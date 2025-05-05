// API Integration Service
import axios from 'axios';
import { getCredential } from '../database/db-service.js';

// Gemini API Integration
export async function generateWithGemini(prompt, userId) {
  try {
    const geminiKey = await getCredential(userId, 'gemini');
    
    if (!geminiKey) {
      throw new Error('Kein Gemini API-Schlüssel gefunden');
    }
    
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      {
        contents: [{ parts: [{ text: prompt }] }]
      },
      {
        params: { key: geminiKey },
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    // Extrahiere den generierten Text
    const generatedText = response.data.candidates[0].content.parts[0].text;
    return generatedText;
  } catch (error) {
    console.error('Gemini API Fehler:', error);
    throw error;
  }
}

// Transkription mit WhisperAPI
export async function transcribeWithWhisper(audioBuffer, userId) {
  try {
    const openaiKey = await getCredential(userId, 'openai');
    
    if (!openaiKey) {
      throw new Error('Kein OpenAI API-Schlüssel gefunden');
    }
    
    const formData = new FormData();
    formData.append('file', new Blob([audioBuffer], { type: 'audio/wav' }), 'audio.wav');
    formData.append('model', 'whisper-1');
    
    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    return response.data.text;
  } catch (error) {
    console.error('Whisper API Fehler:', error);
    throw error;
  }
}

// Notion Integration
export async function exportToNotion(title, content, userId) {
  try {
    const notionCreds = await getCredential(userId, 'notion');
    
    if (!notionCreds) {
      throw new Error('Keine Notion-Anmeldedaten gefunden');
    }
    
    const { token, databaseId } = JSON.parse(notionCreds);
    
    const response = await axios.post(
      'https://api.notion.com/v1/pages',
      {
        parent: { database_id: databaseId },
        properties: {
          title: {
            title: [{ text: { content: title } }]
          }
        },
        children: [{
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ text: { content } }]
          }
        }]
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28'
        }
      }
    );
    
    return response.data.id;
  } catch (error) {
    console.error('Notion API Fehler:', error);
    throw error;
  }
}

// Obsidian Integration (via Webhook)
export async function exportToObsidian(title, content, userId) {
  try {
    const obsidianCreds = await getCredential(userId, 'obsidian');
    
    if (!obsidianCreds) {
      throw new Error('Keine Obsidian-Anmeldedaten gefunden');
    }
    
    const { webhookUrl, vault } = JSON.parse(obsidianCreds);
    
    const response = await axios.post(
      webhookUrl,
      {
        vault,
        file: `${title}.md`,
        content
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Obsidian Webhook Fehler:', error);
    throw error;
  }
}