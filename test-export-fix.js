#!/usr/bin/env node

/**
 * Test Export Fix - Überprüft ob Notion und Miro Export funktionieren
 */

// Lade .env Umgebungsvariablen
require('dotenv').config();

const { exportToNotion } = require('./src/integrations/notion-export');
const { exportToMiro } = require('./src/integrations/miro-export');

async function testExportFunctions() {
  console.log("🧪 Testing Export Functions Fix...");
  console.log("=" .repeat(50));
  
  const testSummary = "Test-Zusammenfassung für Otto Live Session";
  const testTitle = `Otto Live Test - ${new Date().toLocaleString().replace(/[/:]/g, '')}`;
  const testTranscript = "Das ist ein Test-Transkript für die Live-Session. Es enthält verschiedene Inhalte und Entitäten.";
  
  // Test Notion Export
  console.log("\n📝 Testing Notion Export...");
  try {
    const notionResult = await exportToNotion(testSummary, testTitle, {
      templateType: 'live-session'
    });
    
    if (notionResult) {
      console.log("✅ Notion Export erfolgreich!");
      console.log(`🔗 Notion URL: ${notionResult}`);
    } else {
      console.log("⚠️ Notion Export keine Daten (API-Keys fehlen?)");
    }
  } catch (error) {
    console.log("❌ Notion Export Fehler:", error.message);
  }
  
  // Test Miro Export
  console.log("\n🎨 Testing Miro Export...");
  try {
    const miroResult = await exportToMiro(testTranscript, testSummary, {
      useOptimizedLayout: true,
      meetingType: 'Live Session Test'
    });
    
    if (miroResult) {
      console.log("✅ Miro Export erfolgreich!");
      console.log(`🔗 Miro URL: ${miroResult}`);
    } else {
      console.log("⚠️ Miro Export keine Daten (API-Keys fehlen?)");
    }
  } catch (error) {
    console.log("❌ Miro Export Fehler:", error.message);
  }
  
  console.log("\n" + "=" .repeat(50));
  console.log("🔧 Export Function Test Complete");
  console.log("\nℹ️ Falls API-Keys fehlen:");
  console.log("   1. config.json bearbeiten");
  console.log("   2. NOTION_API_KEY und NOTION_DATABASE_ID hinzufügen");
  console.log("   3. MIRO_API_TOKEN hinzufügen");
}

// Run test if called directly
if (require.main === module) {
  testExportFunctions().catch(console.error);
}

module.exports = { testExportFunctions };