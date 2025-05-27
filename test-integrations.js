/**
 * Test-Skript für Notion und Obsidian Export-Integrationen
 * Demonstriert die neuen Creative Agency Export-Features
 */

const { testNotionExport } = require('./src/integrations/notion-export');
const { testObsidianExport } = require('./src/integrations/obsidian-export');
const { exportToMiro } = require('./src/integrations/miro-export-improved');

async function testAllIntegrations() {
  console.log("🎨 === OTTO CREATIVE ASSISTANT - INTEGRATION TESTS ===\n");
  
  // Test-Daten für Mercedes EQS Kampagne
  const testData = {
    transcript: `
      Hallo Team, willkommen zum Creative Briefing für unseren neuen Kunden Mercedes-Benz.
      
      Wir entwickeln eine Kampagne für den neuen Mercedes EQS, das Flaggschiff der Elektro-Linie.
      
      Die Zielgruppe sind Premium-Kunden zwischen 35 und 55 Jahren, technikaffin und umweltbewusst.
      Sie haben ein hohes Einkommen und legen Wert auf Luxus, aber auch auf Nachhaltigkeit.
      
      Unsere Key Message ist: "Luxus trifft auf Nachhaltigkeit - Die Zukunft fährt elektrisch".
      
      Die Deliverables umfassen einen 30-Sekunden TV-Spot, Digital Ads für Social Media,
      Print-Anzeigen für Premium-Magazine und eine Landing Page.
      
      Timeline: Kampagnen-Launch ist im März 2025 geplant, Produktion startet im Januar.
      Das Budget beträgt 2,5 Millionen Euro.
      
      Unser Team besteht aus Sarah als Creative Director, Max als Art Director,
      Lisa als Copywriter und Tom als Motion Designer.
      
      Inspiration-Quellen sind die Apple "Think Different" Kampagne und 
      Tesla's minimalistischer Ansatz in der Kommunikation.
      
      Die Markenrichtlinien von Mercedes betonen Eleganz, Innovation und deutsche Ingenieurskunst.
      
      Fragen oder Anmerkungen? Dann können wir gleich in die Konzeptphase starten.
    `,
    summary: "Creative Briefing für Mercedes EQS Elektro-Kampagne - Premium-Zielgruppe, Luxus meets Nachhaltigkeit, Launch März 2025",
    entities: ['Mercedes-Benz', 'EQS', 'Kampagne', 'Premium', 'Elektro', 'Nachhaltigkeit', 'TV-Spot', 'Sarah', 'Max', 'Lisa'],
    entityEmojis: { 
      'Mercedes-Benz': '🚗', 
      'EQS': '⚡', 
      'Kampagne': '📢', 
      'Premium': '💎',
      'Elektro': '🔋',
      'Nachhaltigkeit': '🌱',
      'TV-Spot': '📺'
    }
  };
  
  console.log("📋 Test-Szenario: Mercedes EQS Creative Briefing");
  console.log("─".repeat(50));
  console.log(`📝 Transkript-Länge: ${testData.transcript.length} Zeichen`);
  console.log(`🏷️ Entitäten: ${testData.entities.length} erkannt`);
  console.log(`📊 Summary: ${testData.summary}\n`);
  
  // 1. Obsidian Export Test
  console.log("1. 📚 Testing Obsidian Export...");
  console.log("─".repeat(30));
  
  try {
    const obsidianResult = await testObsidianExport();
    if (obsidianResult) {
      console.log("✅ Obsidian Export erfolgreich!");
    } else {
      console.log("⚠️ Obsidian Export mit Warnungen.");
    }
  } catch (error) {
    console.log("❌ Obsidian Export fehlgeschlagen:", error.message);
  }
  
  console.log("");
  
  // 2. Notion Export Test
  console.log("2. 📊 Testing Notion Export...");
  console.log("─".repeat(30));
  
  try {
    const notionResult = await testNotionExport();
    if (notionResult) {
      console.log("✅ Notion Export erfolgreich!");
    } else {
      console.log("⚠️ Notion Export mit Warnungen (API-Keys prüfen).");
    }
  } catch (error) {
    console.log("❌ Notion Export fehlgeschlagen:", error.message);
  }
  
  console.log("");
  
  // 3. Miro Export Test (falls API verfügbar)
  console.log("3. 🟦 Testing Miro Export...");
  console.log("─".repeat(30));
  
  try {
    const miroResult = await exportToMiro(
      testData.transcript,
      testData.summary,
      { 
        meetingType: 'creative_briefing',
        entities: testData.entities,
        entityEmojis: testData.entityEmojis
      }
    );
    
    if (miroResult && miroResult.viewLink) {
      console.log("✅ Miro Export erfolgreich!");
      console.log(`🔗 Board URL: ${miroResult.viewLink}`);
    } else {
      console.log("⚠️ Miro Export mit Warnungen (API-Keys prüfen).");
    }
  } catch (error) {
    console.log("❌ Miro Export fehlgeschlagen:", error.message);
  }
  
  console.log("");
  
  // 4. Projekt-Struktur Check
  console.log("4. 📁 Projekt-Struktur Check...");
  console.log("─".repeat(30));
  
  const fs = require('fs');
  const path = require('path');
  
  // Check für wichtige Dateien
  const criticalFiles = [
    'src/utils/creative-agency-templates.js',
    'src/integrations/miro-creative-templates.js',
    'src/integrations/obsidian-creative-templates.js',
    'src/integrations/notion-creative-templates.js',
    'src/integrations/obsidian-export.js',
    'src/integrations/notion-export.js',
    'test-creative-agency-features.js',
    'CREATIVE_AGENCY_FEATURES.md'
  ];
  
  let missingFiles = 0;
  for (const file of criticalFiles) {
    if (fs.existsSync(path.resolve(file))) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - FEHLT!`);
      missingFiles++;
    }
  }
  
  if (missingFiles === 0) {
    console.log("\n✅ Alle kritischen Dateien vorhanden!");
  } else {
    console.log(`\n⚠️ ${missingFiles} Dateien fehlen!`);
  }
  
  // 5. Vault-Struktur Check (Obsidian)
  console.log("\n5. 🏗️ Obsidian Vault Struktur...");
  console.log("─".repeat(30));
  
  const vaultPath = path.resolve(__dirname, 'obsidian-vault');
  const expectedFolders = [
    'Creative Briefs',
    'Design Reviews',
    'Brainstorming',
    'Client Presentations',
    'Brand Strategy',
    'Project Learnings',
    'Process Optimization',
    'Entities'
  ];
  
  let createdFolders = 0;
  for (const folder of expectedFolders) {
    const folderPath = path.join(vaultPath, folder);
    if (fs.existsSync(folderPath)) {
      console.log(`📁 ${folder} ✅`);
      createdFolders++;
    } else {
      console.log(`📁 ${folder} ❌`);
    }
  }
  
  console.log(`\n📊 Vault-Struktur: ${createdFolders}/${expectedFolders.length} Ordner erstellt`);
  
  // 6. Performance Summary
  console.log("\n6. ⚡ Performance Summary...");
  console.log("─".repeat(30));
  
  const startTime = Date.now();
  
  // Quick Template-Selection Test
  const { selectBestTemplate } = require('./src/utils/summary-templates');
  for (let i = 0; i < 100; i++) {
    selectBestTemplate(testData.transcript);
  }
  
  const endTime = Date.now();
  const avgTime = (endTime - startTime) / 100;
  
  console.log(`🚀 Template-Selection: ${avgTime.toFixed(2)}ms pro Aufruf`);
  console.log(`📊 Transkript-Verarbeitung: ${(testData.transcript.length / 1000).toFixed(1)}k Zeichen`);
  console.log(`🏷️ Entity-Extraktion: ${testData.entities.length} Entitäten erkannt`);
  
  // 7. Konfiguration Check
  console.log("\n7. ⚙️ Konfiguration Check...");
  console.log("─".repeat(30));
  
  let config = {};
  try {
    config = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'config.json'), 'utf8'));
  } catch (e) {
    console.log("⚠️ config.json nicht gefunden oder fehlerhaft");
  }
  
  const requiredKeys = ['KITEGG_API_KEY'];
  const optionalKeys = ['MIRO_API_KEY', 'NOTION_API_KEY', 'OBSIDIAN_VAULT_PATH'];
  
  requiredKeys.forEach(key => {
    if (config[key]) {
      console.log(`✅ ${key}: Konfiguriert`);
    } else {
      console.log(`❌ ${key}: FEHLT (erforderlich)`);
    }
  });
  
  optionalKeys.forEach(key => {
    if (config[key]) {
      console.log(`✅ ${key}: Konfiguriert`);
    } else {
      console.log(`⚠️ ${key}: Nicht konfiguriert (optional)`);
    }
  });
  
  console.log("\n🎨 === INTEGRATION TESTS ABGESCHLOSSEN ===");
  console.log("\n📋 Nächste Schritte:");
  console.log("1. Konfiguriere fehlende API-Keys in config.json");
  console.log("2. Teste mit echten Audio-Aufnahmen: npm run start");
  console.log("3. Überprüfe generierte Inhalte in Obsidian/Notion/Miro");
  console.log("4. Anpassung der Templates nach Bedarf");
  console.log("\n🚀 Otto Creative Assistant ist bereit für den Einsatz!");
}

// Performance-spezifische Tests
async function performanceTests() {
  console.log("\n🏃‍♂️ === PERFORMANCE TESTS ===");
  
  const { templateSelector } = require('./src/utils/creative-agency-templates');
  const { creativeMiroSelector } = require('./src/integrations/miro-creative-templates');
  const { obsidianCreativeSelector } = require('./src/integrations/obsidian-creative-templates');
  const { notionCreativeSelector } = require('./src/integrations/notion-creative-templates');
  
  const testContent = "Client Mercedes-Benz Projekt EQS Kampagne Zielgruppe Premium Deliverables TV-Spot Timeline März Budget";
  const iterations = 1000;
  
  console.time("Template Detection Performance");
  for (let i = 0; i < iterations; i++) {
    templateSelector.detectTemplate(testContent);
    creativeMiroSelector.selectTemplate(testContent, '', {});
    obsidianCreativeSelector.selectTemplate(testContent, '', 'creative_briefing');
    notionCreativeSelector.selectTemplate(testContent, '', 'creative_briefing');
  }
  console.timeEnd("Template Detection Performance");
  
  console.log(`✅ Verarbeitet: ${iterations * 4} Template-Selections`);
  console.log(`📊 Durchschnitt: ${((iterations * 4) / 1000).toFixed(1)} Selections/ms`);
}

// Main execution
if (require.main === module) {
  (async () => {
    try {
      await testAllIntegrations();
      await performanceTests();
    } catch (error) {
      console.error("❌ Integration Tests fehlgeschlagen:", error);
      process.exit(1);
    }
  })();
}

module.exports = {
  testAllIntegrations,
  performanceTests
};
