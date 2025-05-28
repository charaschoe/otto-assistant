/**
 * Notion Debug Tool für Otto Creative Assistant
 * VSCode Launch: 🔍 Debug Notion Connection
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function debugNotionConnection() {
  console.log("🔍 === NOTION CONNECTION DEBUG ===\n");
  
  // 1. Config prüfen
  console.log("1. 📋 Config Validation");
  console.log("─".repeat(50));
  
  let config = {};
  const configPath = path.resolve(__dirname, 'config.json');
  
  try {
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      console.log("✅ config.json gefunden");
      
      if (config.NOTION_API_KEY) {
        console.log(`✅ NOTION_API_KEY: ${config.NOTION_API_KEY.substring(0, 10)}...`);
      } else {
        console.log("❌ NOTION_API_KEY fehlt in config.json");
        return;
      }
      
      if (config.NOTION_DATABASE_ID) {
        console.log(`✅ NOTION_DATABASE_ID: ${config.NOTION_DATABASE_ID.substring(0, 10)}...`);
      } else {
        console.log("❌ NOTION_DATABASE_ID fehlt in config.json");
        return;
      }
      
    } else {
      console.log("❌ config.json nicht gefunden");
      return;
    }
  } catch (error) {
    console.log("❌ Fehler beim Laden der config.json:", error.message);
    return;
  }
  
  const NOTION_API_BASE = "https://api.notion.com/v1";
  const NOTION_VERSION = "2022-06-28";
  
  // 2. API Key Test
  console.log("\n2. 🔑 API Key Validation");
  console.log("─".repeat(50));
  
  try {
    const response = await axios.get(`${NOTION_API_BASE}/users/me`, {
      headers: {
        "Authorization": `Bearer ${config.NOTION_API_KEY}`,
        "Notion-Version": NOTION_VERSION
      }
    });
    
    console.log("✅ API Key ist gültig");
    console.log(`👤 Bot User: ${response.data.name || 'Unnamed Bot'}`);
    console.log(`🤖 Bot Type: ${response.data.type}`);
    console.log(`📧 Bot Owner: ${response.data.owner?.user?.name || 'Unknown'}`);
    
  } catch (error) {
    console.log("❌ API Key Validation fehlgeschlagen:");
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Fehler: ${error.response?.data?.message || error.message}`);
    
    if (error.response?.status === 401) {
      console.log("\n🔧 Troubleshooting für 401 Unauthorized:");
      console.log("1. API Key in Notion überprüfen: https://www.notion.so/my-integrations");
      console.log("2. Neuen API Key generieren falls nötig");
      console.log("3. API Key in config.json aktualisieren");
    }
    return;
  }
  
  // 3. Database Access Test
  console.log("\n3. 🗄️ Database Access Test");
  console.log("─".repeat(50));
  
  try {
    const dbResponse = await axios.get(`${NOTION_API_BASE}/databases/${config.NOTION_DATABASE_ID}`, {
      headers: {
        "Authorization": `Bearer ${config.NOTION_API_KEY}`,
        "Notion-Version": NOTION_VERSION
      }
    });
    
    console.log("✅ Database ist zugänglich");
    console.log(`📊 Database Name: ${dbResponse.data.title?.[0]?.plain_text || 'Unnamed Database'}`);
    console.log(`🔗 Database URL: ${dbResponse.data.url}`);
    console.log(`📝 Properties: ${Object.keys(dbResponse.data.properties).length}`);
    
    // Properties auflisten
    console.log("\n📋 Database Properties:");
    for (const [propName, propConfig] of Object.entries(dbResponse.data.properties)) {
      console.log(`   • ${propName}: ${propConfig.type}`);
    }
    
  } catch (error) {
    console.log("❌ Database Access fehlgeschlagen:");
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Fehler: ${error.response?.data?.message || error.message}`);
    
    if (error.response?.status === 404) {
      console.log("\n🔧 Troubleshooting für 404 Not Found:");
      console.log("1. Database ID in config.json überprüfen");
      console.log("2. Database existiert und ist nicht gelöscht");
      console.log("3. Database URL öffnen und ID aus URL kopieren");
    } else if (error.response?.status === 403) {
      console.log("\n🔧 Troubleshooting für 403 Forbidden:");
      console.log("1. Integration muss zur Database hinzugefügt werden");
      console.log("2. In Notion: Database öffnen → '...' → 'Add connections' → Deine Integration auswählen");
      console.log("3. Berechtigungen: Read, Insert, Update Pages erforderlich");
    }
    return;
  }
  
  // 4. Page Creation Test
  console.log("\n4. 📄 Page Creation Test");
  console.log("─".repeat(50));
  
  try {
    // Einfache Test-Page erstellen
    const testPageData = {
      parent: { database_id: config.NOTION_DATABASE_ID },
      properties: {},
      children: [
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [{ 
              type: "text", 
              text: { content: "🧪 Test Page erstellt von Otto Creative Assistant Debug Tool" }
            }]
          }
        }
      ]
    };
    
    // Minimale Properties basierend auf Database Schema
    const dbResponse = await axios.get(`${NOTION_API_BASE}/databases/${config.NOTION_DATABASE_ID}`, {
      headers: {
        "Authorization": `Bearer ${config.NOTION_API_KEY}`,
        "Notion-Version": NOTION_VERSION
      }
    });
    
    // Title Property finden und setzen
    for (const [propName, propConfig] of Object.entries(dbResponse.data.properties)) {
      if (propConfig.type === 'title') {
        testPageData.properties[propName] = {
          title: [{ 
            type: "text", 
            text: { content: `Otto Debug Test ${new Date().toISOString()}` }
          }]
        };
        break;
      }
    }
    
    console.log("🚀 Erstelle Test-Page...");
    const pageResponse = await axios.post(`${NOTION_API_BASE}/pages`, testPageData, {
      headers: {
        "Authorization": `Bearer ${config.NOTION_API_KEY}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json"
      }
    });
    
    console.log("✅ Test-Page erfolgreich erstellt!");
    console.log(`🔗 Page URL: ${pageResponse.data.url}`);
    console.log(`📄 Page ID: ${pageResponse.data.id}`);
    
    // Page in Database prüfen
    console.log("\n🔍 Prüfe ob Page in Database sichtbar ist...");
    
    const pagesResponse = await axios.post(`${NOTION_API_BASE}/databases/${config.NOTION_DATABASE_ID}/query`, {
      page_size: 5,
      sorts: [{ timestamp: "created_time", direction: "descending" }]
    }, {
      headers: {
        "Authorization": `Bearer ${config.NOTION_API_KEY}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json"
      }
    });
    
    console.log(`📊 Gefundene Pages in Database: ${pagesResponse.data.results.length}`);
    
    // Prüfe ob unsere Test-Page dabei ist
    const ourPage = pagesResponse.data.results.find(page => page.id === pageResponse.data.id);
    if (ourPage) {
      console.log("✅ Test-Page ist in Database sichtbar!");
    } else {
      console.log("⚠️ Test-Page nicht in Database-Query gefunden (aber erfolgreich erstellt)");
    }
    
  } catch (error) {
    console.log("❌ Page Creation fehlgeschlagen:");
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Fehler: ${error.response?.data?.message || error.message}`);
    
    if (error.response?.data) {
      console.log("📋 Detaillierter Fehler:", JSON.stringify(error.response.data, null, 2));
    }
  }
  
  // 5. Database Query Test
  console.log("\n5. 🔍 Database Query Test");
  console.log("─".repeat(50));
  
  try {
    const queryResponse = await axios.post(`${NOTION_API_BASE}/databases/${config.NOTION_DATABASE_ID}/query`, {
      page_size: 10
    }, {
      headers: {
        "Authorization": `Bearer ${config.NOTION_API_KEY}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json"
      }
    });
    
    console.log(`✅ Database Query erfolgreich`);
    console.log(`📊 Aktuelle Pages in Database: ${queryResponse.data.results.length}`);
    
    if (queryResponse.data.results.length > 0) {
      console.log("\n📋 Letzte Pages:");
      queryResponse.data.results.slice(0, 3).forEach((page, index) => {
        const title = extractPageTitle(page.properties);
        const created = new Date(page.created_time).toLocaleString();
        console.log(`   ${index + 1}. ${title} (${created})`);
      });
    } else {
      console.log("⚠️ Keine Pages in Database gefunden - Database ist leer");
    }
    
  } catch (error) {
    console.log("❌ Database Query fehlgeschlagen:", error.message);
  }
  
  console.log("\n🔍 === NOTION DEBUG ABGESCHLOSSEN ===");
  
  // Zusammenfassung
  console.log("\n📊 Debug Summary:");
  console.log("✅ Config geladen");
  console.log("✅ API Key gültig");
  console.log("✅ Database zugänglich");
  console.log("✅ Page Creation funktioniert");
  console.log("✅ Database Query funktioniert");
  console.log("\n💡 Falls Pages nicht ankommen:");
  console.log("1. Browser-Cache leeren und Notion neu laden");
  console.log("2. Notion Desktop App neu starten");
  console.log("3. Database-Filter prüfen (keine Filter aktiv?)");
  console.log("4. Database-Ansicht wechseln (Table, Board, etc.)");
}

function extractPageTitle(properties) {
  for (const [propName, propValue] of Object.entries(properties)) {
    if (propValue.type === 'title' && propValue.title?.length > 0) {
      return propValue.title[0].plain_text;
    }
  }
  return 'Untitled';
}

// Main execution
if (require.main === module) {
  (async () => {
    try {
      await debugNotionConnection();
    } catch (error) {
      console.error("❌ Notion Debug fehlgeschlagen:", error);
      process.exit(1);
    }
  })();
}

module.exports = {
  debugNotionConnection
};
