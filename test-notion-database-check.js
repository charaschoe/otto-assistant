/**
 * Debug-Tool für Notion Database Structure
 * Überprüft die existierenden Properties in der konfigurierten Database
 */

const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Lade Konfiguration
let config = {};
try {
  const configPath = path.resolve(__dirname, "config.json");
  config = JSON.parse(fs.readFileSync(configPath, "utf8"));
} catch (e) {
  console.error("❌ Konnte config.json nicht laden:", e.message);
  process.exit(1);
}

const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

async function checkDatabaseStructure() {
  const apiKey = config.NOTION_API_KEY;
  const databaseId = config.NOTION_DATABASE_ID;
  
  if (!apiKey || !databaseId) {
    console.error("❌ NOTION_API_KEY oder NOTION_DATABASE_ID fehlt in config.json");
    return;
  }

  try {
    console.log("🔍 === NOTION DATABASE STRUCTURE CHECK ===\n");
    console.log(`📊 Database ID: ${databaseId}`);
    
    // Database-Struktur abrufen
    const response = await axios.get(`${NOTION_API_BASE}/databases/${databaseId}`, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Notion-Version": NOTION_VERSION
      }
    });
    
    const database = response.data;
    console.log(`📝 Database Name: ${database.title[0]?.text?.content || 'Unnamed'}`);
    console.log(`🔗 Database URL: ${database.url}\n`);
    
    // Existierende Properties anzeigen
    console.log("📋 EXISTIERENDE PROPERTIES:");
    console.log("─".repeat(50));
    
    const properties = database.properties;
    Object.entries(properties).forEach(([name, config]) => {
      console.log(`✅ "${name}" (${config.type})`);
      
      // Zusätzliche Infos für bestimmte Typen
      if (config.type === 'select' && config.select?.options) {
        const options = config.select.options.map(opt => opt.name).join(', ');
        console.log(`   Options: ${options}`);
      }
      
      if (config.type === 'multi_select' && config.multi_select?.options) {
        const options = config.multi_select.options.map(opt => opt.name).join(', ');
        console.log(`   Options: ${options}`);
      }
    });
    
    console.log("\n🎯 ERWARTETE PROPERTIES (creative_briefing Template):");
    console.log("─".repeat(50));
    
    const expectedProperties = [
      "Name",
      "Client", 
      "Brand",
      "Project Type",
      "Status",
      "Priority",
      "Budget Range",
      "Target Audience",
      "Key Message",
      "Deliverables",
      "Timeline",
      "Team",
      "Tags",
      "Created",
      "Last Edited"
    ];
    
    expectedProperties.forEach(expectedProp => {
      if (properties[expectedProp]) {
        console.log(`✅ "${expectedProp}" - VORHANDEN (${properties[expectedProp].type})`);
      } else {
        console.log(`❌ "${expectedProp}" - FEHLT`);
      }
    });
    
    // Fehlende Properties identifizieren
    const missingProperties = expectedProperties.filter(prop => !properties[prop]);
    const extraProperties = Object.keys(properties).filter(prop => !expectedProperties.includes(prop));
    
    if (missingProperties.length > 0) {
      console.log("\n⚠️ FEHLENDE PROPERTIES:");
      missingProperties.forEach(prop => console.log(`   - ${prop}`));
    }
    
    if (extraProperties.length > 0) {
      console.log("\n📎 ZUSÄTZLICHE PROPERTIES:");
      extraProperties.forEach(prop => console.log(`   - ${prop} (${properties[prop].type})`));
    }
    
    console.log("\n💡 EMPFEHLUNG:");
    if (missingProperties.length > 0) {
      console.log("1. Erstelle die fehlenden Properties in deiner Notion Database");
      console.log("2. Oder passe den Code an, um nur existierende Properties zu verwenden");
      console.log("3. Oder verwende eine neue Database mit dem korrekten Schema");
    } else {
      console.log("✅ Database-Struktur ist kompatibel!");
    }
    
  } catch (error) {
    console.error("❌ Fehler beim Abrufen der Database-Struktur:");
    console.error("Status:", error.response?.status);
    console.error("Message:", error.response?.data?.message || error.message);
    
    if (error.response?.status === 404) {
      console.log("\n🔧 Troubleshooting:");
      console.log("- Database-ID korrekt?");
      console.log("- Integration hat Zugriff auf die Database?");
      console.log("- Database wurde mit der Integration geteilt?");
    }
    
    if (error.response?.status === 401) {
      console.log("\n🔧 Troubleshooting:");
      console.log("- API-Key korrekt?");
      console.log("- Integration existiert noch?");
    }
  }
}

// Funktion zum Erstellen einer kompatiblen Test-Database
async function createCompatibleDatabase() {
  const apiKey = config.NOTION_API_KEY;
  const parentPageId = config.NOTION_PARENT_PAGE_ID;
  
  if (!parentPageId) {
    console.log("❌ NOTION_PARENT_PAGE_ID fehlt - kann keine neue Database erstellen");
    return;
  }
  
  try {
    console.log("\n🛠️ Erstelle kompatible Test-Database...");
    
    const databaseData = {
      parent: { page_id: parentPageId },
      title: [{ type: "text", text: { content: "Otto Assistant - Creative Briefing" } }],
      properties: {
        "Name": { title: {} },
        "Client": { rich_text: {} },
        "Brand": { rich_text: {} },
        "Project Type": { 
          select: { 
            options: [
              { name: "Campaign", color: "blue" },
              { name: "Brand Identity", color: "green" },
              { name: "Website", color: "purple" },
              { name: "Print", color: "yellow" },
              { name: "Digital", color: "red" },
              { name: "Video", color: "pink" },
              { name: "Event", color: "gray" }
            ]
          }
        },
        "Status": { 
          select: { 
            options: [
              { name: "Briefing", color: "yellow" },
              { name: "Concept", color: "blue" },
              { name: "Execution", color: "purple" },
              { name: "Review", color: "orange" },
              { name: "Completed", color: "green" },
              { name: "On Hold", color: "red" }
            ]
          }
        },
        "Priority": { 
          select: { 
            options: [
              { name: "High", color: "red" },
              { name: "Medium", color: "yellow" },
              { name: "Low", color: "green" }
            ]
          }
        },
        "Target Audience": { rich_text: {} },
        "Key Message": { rich_text: {} },
        "Tags": { multi_select: { options: [] } },
        "Timeline": { date: {} },
        "Created": { created_time: {} },
        "Last Edited": { last_edited_time: {} }
      }
    };
    
    const response = await axios.post(`${NOTION_API_BASE}/databases`, databaseData, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json"
      }
    });
    
    console.log("✅ Neue Database erstellt!");
    console.log(`📊 Database ID: ${response.data.id}`);
    console.log(`🔗 Database URL: ${response.data.url}`);
    console.log("\n💡 Verwende diese Database ID in deiner config.json:");
    console.log(`"NOTION_DATABASE_ID": "${response.data.id}"`);
    
  } catch (error) {
    console.error("❌ Fehler beim Erstellen der Database:");
    console.error(error.response?.data || error.message);
  }
}

// Main execution
if (require.main === module) {
  (async () => {
    await checkDatabaseStructure();
    
    // Frage nach Database-Erstellung nur wenn PARENT_PAGE_ID vorhanden ist
    if (config.NOTION_PARENT_PAGE_ID) {
      console.log("\n❓ Möchtest du eine kompatible Test-Database erstellen?");
      console.log("   (Führe mit --create-db Flag aus)");
      
      if (process.argv.includes('--create-db')) {
        await createCompatibleDatabase();
      }
    }
  })();
}

module.exports = {
  checkDatabaseStructure,
  createCompatibleDatabase
};
