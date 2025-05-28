/**
 * Kompatible Notion Export Integration für Otto Assistant
 * Arbeitet mit existierenden Database-Properties
 */

const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Lade Notion-API-Konfiguration aus config.json
let config = {};
try {
  const configPath = path.resolve(__dirname, "../../config.json");
  config = JSON.parse(fs.readFileSync(configPath, "utf8"));
} catch (e) {
  console.warn("⚠️ Konnte config.json nicht laden, Notion-Export deaktiviert.");
}

const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

/**
 * Holt die aktuellen Database-Properties
 * @param {string} databaseId - Die Database-ID
 * @param {string} apiKey - Der API-Key
 * @returns {Promise<object>} - Die Properties der Database
 */
async function getDatabaseProperties(databaseId, apiKey) {
  try {
    const response = await axios.get(`${NOTION_API_BASE}/databases/${databaseId}`, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Notion-Version": NOTION_VERSION
      }
    });
    
    return response.data.properties;
  } catch (error) {
    console.error("❌ Fehler beim Abrufen der Database-Properties:", error.response?.data || error.message);
    return {};
  }
}

/**
 * Erstellt Properties basierend auf verfügbaren Database-Properties
 * @param {object} availableProperties - Verfügbare Properties der Database
 * @param {string} transcript - Das Transkript
 * @param {string} summary - Die Zusammenfassung
 * @param {Array} entities - Extrahierte Entitäten
 * @param {object} entityEmojis - Entitäten mit Emojis
 * @returns {object} - Properties für die neue Page
 */
function createCompatibleProperties(availableProperties, transcript, summary, entities, entityEmojis) {
  const properties = {};
  
  // Erstelle Title für Name-Property
  if (availableProperties.Name && availableProperties.Name.type === 'title') {
    const title = generateTitle(transcript, entities);
    properties.Name = {
      title: [{ text: { content: title } }]
    };
  }
  
  // Setze automatisch Created time falls vorhanden
  if (availableProperties["Created time"] && availableProperties["Created time"].type === 'created_time') {
    // Created time wird automatisch gesetzt, nichts zu tun
  }
  
  // Falls andere Properties verfügbar sind, nutze sie
  Object.entries(availableProperties).forEach(([propName, propConfig]) => {
    if (propName === 'Name' || propName === 'Created time') return; // Bereits behandelt
    
    switch (propConfig.type) {
      case 'rich_text':
        if (propName.toLowerCase().includes('client') || propName.toLowerCase().includes('kunde')) {
          const client = extractClient(transcript);
          if (client) {
            properties[propName] = {
              rich_text: [{ text: { content: client } }]
            };
          }
        } else if (propName.toLowerCase().includes('summary') || propName.toLowerCase().includes('zusammenfassung')) {
          properties[propName] = {
            rich_text: [{ text: { content: summary || 'Automatisch generiert' } }]
          };
        }
        break;
        
      case 'select':
        // Versuche sinnvolle Werte zu setzen falls verfügbar
        if (propName.toLowerCase().includes('status')) {
          properties[propName] = { select: { name: 'Briefing' } };
        } else if (propName.toLowerCase().includes('priority')) {
          properties[propName] = { select: { name: 'Medium' } };
        }
        break;
        
      case 'multi_select':
        if (propName.toLowerCase().includes('tag')) {
          // Nutze Entitäten als Tags
          const tags = entities.slice(0, 3).map(entity => ({ name: entity }));
          if (tags.length > 0) {
            properties[propName] = { multi_select: tags };
          }
        }
        break;
        
      case 'date':
        if (propName.toLowerCase().includes('date') || propName.toLowerCase().includes('datum')) {
          properties[propName] = {
            date: { start: new Date().toISOString().split('T')[0] }
          };
        }
        break;
    }
  });
  
  return properties;
}

/**
 * Generiert einen aussagekräftigen Titel
 * @param {string} transcript - Das Transkript
 * @param {Array} entities - Entitäten
 * @returns {string} - Der generierte Titel
 */
function generateTitle(transcript, entities) {
  const date = new Date().toLocaleDateString('de-DE');
  
  // Versuche Client zu extrahieren
  const client = extractClient(transcript);
  
  // Versuche Projekt zu extrahieren
  const project = extractProject(transcript);
  
  if (client && project) {
    return `🎯 ${client} - ${project} - ${date}`;
  } else if (client) {
    return `🎯 ${client} - Creative Session - ${date}`;
  } else if (entities.length > 0) {
    return `🎯 ${entities[0]} - Creative Session - ${date}`;
  } else {
    return `🎯 Otto Assistant Session - ${date}`;
  }
}

/**
 * Extrahiert Client-Information aus dem Transkript
 * @param {string} transcript - Das Transkript
 * @returns {string|null} - Der Client oder null
 */
function extractClient(transcript) {
  const clientPatterns = [
    /(?:kunde|client):\s*([^\n,\.]+)/i,
    /(?:für|for)\s+([A-Z][a-zA-Z\-\s]+?)(?:\s|,|\.)/,
    /(?:Mercedes|BMW|Audi|Apple|Google|Microsoft|Amazon)/i
  ];
  
  for (const pattern of clientPatterns) {
    const match = transcript.match(pattern);
    if (match) {
      return match[1] ? match[1].trim() : match[0].trim();
    }
  }
  
  return null;
}

/**
 * Extrahiert Projekt-Information aus dem Transkript
 * @param {string} transcript - Das Transkript
 * @returns {string|null} - Das Projekt oder null
 */
function extractProject(transcript) {
  const projectPatterns = [
    /(?:projekt|project|kampagne|campaign):\s*([^\n,\.]+)/i,
    /(?:EQS|Kampagne|Website|App|Brand)/i
  ];
  
  for (const pattern of projectPatterns) {
    const match = transcript.match(pattern);
    if (match) {
      return match[1] ? match[1].trim() : match[0].trim();
    }
  }
  
  return null;
}

/**
 * Exportiert Transkript und Zusammenfassung als Notion-Page (kompatible Version)
 * @param {string} transcript - Das Transkript
 * @param {string} summary - Die Zusammenfassung
 * @param {Array} entities - Extrahierte Entitäten
 * @param {object} entityEmojis - Entitäten mit Emojis
 * @param {object} options - Zusätzliche Optionen
 * @returns {Promise<string|null>} - Die URL der erstellten Page oder null
 */
async function exportToNotionCompatible(transcript, summary, entities = [], entityEmojis = {}, options = {}) {
  const apiKey = config.NOTION_API_KEY || process.env.NOTION_API_KEY;
  const databaseId = config.NOTION_DATABASE_ID || process.env.NOTION_DATABASE_ID;
  
  if (!apiKey) {
    console.error("❌ Notion API-Key fehlt.");
    return null;
  }
  
  if (!databaseId) {
    console.error("❌ Notion Database-ID fehlt.");
    return null;
  }

  try {
    console.log("🔍 Prüfe Database-Properties...");
    
    // 1. Aktuelle Database-Properties abrufen
    const availableProperties = await getDatabaseProperties(databaseId, apiKey);
    
    if (Object.keys(availableProperties).length === 0) {
      console.error("❌ Konnte Database-Properties nicht abrufen.");
      return null;
    }
    
    console.log(`📊 Gefundene Properties: ${Object.keys(availableProperties).join(', ')}`);
    
    // 2. Kompatible Properties erstellen
    const properties = createCompatibleProperties(
      availableProperties, 
      transcript, 
      summary, 
      entities, 
      entityEmojis
    );
    
    console.log(`✅ Verwendete Properties: ${Object.keys(properties).join(', ')}`);
    
    // 3. Content für Page erstellen
    const content = createSimpleContent(transcript, summary, entities, entityEmojis);
    
    // 4. Notion Page erstellen
    const pageData = {
      parent: { database_id: databaseId },
      properties: properties,
      children: createNotionBlocks(content)
    };
    
    console.log("📤 Sende Daten an Notion...");
    
    const response = await axios.post(`${NOTION_API_BASE}/pages`, pageData, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json"
      }
    });
    
    const pageUrl = response.data.url;
    console.log(`✅ Notion Page erfolgreich erstellt: ${pageUrl}`);
    
    return pageUrl;
    
  } catch (error) {
    console.error("❌ Notion Export fehlgeschlagen:", error.response?.data || error.message);
    return null;
  }
}

/**
 * Erstellt einfachen Content für die Page
 * @param {string} transcript - Das Transkript
 * @param {string} summary - Die Zusammenfassung
 * @param {Array} entities - Entitäten
 * @param {object} entityEmojis - Entitäten mit Emojis
 * @returns {string} - Der formatierte Content
 */
function createSimpleContent(transcript, summary, entities, entityEmojis) {
  const client = extractClient(transcript) || 'Unbekannt';
  const project = extractProject(transcript) || 'Creative Session';
  const date = new Date().toLocaleString('de-DE');
  
  let content = `# Creative Session

## Projekt-Details
**Client:** ${client}
**Projekt:** ${project}
**Datum:** ${date}

## Zusammenfassung
${summary || 'Automatisch generiert aus Transkript'}

## Erkannte Themen
`;

  // Entitäten hinzufügen
  if (entities.length > 0) {
    entities.forEach(entity => {
      const emoji = entityEmojis[entity] || '🔹';
      content += `${emoji} ${entity}\n`;
    });
  } else {
    content += 'Keine spezifischen Themen erkannt.\n';
  }

  content += `
## Vollständiges Transkript

${transcript}

---
*Automatisch archiviert von Otto Assistant - ${date}*`;

  return content;
}

/**
 * Erstellt Notion Blocks aus Content
 * @param {string} content - Der Content
 * @returns {Array} - Array von Notion Blocks
 */
function createNotionBlocks(content) {
  const blocks = [];
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (!trimmedLine) continue;
    
    // Headers
    if (trimmedLine.startsWith('# ')) {
      blocks.push({
        object: "block",
        type: "heading_1",
        heading_1: {
          rich_text: [{ type: "text", text: { content: trimmedLine.substring(2) } }]
        }
      });
    } else if (trimmedLine.startsWith('## ')) {
      blocks.push({
        object: "block",
        type: "heading_2",
        heading_2: {
          rich_text: [{ type: "text", text: { content: trimmedLine.substring(3) } }]
        }
      });
    }
    // Dividers
    else if (trimmedLine === '---') {
      blocks.push({
        object: "block",
        type: "divider",
        divider: {}
      });
    }
    // Regular paragraphs
    else {
      blocks.push({
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [{ type: "text", text: { content: trimmedLine } }]
        }
      });
    }
  }
  
  return blocks;
}

module.exports = {
  exportToNotionCompatible,
  getDatabaseProperties,
  createCompatibleProperties
};
