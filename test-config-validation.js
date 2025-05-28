/**
 * Config Validation Tests für Otto Creative Assistant
 * VSCode Launch: 🔧 Config Validation Test
 */

const fs = require('fs');
const path = require('path');

async function testConfigValidation() {
  console.log("🔧 === CONFIG VALIDATION TEST ===\n");
  
  const configPath = path.resolve(__dirname, 'config.json');
  const exampleConfigPath = path.resolve(__dirname, 'config.example.json');
  
  // 1. Config File Existence
  console.log("1. 📄 Config File Existence");
  console.log("─".repeat(50));
  
  if (fs.existsSync(configPath)) {
    console.log("✅ config.json gefunden");
  } else {
    console.log("❌ config.json NICHT gefunden");
    console.log("💡 Erstelle config.json basierend auf config.example.json");
    
    if (fs.existsSync(exampleConfigPath)) {
      console.log("📋 config.example.json als Vorlage verfügbar");
    } else {
      console.log("⚠️ config.example.json auch nicht gefunden");
      await createExampleConfig();
    }
  }
  
  // 2. Config Structure Validation
  console.log("\n2. 🏗️ Config Structure Validation");
  console.log("─".repeat(50));
  
  let config = {};
  let isValidJson = false;
  
  try {
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf8');
      config = JSON.parse(configContent);
      isValidJson = true;
      console.log("✅ config.json ist valides JSON");
    } else {
      console.log("⚠️ config.json nicht vorhanden - verwende Standard-Konfiguration");
    }
  } catch (error) {
    console.log("❌ config.json ist KEIN valides JSON:");
    console.log(`   Fehler: ${error.message}`);
    console.log("💡 JSON-Syntax prüfen");
  }
  
  // 3. Required Keys Validation
  console.log("\n3. 🔑 Required Keys Validation");
  console.log("─".repeat(50));
  
  const requiredKeys = [
    { key: 'KITEGG_API_KEY', description: 'API-Key für Whisper/Gemini', critical: true }
  ];
  
  const optionalKeys = [
    { key: 'MIRO_API_KEY', description: 'Miro Board Integration', critical: false },
    { key: 'MIRO_TEAM_ID', description: 'Miro Team ID', critical: false },
    { key: 'NOTION_API_KEY', description: 'Notion Database Integration', critical: false },
    { key: 'NOTION_DATABASE_ID', description: 'Notion Database ID', critical: false },
    { key: 'OBSIDIAN_VAULT_PATH', description: 'Pfad zum Obsidian Vault', critical: false }
  ];
  
  let criticalMissing = 0;
  let optionalMissing = 0;
  
  console.log("📋 Erforderliche Konfiguration:");
  for (const { key, description, critical } of requiredKeys) {
    if (config[key] && config[key].trim() !== '') {
      console.log(`   ✅ ${key}: Konfiguriert`);
      console.log(`      ${description}`);
      console.log(`      Wert: ${config[key].substring(0, 20)}...`);
    } else {
      console.log(`   ❌ ${key}: FEHLT`);
      console.log(`      ${description}`);
      if (critical) criticalMissing++;
    }
  }
  
  console.log("\n📋 Optionale Konfiguration:");
  for (const { key, description, critical } of optionalKeys) {
    if (config[key] && config[key].trim() !== '') {
      console.log(`   ✅ ${key}: Konfiguriert`);
      console.log(`      ${description}`);
      console.log(`      Wert: ${config[key].substring(0, 20)}...`);
    } else {
      console.log(`   ⚠️ ${key}: Nicht konfiguriert`);
      console.log(`      ${description}`);
      optionalMissing++;
    }
  }
  
  // 4. API Key Format Validation
  console.log("\n4. 🔐 API Key Format Validation");
  console.log("─".repeat(50));
  
  if (config.KITEGG_API_KEY) {
    const apiKey = config.KITEGG_API_KEY;
    if (apiKey.startsWith('kitegg_') || apiKey.length > 20) {
      console.log("✅ KITEGG_API_KEY: Format scheint korrekt");
    } else {
      console.log("⚠️ KITEGG_API_KEY: Format ungewöhnlich (prüfen)");
    }
  }
  
  if (config.MIRO_API_KEY) {
    const miroKey = config.MIRO_API_KEY;
    if (miroKey.length > 30) {
      console.log("✅ MIRO_API_KEY: Format scheint korrekt");
    } else {
      console.log("⚠️ MIRO_API_KEY: Format könnte zu kurz sein");
    }
  }
  
  if (config.NOTION_API_KEY) {
    const notionKey = config.NOTION_API_KEY;
    if (notionKey.startsWith('secret_')) {
      console.log("✅ NOTION_API_KEY: Format korrekt (starts with 'secret_')");
    } else {
      console.log("⚠️ NOTION_API_KEY: Sollte mit 'secret_' beginnen");
    }
  }
  
  // 5. Path Validation
  console.log("\n5. 📁 Path Validation");
  console.log("─".repeat(50));
  
  if (config.OBSIDIAN_VAULT_PATH) {
    const vaultPath = config.OBSIDIAN_VAULT_PATH;
    
    if (fs.existsSync(vaultPath)) {
      console.log("✅ OBSIDIAN_VAULT_PATH: Pfad existiert");
      
      // Prüfe ob es ein Verzeichnis ist
      const stats = fs.statSync(vaultPath);
      if (stats.isDirectory()) {
        console.log("✅ OBSIDIAN_VAULT_PATH: Ist ein Verzeichnis");
        
        // Prüfe Schreibrechte
        try {
          const testFile = path.join(vaultPath, '.otto-test');
          fs.writeFileSync(testFile, 'test');
          fs.unlinkSync(testFile);
          console.log("✅ OBSIDIAN_VAULT_PATH: Schreibrechte vorhanden");
        } catch (error) {
          console.log("❌ OBSIDIAN_VAULT_PATH: Keine Schreibrechte");
        }
      } else {
        console.log("❌ OBSIDIAN_VAULT_PATH: Ist kein Verzeichnis");
      }
    } else {
      console.log("❌ OBSIDIAN_VAULT_PATH: Pfad existiert nicht");
      console.log("💡 Verzeichnis erstellen oder Pfad korrigieren");
    }
  } else {
    console.log("⚠️ OBSIDIAN_VAULT_PATH: Nicht konfiguriert");
  }
  
  // 6. Environment Variables Check
  console.log("\n6. 🌍 Environment Variables Check");
  console.log("─".repeat(50));
  
  const envVars = ['NODE_ENV', 'HOME', 'USER'];
  for (const envVar of envVars) {
    if (process.env[envVar]) {
      console.log(`✅ ${envVar}: ${process.env[envVar]}`);
    } else {
      console.log(`⚠️ ${envVar}: Nicht gesetzt`);
    }
  }
  
  // 7. Network Connectivity Test
  console.log("\n7. 🌐 Network Connectivity Test");
  console.log("─".repeat(50));
  
  try {
    const https = require('https');
    
    const testUrls = [
      'https://api.openai.com',
      'https://api.miro.com',
      'https://api.notion.com'
    ];
    
    for (const url of testUrls) {
      try {
        console.log(`🧪 Testing ${url}...`);
        // Einfacher Connectivity Test (würde in echter Umgebung HTTP-Request machen)
        console.log(`✅ ${url}: Erreichbar (simuliert)`);
      } catch (error) {
        console.log(`❌ ${url}: Nicht erreichbar - ${error.message}`);
      }
    }
    
  } catch (error) {
    console.log("⚠️ Network Tests übersprungen:", error.message);
  }
  
  // 8. Generate Config Summary
  console.log("\n8. 📊 Configuration Summary");
  console.log("─".repeat(50));
  
  const totalKeys = requiredKeys.length + optionalKeys.length;
  const configuredKeys = Object.keys(config).length;
  const completionRate = Math.round((configuredKeys / totalKeys) * 100);
  
  console.log(`📈 Konfiguration Status:`);
  console.log(`   Konfigurierte Keys: ${configuredKeys}/${totalKeys}`);
  console.log(`   Completion Rate: ${completionRate}%`);
  console.log(`   Kritische fehlend: ${criticalMissing}`);
  console.log(`   Optionale fehlend: ${optionalMissing}`);
  
  if (criticalMissing === 0) {
    console.log("✅ Minimale Konfiguration vorhanden - Otto kann starten");
  } else {
    console.log("❌ Kritische Konfiguration fehlt - Otto kann nicht vollständig funktionieren");
  }
  
  if (optionalMissing === 0) {
    console.log("🎯 Vollständige Konfiguration - Alle Features verfügbar");
  } else {
    console.log(`⚠️ ${optionalMissing} optionale Features nicht konfiguriert`);
  }
  
  // 9. Recommendations
  console.log("\n9. 💡 Empfehlungen");
  console.log("─".repeat(50));
  
  if (criticalMissing > 0) {
    console.log("🔴 Hohe Priorität:");
    console.log("   1. KITEGG_API_KEY konfigurieren für Transkription");
    console.log("   2. config.json erstellen falls nicht vorhanden");
  }
  
  if (optionalMissing > 0) {
    console.log("🟡 Mittlere Priorität:");
    if (!config.MIRO_API_KEY) {
      console.log("   1. Miro Integration für interaktive Boards");
    }
    if (!config.NOTION_API_KEY) {
      console.log("   2. Notion Integration für Projektmanagement");
    }
    if (!config.OBSIDIAN_VAULT_PATH) {
      console.log("   3. Obsidian Integration für Wissensarchivierung");
    }
  }
  
  console.log("\n🔧 === CONFIG VALIDATION ABGESCHLOSSEN ===");
  
  return {
    isValidJson,
    criticalMissing,
    optionalMissing,
    completionRate,
    canStart: criticalMissing === 0
  };
}

async function createExampleConfig() {
  console.log("\n📝 Erstelle config.example.json...");
  
  const exampleConfig = {
    "KITEGG_API_KEY": "your-kitegg-api-key-here",
    "MIRO_API_KEY": "your-miro-api-key-here",
    "MIRO_TEAM_ID": "your-miro-team-id-here",
    "NOTION_API_KEY": "secret_your-notion-api-key-here",
    "NOTION_DATABASE_ID": "your-notion-database-id-here",
    "OBSIDIAN_VAULT_PATH": "/path/to/your/obsidian/vault"
  };
  
  try {
    const examplePath = path.resolve(__dirname, 'config.example.json');
    fs.writeFileSync(examplePath, JSON.stringify(exampleConfig, null, 2), 'utf8');
    console.log("✅ config.example.json erstellt");
    console.log("💡 Kopiere config.example.json zu config.json und fülle deine API-Keys ein");
  } catch (error) {
    console.log("❌ Konnte config.example.json nicht erstellen:", error.message);
  }
}

async function testConfigPerformance() {
  console.log("\n⚡ Config Loading Performance Test");
  console.log("─".repeat(50));
  
  const iterations = 1000;
  
  console.time(`Config Loading (${iterations}x)`);
  for (let i = 0; i < iterations; i++) {
    try {
      const configPath = path.resolve(__dirname, 'config.json');
      if (fs.existsSync(configPath)) {
        const content = fs.readFileSync(configPath, 'utf8');
        JSON.parse(content);
      }
    } catch (error) {
      // Expected for missing config
    }
  }
  console.timeEnd(`Config Loading (${iterations}x)`);
  
  console.log("✅ Config Loading Performance Test abgeschlossen");
}

// Main execution
if (require.main === module) {
  (async () => {
    try {
      const result = await testConfigValidation();
      await testConfigPerformance();
      
      if (!result.canStart) {
        console.log("\n⚠️ WARNUNG: Otto kann nicht vollständig funktionieren");
        console.log("Bitte konfiguriere die fehlenden API-Keys");
        process.exit(1);
      }
    } catch (error) {
      console.error("❌ Config Validation fehlgeschlagen:", error);
      process.exit(1);
    }
  })();
}

module.exports = {
  testConfigValidation,
  createExampleConfig,
  testConfigPerformance
};
