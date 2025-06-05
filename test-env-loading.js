#!/usr/bin/env node

/**
 * Test .env Loading - Überprüft ob Umgebungsvariablen korrekt geladen werden
 */

// Lade .env Umgebungsvariablen
require('dotenv').config();

console.log("🧪 Testing .env Variable Loading...");
console.log("=" .repeat(50));

// Überprüfe wichtige API-Keys
const envVars = [
  'NOTION_API_KEY',
  'NOTION_DATABASE_ID', 
  'MIRO_API_TOKEN',
  'MIRO_API_KEY',
  'MIRO_TEAM_ID',
  'KITEGG_API_KEY'
];

let foundVars = 0;

envVars.forEach(varName => {
  const value = process.env[varName];
  if (value && value.trim() !== '') {
    console.log(`✅ ${varName}: GESETZT (${value.substring(0, 10)}...)`);
    foundVars++;
  } else {
    console.log(`❌ ${varName}: NICHT GESETZT`);
  }
});

console.log("=" .repeat(50));
console.log(`📊 Gefundene Variablen: ${foundVars}/${envVars.length}`);

if (foundVars > 0) {
  console.log("✅ .env Datei wird korrekt geladen!");
  console.log("🚀 Export-Funktionen sollten jetzt funktionieren.");
} else {
  console.log("⚠️ Keine API-Keys gefunden in Umgebungsvariablen.");
  console.log("💡 Stellen Sie sicher, dass eine .env Datei existiert.");
}

console.log("\n🔍 Aktuelle .env Datei Suche in:");
console.log("   " + process.cwd());