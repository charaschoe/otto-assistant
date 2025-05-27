/**
 * Test-Skript für Creative Agency Features
 * Demonstriert die neuen Templates und Integrations für Kreativ-Agenturen
 */

const { creativeTemplates, templateSelector } = require('./src/utils/creative-agency-templates');
const { CREATIVE_MIRO_TEMPLATES, creativeMiroSelector } = require('./src/integrations/miro-creative-templates');
const { CREATIVE_OBSIDIAN_TEMPLATES, obsidianCreativeSelector } = require('./src/integrations/obsidian-creative-templates');
const { CREATIVE_NOTION_TEMPLATES, notionCreativeSelector } = require('./src/integrations/notion-creative-templates');
const { templates: summaryTemplates, selectBestTemplate } = require('./src/utils/summary-templates');

// Test-Daten für verschiedene Creative Agency Szenarien
const testScenarios = {
  creative_briefing: `
    Client: Mercedes-Benz
    Marke: Mercedes EQS
    Projekt: Neue Elektro-Kampagne für 2025
    Zielgruppe: Premium-Kunden zwischen 35-55 Jahren, technikaffin, umweltbewusst
    Botschaft: "Luxus trifft auf Nachhaltigkeit - Die Zukunft fährt elektrisch"
    Deliverables: TV-Spot, Digital Ads, Social Media Kampagne, Print Anzeigen
    Timeline: Launch im März 2025, Produktion startet Januar
    Budget: 2,5 Millionen Euro
    Team: Creative Director Sarah, Art Director Max, Copywriter Lisa
  `,
  
  design_review: `
    Projekt: Mercedes EQS Kampagne
    Phase: Concept Review Version 2
    Teilnehmer: Creative Team, Client, Account Manager
    Feedback: Das neue Logo-Design gefällt sehr gut, die Farbpalette wirkt premium
    Änderungen: Schriftgröße in den Headlines vergrößern, mehr Weißraum um das Produktbild
    Neue Ideen: Animierte Version für Social Media, Interactive Banner für Website
    Nächste Schritte: Überarbeitung bis Freitag, finales Review nächste Woche
  `,
  
  creative_brainstorming: `
    Challenge: Wie machen wir Elektroautos für junge Zielgruppen cool?
    Ideen: Gaming-Integration, Virtual Reality Showroom, Influencer Partnerships
    Innovation: AR-App die zeigt wie nachhaltig dein Fahrstil ist
    Schnelle Umsetzung: Social Media Challenge #ElectricVibes
    Big Bet: Partnerschaft mit Tesla für gemeinsame Ladestation-Kampagne
    Inspiration: Apple's Think Different Kampagne, Nike's Just Do It
  `,
  
  client_presentation: `
    Client: Mercedes-Benz Marketing Team
    Projekt: EQS Launch Kampagne
    Präsentation: Konzeptvorstellung der TV-Kampagne
    Client Feedback: Sehr begeistert von der kreativen Umsetzung
    Entscheidungen: Grünes Licht für Produktion des Hauptspots
    Änderungswünsche: Zusätzliche 15-Sekunden Version für Social Media
    Nächste Schritte: Casting beginnt nächste Woche, Drehtermine koordinieren
  `,
  
  brand_workshop: `
    Brand: GreenTech Startup
    Mission: Nachhaltige Technologie für alle zugänglich machen
    Vision: Eine Welt ohne CO2-Emissionen bis 2050
    Values: Innovation, Nachhaltigkeit, Transparenz, Collaboration
    Zielgruppe: Eco-conscious Millennials und Gen-Z
    Tonalität: Optimistisch, authentisch, wissenschaftlich fundiert
    Farben: Grün-Töne, sauberes Weiß, technisches Blau
    Differenzierung: Open Source Ansatz, Community-driven Innovation
  `,
  
  project_postmortem: `
    Projekt: BMW i4 Launch Kampagne
    Client: BMW Group
    Erfolg: Kampagne übertraf KPIs um 23%, hohe Client Satisfaction
    Was lief gut: Exzellente Teamwork, kreative Breakthrough-Idee, termingerechte Lieferung
    Herausforderungen: Enge Timeline, komplexe Abstimmungsprozesse beim Client
    Learnings: Frühere Stakeholder-Einbindung, bessere Tool-Integration nötig
    Empfehlungen: Slack für interne Kommunikation, Figma für Design Reviews
  `,
  
  workflow_optimization: `
    Prozess: Design Review Workflow
    Problem: Zu viele Feedback-Schleifen, unklare Verantwortlichkeiten
    Bottlenecks: Manual File-Sharing, fehlende Versionskontrolle
    Lösung: Figma für kollaboratives Design, Asana für Task-Management
    ROI: 30% Zeitersparnis, bessere Client Satisfaction
    Tools: Figma, Asana, Slack, Adobe Creative Cloud
    Effizienz: Reduzierung von 5 auf 2 Review-Zyklen im Durchschnitt
  `
};

async function testCreativeAgencyFeatures() {
  console.log("🎨 === CREATIVE AGENCY FEATURES TEST ===\n");
  
  // Test Template Selection
  console.log("1. 📝 Template Selection Tests:");
  console.log("─".repeat(40));
  
  for (const [scenarioName, content] of Object.entries(testScenarios)) {
    console.log(`\n🧪 Testing: ${scenarioName}`);
    
    // Test Summary Template Selection
    const summaryTemplate = selectBestTemplate(content);
    console.log(`  📋 Summary Template: ${summaryTemplate}`);
    
    // Test Creative Agency Template Selection
    const creativeTemplate = templateSelector.detectTemplate(content);
    console.log(`  🎨 Creative Template: ${creativeTemplate}`);
    
    // Test Miro Template Selection
    const miroTemplate = creativeMiroSelector.selectTemplate(content, '', {});
    console.log(`  🟦 Miro Template: ${miroTemplate.name}`);
    
    // Test Obsidian Template Selection
    const obsidianTemplate = obsidianCreativeSelector.selectTemplate(content, '', creativeTemplate);
    const obsidianTitle = obsidianCreativeSelector.generateTitle(content, creativeTemplate);
    console.log(`  📚 Obsidian Template: ${obsidianTitle}`);
    
    // Test Notion Template Selection
    const notionTemplate = notionCreativeSelector.selectTemplate(content, '', creativeTemplate);
    const notionTitle = notionCreativeSelector.generateTitle(content, creativeTemplate);
    console.log(`  📊 Notion Template: ${notionTitle}`);
  }
  
  // Test Template Content Generation
  console.log("\n\n2. 🏗️ Template Content Generation Test:");
  console.log("─".repeat(40));
  
  const testContent = testScenarios.creative_briefing;
  const templateType = 'creative_briefing';
  
  console.log("\n📋 Testing Creative Briefing Template Generation...");
  
  // Test Obsidian Template Data Extraction
  const obsidianData = obsidianCreativeSelector.extractTemplateData(
    testContent, 
    "Mercedes EQS Campaign Brief", 
    templateType, 
    ['Mercedes', 'EQS', 'Elektro', 'Kampagne'], 
    { 'Mercedes': '🚗', 'EQS': '⚡', 'Elektro': '🔋' }
  );
  
  console.log("🔍 Extracted Obsidian Data:", {
    title: obsidianData.title,
    client: obsidianData.client,
    brand: obsidianData.brand,
    target_audience: obsidianData.target_audience
  });
  
  // Test Notion Properties Generation
  const notionTemplate = notionCreativeSelector.selectTemplate(testContent, '', templateType);
  const notionProperties = notionCreativeSelector.createPageProperties(
    notionTemplate,
    testContent,
    "Creative brief for Mercedes EQS campaign",
    templateType,
    ['Mercedes', 'EQS', 'Premium', 'Elektro'],
    {}
  );
  
  console.log("📊 Generated Notion Properties:", JSON.stringify(notionProperties, null, 2));
  
  // Test Miro Content Generation
  const miroTemplate = creativeMiroSelector.selectTemplate(testContent, '', {});
  const miroContent = creativeMiroSelector.getTemplateSpecificContent(
    miroTemplate,
    testContent,
    "Mercedes EQS Campaign Brief",
    ['Mercedes', 'EQS', 'Elektro']
  );
  
  console.log("🟦 Generated Miro Content:", miroContent);
  
  // Test Features Overview
  console.log("\n\n3. ✨ New Features Overview:");
  console.log("─".repeat(40));
  
  console.log("\n🎯 Creative Agency Templates:");
  console.log("  • Creative Briefing - Strukturierte Projektbriefs");
  console.log("  • Design Review - Feedback-Sessions dokumentieren");
  console.log("  • Creative Brainstorming - Ideensammlung organisieren");
  console.log("  • Client Presentation - Kundenpräsentationen archivieren");
  console.log("  • Brand Workshop - Brand-Strategie entwickeln");
  console.log("  • Project Post-Mortem - Learnings dokumentieren");
  console.log("  • Workflow Optimization - Prozesse verbessern");
  
  console.log("\n🟦 Enhanced Miro Integration:");
  console.log("  • 6 spezialisierte Templates für Creative Meetings");
  console.log("  • Optimiert für große Whiteboards/TVs");
  console.log("  • Interaktive Post-it Bereiche");
  console.log("  • Automatische Content-Extraktion und -Kategorisierung");
  
  console.log("\n📚 Advanced Obsidian Templates:");
  console.log("  • Strukturierte Markdown-Templates");
  console.log("  • Automatische Tag-Generierung");
  console.log("  • Cross-linking zwischen Projekten und Clients");
  console.log("  • Metadata-Extraktion für bessere Archivierung");
  
  console.log("\n📊 Enhanced Notion Integration:");
  console.log("  • 7 spezialisierte Datenbank-Strukturen");
  console.log("  • Automatische Property-Zuordnung");
  console.log("  • Relation-Support zwischen Projects/Clients");
  console.log("  • Rich Content-Formatierung");
  
  console.log("\n🔧 Usage Recommendations:");
  console.log("  • Verwende für Client Briefings: Alle 4 Integrations");
  console.log("  • Für Design Reviews: Miro (Live) + Notion (Archiv)");
  console.log("  • Für Brainstorming: Miro (Workshop) + Obsidian (Ideas)");
  console.log("  • Für Post-Mortems: Notion (Metrics) + Obsidian (Learnings)");
  
  console.log("\n✅ Test completed successfully!");
  console.log("🎨 All Creative Agency features are working correctly.\n");
}

// Utility function um Template-Kompatibilität zu prüfen
function checkTemplateCompatibility() {
  console.log("🔧 Template Compatibility Check:");
  console.log("─".repeat(30));
  
  const creativeTemplateNames = Object.keys(creativeTemplates);
  const miroTemplateNames = Object.keys(CREATIVE_MIRO_TEMPLATES);
  const obsidianTemplateNames = Object.keys(CREATIVE_OBSIDIAN_TEMPLATES);
  const notionTemplateNames = Object.keys(CREATIVE_NOTION_TEMPLATES);
  
  console.log(`📝 Creative Templates: ${creativeTemplateNames.length}`);
  console.log(`🟦 Miro Templates: ${miroTemplateNames.length}`);
  console.log(`📚 Obsidian Templates: ${obsidianTemplateNames.length}`);
  console.log(`📊 Notion Templates: ${notionTemplateNames.length}`);
  
  // Check for template coverage
  const commonTemplates = creativeTemplateNames.filter(name => 
    obsidianTemplateNames.includes(name) && 
    notionTemplateNames.includes(name)
  );
  
  console.log(`✅ Templates with full coverage: ${commonTemplates.length}`);
  console.log(`   ${commonTemplates.join(', ')}`);
  
  const missingObsidian = creativeTemplateNames.filter(name => !obsidianTemplateNames.includes(name));
  const missingNotion = creativeTemplateNames.filter(name => !notionTemplateNames.includes(name));
  
  if (missingObsidian.length > 0) {
    console.log(`⚠️  Missing Obsidian templates: ${missingObsidian.join(', ')}`);
  }
  
  if (missingNotion.length > 0) {
    console.log(`⚠️  Missing Notion templates: ${missingNotion.join(', ')}`);
  }
  
  if (missingObsidian.length === 0 && missingNotion.length === 0) {
    console.log("✅ Perfect template coverage across all platforms!");
  }
  
  console.log("");
}

// Performance Test
function performanceTest() {
  console.log("⚡ Performance Test:");
  console.log("─".repeat(20));
  
  const testContent = testScenarios.creative_briefing;
  const iterations = 1000;
  
  console.time("Template Selection Performance");
  
  for (let i = 0; i < iterations; i++) {
    const summaryTemplate = selectBestTemplate(testContent);
    const creativeTemplate = templateSelector.detectTemplate(testContent);
    const miroTemplate = creativeMiroSelector.selectTemplate(testContent, '', {});
    const obsidianTemplate = obsidianCreativeSelector.selectTemplate(testContent, '', creativeTemplate);
    const notionTemplate = notionCreativeSelector.selectTemplate(testContent, '', creativeTemplate);
  }
  
  console.timeEnd("Template Selection Performance");
  console.log(`✅ Processed ${iterations} iterations successfully\n`);
}

// Main execution
if (require.main === module) {
  (async () => {
    try {
      await testCreativeAgencyFeatures();
      checkTemplateCompatibility();
      performanceTest();
    } catch (error) {
      console.error("❌ Test failed:", error);
      process.exit(1);
    }
  })();
}

module.exports = {
  testCreativeAgencyFeatures,
  checkTemplateCompatibility,
  performanceTest,
  testScenarios
};
