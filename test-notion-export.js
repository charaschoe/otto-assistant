/**
 * Einzeltest für Notion Export Funktionalität
 * VSCode Launch: 📊 Test Notion Export Only
 */

const { exportToNotionCompatible } = require('./src/integrations/notion-export-compatible');
const { createCreativeDatabase, testNotionExport } = require('./src/integrations/notion-export');

async function testNotionExportOnly() {
  console.log("📊 === NOTION EXPORT TEST ===\n");
  
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
    console.log("📊 Teste Notion Export...");
    
    const result = await exportToNotionCompatible(
      testData.transcript,
      testData.summary,
      testData.entities,
      testData.entityEmojis,
      { templateType: 'creative_briefing' }
    );
    
    if (result) {
      console.log("✅ Notion Export erfolgreich!");
      console.log(`🔗 Page URL: ${result}`);
      
      // Extrahiere Page-ID aus URL für weitere Tests
      const pageIdMatch = result.match(/([a-f0-9]{32})/);
      if (pageIdMatch) {
        console.log(`📄 Page ID: ${pageIdMatch[1]}`);
      }
      
    } else {
      console.log("⚠️ Notion Export mit Warnungen:");
      console.log("   - API-Keys in config.json prüfen");
      console.log("   - NOTION_API_KEY und NOTION_DATABASE_ID erforderlich");
      console.log("   - Netzwerkverbindung prüfen");
      console.log("   - Database-Berechtigungen prüfen");
    }
    
  } catch (error) {
    console.log("❌ Notion Export fehlgeschlagen:");
    console.log(`   Fehler: ${error.message}`);
    
    if (error.message.includes('API') || error.message.includes('401') || error.message.includes('403')) {
      console.log("\n🔧 Troubleshooting:");
      console.log("1. config.json erstellen mit:");
      console.log('   {');
      console.log('     "NOTION_API_KEY": "secret_xxxxx",');
      console.log('     "NOTION_DATABASE_ID": "xxxxx-xxxxx-xxxxx"');
      console.log('   }');
      console.log("2. Notion Integration erstellen: https://www.notion.so/my-integrations");
      console.log("3. Database mit Integration teilen");
      console.log("4. Korrekte Berechtigungen setzen (Read/Write)");
    }
  }
  
  console.log("\n📊 === NOTION EXPORT TEST ABGESCHLOSSEN ===");
}

// Zusätzliche Notion-spezifische Tests
async function testNotionTemplates() {
  console.log("\n📄 Teste Notion Templates...");
  
  const { notionCreativeSelector } = require('./src/integrations/notion-creative-templates');
  
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
      const template = notionCreativeSelector.selectTemplate('', '', type);
      const properties = notionCreativeSelector.createPageProperties(template, '', '', type, [], {});
      const templateData = notionCreativeSelector.extractTemplateData('', '', type, [], {});
      
      console.log(`✅ ${type}: Properties ${Object.keys(properties).length}, Data ${Object.keys(templateData).length} keys`);
    } catch (error) {
      console.log(`❌ ${type}: ${error.message}`);
    }
  }
}

async function testNotionBlockGeneration() {
  console.log("\n🧱 Teste Notion Block Generation...");
  
  const testMarkdown = `# Test Header
  
## Subheader

Dies ist ein Paragraph mit **bold** und *italic* Text.

- List Item 1
- List Item 2
- List Item 3

1. Numbered Item 1
2. Numbered Item 2

\`\`\`javascript
console.log("Code Block");
\`\`\`

---

Weiterer Paragraph nach Divider.`;

  try {
    // Simuliere Block-Generierung (würde normalerweise in exportToNotion passieren)
    const lines = testMarkdown.split('\n');
    let blockCount = 0;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      if (trimmedLine.startsWith('#')) {
        blockCount++; // Header
      } else if (trimmedLine.startsWith('-')) {
        blockCount++; // Bullet
      } else if (/^\d+\./.test(trimmedLine)) {
        blockCount++; // Numbered
      } else if (trimmedLine === '---') {
        blockCount++; // Divider
      } else if (trimmedLine.startsWith('```')) {
        blockCount++; // Code
      } else {
        blockCount++; // Paragraph
      }
    }
    
    console.log(`✅ Block Generation: ${blockCount} Blocks aus ${lines.length} Zeilen`);
    console.log(`📊 Conversion Rate: ${(blockCount / lines.length * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.log(`❌ Block Generation fehlgeschlagen: ${error.message}`);
  }
}

async function testNotionDatabaseCreation() {
  console.log("\n🗄️ Teste Database Creation...");
  
  const templateTypes = ['creative_briefing', 'design_review', 'client_presentation'];
  
  for (const type of templateTypes) {
    try {
      console.log(`🧪 Testing Database Creation für: ${type}`);
      
      // Hinweis: Dies würde normalerweise eine echte API-Anfrage machen
      // Hier simulieren wir nur die Template-Generierung
      const { notionCreativeSelector } = require('./src/integrations/notion-creative-templates');
      const template = notionCreativeSelector.selectTemplate('', '', type);
      
      if (template.properties) {
        const propertyCount = Object.keys(template.properties).length;
        console.log(`   ✅ ${type}: ${propertyCount} Properties definiert`);
      } else {
        console.log(`   ❌ ${type}: Keine Properties definiert`);
      }
      
    } catch (error) {
      console.log(`   ❌ ${type}: ${error.message}`);
    }
  }
  
  console.log("\n💡 Hinweis: Echte Database-Erstellung benötigt NOTION_PARENT_PAGE_ID in config.json");
}

async function testConfigValidation() {
  console.log("\n⚙️ Teste Notion Konfiguration...");
  
  const fs = require('fs');
  const path = require('path');
  
  try {
    const configPath = path.resolve(__dirname, 'config.json');
    
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      // Check required keys
      const requiredKeys = ['NOTION_API_KEY', 'NOTION_DATABASE_ID'];
      const optionalKeys = ['NOTION_PARENT_PAGE_ID'];
      
      console.log("📋 Konfiguration Status:");
      
      for (const key of requiredKeys) {
        if (config[key]) {
          console.log(`   ✅ ${key}: Konfiguriert (${config[key].substring(0, 10)}...)`);
        } else {
          console.log(`   ❌ ${key}: FEHLT (erforderlich)`);
        }
      }
      
      for (const key of optionalKeys) {
        if (config[key]) {
          console.log(`   ✅ ${key}: Konfiguriert (${config[key].substring(0, 10)}...)`);
        } else {
          console.log(`   ⚠️ ${key}: Nicht konfiguriert (optional)`);
        }
      }
      
    } else {
      console.log("❌ config.json nicht gefunden");
      console.log("💡 Erstelle config.json mit Notion API-Keys");
    }
    
  } catch (error) {
    console.log(`❌ Config Validation fehlgeschlagen: ${error.message}`);
  }
}

// Main execution
if (require.main === module) {
  (async () => {
    try {
      await testNotionExportOnly();
      await testNotionTemplates();
      await testNotionBlockGeneration();
      await testNotionDatabaseCreation();
      await testConfigValidation();
    } catch (error) {
      console.error("❌ Notion Export Test fehlgeschlagen:", error);
      process.exit(1);
    }
  })();
}

module.exports = {
  testNotionExportOnly,
  testNotionTemplates,
  testNotionBlockGeneration,
  testNotionDatabaseCreation,
  testConfigValidation
};
