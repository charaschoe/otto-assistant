/**
 * Notion Export Integration für Otto Assistant
 * Erweitert für Creative Agency Features
 */

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { notionCreativeSelector } = require("./notion-creative-templates");
const { selectBestTemplate } = require("../utils/summary-templates");

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
 * Exportiert Transkript und Zusammenfassung als Notion-Page
 * @param {string} transcript - Das Transkript
 * @param {string} summary - Die Zusammenfassung
 * @param {Array} entities - Extrahierte Entitäten
 * @param {object} entityEmojis - Entitäten mit Emojis
 * @param {object} options - Zusätzliche Optionen
 * @returns {Promise<string|null>} - Die URL der erstellten Page oder null
 */
async function exportToNotion(transcript, summary, entities = [], entityEmojis = {}, options = {}) {
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
    // 1. Template-Typ ermitteln
    const templateType = options.templateType || selectBestTemplate(transcript);
    console.log(`🎨 Notion Template-Typ: ${templateType}`);
    
    // 2. Template und Properties erstellen
    const template = notionCreativeSelector.selectTemplate(transcript, summary, templateType);
    const properties = notionCreativeSelector.createPageProperties(
      template, 
      transcript, 
      summary, 
      templateType, 
      entities, 
      entityEmojis
    );
    
    // 3. Content erstellen
    const templateData = notionCreativeSelector.extractTemplateData(
      transcript, 
      summary, 
      templateType, 
      entities, 
      entityEmojis
    );
    const content = notionCreativeSelector.createPageContent(template, transcript, summary, templateData);
    
    // 4. Notion Page erstellen
    const pageData = {
      parent: { database_id: databaseId },
      properties: properties,
      children: createNotionBlocks(content)
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
 * Erstellt Notion Blocks aus Markdown-Content
 * @param {string} content - Markdown-Content
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
    // Code Blocks
    else if (trimmedLine.startsWith('```')) {
      // Handle code blocks (simplified)
      blocks.push({
        object: "block",
        type: "code",
        code: {
          rich_text: [{ type: "text", text: { content: "Code Block" } }],
          language: "javascript"
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
      // Skip empty lines and markdown formatting
      if (trimmedLine && !trimmedLine.startsWith('**') && !trimmedLine.startsWith('*')) {
        blocks.push({
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [{ type: "text", text: { content: trimmedLine } }]
          }
        });
      }
    }
  }
  
  return blocks;
}

/**
 * Erstellt eine neue Notion Database für Creative Agency Templates
 * @param {string} templateType - Der Template-Typ
 * @returns {Promise<string|null>} - Die Database-ID oder null
 */
async function createCreativeDatabase(templateType) {
  const apiKey = config.NOTION_API_KEY || process.env.NOTION_API_KEY;
  const parentPageId = config.NOTION_PARENT_PAGE_ID || process.env.NOTION_PARENT_PAGE_ID;
  
  if (!apiKey || !parentPageId) {
    console.error("❌ Notion API-Key oder Parent Page-ID fehlt für Database-Erstellung.");
    return null;
  }
  
  try {
    const template = notionCreativeSelector.selectTemplate('', '', templateType);
    
    const databaseData = {
      parent: { page_id: parentPageId },
      title: [{ type: "text", text: { content: template.name } }],
      properties: {}
    };
    
    // Properties vom Template übernehmen
    Object.entries(template.properties).forEach(([key, config]) => {
      databaseData.properties[key] = { [config.type]: config };
    });
    
    const response = await axios.post(`${NOTION_API_BASE}/databases`, databaseData, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json"
      }
    });
    
    console.log(`✅ Notion Database erstellt: ${response.data.id}`);
    return response.data.id;
    
  } catch (error) {
    console.error("❌ Database-Erstellung fehlgeschlagen:", error.response?.data || error.message);
    return null;
  }
}

/**
 * Test-Funktion für Notion Export
 */
async function testNotionExport() {
  const testData = {
    transcript: `
      Client: Mercedes-Benz
      Projekt: EQS Kampagne 2025
      Zielgruppe: Premium-Kunden, umweltbewusst
      Botschaft: Luxus trifft Nachhaltigkeit
      Team: Sarah (Creative Director), Max (Art Director)
    `,
    summary: "Creative Briefing für Mercedes EQS Elektro-Kampagne",
    entities: ['Mercedes-Benz', 'EQS', 'Kampagne', 'Premium'],
    entityEmojis: { 'Mercedes-Benz': '🚗', 'EQS': '⚡', 'Kampagne': '📢' }
  };
  
  console.log("🧪 Testing Notion Export...");
  const result = await exportToNotion(
    testData.transcript,
    testData.summary,
    testData.entities,
    testData.entityEmojis,
    { templateType: 'creative_briefing' }
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
  createCreativeDatabase,
  testNotionExport
};
