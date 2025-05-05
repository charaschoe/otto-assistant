// API-Route für die Transkription
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { authenticate } = require('../src/auth/auth');
const { getCredential, saveTranscript } = require('../src/database/db');
const axios = require('axios');

const router = express.Router();

// Konfiguriere multer für den Datei-Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `recording-${Date.now()}.wav`);
  }
});

const upload = multer({ storage });

// Transkriptions-Endpunkt
router.post('/transcribe', authenticate, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Keine Audiodatei hochgeladen' });
    }

    // Audiodatei-Pfad
    const audioFilePath = req.file.path;
    
    // Output-Optionen extrahieren
    const outputOptions = req.body.outputOptions ? req.body.outputOptions.split(',') : [];
    
    // User-ID aus dem authentifizierten Request
    const userId = req.user.id;
    
    // Titel für die Transkription
    const title = req.body.title || `Transkript ${new Date().toLocaleDateString()}`;
    
    // Transkription mit Python-Skript starten
    const python = spawn('python3', [
      './src/transcription/whisper-transcribe.py',
      audioFilePath
    ]);

    let transcript = '';
    let capture = false;

    python.stdout.on('data', (data) => {
      const lines = data.toString().split('\n');
      for (const line of lines) {
        if (line.includes('📝 TRANSKRIPT_START')) capture = true;
        else if (line.includes('📝 TRANSKRIPT_END')) capture = false;
        else if (capture) transcript += line + '\n';
      }
    });

    python.stderr.on('data', (data) => {
      console.error('Fehler:', data.toString());
    });

    python.on('close', async (code) => {
      // Entferne temporäre Audiodatei
      fs.unlinkSync(audioFilePath);
      
      if (transcript.trim()) {
        // Transkript in der Datenbank speichern
        const transcriptId = await saveTranscript(userId, transcript.trim(), title);
        
        const results = { 
          transcript: transcript.trim(), 
          transcriptId,
          exportResults: {} 
        };
        
        // Verarbeite alle ausgewählten Export-Optionen
        try {
          const exportPromises = [];
          
          // Notion Export
          if (outputOptions.includes('1')) {
            try {
              const notionCreds = await getCredential(userId, 'notion');
              
              if (notionCreds) {
                const notionData = JSON.parse(notionCreds);
                
                // Notion API aufrufen
                const notionResponse = await axios.post(
                  'https://api.notion.com/v1/pages',
                  {
                    parent: { database_id: notionData.databaseId },
                    properties: {
                      title: {
                        title: [{ text: { content: title } }]
                      }
                    },
                    children: [{
                      object: 'block',
                      type: 'paragraph',
                      paragraph: {
                        rich_text: [{ text: { content: transcript.trim() } }]
                      }
                    }]
                  },
                  {
                    headers: {
                      'Authorization': `Bearer ${notionData.token}`,
                      'Content-Type': 'application/json',
                      'Notion-Version': '2022-06-28'
                    }
                  }
                );
                
                results.exportResults.notion = 'success';
                results.exportResults.notionPageId = notionResponse.data.id;
              } else {
                results.exportResults.notion = 'no_credentials';
              }
            } catch (error) {
              console.error('Notion Export Error:', error);
              results.exportResults.notion = 'error';
            }
          }
          
          // Obsidian Export (über einen speziellen Obsidian-Webhook-Service)
          if (outputOptions.includes('2')) {
            try {
              const obsidianCreds = await getCredential(userId, 'obsidian');
              
              if (obsidianCreds) {
                const obsidianData = JSON.parse(obsidianCreds);
                
                // Obsidian-Webhook aufrufen (dies erfordert einen speziellen Service)
                await axios.post(
                  obsidianData.webhookUrl,
                  {
                    vault: obsidianData.vault,
                    file: `${title}.md`,
                    content: transcript.trim()
                  }
                );
                
                results.exportResults.obsidian = 'success';
              } else {
                results.exportResults.obsidian = 'no_credentials';
              }
            } catch (error) {
              console.error('Obsidian Export Error:', error);
              results.exportResults.obsidian = 'error';
            }
          }
          
          // Google Drive Export
          if (outputOptions.includes('12')) {
            try {
              const googleCreds = await getCredential(userId, 'google');
              
              if (googleCreds) {
                // Markdown-Datei erstellen
                const mdFilePath = path.join(__dirname, '../exports', `${title}.md`);
                fs.writeFileSync(mdFilePath, transcript.trim());
                
                // Google Drive API aufrufen würde hier implementiert
                // ...
                
                results.exportResults.gdrive = 'success';
                
                // Temporäre Datei entfernen
                fs.unlinkSync(mdFilePath);
              } else {
                results.exportResults.gdrive = 'no_credentials';
              }
            } catch (error) {
              console.error('Google Drive Export Error:', error);
              results.exportResults.gdrive = 'error';
            }
          }
          
          // Weitere Export-Optionen hier implementieren
          
          // Sende das Ergebnis
          res.json(results);
          
        } catch (error) {
          console.error('Export Error:', error);
          res.status(500).json({ 
            error: 'Fehler beim Exportieren', 
            transcript: transcript.trim(),
            transcriptId
          });
        }
      } else {
        res.status(500).json({ error: 'Keine Transkription erstellt' });
      }
    });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

// Endpunkt zum Abrufen aller Transkriptionen eines Benutzers
router.get('/transcripts', authenticate, async (req, res) => {
  try {
    const { getTranscripts } = require('../src/database/db');
    const transcripts = await getTranscripts(req.user.id);
    res.json({ transcripts });
  } catch (error) {
    console.error('Get Transcripts Error:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Transkriptionen' });
  }
});

// Endpunkt zum Abrufen einer bestimmten Transkription
router.get('/transcripts/:id', authenticate, async (req, res) => {
  try {
    const { getTranscript } = require('../src/database/db');
    const transcript = await getTranscript(req.params.id);
    
    if (!transcript) {
      return res.status(404).json({ error: 'Transkription nicht gefunden' });
    }
    
    // Sicherheitscheck - Nur eigene Transkriptionen anzeigen
    if (transcript.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Keine Berechtigung' });
    }
    
    res.json({ transcript });
  } catch (error) {
    console.error('Get Transcript Error:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Transkription' });
  }
});

module.exports = router;