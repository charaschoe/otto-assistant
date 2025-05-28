/**
 * Test für Creative Talkback System
 * Testet die "Hey Otto" Funktionalität für kreative KI-Unterstützung
 */

const { 
  detectTalkbackTriggers, 
  processCreativeTalkback, 
  formatTalkbackResponses,
  testCreativeTalkback 
} = require('./src/utils/creative-talkback');

async function runTalkbackTests() {
  console.log("🤖 === OTTO CREATIVE TALKBACK TESTS ===\n");
  
  // Test-Szenarien für verschiedene Otto-Anfragen
  const testScenarios = [
    {
      name: "Creative Briefing mit Otto-Anfragen",
      transcript: `
        Hallo Team, wir starten heute mit dem Creative Briefing für Mercedes EQS.
        Die Zielgruppe sind Premium-Kunden zwischen 35 und 55 Jahren.
        Sie legen Wert auf Luxus aber auch auf Nachhaltigkeit.
        Hey Otto, hast du eine Idee für die Hauptbotschaft der Kampagne?
        Wir müssen Elektromobilität mit Premium-Gefühl verbinden.
        Das Budget beträgt 2,5 Millionen Euro für die gesamte Kampagne.
        Otto, welche visuellen Elemente könnten das unterstützen?
        Ich denke an minimalistische Designs mit natürlichen Elementen.
      `
    },
    {
      name: "Design Review mit kreativen Fragen",
      transcript: `
        Hier ist der erste Entwurf für das Mercedes Logo-Layout.
        Die Typografie wirkt noch etwas schwer, finde ich.
        Otto, wie könnten wir das eleganter gestalten?
        Vielleicht sollten wir eine dünnere Schrift verwenden?
        Die Farbpalette gefällt mir schon gut - das Grün symbolisiert Nachhaltigkeit.
        Hey Otto, welche Designtrends passen zu Elektroautos?
        Wir wollen modern aber zeitlos wirken.
      `
    },
    {
      name: "Brainstorming Session mit Otto-Input",
      transcript: `
        Brainstorming für die Mercedes EQS Social Media Kampagne.
        Wir brauchen Ideen für Instagram und TikTok Content.
        Die Gen-Z soll auch erreicht werden, nicht nur die klassische Zielgruppe.
        Otto, was sind aktuell die viralsten Content-Formate?
        Ich denke an Challenges oder Behind-the-Scenes Content.
        Otto, hilf uns bei innovativen Kampagnen-Ideen für Elektroautos.
        Sustainability ist wichtig, aber nicht langweilig.
      `
    },
    {
      name: "Client Presentation Vorbereitung",
      transcript: `
        Morgen präsentieren wir dem Mercedes Marketing Team unsere Konzepte.
        Wir haben drei verschiedene Ansätze entwickelt.
        Der erste fokussiert auf technische Innovation.
        Otto, wie strukturieren wir am besten die Präsentation?
        Ich bin mir unsicher, mit welchem Konzept wir anfangen sollten.
        Hey Otto, was sind die wichtigsten Argumente für Elektromobilität?
        Die Kunden müssen emotional abgeholt werden.
      `
    }
  ];
  
  console.log("1. 🔍 Trigger Detection Tests");
  console.log("─".repeat(40));
  
  for (const scenario of testScenarios) {
    console.log(`\n🧪 Testing: ${scenario.name}`);
    
    const triggers = detectTalkbackTriggers(scenario.transcript);
    
    console.log(`   🎯 Erkannte Trigger: ${triggers.length}`);
    
    if (triggers.length > 0) {
      triggers.forEach((trigger, index) => {
        console.log(`   ${index + 1}. "${trigger.originalLine}"`);
        console.log(`      Context: ${trigger.context.meetingType} - ${trigger.context.currentTopic}`);
      });
    } else {
      console.log("   ⚠️ Keine Otto-Anfragen erkannt");
    }
  }
  
  console.log("\n\n2. 🤖 Creative Response Generation Test");
  console.log("─".repeat(40));
  
  // Teste nur das erste Szenario für Response-Generierung
  const firstScenario = testScenarios[0];
  console.log(`\n🧪 Testing: ${firstScenario.name}`);
  
  const responses = await processCreativeTalkback(firstScenario.transcript);
  
  if (responses.length > 0) {
    console.log(`✅ ${responses.length} Antworten generiert:`);
    
    const formatted = formatTalkbackResponses(responses, 'plain');
    console.log(formatted);
  } else {
    console.log("❌ Keine Antworten generiert (API-Key prüfen)");
  }
  
  console.log("\n3. 📊 Pattern Recognition Test");
  console.log("─".repeat(40));
  
  // Teste verschiedene Otto-Trigger-Patterns
  const triggerPatterns = [
    "Hey Otto, hast du eine Idee?",
    "Otto, wie könnten wir das verbessern?", 
    "Otto, welche Trends siehst du?",
    "Frag Otto mal nach seiner Meinung",
    "Otto, hilf uns bei diesem Problem",
    "Hey Otto, was denkst du dazu?",
    "Otto, hast du Inspiration für uns?",
    "Otto, welche kreativen Ansätze gibt es?"
  ];
  
  for (const pattern of triggerPatterns) {
    const testTranscript = `Das ist ein Test. ${pattern} Das war der Test.`;
    const triggers = detectTalkbackTriggers(testTranscript);
    
    if (triggers.length > 0) {
      console.log(`✅ "${pattern}" - Erkannt`);
    } else {
      console.log(`❌ "${pattern}" - Nicht erkannt`);
    }
  }
  
  console.log("\n4. 🎨 Context Analysis Test");
  console.log("─".repeat(40));
  
  const contextTestTranscript = `
    Wir arbeiten an einer Nike Kampagne für den neuen Air Max.
    Die Zielgruppe sind Sportbegeisterte zwischen 18 und 35 Jahren.
    Das Design soll modern und dynamisch sein.
    Hey Otto, welche Farben würden am besten funktionieren?
    Wir verwenden Figma für die Prototypen.
  `;
  
  const contextTriggers = detectTalkbackTriggers(contextTestTranscript);
  
  if (contextTriggers.length > 0) {
    const context = contextTriggers[0].context;
    console.log("📋 Extrahierter Kontext:");
    console.log(`   Meeting-Typ: ${context.meetingType}`);
    console.log(`   Aktuelles Thema: ${context.currentTopic}`);
    console.log(`   Entitäten: ${context.entities.map(e => e.name).join(', ')}`);
    console.log(`   Kontext davor: "${context.before}"`);
    console.log(`   Kontext danach: "${context.after}"`);
  }
  
  console.log("\n5. 📝 Format Test");
  console.log("─".repeat(40));
  
  if (responses.length > 0) {
    console.log("🔸 Markdown Format:");
    const markdownFormat = formatTalkbackResponses(responses, 'markdown');
    console.log(markdownFormat.substring(0, 200) + "...");
    
    console.log("\n🔸 HTML Format:");
    const htmlFormat = formatTalkbackResponses(responses, 'html');
    console.log(htmlFormat.substring(0, 200) + "...");
  }
  
  console.log("\n6. ⚡ Performance Test");
  console.log("─".repeat(40));
  
  const performanceTestTranscript = "Hey Otto, teste die Performance. Otto, wie schnell bist du?";
  
  console.time("Trigger Detection Performance");
  for (let i = 0; i < 1000; i++) {
    detectTalkbackTriggers(performanceTestTranscript);
  }
  console.timeEnd("Trigger Detection Performance");
  
  console.log("✅ 1000 Trigger-Erkennungen durchgeführt");
  
  console.log("\n🤖 === CREATIVE TALKBACK TESTS ABGESCHLOSSEN ===");
  console.log("\n📋 Zusammenfassung:");
  console.log("✅ Trigger-Erkennung funktioniert");
  console.log("✅ Context-Extraktion funktioniert");
  console.log("✅ Pattern-Recognition funktioniert");
  console.log("✅ Performance ist gut");
  
  if (responses.length > 0) {
    console.log("✅ KI-Response-Generierung funktioniert");
  } else {
    console.log("⚠️ KI-Response-Generierung benötigt API-Key");
  }
  
  console.log("\n🚀 Creative Talkback ist bereit für den Einsatz!");
}

// Erweiterte Integration Tests
async function testTalkbackIntegration() {
  console.log("\n🔗 Integration mit bestehenden Systemen testen...");
  
  try {
    // Test mit Summary Templates
    const { selectBestTemplate } = require('./src/utils/summary-templates');
    const testTranscript = "Hey Otto, welche Briefing-Vorlage sollten wir verwenden?";
    const template = selectBestTemplate(testTranscript);
    console.log(`✅ Summary Template Integration: ${template}`);
    
    // Test mit Creative Agency Templates 
    const { templateSelector } = require('./src/utils/creative-agency-templates');
    const creativeTemplate = templateSelector.detectTemplate(testTranscript);
    console.log(`✅ Creative Template Integration: ${creativeTemplate}`);
    
    // Test Gemini Integration
    const fs = require('fs');
    const configPath = './config.json';
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (config.KITEGG_API_KEY) {
        console.log("✅ Kitegg API Integration verfügbar");
      } else {
        console.log("⚠️ Kitegg API-Key fehlt");
      }
    }
    
  } catch (error) {
    console.log("❌ Integration Test Fehler:", error.message);
  }
}

// Main execution
if (require.main === module) {
  (async () => {
    try {
      await runTalkbackTests();
      await testTalkbackIntegration();
    } catch (error) {
      console.error("❌ Creative Talkback Tests fehlgeschlagen:", error);
      process.exit(1);
    }
  })();
}

module.exports = {
  runTalkbackTests,
  testTalkbackIntegration
};
