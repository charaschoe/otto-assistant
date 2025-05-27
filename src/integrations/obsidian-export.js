/**
 * Obsidian Export Integration für Otto Assistant
 * Erweitert für Creative Agency Features
 */

const fs = require("fs");
const path = require("path");
const { obsidianCreativeSelector } = require("./obsidian-creative-templates");
const { selectBestTemplate } = require("../utils/summary-templates");

// Standard Obsidian Vault Pfad (kann in config.json überschrieben werden)
const DEFAULT_VAULT_PATH = path.resolve(__dirname, "../../obsidian-vault");

// Lade Konfiguration
let config = {};
try {
  const configPath = path.resolve(__dirname, "../../config.json");
  config = JSON.parse(fs.readFileSync(configPath, "utf8"));
} catch (e) {
  console.warn("⚠️ Konnte config.json nicht laden, verwende Standard-Einstellungen.");
}

/**
 * Exportiert Transkript und Zusammenfassung in Obsidian Vault
 * @param {string} transcript - Das Transkript
 * @param {string} summary - Die Zusammenfassung
 * @param {Array} entities - Extrahierte Entitäten
 * @param {object} entityEmojis - Entitäten mit Emojis
 * @param {object} options - Zusätzliche Optionen
 * @returns {Promise<string|null>} - Der Pfad der erstellten Datei oder null
 */
async function exportToObsidian(transcript, summary, entities = [], entityEmojis = {}, options = {}) {
  try {
    // 1. Vault-Pfad bestimmen
    const vaultPath = config.OBSIDIAN_VAULT_PATH || process.env.OBSIDIAN_VAULT_PATH || DEFAULT_VAULT_PATH;
    
    // 2. Template-Typ ermitteln
    const templateType = options.templateType || selectBestTemplate(transcript);
    console.log(`🎨 Obsidian Template-Typ: ${templateType}`);
    
    // 3. Template-Daten extrahieren
    const templateData = obsidianCreativeSelector.extractTemplateData(
      transcript, 
      summary, 
      templateType, 
      entities, 
      entityEmojis
    );
    
    // 4. Template auswählen und Content generieren
    const template = obsidianCreativeSelector.selectTemplate(transcript, summary, templateType);
    const content = renderObsidianTemplate(template, templateData, transcript, summary);
    
    // 5. Datei erstellen
    const fileName = generateFileName(templateData.title, templateType);
    const filePath = await writeObsidianFile(vaultPath, fileName, content, templateType);
    
    // 6. Entity-Dateien erstellen
    await createEntityFiles(vaultPath, entities, entityEmojis, templateType);
    
    console.log(`✅ Obsidian Export erfolgreich: ${filePath}`);
    return filePath;
    
  } catch (error) {
    console.error("❌ Obsidian Export fehlgeschlagen:", error.message);
    return null;
  }
}

/**
 * Rendert ein Obsidian Template mit den gegebenen Daten
 * @param {string} template - Das Template
 * @param {object} templateData - Die Template-Daten
 * @param {string} transcript - Das Original-Transkript
 * @param {string} summary - Die Zusammenfassung
 * @returns {string} - Der gerenderte Content
 */
function renderObsidianTemplate(template, templateData, transcript, summary) {
  let content = template;
  
  // Template-Variablen ersetzen
  Object.entries(templateData).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    content = content.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value || 'TBD');
  });
  
  // Spezielle Variablen
  content = content.replace(/{{transcript}}/g, transcript);
  content = content.replace(/{{summary}}/g, summary || '');
  content = content.replace(/{{created_at}}/g, new Date().toLocaleString('de-DE'));
  
  // Handlebars-ähnliche Conditional Blocks (vereinfacht)
  content = content.replace(/{{#if entities\.length}}[\s\S]*?{{\/if}}/g, (match) => {
    if (templateData.entities && templateData.entities.length > 0) {
      return match.replace(/{{#if entities\.length}}/, '').replace(/{{\/if}}/, '');
    }
    return '';
  });
  
  // Entity Emojis Loop (vereinfacht)
  if (templateData.entityEmojis) {
    const entityList = Object.entries(templateData.entityEmojis)
      .map(([entity, emoji]) => `- ${emoji} [[${entity}]]`)
      .join('\n');
    content = content.replace(/{{#each entityEmojis}}[\s\S]*?{{\/each}}/g, entityList);
  }
  
  return content;
}

/**
 * Generiert einen Dateinamen basierend auf Titel und Template-Typ
 * @param {string} title - Der Titel
 * @param {string} templateType - Der Template-Typ
 * @returns {string} - Der Dateiname
 */
function generateFileName(title, templateType) {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
  
  // Bereinige den Titel für Dateinamen
  const cleanTitle = title
    .replace(/[^\w\s-äöüÄÖÜß]/g, '') // Entferne Sonderzeichen außer Umlauten
    .replace(/\s+/g, '-') // Ersetze Leerzeichen durch Bindestriche
    .toLowerCase();
  
  return `${dateStr}_${timeStr}_${cleanTitle}.md`;
}

/**
 * Schreibt eine Datei in den Obsidian Vault
 * @param {string} vaultPath - Der Vault-Pfad
 * @param {string} fileName - Der Dateiname
 * @param {string} content - Der Inhalt
 * @param {string} templateType - Der Template-Typ
 * @returns {Promise<string>} - Der vollständige Dateipfad
 */
async function writeObsidianFile(vaultPath, fileName, content, templateType) {
  // Erstelle Template-spezifische Ordner
  const folderMap = {
    'creative_briefing': 'Creative Briefs',
    'design_review': 'Design Reviews',
    'creative_brainstorming': 'Brainstorming',
    'client_presentation': 'Client Presentations',
    'brand_workshop': 'Brand Strategy',
    'project_postmortem': 'Project Learnings',
    'workflow_optimization': 'Process Optimization'
  };
  
  const folderName = folderMap[templateType] || 'General';
  const folderPath = path.join(vaultPath, folderName);
  
  // Erstelle Ordner falls nicht vorhanden
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  
  const filePath = path.join(folderPath, fileName);
  fs.writeFileSync(filePath, content, 'utf8');
  
  return filePath;
}

/**
 * Erstellt Entity-Dateien für bessere Verlinkung
 * @param {string} vaultPath - Der Vault-Pfad
 * @param {Array} entities - Die Entitäten
 * @param {object} entityEmojis - Entitäten mit Emojis
 * @param {string} sourceTemplateType - Der Template-Typ der Quelle
 */
async function createEntityFiles(vaultPath, entities, entityEmojis, sourceTemplateType) {
  const entitiesFolder = path.join(vaultPath, 'Entities');
  
  if (!fs.existsSync(entitiesFolder)) {
    fs.mkdirSync(entitiesFolder, { recursive: true });
  }
  
  for (const entity of entities) {
    const entityFileName = `${entity.replace(/[^\w\s-äöüÄÖÜß]/g, '').replace(/\s+/g, '-')}.md`;
    const entityFilePath = path.join(entitiesFolder, entityFileName);
    
    // Erstelle nur neue Entity-Dateien, aktualisiere keine bestehenden
    if (!fs.existsSync(entityFilePath)) {
      const emoji = entityEmojis[entity] || '📋';
      const entityContent = createEntityContent(entity, emoji, sourceTemplateType);
      fs.writeFileSync(entityFilePath, entityContent, 'utf8');
    }
  }
}

/**
 * Erstellt den Inhalt für eine Entity-Datei
 * @param {string} entity - Die Entität
 * @param {string} emoji - Das Emoji
 * @param {string} sourceTemplateType - Der Template-Typ der Quelle
 * @returns {string} - Der Entity-Content
 */
function createEntityContent(entity, emoji, sourceTemplateType) {
  const date = new Date().toLocaleString('de-DE');
  
  return `# ${emoji} ${entity}

## Übersicht
Diese Entität wurde automatisch von Otto Assistant erkannt und verlinkt.

## Erwähnungen
- Erstmals erwähnt in: [[${sourceTemplateType}]]
- Letzte Aktualisierung: ${date}

## Notizen
*Hier können Sie zusätzliche Notizen zu ${entity} hinzufügen.*

## Verwandte Konzepte
*Verlinken Sie hier verwandte Entitäten und Konzepte.*

---
**Tags:** #entity #${entity.toLowerCase().replace(/\s+/g, '-')} #otto-generated
**Erstellt:** ${date}
**Quelle:** Otto Assistant
`;
}

/**
 * Erstellt die Ordnerstruktur für Creative Agency
 */
async function setupCreativeVaultStructure(vaultPath) {
  const folders = [
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
  
  for (const folder of folders) {
    const folderPath = path.join(vaultPath, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      console.log(`📁 Ordner erstellt: ${folder}`);
    }
  }
  
  // Erstelle Index-Datei
  const indexPath = path.join(vaultPath, 'Creative Agency Dashboard.md');
  if (!fs.existsSync(indexPath)) {
    const indexContent = createDashboardContent();
    fs.writeFileSync(indexPath, indexContent, 'utf8');
    console.log("📊 Dashboard erstellt: Creative Agency Dashboard.md");
  }
}

/**
 * Erstellt den Inhalt für das Creative Agency Dashboard
 */
function createDashboardContent() {
  return `# 🎨 Creative Agency Dashboard

Willkommen im Otto Assistant Creative Agency Vault!

## 📋 Quick Navigation

### 🎯 Project Management
- [[Creative Briefs]] - Alle Projektbriefs
- [[Client Presentations]] - Kundenpräsentationen
- [[Project Learnings]] - Post-Mortems und Learnings

### 🎨 Creative Work
- [[Design Reviews]] - Feedback-Sessions
- [[Brainstorming]] - Ideensammlung
- [[Brand Strategy]] - Marken-Workshops

### ⚙️ Operations
- [[Process Optimization]] - Workflow-Verbesserungen
- [[Templates]] - Vorlagen und Templates
- [[Archive]] - Archivierte Projekte

## 📊 Recent Activity
*Die neuesten 10 Dateien werden hier automatisch verlinkt.*

## 🏷️ Tags Overview
- #creative-briefing
- #design-review  
- #brainstorming
- #client-presentation
- #brand-workshop
- #post-mortem
- #workflow-optimization
- #otto-generated

## 🔗 Important Links
- [[Entity Index]] - Alle erkannten Entitäten
- [[Client Database]] - Kundenübersicht
- [[Project Timeline]] - Projekt-Timeline

---
**Erstellt von:** Otto Assistant
**Letzte Aktualisierung:** ${new Date().toLocaleString('de-DE')}
`;
}

/**
 * Test-Funktion für Obsidian Export
 */
async function testObsidianExport() {
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
  
  console.log("🧪 Testing Obsidian Export...");
  
  // Setup Vault Structure
  const vaultPath = config.OBSIDIAN_VAULT_PATH || DEFAULT_VAULT_PATH;
  await setupCreativeVaultStructure(vaultPath);
  
  const result = await exportToObsidian(
    testData.transcript,
    testData.summary,
    testData.entities,
    testData.entityEmojis,
    { templateType: 'creative_briefing' }
  );
  
  if (result) {
    console.log("✅ Obsidian Export Test erfolgreich!");
    console.log("📄 Datei erstellt:", result);
  } else {
    console.log("❌ Obsidian Export Test fehlgeschlagen!");
  }
}

module.exports = {
  exportToObsidian,
  setupCreativeVaultStructure,
  testObsidianExport
};
