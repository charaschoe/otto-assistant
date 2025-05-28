/**
 * Test für kompatible Notion Export Funktionalität
 * Verwendet nur existierende Database-Properties
 */

const { exportToNotionCompatible } = require('./src/integrations/notion-export-compatible');

async function testCompatibleNotionExport() {
  console.log("🎯 === KOMPATIBLE NOTION EXPORT TEST ===\n");
  
  const testData = {
    transcript: `
      Creative Briefing für Mercedes EQS Kampagne.
      Zielgruppe: Premium-Kunden, 35-55 Jahre, umweltbewusst.
      Hauptbotschaft: Luxus trifft Nachhaltigkeit.
      Deliverables: TV-Spot, Digital Ads, Print, Landing Page.
      Budget: 2,5 Millionen Euro.
      Team: Sarah (Creative Director), Max (Art Director), Lisa (Copywriter).
      Timeline: Launch März 2025, Produktion startet Januar.
      Client: Mercedes-Benz Deutschland GmbH.
    `,
    summary: "Creative Briefing für Mercedes EQS Elektro-Kampagne - Premium-Zielgruppe, Luxus meets Nachhaltigkeit, Launch März 2025",
    entities: ['Mercedes-Benz', 'EQS', 'Kampagne', 'Premium', 'TV-Spot', 'Sarah', 'Max', 'Lisa'],
    entityEmojis: { 
      'Mercedes-Benz': '🚗', 
      'EQS': '⚡', 
      'Kampagne': '📢',
      'Premium': '💎',
      'TV-Spot': '📺',
      'Sarah': '👩‍💼',
      'Max': '👨‍🎨',
      'Lisa': '✍️'
    }
  };
  
  console.log("📋 Test-Szenario: Mercedes EQS Creative Briefing");
  console.log("─".repeat(50));
  console.log(`📝 Transkript-Länge: ${testData.transcript.length} Zeichen`);
  console.log(`🏷️ Entitäten: ${testData.entities.length} erkannt`);
  console.log(`📊 Summary: ${testData.summary}\n`);
  
  try {
    console.log("📊 Starte kompatiblen Notion Export...");
    
    const result = await exportToNotionCompatible(
      testData.transcript,
      testData.summary,
      testData.entities,
      testData.entityEmojis,
      { templateType: 'creative_briefing' }
    );
    
    if (result) {
      console.log("\n✅ NOTION EXPORT ERFOLGREICH!");
      console.log(`🔗 Page URL: ${result}`);
      
      // Extrahiere Page-ID aus URL für weitere Tests
      const pageIdMatch = result.match(/([a-f0-9]{32})/);
      if (pageIdMatch) {
        console.log(`📄 Page ID: ${pageIdMatch[1]}`);
      }
      
      console.log("\n🎉 Die Session wurde erfolgreich in deine Notion Database exportiert!");
      console.log("💡 Du findest sie in deiner 'OTTO Table' Database.");
      
    } else {
      console.log("\n❌ NOTION EXPORT FEHLGESCHLAGEN");
      console.log("⚠️ Mögliche Ursachen:");
      console.log("   - API-Keys in config.json prüfen");
      console.log("   - NOTION_API_KEY und NOTION_DATABASE_ID korrekt?");
      console.log("   - Netzwerkverbindung prüfen");
      console.log("   - Database-Berechtigungen prüfen");
      console.log("   - Integration mit Database geteilt?");
    }
    
  } catch (error) {
    console.log("\n❌ NOTION EXPORT FEHLER:");
    console.log(`   ${error.message}`);
    
    if (error.message.includes('API') || error.message.includes('401') || error.message.includes('403')) {
      console.log("\n🔧 Troubleshooting:");
      console.log("1. Notion Integration prüfen: https://www.notion.so/my-integrations");
      console.log("2. Database mit Integration teilen");
      console.log("3. Korrekte Berechtigungen setzen (Read/Write)");
      console.log("4. API-Key und Database-ID in config.json prüfen");
    }
    
    if (error.message.includes('404')) {
      console.log("\n🔧 Database-Problem:");
      console.log("1. Database-ID korrekt?");
      console.log("2. Database existiert noch?");
      console.log("3. Zugriff auf Database vorhanden?");
    }
  }
  
  console.log("\n🎯 === KOMPATIBLE NOTION EXPORT TEST ABGESCHLOSSEN ===");
}

// Zusätzlicher Test zum Vergleich der Ansätze
async function compareExportMethods() {
  console.log("\n🔄 === VERGLEICH: ORIGINAL vs KOMPATIBEL ===\n");
  
  const testData = {
    transcript: "Test-Session für Vergleich der Export-Methoden.",
    summary: "Kurzer Test zum Vergleich",
    entities: ['Test', 'Vergleich'],
    entityEmojis: { 'Test': '🧪', 'Vergleich': '🔄' }
  };
  
  console.log("1️⃣ Original Export (erwartet Fehler):");
  try {
    const { exportToNotion } = require('./src/integrations/notion-export');
    const originalResult = await exportToNotion(
      testData.transcript,
      testData.summary,
      testData.entities,
      testData.entityEmojis,
      { templateType: 'creative_briefing' }
    );
    
    if (originalResult) {
      console.log("   ✅ Original Export erfolgreich (unerwartet!)");
    } else {
      console.log("   ❌ Original Export fehlgeschlagen (erwartet)");
    }
  } catch (error) {
    console.log("   ❌ Original Export Fehler (erwartet):", error.message.substring(0, 100) + '...');
  }
  
  console.log("\n2️⃣ Kompatible Export (erwartet Erfolg):");
  try {
    const compatibleResult = await exportToNotionCompatible(
      testData.transcript,
      testData.summary,
      testData.entities,
      testData.entityEmojis,
      { templateType: 'creative_briefing' }
    );
    
    if (compatibleResult) {
      console.log("   ✅ Kompatible Export erfolgreich!");
      console.log(`   🔗 ${compatibleResult}`);
    } else {
      console.log("   ❌ Kompatible Export fehlgeschlagen");
    }
  } catch (error) {
    console.log("   ❌ Kompatible Export Fehler:", error.message.substring(0, 100) + '...');
  }
  
  console.log("\n💡 FAZIT:");
  console.log("Die kompatible Version sollte funktionieren, weil sie:");
  console.log("- Zuerst die verfügbaren Properties der Database prüft");
  console.log("- Nur existierende Properties verwendet");
  console.log("- Flexibel mit verschiedenen Database-Strukturen umgeht");
}

// Main execution
if (require.main === module) {
  (async () => {
    try {
      await testCompatibleNotionExport();
      await compareExportMethods();
    } catch (error) {
      console.error("❌ Test fehlgeschlagen:", error);
      process.exit(1);
    }
  })();
}

module.exports = {
  testCompatibleNotionExport,
  compareExportMethods
};
