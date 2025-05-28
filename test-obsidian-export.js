/**
 * Einzeltest für Obsidian Export Funktionalität
 * VSCode Launch: 📚 Test Obsidian Export Only
 */

const { exportToObsidian, setupCreativeVaultStructure, testObsidianExport } = require('./src/integrations/obsidian-export');
const fs = require('fs');
const path = require('path');

async function testObsidianExportOnly() {
  console.log("📚 === OBSIDIAN EXPORT TEST ===\n");
  
  const testData = {
    transcript: `
      Creative Briefing für Mercedes EQS Kampagne.
      Zielgruppe: Premium-Kunden, 35-55 Jahre, umweltbewusst.
      Hauptbotschaft: Luxus trifft Nachhaltigkeit.
      Deliverables: TV-Spot, Digital Ads, Print, Landing Page.
      Budget: 2,5 Millionen Euro.
      Team: Sarah (Creative Director), Max (Art Director), Lisa (Copywriter).
      Timeline: Launch März 2025, Produktion startet Januar.
    `,
    summary: "Creative Briefing für Mercedes EQS Elektro-Kampagne",
    entities: ['Mercedes-Benz', 'EQS', 'Kampagne', 'Premium', 'TV-Spot', 'Sarah', 'Max', 'Lisa'],
    entityEmojis: { 
      'Mercedes-Benz': '🚗', 
      'EQS': '⚡', 
      'Kampagne': '📢',
      'Premium': '💎',
      'TV-Spot': '📺',
      'Sarah': '👩‍💼',
      'Max': '👨‍🎨'
    }
  };
  
  console.log("📋 Test-Szenario: Mercedes EQS Creative Briefing");
  console.log("─".repeat(50));
  console.log(`📝 Transkript-Länge: ${testData.transcript.length} Zeichen`);
  console.log(`🏷️ Entitäten: ${testData.entities.length} erkannt`);
  console.log(`📊 Summary: ${testData.summary}\n`);
  
  try {
    // 1. Vault-Struktur Setup
    console.log("📁 Setup Obsidian Vault Struktur...");
    const vaultPath = path.resolve(__dirname, 'obsidian-vault');
    await setupCreativeVaultStructure(vaultPath);
    console.log(`✅ Vault erstellt: ${vaultPath}`);
    
    // 2. Export Test
    console.log("\n📚 Teste Obsidian Export...");
    
    const result = await exportToObsidian(
      testData.transcript,
      testData.summary,
      testData.entities,
      testData.entityEmojis,
      { templateType: 'creative_briefing' }
    );
    
    if (result) {
      console.log("✅ Obsidian Export erfolgreich!");
      console.log(`📄 Datei erstellt: ${result}`);
      
      // 3. Datei-Inhalt prüfen
      if (fs.existsSync(result)) {
        const content = fs.readFileSync(result, 'utf8');
        console.log(`📊 Content-Länge: ${content.length} Zeichen`);
        console.log(`🔗 Links erkannt: ${(content.match(/\[\[.*?\]\]/g) || []).length}`);
        console.log(`🏷️ Tags erkannt: ${(content.match(/#[\w-]+/g) || []).length}`);
        
        // Zeige ersten Teil des Contents
        console.log("\n📝 Content-Vorschau:");
        console.log("─".repeat(30));
        console.log(content.substring(0, 300) + "...");
      }
      
      // 4. Entity-Dateien prüfen
      console.log("\n🔍 Prüfe Entity-Dateien...");
      const entitiesPath = path.join(vaultPath, 'Entities');
      if (fs.existsSync(entitiesPath)) {
        const entityFiles = fs.readdirSync(entitiesPath);
        console.log(`✅ Entity-Dateien erstellt: ${entityFiles.length}`);
        entityFiles.forEach(file => {
          console.log(`   📋 ${file}`);
        });
      }
      
    } else {
      console.log("⚠️ Obsidian Export mit Warnungen:");
      console.log("   - Vault-Pfad prüfen");
      console.log("   - Schreibrechte prüfen");
      console.log("   - Template-Konfiguration prüfen");
    }
    
  } catch (error) {
    console.log("❌ Obsidian Export fehlgeschlagen:");
    console.log(`   Fehler: ${error.message}`);
    
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Obsidian Vault Pfad in config.json setzen:");
    console.log('   { "OBSIDIAN_VAULT_PATH": "/path/to/your/vault" }');
    console.log("2. Schreibrechte für Vault-Ordner prüfen");
    console.log("3. Obsidian Templates prüfen");
  }
  
  console.log("\n📚 === OBSIDIAN EXPORT TEST ABGESCHLOSSEN ===");
}

// Zusätzliche Obsidian-spezifische Tests
async function testObsidianVaultStructure() {
  console.log("\n🏗️ Teste Vault-Struktur...");
  
  const vaultPath = path.resolve(__dirname, 'obsidian-vault');
  const expectedFolders = [
    'Creative Briefs',
    'Design Reviews',
    'Brainstorming',
    'Client Presentations',
    'Brand Strategy',
    'Project Learnings',
    'Process Optimization',
    'Entities',
    'Templates',
    'Archive'
  ];
  
  let createdFolders = 0;
  for (const folder of expectedFolders) {
    const folderPath = path.join(vaultPath, folder);
    if (fs.existsSync(folderPath)) {
      console.log(`✅ ${folder}`);
      createdFolders++;
    } else {
      console.log(`❌ ${folder} - Fehlt`);
    }
  }
  
  console.log(`\n📊 Vault-Struktur: ${createdFolders}/${expectedFolders.length} Ordner vorhanden`);
  
  // Dashboard Check
  const dashboardPath = path.join(vaultPath, 'Creative Agency Dashboard.md');
  if (fs.existsSync(dashboardPath)) {
    console.log("✅ Creative Agency Dashboard vorhanden");
    const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
    console.log(`📊 Dashboard-Länge: ${dashboardContent.length} Zeichen`);
  } else {
    console.log("❌ Creative Agency Dashboard fehlt");
  }
}

async function testObsidianTemplates() {
  console.log("\n📄 Teste Obsidian Templates...");
  
  const { obsidianCreativeSelector } = require('./src/integrations/obsidian-creative-templates');
  
  const templateTypes = [
    'creative_briefing',
    'design_review', 
    'creative_brainstorming',
    'client_presentation',
    'brand_workshop',
    'project_postmortem',
    'workflow_optimization'
  ];
  
  for (const type of templateTypes) {
    try {
      const template = obsidianCreativeSelector.selectTemplate('', '', type);
      const templateData = obsidianCreativeSelector.extractTemplateData('', '', type, [], {});
      
      console.log(`✅ ${type}: Template ${template.length}c, Data ${Object.keys(templateData).length} keys`);
    } catch (error) {
      console.log(`❌ ${type}: ${error.message}`);
    }
  }
}

// Datei-System Tests
async function testFileSystemOperations() {
  console.log("\n💾 Teste File-System Operationen...");
  
  const testPath = path.resolve(__dirname, 'obsidian-vault', 'test-file.md');
  const testContent = `# Test File\n\nDies ist eine Test-Datei für Otto Creative Assistant.\n\n## Tags\n#test #otto-generated\n\n## Links\n[[Test Entity]]`;
  
  try {
    // Schreibe Test-Datei
    fs.writeFileSync(testPath, testContent, 'utf8');
    console.log("✅ Test-Datei erstellt");
    
    // Lese Test-Datei
    const readContent = fs.readFileSync(testPath, 'utf8');
    if (readContent === testContent) {
      console.log("✅ Test-Datei korrekt gelesen");
    } else {
      console.log("❌ Test-Datei Inhalt stimmt nicht überein");
    }
    
    // Lösche Test-Datei
    fs.unlinkSync(testPath);
    console.log("✅ Test-Datei gelöscht");
    
  } catch (error) {
    console.log(`❌ File-System Test fehlgeschlagen: ${error.message}`);
  }
}

// Main execution
if (require.main === module) {
  (async () => {
    try {
      await testObsidianExportOnly();
      await testObsidianVaultStructure();
      await testObsidianTemplates();
      await testFileSystemOperations();
    } catch (error) {
      console.error("❌ Obsidian Export Test fehlgeschlagen:", error);
      process.exit(1);
    }
  })();
}

module.exports = {
  testObsidianExportOnly,
  testObsidianVaultStructure,
  testObsidianTemplates,
  testFileSystemOperations
};
