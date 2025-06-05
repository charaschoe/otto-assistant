#!/usr/bin/env node

/**
 * Otto Assistant 25-Second Mode
 * Aufnahme und Verarbeitung in 25-Sekunden-Segmenten
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { execSync } = require('child_process');

class Otto25SecondMode {
  constructor() {
    this.isRecording = false;
    this.segmentCount = 0;
    this.sessionStartTime = new Date();
    this.tempDir = './temp-audio';
    this.outputDir = './recordings';
    this.context = [];
    this.segmentDuration = 25; // 25 Sekunden
    
    // Erstelle Verzeichnisse falls sie nicht existieren
    this.ensureDirectories();
  }

  ensureDirectories() {
    [this.tempDir, this.outputDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  displayInterface() {
    console.clear();
    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║                     🤖 OTTO 25-SEKUNDEN-MODUS                   ║');
    console.log('║                   Segmentierte Audio-Aufnahme                   ║');
    console.log('╚══════════════════════════════════════════════════════════════════╝');
    console.log('');
    
    const now = new Date();
    const sessionDuration = Math.floor((now - this.sessionStartTime) / 1000);
    const minutes = Math.floor(sessionDuration / 60);
    const seconds = sessionDuration % 60;
    
    console.log('📊 SESSION STATUS:');
    console.log('┌────────────────────────────────────────────────────────────────┐');
    console.log(`│ Status: ${this.isRecording ? '🔴 AUFNAHME LÄUFT' : '⚪ BEREIT'}                              │`);
    console.log(`│ Segment: ${this.segmentCount.toString().padStart(3, '0')}                                               │`);
    console.log(`│ Session-Zeit: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}                                     │`);
    console.log(`│ Kontext-Einträge: ${this.context.length.toString().padStart(2, ' ')}                                    │`);
    console.log('└────────────────────────────────────────────────────────────────┘');
    console.log('');
    
    if (this.isRecording) {
      console.log('🎤 Aufnahme läuft... Sprechen Sie jetzt!');
      console.log(`⏱️  25-Sekunden-Timer ist aktiv`);
    } else {
      console.log('💡 STEUERUNG:');
      console.log('   [SPACE] → Neue 25s-Aufnahme starten');
      console.log('   [s] → Status anzeigen');
      console.log('   [c] → Kontext löschen');
      console.log('   [e] → Export starten');
      console.log('   [q] → Beenden');
    }
    
    if (this.context.length > 0) {
      console.log('');
      console.log('📝 LETZTE TRANSKRIPTIONEN:');
      console.log('┌────────────────────────────────────────────────────────────────┐');
      this.context.slice(-3).forEach((entry, index) => {
        const text = entry.text.length > 50 ? entry.text.substring(0, 50) + '...' : entry.text;
        const time = entry.timestamp.toLocaleTimeString('de-DE');
        console.log(`│ ${time} - ${text.padEnd(40, ' ')} │`);
      });
      console.log('└────────────────────────────────────────────────────────────────┘');
    }
  }

  async startRecording() {
    if (this.isRecording) {
      console.log('⚠️  Aufnahme läuft bereits!');
      return;
    }

    this.segmentCount++;
    this.isRecording = true;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const audioFile = path.join(this.tempDir, `segment-${this.segmentCount}-${timestamp}.wav`);
    
    this.displayInterface();
    
    try {
      // SoX für Audio-Aufnahme verwenden
      const soxProcess = spawn('sox', [
        '-t', 'coreaudio',
        '-d',
        audioFile,
        'trim', '0', `${this.segmentDuration}`
      ]);

      // Timer für visuelle Anzeige
      let countdown = this.segmentDuration;
      const countdownInterval = setInterval(() => {
        process.stdout.write(`\r🎤 Aufnahme läuft... ${countdown}s verbleibend`);
        countdown--;
        
        if (countdown < 0) {
          clearInterval(countdownInterval);
        }
      }, 1000);

      soxProcess.on('close', async (code) => {
        clearInterval(countdownInterval);
        this.isRecording = false;
        
        if (code === 0) {
          console.log('\n✅ Aufnahme abgeschlossen. Verarbeitung startet...');
          await this.processAudioFile(audioFile);
        } else {
          console.log('\n❌ Aufnahme fehlgeschlagen');
        }
        
        this.displayInterface();
      });

      soxProcess.on('error', (error) => {
        clearInterval(countdownInterval);
        this.isRecording = false;
        console.error('\n❌ Aufnahme-Fehler:', error);
        this.displayInterface();
      });

    } catch (error) {
      this.isRecording = false;
      console.error('❌ Fehler beim Starten der Aufnahme:', error);
      this.displayInterface();
    }
  }

  async processAudioFile(audioFile) {
    try {
      console.log('🔄 Transkription mit Whisper...');
      
      // Whisper für Transkription verwenden (mit venv)
      const whisperCommand = `source venv/bin/activate && whisper "${audioFile}" --language German --model base --output_format txt --output_dir "${this.tempDir}"`;
      const result = execSync(whisperCommand, { encoding: 'utf8', shell: '/bin/bash' });
      
      // Transkriptions-Datei finden
      const baseFilename = path.basename(audioFile, '.wav');
      const transcriptFile = path.join(this.tempDir, `${baseFilename}.txt`);
      
      if (fs.existsSync(transcriptFile)) {
        const transcription = fs.readFileSync(transcriptFile, 'utf8').trim();
        
        if (transcription && transcription.length > 10) {
          // Zur Kontext hinzufügen
          this.context.push({
            segment: this.segmentCount,
            timestamp: new Date(),
            text: transcription,
            audioFile: audioFile
          });
          
          console.log('✅ Transkription erfolgreich:');
          console.log(`📝 "${transcription}"`);
          
          // Prüfe auf Befehle
          await this.checkForCommands(transcription);
          
        } else {
          console.log('⚠️  Keine Sprache erkannt oder Transkription zu kurz');
        }
        
        // Aufräumen
        fs.unlinkSync(transcriptFile);
      } else {
        console.log('❌ Transkriptions-Datei nicht gefunden');
      }
      
      // Audio-Datei verschieben
      const finalAudioPath = path.join(this.outputDir, path.basename(audioFile));
      fs.renameSync(audioFile, finalAudioPath);
      
    } catch (error) {
      console.error('❌ Verarbeitungs-Fehler:', error);
    }
  }

  async checkForCommands(text) {
    const lowercaseText = text.toLowerCase();
    
    // Export-Befehle
    if (lowercaseText.includes('export') || lowercaseText.includes('speichern') || 
        lowercaseText.includes('fertig') || lowercaseText.includes('ende')) {
      console.log('🔄 Export wird ausgelöst...');
      await this.exportSession();
    }
    
    // Session-Ende
    if (lowercaseText.includes('session ende') || lowercaseText.includes('beenden') ||
        lowercaseText.includes('das wars')) {
      console.log('🏁 Session wird beendet...');
      await this.exportSession();
      process.exit(0);
    }
    
    // Kontext löschen
    if (lowercaseText.includes('neue session') || lowercaseText.includes('reset')) {
      console.log('🧹 Kontext wird gelöscht...');
      this.context = [];
    }
  }

  async exportSession() {
    if (this.context.length === 0) {
      console.log('⚠️  Nichts zu exportieren - keine Transkriptionen vorhanden');
      return;
    }

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const exportFile = path.join(this.outputDir, `otto-25s-session-${timestamp}.md`);
      
      let content = `# Otto 25-Sekunden Session\n\n`;
      content += `**Datum:** ${new Date().toLocaleString('de-DE')}\n`;
      content += `**Segmente:** ${this.context.length}\n`;
      content += `**Session-Dauer:** ${Math.floor((new Date() - this.sessionStartTime) / 60000)} Minuten\n\n`;
      
      content += `## Transkriptionen\n\n`;
      
      this.context.forEach((entry, index) => {
        content += `### Segment ${entry.segment} (${entry.timestamp.toLocaleTimeString('de-DE')})\n\n`;
        content += `${entry.text}\n\n`;
        content += `---\n\n`;
      });
      
      fs.writeFileSync(exportFile, content);
      
      console.log(`✅ Session exportiert: ${exportFile}`);
      
      // Versuche auch JSON-Export für weitere Verarbeitung
      const jsonFile = path.join(this.outputDir, `otto-25s-session-${timestamp}.json`);
      fs.writeFileSync(jsonFile, JSON.stringify({
        sessionStart: this.sessionStartTime,
        sessionEnd: new Date(),
        segmentCount: this.context.length,
        segments: this.context
      }, null, 2));
      
      console.log(`📊 Daten exportiert: ${jsonFile}`);
      
    } catch (error) {
      console.error('❌ Export-Fehler:', error);
    }
  }

  showStatus() {
    console.clear();
    this.displayInterface();
    
    if (this.context.length > 0) {
      console.log('\n📈 DETAILLIERTE STATISTIKEN:');
      console.log('┌────────────────────────────────────────────────────────────────┐');
      
      const totalWords = this.context.reduce((sum, entry) => sum + entry.text.split(' ').length, 0);
      const avgWordsPerSegment = Math.round(totalWords / this.context.length);
      const sessionDuration = Math.floor((new Date() - this.sessionStartTime) / 60000);
      
      console.log(`│ Gesamtwörter: ${totalWords.toString().padStart(4, ' ')}                                        │`);
      console.log(`│ Ø Wörter/Segment: ${avgWordsPerSegment.toString().padStart(3, ' ')}                                    │`);
      console.log(`│ Session-Minuten: ${sessionDuration.toString().padStart(3, ' ')}                                     │`);
      console.log('└────────────────────────────────────────────────────────────────┘');
    }
  }

  async start() {
    console.log('🚀 Otto 25-Sekunden-Modus startet...');
    
    // System-Überprüfungen
    if (!await this.checkSystemRequirements()) {
      console.error('❌ System-Anforderungen nicht erfüllt');
      process.exit(1);
    }
    
    this.displayInterface();
    
    // Tastatur-Input Setup
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    process.stdin.on('data', async (key) => {
      const keyStr = key.toString();
      
      switch (keyStr) {
        case ' ': // Space für neue Aufnahme
          if (!this.isRecording) {
            await this.startRecording();
          }
          break;
          
        case 's':
          this.showStatus();
          break;
          
        case 'c':
          this.context = [];
          console.log('🧹 Kontext gelöscht');
          setTimeout(() => this.displayInterface(), 1000);
          break;
          
        case 'e':
          await this.exportSession();
          setTimeout(() => this.displayInterface(), 1000);
          break;
          
        case 'q':
          console.log('\n👋 Session wird beendet...');
          if (this.context.length > 0) {
            await this.exportSession();
          }
          process.exit(0);
          break;
          
        case '\u0003': // Ctrl+C
          console.log('\n🛑 Unterbrochen...');
          process.exit(0);
          break;
      }
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Session wird beendet...');
      if (this.context.length > 0) {
        await this.exportSession();
      }
      process.exit(0);
    });
  }

  async checkSystemRequirements() {
    try {
      // Prüfe SoX
      execSync('sox --version', { stdio: 'ignore' });
      console.log('✅ SoX verfügbar');
      
      // Prüfe Whisper (mit venv)
      execSync('source venv/bin/activate && whisper --help', { stdio: 'ignore', shell: '/bin/bash' });
      console.log('✅ OpenAI Whisper verfügbar');
      
      return true;
    } catch (error) {
      console.error('❌ Fehlende Abhängigkeiten:');
      console.error('   - SoX: brew install sox');
      console.error('   - Whisper: pip install openai-whisper');
      return false;
    }
  }
}

// Hauptfunktion
async function main() {
  const otto25s = new Otto25SecondMode();
  await otto25s.start();
}

// Programm starten
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Fehler:', error);
    process.exit(1);
  });
}

module.exports = Otto25SecondMode;