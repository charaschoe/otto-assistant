/**
 * Einzeltest für Template Selection Funktionalität
 * VSCode Launch: 🎨 Test Template Selection Only
 */

const { selectBestTemplate } = require('./src/utils/summary-templates');
const { templateSelector } = require('./src/utils/creative-agency-templates');

async function testTemplateSelectionOnly() {
  console.log("🎨 === TEMPLATE SELECTION TEST ===\n");
  
  // Test-Szenarien für verschiedene Meeting-Typen
  const testScenarios = [
    {
      name: "Creative Briefing",
      transcript: `
        Hallo Team, willkommen zum Creative Briefing für unseren neuen Kunden Mercedes-Benz.
        Wir entwickeln eine Kampagne für den neuen Mercedes EQS.
        Die Zielgruppe sind Premium-Kunden zwischen 35 und 55 Jahren.
        Deliverables umfassen TV-Spot, Digital Ads und Landing Page.
        Das Budget beträgt 2,5 Millionen Euro.
      `,
      expectedType: "creative_briefing"
    },
    {
      name: "Design Review",
      transcript: `
        Hier ist der erste Entwurf für das Logo-Layout.
        Die Typografie wirkt noch etwas schwer.
        Das Feedback vom Client war positiv zur Farbpalette.
        Wir sollten die Schriftgröße anpassen.
        Version 2.0 wird nächste Woche präsentiert.
      `,
      expectedType: "design_review"
    },
    {
      name: "Brainstorming Session",
      transcript: `
        Brainstorming für innovative Kampagnen-Ideen.
        Wir brauchen kreative Konzepte für Social Media.
        Inspiration von Apple und Tesla Kampagnen.
        Ideensammlung für virale Content-Formate.
        Innovation und Kreativität stehen im Fokus.
      `,
      expectedType: "creative_brainstorming"
    },
    {
      name: "Client Presentation",
      transcript: `
        Präsentation für das Marketing-Team.
        Drei verschiedene Konzepte entwickelt.
        Erster Ansatz fokussiert auf technische Innovation.
        Zweiter Ansatz emotionale Ansprache.
        Präsentation morgen um 14 Uhr beim Kunden.
      `,
      expectedType: "client_presentation"
    },
    {
      name: "Brand Workshop",
      transcript: `
        Brand-Strategy Workshop für Positionierung.
        Markenidentität und Corporate Design.
        Zielgruppen-Analyse und Personas.
        Brand Values und Mission Statement.
        Competitive Landscape Analysis.
      `,
      expectedType: "brand_workshop"
    },
    {
      name: "Project Post-Mortem",
      transcript: `
        Projektabschluss und Learnings-Session.
        Was lief gut, was kann verbessert werden.
        Timeline-Analyse und Budget-Review.
        Team-Feedback und Prozess-Optimierung.
        Dokumentation für zukünftige Projekte.
      `,
      expectedType: "project_postmortem"
    },
    {
      name: "Workflow Optimization",
      transcript: `
        Prozess-Verbesserung in der Kreativagentur.
        Tool-Evaluierung für bessere Workflows.
        Effizienz-Steigerung im Design-Prozess.
        Automatisierung von wiederkehrenden Tasks.
        Optimierung der Client-Kommunikation.
      `,
      expectedType: "workflow_optimization"
    }
  ];
  
  console.log("1. 🔍 Template Detection Tests");
  console.log("─".repeat(50));
  
  let correctDetections = 0;
  let totalTests = testScenarios.length;
  
  for (const scenario of testScenarios) {
    console.log(`\n🧪 Testing: ${scenario.name}`);
    
    // Test mit Summary Templates
    const detectedTemplate = selectBestTemplate(scenario.transcript);
    
    // Test mit Creative Agency Templates
    const creativeTemplate = templateSelector.detectTemplate(scenario.transcript);
    
    console.log(`   📊 Summary Template: ${detectedTemplate}`);
    console.log(`   🎨 Creative Template: ${creativeTemplate}`);
    console.log(`   🎯 Expected: ${scenario.expectedType}`);
    
    const isCorrect = detectedTemplate === scenario.expectedType || 
                     creativeTemplate === scenario.expectedType;
    
    if (isCorrect) {
      console.log(`   ✅ CORRECT`);
      correctDetections++;
    } else {
      console.log(`   ❌ INCORRECT`);
    }
  }
  
  console.log(`\n📊 Accuracy: ${correctDetections}/${totalTests} (${(correctDetections/totalTests*100).toFixed(1)}%)`);
  
  // 2. Keyword-basierte Tests
  console.log("\n\n2. 🔤 Keyword Detection Tests");
  console.log("─".repeat(50));
  
  const keywordTests = [
    { keywords: "briefing kunde kampagne zielgruppe", expected: "creative_briefing" },
    { keywords: "feedback iteration freigabe design", expected: "design_review" },
    { keywords: "ideen brainstorming kreativität innovation", expected: "creative_brainstorming" },
    { keywords: "präsentation client pitch konzept", expected: "client_presentation" },
    { keywords: "brand marke positionierung identität", expected: "brand_workshop" },
    { keywords: "learnings retrospektive postmortem analyse", expected: "project_postmortem" },
    { keywords: "prozess workflow optimierung effizienz", expected: "workflow_optimization" }
  ];
  
  let keywordCorrect = 0;
  
  for (const test of keywordTests) {
    const detected = selectBestTemplate(test.keywords);
    const creative = templateSelector.detectTemplate(test.keywords);
    
    const isCorrect = detected === test.expected || creative === test.expected;
    
    console.log(`Keywords: "${test.keywords}"`);
    console.log(`   Detected: ${detected} | Creative: ${creative} | Expected: ${test.expected}`);
    console.log(`   ${isCorrect ? '✅' : '❌'} ${isCorrect ? 'CORRECT' : 'INCORRECT'}`);
    
    if (isCorrect) keywordCorrect++;
  }
  
  console.log(`\nKeyword Accuracy: ${keywordCorrect}/${keywordTests.length} (${(keywordCorrect/keywordTests.length*100).toFixed(1)}%)`);
  
  // 3. Edge Case Tests
  console.log("\n\n3. 🎭 Edge Case Tests");
  console.log("─".repeat(50));
  
  const edgeCases = [
    { name: "Empty Input", input: "", expected: "default handling" },
    { name: "Very Short", input: "Meeting", expected: "any template" },
    { name: "Mixed Content", input: "briefing review brainstorming presentation", expected: "multiple matches" },
    { name: "German/English Mix", input: "Creative briefing für client presentation", expected: "mixed language" },
    { name: "Very Long", input: "Lorem ipsum ".repeat(100), expected: "default handling" }
  ];
  
  for (const testCase of edgeCases) {
    try {
      const result = selectBestTemplate(testCase.input);
      console.log(`${testCase.name}: "${testCase.input.substring(0, 30)}..." → ${result} ✅`);
    } catch (error) {
      console.log(`${testCase.name}: ERROR - ${error.message} ❌`);
    }
  }
  
  console.log("\n🎨 === TEMPLATE SELECTION TEST ABGESCHLOSSEN ===");
}

// Performance-Tests für Template Selection
async function testTemplateSelectionPerformance() {
  console.log("\n⚡ Performance Tests für Template Selection");
  console.log("─".repeat(50));
  
  const testTranscript = `
    Creative Briefing für Mercedes EQS Kampagne.
    Zielgruppe Premium-Kunden, Design Review für Logo,
    Brainstorming innovative Ideen, Client Presentation,
    Brand Workshop Positionierung, Post-Mortem Learnings,
    Workflow Optimierung Prozesse.
  `;
  
  // Test 1: Einzelne Aufrufe
  console.time("Single Template Selection");
  for (let i = 0; i < 1000; i++) {
    selectBestTemplate(testTranscript);
  }
  console.timeEnd("Single Template Selection");
  
  // Test 2: Creative Template Selector
  console.time("Creative Template Selection");
  for (let i = 0; i < 1000; i++) {
    templateSelector.detectTemplate(testTranscript);
  }
  console.timeEnd("Creative Template Selection");
  
  // Test 3: Batch Processing
  const batchInputs = Array(100).fill(testTranscript);
  
  console.time("Batch Template Selection");
  for (const input of batchInputs) {
    selectBestTemplate(input);
    templateSelector.detectTemplate(input);
  }
  console.timeEnd("Batch Template Selection");
  
  console.log("\n✅ Performance Tests abgeschlossen");
}

// Template-Konsistenz Tests
async function testTemplateConsistency() {
  console.log("\n🔄 Template Konsistenz Tests");
  console.log("─".repeat(50));
  
  const consistencyTests = [
    "Creative Briefing für neuen Kunden",
    "Design Review Meeting heute",
    "Brainstorming Session für Ideen",
    "Client Presentation vorbereiten",
    "Brand Workshop Strategie",
    "Post-Mortem Meeting Learnings",
    "Workflow Optimierung Prozess"
  ];
  
  for (const test of consistencyTests) {
    const results = [];
    
    // 10 Aufrufe für jedes Template
    for (let i = 0; i < 10; i++) {
      results.push(selectBestTemplate(test));
    }
    
    // Prüfe Konsistenz
    const uniqueResults = [...new Set(results)];
    const isConsistent = uniqueResults.length === 1;
    
    console.log(`"${test}"`);
    console.log(`   Ergebnisse: ${uniqueResults.join(', ')}`);
    console.log(`   ${isConsistent ? '✅' : '❌'} ${isConsistent ? 'CONSISTENT' : 'INCONSISTENT'}`);
  }
}

// Main execution
if (require.main === module) {
  (async () => {
    try {
      await testTemplateSelectionOnly();
      await testTemplateSelectionPerformance();
      await testTemplateConsistency();
    } catch (error) {
      console.error("❌ Template Selection Test fehlgeschlagen:", error);
      process.exit(1);
    }
  })();
}

module.exports = {
  testTemplateSelectionOnly,
  testTemplateSelectionPerformance,
  testTemplateConsistency
};
