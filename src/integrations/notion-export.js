/**
 * Notion Export Integration für Otto Assistant
 * Vereinfacht für maximale Kompatibilität
 */

// Lade .env Umgebungsvariablen
require('dotenv').config();

const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Lade Notion-API-Konfiguration aus config.json (fallback)
let config = {};
try {
  const configPath = path.resolve(__dirname, "../../config.json");
  config = JSON.parse(fs.readFileSync(configPath, "utf8"));
} catch (e) {
  console.warn("⚠️ Konnte config.json nicht laden, verwende Umgebungsvariablen.");
}

const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

/**
 * Exportiert Zusammenfassung als Notion-Page
 * @param {string} summary - Die Zusammenfassung
 * @param {string} title - Der Titel
 * @param {object} options - Zusätzliche Optionen
 * @returns {Promise<string|null>} - Die URL der erstellten Page oder null
 */
async function exportToNotion(summary, title, options = {}) {
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
    // Minimale Properties für maximale Kompatibilität - nur Title Property
    const properties = {
      "Name": {
        title: [{ type: "text", text: { content: title || "Otto Transkript" } }]
      }
    };

    // Vereinfachter Content
    const content = createNotionBlocks(summary || "Keine Zusammenfassung verfügbar.");
    
    // Notion Page erstellen
    const pageData = {
      parent: { database_id: databaseId },
      properties: properties,
      children: content
    };
    
    const response = await axios.post(`${NOTION_API_BASE}/pages`, pageData, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json"
      }
    });
    
    const pageUrl = response.data.url;
    console.log(`✅ Notion Page erstellt: ${pageUrl}`);
    
    return pageUrl;
    
  } catch (error) {
    console.error("❌ Notion Export fehlgeschlagen:", error.response?.data || error.message);
    return null;
  }
}

/**
 * Erstellt Notion Blocks aus Text-Content
 * @param {string} content - Text-Content
 * @returns {Array} - Array von Notion Blocks
 */
function createNotionBlocks(content) {
  const blocks = [];
  
  if (!content || typeof content !== 'string') {
    return [{
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [{ type: "text", text: { content: "Kein Inhalt verfügbar." } }]
      }
    }];
  }

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
    } else if (trimmedLine.startsWith('### ')) {
      blocks.push({
        object: "block",
        type: "heading_3",
        heading_3: {
          rich_text: [{ type: "text", text: { content: trimmedLine.substring(4) } }]
        }
      });
    }
    // Bullet Lists
    else if (trimmedLine.startsWith('- ')) {
      blocks.push({
        object: "block",
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{ type: "text", text: { content: trimmedLine.substring(2) } }]
        }
      });
    }
    // Numbered Lists
    else if (/^\d+\.\s/.test(trimmedLine)) {
      blocks.push({
        object: "block",
        type: "numbered_list_item",
        numbered_list_item: {
          rich_text: [{ type: "text", text: { content: trimmedLine.replace(/^\d+\.\s/, '') } }]
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
  
  return blocks.length > 0 ? blocks : [{
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: [{ type: "text", text: { content: content } }]
    }
  }];
}

/**
 * Test-Funktion für Notion Export
 */
async function testNotionExport() {
  console.log("🧪 Testing Notion Export...");
  const result = await exportToNotion(
    "Test-Zusammenfassung für Otto Assistant",
    "Otto Test",
    { templateType: 'standard' }
  );
  
  if (result) {
    console.log("✅ Notion Export Test erfolgreich!");
    console.log("🔗 Page URL:", result);
  } else {
    console.log("❌ Notion Export Test fehlgeschlagen!");
  }
}

module.exports = {
  exportToNotion,
  testNotionExport
};
