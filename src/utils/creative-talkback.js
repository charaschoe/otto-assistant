/**
 * Creative Talkback System für Otto Assistant
 * Erkennt "Hey Otto" Anfragen und bietet kreative KI-Unterstützung
 */

const fs = require("fs");
const path = require("path");

// Lade Konfiguration für Kitegg API
let config = {};
try {
  const configPath = path.resolve(__dirname, "../../config.json");
  config = JSON.parse(fs.readFileSync(configPath, "utf8"));
} catch (e) {
  console.warn("⚠️ Konnte config.json nicht laden, Creative Talkback deaktiviert.");
}

/**
 * Erkennt "Hey Otto" Trigger in Transkripten
 * @param {string} transcript - Das Transkript
 * @returns {Array} - Array von erkannten Talkback-Anfragen
 */
function detectTalkbackTriggers(transcript) {
  const talkbackPatterns = [
    /hey otto[,\s]+(.+?)(?:\.|$)/gi,
    /otto[,\s]+(.+?)(?:\.|$)/gi,
    /otto.*idee[^.]*(?:\.|$)/gi,
    /otto.*hilfe[^.]*(?:\.|$)/gi,
    /otto.*vorschlag[^.]*(?:\.|$)/gi,
    /otto.*inspiration[^.]*(?:\.|$)/gi,
    /frag.*otto[^.]*(?:\.|$)/gi,
    /otto.*kreativ[^.]*(?:\.|$)/gi
  ];

  const triggers = [];
  const lines = transcript.split(/[.!?]+/);

  for (const line of lines) {
    const trimmedLine = line.trim().toLowerCase();
    
    for (const pattern of talkbackPatterns) {
      const matches = trimmedLine.match(pattern);
      if (matches) {
        // Extrahiere den Context vor und nach der Otto-Anfrage
        const context = extractContext(transcript, line);
        
        triggers.push({
          trigger: matches[0],
          question: matches[1] || extractQuestion(line),
          context: context,
          originalLine: line.trim(),
          timestamp: new Date().toISOString()
        });
        break; // Nur ein Pattern pro Zeile
      }
    }
  }

  return triggers;
}

/**
 * Extrahiert den Kontext um eine Otto-Anfrage
 * @param {string} fullTranscript - Das vollständige Transkript
 * @param {string} triggerLine - Die Zeile mit der Otto-Anfrage
 * @returns {object} - Kontext-Informationen
 */
function extractContext(fullTranscript, triggerLine) {
  const lines = fullTranscript.split(/[.!?]+/);
  const triggerIndex = lines.findIndex(line => line.includes(triggerLine));
  
  // Sammle Kontext: 2 Sätze davor und danach
  const contextBefore = lines.slice(Math.max(0, triggerIndex - 2), triggerIndex);
  const contextAfter = lines.slice(triggerIndex + 1, triggerIndex + 3);
  
  // Erkenne Meeting-Typ und Thema
  const meetingType = detectMeetingType(fullTranscript);
  const currentTopic = extractCurrentTopic(contextBefore, contextAfter);
  const entities = extractRelevantEntities(fullTranscript);
  
  return {
    before: contextBefore.join('. ').trim(),
    after: contextAfter.join('. ').trim(),
    meetingType: meetingType,
    currentTopic: currentTopic,
    entities: entities,
    fullLength: fullTranscript.length
  };
}

/**
 * Extrahiert die Frage aus einer Otto-Anfrage
 * @param {string} line - Die Zeile mit der Anfrage
 * @returns {string} - Die extrahierte Frage
 */
function extractQuestion(line) {
  // Entferne "Hey Otto" und ähnliche Trigger
  let question = line
    .replace(/hey otto[,\s]*/gi, '')
    .replace(/otto[,\s]*/gi, '')
    .replace(/^[,\s]+/, '')
    .trim();
  
  // Falls keine spezifische Frage, setze Standardfrage
  if (question.length < 10) {
    question = "Hast du eine Idee oder einen Vorschlag?";
  }
  
  return question;
}

/**
 * Erkennt den Meeting-Typ für besseren Kontext
 * @param {string} transcript - Das Transkript
 * @returns {string} - Der erkannte Meeting-Typ
 */
function detectMeetingType(transcript) {
  const { selectBestTemplate } = require('./summary-templates');
  return selectBestTemplate(transcript);
}

/**
 * Extrahiert das aktuelle Gesprächsthema
 * @param {Array} contextBefore - Kontext vor der Anfrage
 * @param {Array} contextAfter - Kontext nach der Anfrage
 * @returns {string} - Das aktuelle Thema
 */
function extractCurrentTopic(contextBefore, contextAfter) {
  const combinedContext = [...contextBefore, ...contextAfter].join(' ');
  
  // Häufige Creative-Themen erkennen
  const topicPatterns = {
    'Kampagne': /kampagne|campaign|werbung/gi,
    'Design': /design|layout|visual|grafik/gi,
    'Branding': /brand|marke|logo|corporate/gi,
    'Konzept': /konzept|idee|approach|strategie/gi,
    'Zielgruppe': /zielgruppe|target|audience|persona/gi,
    'Kreativität': /kreativ|innovation|inspiration|brainstorm/gi,
    'Client': /kunde|client|briefing|präsentation/gi,
    'Technisch': /technisch|entwicklung|umsetzung|implementation/gi
  };
  
  for (const [topic, pattern] of Object.entries(topicPatterns)) {
    if (pattern.test(combinedContext)) {
      return topic;
    }
  }
  
  return 'Allgemein';
}

/**
 * Extrahiert relevante Entitäten für besseren Kontext
 * @param {string} transcript - Das vollständige Transkript
 * @returns {Array} - Array relevanter Entitäten
 */
function extractRelevantEntities(transcript) {
  const entityPatterns = {
    brands: /\b(Mercedes|BMW|Apple|Nike|Coca-Cola|Google|Microsoft|Amazon)\b/gi,
    tools: /\b(Figma|Photoshop|Illustrator|After Effects|Sketch|InVision)\b/gi,
    concepts: /\b(Kampagne|Design|Branding|UX|UI|Marketing|SEO|Social Media)\b/gi
  };
  
  const entities = [];
  
  for (const [category, pattern] of Object.entries(entityPatterns)) {
    const matches = transcript.match(pattern) || [];
    entities.push(...matches.map(match => ({ category, name: match })));
  }
  
  return entities.slice(0, 10); // Limitiere auf 10 relevanteste
}

/**
 * Generiert eine kreative KI-Antwort für Otto-Anfragen
 * @param {object} trigger - Das Trigger-Objekt
 * @returns {Promise<string>} - Die KI-generierte Antwort
 */
async function generateCreativeResponse(trigger) {
  if (!config.KITEGG_API_KEY) {
    return "⚠️ Kitegg API-Key fehlt für Creative Talkback";
  }

  try {
    const prompt = buildCreativePrompt(trigger);
    
    // Verwende das gleiche Kitegg-Setup wie im restlichen System
    const { generateSummary } = require('./gemini');
    
    // Angepasster API-Call für Creative Talkback
    const response = await generateSummary(prompt, {
      template: 'creative_talkback',
      maxTokens: 200,
      temperature: 0.8 // Höhere Kreativität
    });
    
    return response || "💡 Entschuldigung, ich konnte keine kreative Antwort generieren.";
    
  } catch (error) {
    console.error("❌ Creative Talkback Fehler:", error.message);
    return "💡 Entschuldigung, ich hatte ein technisches Problem. Lass mich das nochmal versuchen.";
  }
}

/**
 * Baut den optimierten Prompt für Creative Talkback
 * @param {object} trigger - Das Trigger-Objekt
 * @returns {string} - Der fertige Prompt
 */
function buildCreativePrompt(trigger) {
  const { question, context, originalLine } = trigger;
  
  const basePrompt = `Du bist Otto, ein kreativer KI-Assistent für Design-Agenturen und Creative Teams.

KONTEXT:
Meeting-Typ: ${context.meetingType}
Aktuelles Thema: ${context.currentTopic}
Vorheriger Kontext: "${context.before}"
Nachfolgender Kontext: "${context.after}"

ANFRAGE:
"${originalLine}"

AUFGABE:
Gib eine kreative, hilfreiche und praxisnahe Antwort auf die Anfrage. 

RICHTLINIEN:
- Sei konkret und umsetzbar
- Nutze Creative-Industry Know-how
- Gib 2-3 spezifische Ideen oder Vorschläge
- Halte dich kurz (max. 150 Wörter)
- Verwende eine freundliche, professionelle Tonalität
- Beziehe dich auf den Meeting-Kontext

SPEZIALWISSEN:
- Design-Trends und Best Practices
- Brand-Strategien und Positionierung
- Creative Processes und Workflows
- Client-Management und Präsentationen
- Marketing und Kommunikation

ANTWORT:`;

  return basePrompt;
}

/**
 * Verarbeitet alle Otto-Anfragen in einem Transkript
 * @param {string} transcript - Das vollständige Transkript
 * @returns {Promise<Array>} - Array von Antworten
 */
async function processCreativeTalkback(transcript) {
  const triggers = detectTalkbackTriggers(transcript);
  
  if (triggers.length === 0) {
    return [];
  }
  
  console.log(`🎨 ${triggers.length} Otto-Anfrage(n) erkannt, generiere Antworten...`);
  
  const responses = [];
  
  for (const trigger of triggers) {
    const response = await generateCreativeResponse(trigger);
    
    responses.push({
      trigger: trigger,
      response: response,
      timestamp: new Date().toISOString()
    });
  }
  
  return responses;
}

/**
 * Formatiert Talkback-Antworten für verschiedene Ausgabeformate
 * @param {Array} responses - Array von Talkback-Antworten
 * @param {string} format - Ausgabeformat ('markdown', 'plain', 'html')
 * @returns {string} - Formatierte Ausgabe
 */
function formatTalkbackResponses(responses, format = 'markdown') {
  if (responses.length === 0) {
    return '';
  }
  
  switch (format) {
    case 'markdown':
      return formatAsMarkdown(responses);
    case 'plain':
      return formatAsPlain(responses);
    case 'html':
      return formatAsHtml(responses);
    default:
      return formatAsMarkdown(responses);
  }
}

function formatAsMarkdown(responses) {
  let output = '\n## 🤖 Otto Creative Talkback\n\n';
  
  responses.forEach((item, index) => {
    output += `### Anfrage ${index + 1}\n`;
    output += `**Frage:** "${item.trigger.originalLine}"\n\n`;
    output += `**Otto's Antwort:**\n${item.response}\n\n`;
    output += `---\n\n`;
  });
  
  return output;
}

function formatAsPlain(responses) {
  let output = '\n=== OTTO CREATIVE TALKBACK ===\n\n';
  
  responses.forEach((item, index) => {
    output += `Anfrage ${index + 1}:\n`;
    output += `"${item.trigger.originalLine}"\n\n`;
    output += `Otto's Antwort:\n${item.response}\n\n`;
    output += '---\n\n';
  });
  
  return output;
}

function formatAsHtml(responses) {
  let output = '<div class="otto-talkback"><h2>🤖 Otto Creative Talkback</h2>';
  
  responses.forEach((item, index) => {
    output += `<div class="talkback-item">`;
    output += `<h3>Anfrage ${index + 1}</h3>`;
    output += `<p class="question"><strong>Frage:</strong> "${item.trigger.originalLine}"</p>`;
    output += `<div class="response"><strong>Otto's Antwort:</strong><br>${item.response}</div>`;
    output += `</div><hr>`;
  });
  
  output += '</div>';
  return output;
}

/**
 * Test-Funktion für Creative Talkback
 */
async function testCreativeTalkback() {
  const testTranscript = `
    Wir entwickeln eine neue Kampagne für Mercedes EQS.
    Die Zielgruppe sind Premium-Kunden zwischen 35 und 55 Jahren.
    Hey Otto, hast du eine Idee für die Hauptbotschaft?
    Wir wollen Luxus und Nachhaltigkeit verbinden.
    Otto, welche visuellen Elemente könnten wir verwenden?
    Das Budget beträgt 2,5 Millionen Euro.
  `;
  
  console.log("🧪 Testing Creative Talkback...");
  console.log("─".repeat(40));
  
  const responses = await processCreativeTalkback(testTranscript);
  
  if (responses.length > 0) {
    console.log("✅ Creative Talkback Test erfolgreich!");
    console.log(`🤖 ${responses.length} Antworten generiert:`);
    
    const formatted = formatTalkbackResponses(responses, 'plain');
    console.log(formatted);
    
    return true;
  } else {
    console.log("❌ Keine Otto-Anfragen erkannt oder Fehler bei der Generierung");
    return false;
  }
}

module.exports = {
  detectTalkbackTriggers,
  processCreativeTalkback,
  generateCreativeResponse,
  formatTalkbackResponses,
  testCreativeTalkback
};
