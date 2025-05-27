// miro-export-improved.js - Enhanced with template selection
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const {
  extractEntities,
  identifyRelatedTerms,
  identifyEntitiesWithEmojis,
} = require("../utils/entity-linker");

// Lade Miro-API-Konfiguration aus config.json
let config = {};
try {
  const configPath = path.resolve(__dirname, "../../config.json");
  config = JSON.parse(fs.readFileSync(configPath, "utf8"));
} catch (e) {
  console.warn("⚠️ Konnte config.json nicht laden, Miro-Export deaktiviert.");
}

const MIRO_API_BASE = "https://api.miro.com/v2";

// Template-Definitionen
const MIRO_TEMPLATES = {
  PROJECT_KICKOFF: {
    name: "Project Kickoff",
    keywords: ["projekt", "kickoff", "start", "planung", "ziele", "timeline", "team"],
    sections: [
      { title: "🎯 Projektziele", color: "light_green", position: { x: -400, y: -200 } },
      { title: "📅 Timeline", color: "light_blue", position: { x: 0, y: -200 } },
      { title: "👥 Team & Rollen", color: "light_yellow", position: { x: 400, y: -200 } },
      { title: "📋 Aufgaben", color: "light_pink", position: { x: -400, y: 100 } },
      { title: "🚧 Risiken", color: "light_red", position: { x: 0, y: 100 } },
      { title: "📝 Notizen", color: "white", position: { x: 400, y: 100 } }
    ]
  },
  MAD_GLAD_SAD: {
    name: "Mad, Glad, Sad Retrospective",
    keywords: ["retrospektive", "feedback", "mad", "glad", "sad", "ärgerlich", "froh", "traurig", "review"],
    sections: [
      { title: "😠 Mad - Was hat uns geärgert?", color: "light_red", position: { x: -300, y: 0 } },
      { title: "😊 Glad - Was lief gut?", color: "light_green", position: { x: 0, y: 0 } },
      { title: "😢 Sad - Was war enttäuschend?", color: "light_blue", position: { x: 300, y: 0 } }
    ]
  },
  BRAINSTORMING: {
    name: "Brainstorming Session",
    keywords: ["brainstorming", "ideen", "kreativ", "sammeln", "ideenfindung", "workshop"],
    sections: [
      { title: "💡 Ideen", color: "light_yellow", position: { x: -200, y: -100 } },
      { title: "⭐ Top Ideen", color: "light_green", position: { x: 200, y: -100 } },
      { title: "❓ Fragen", color: "light_blue", position: { x: -200, y: 100 } },
      { title: "🔧 Nächste Schritte", color: "light_pink", position: { x: 200, y: 100 } }
    ]
  },
  MEETING_NOTES: {
    name: "Meeting Notes",
    keywords: ["meeting", "besprechung", "agenda", "protokoll", "diskussion", "entscheidungen"],
    sections: [
      { title: "📋 Agenda", color: "light_blue", position: { x: -300, y: -100 } },
      { title: "💬 Diskussion", color: "light_yellow", position: { x: 0, y: -100 } },
      { title: "✅ Entscheidungen", color: "light_green", position: { x: 300, y: -100 } },
      { title: "📝 Action Items", color: "light_pink", position: { x: -150, y: 100 } },
      { title: "📅 Nächstes Meeting", color: "white", position: { x: 150, y: 100 } }
    ]
  },
  DEFAULT: {
    name: "Standard Layout",
    keywords: [],
    sections: [
      { title: "📝 Zusammenfassung", color: "light_green", position: { x: 0, y: -150 } },
      { title: "🏷️ Entitäten", color: "light_yellow", position: { x: -200, y: 50 } },
      { title: "📋 Aufgaben", color: "light_pink", position: { x: 200, y: 50 } }
    ]
  }
};

/**
 * Ermittelt das beste Template basierend auf dem Inhalt
 * @param {string} transcript - Das Transkript
 * @param {string} summary - Die Zusammenfassung
 * @returns {object} - Das passende Template
 */
function selectTemplate(transcript, summary) {
  const content = (transcript + " " + summary).toLowerCase();
  
  let bestMatch = { template: MIRO_TEMPLATES.DEFAULT, score: 0 };
  
  for (const [key, template] of Object.entries(MIRO_TEMPLATES)) {
    if (key === 'DEFAULT') continue;
    
    let score = 0;
    for (const keyword of template.keywords) {
      if (content.includes(keyword)) {
        score++;
      }
    }
    
    if (score > bestMatch.score) {
      bestMatch = { template, score };
    }
  }
  
  console.log(`🎯 Template gewählt: ${bestMatch.template.name} (Score: ${bestMatch.score})`);
  return bestMatch.template;
}

/**
 * Exportiert Entitäten, Beziehungen, Zusammenfassung und Aufgaben als Miro-Board mit Template-Auswahl
 * @param {string} transcript - Das Transkript
 * @param {string} summary - Die Zusammenfassung
 * @param {object} [options] - Zusätzliche Optionen
 * @returns {Promise<string|null>} - Die URL des erstellten Boards oder null
 */
async function exportToMiro(transcript, summary, options = {}) {
  const apiKey = config.MIRO_API_KEY || process.env.MIRO_API_KEY;
  const teamId = config.MIRO_TEAM_ID || process.env.MIRO_TEAM_ID;
  
  if (!apiKey) {
    console.error("❌ Miro API-Key fehlt.");
    return null;
  }
  
  if (!teamId) {
    console.warn("⚠️ Miro Team-ID fehlt. Board wird ohne Team erstellt.");
  }

  try {
    // 1. Template auswählen
    const selectedTemplate = selectTemplate(transcript, summary);
    
    // 2. Board anlegen
    const boardData = {
      name: `Otto Export - ${selectedTemplate.name} - ${new Date().toLocaleDateString('de-DE')}`,
    };
    
    if (teamId) {
      boardData.team = { id: teamId };
    }
    
    const boardRes = await axios.post(`${MIRO_API_BASE}/boards`, boardData, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const board = boardRes.data;
    
    console.log(`✅ Miro Board erstellt: ${board.viewLink}`);
    
    // 3. Template-Struktur erstellen
    await createTemplateStructure(board.id, selectedTemplate, apiKey);
    
    // 4. Inhalte hinzufügen
    await addContentToBoard(board.id, transcript, summary, selectedTemplate, apiKey);
    
    return board.viewLink || board.link || null;
    
  } catch (error) {
    console.error("❌ Miro Export fehlgeschlagen:", error.response?.data || error.message);
    return null;
  }
}

/**
 * Erstellt die Template-Struktur auf dem Board
 */
async function createTemplateStructure(boardId, template, apiKey) {
  console.log(`📋 Erstelle Template-Struktur: ${template.name}`);
  
  for (const section of template.sections) {
    try {
      await axios.post(`${MIRO_API_BASE}/boards/${boardId}/sticky_notes`, {
        data: {
          content: section.title,
        },
        style: { 
          fillColor: section.color,
        },
        position: section.position
      }, {
        headers: { Authorization: `Bearer ${apiKey}` }
      });
    } catch (e) {
      console.warn(`⚠️ Konnte Section '${section.title}' nicht erstellen:`, e.response?.data || e.message);
    }
  }
}

/**
 * Fügt Inhalte zum Board hinzu basierend auf dem Template
 */
async function addContentToBoard(boardId, transcript, summary, template, apiKey) {
  console.log("📝 Füge Inhalte hinzu...");
  
  // Extrahiere Daten
  const entities = extractEntities(transcript);
  const entityEmojis = identifyEntitiesWithEmojis(transcript);
  const tasks = extractTasks(transcript);
  
  // Bestimme Content-Bereiche basierend auf Template
  let contentAreas = getContentAreas(template);
  
  // Zusammenfassung hinzufügen
  if (summary && contentAreas.summary) {
    try {
      await axios.post(`${MIRO_API_BASE}/boards/${boardId}/sticky_notes`, {
        data: {
          content: `📝 ${summary}`,
        },
        style: { fillColor: "light_green" },
        position: { 
          x: contentAreas.summary.x, 
          y: contentAreas.summary.y + 80 
        }
      }, {
        headers: { Authorization: `Bearer ${apiKey}` }
      });
    } catch (e) {
      console.warn("⚠️ Konnte Zusammenfassung nicht hinzufügen:", e.response?.data || e.message);
    }
  }
  
  // Entitäten hinzufügen
  if (entities.length > 0 && contentAreas.entities) {
    let entityY = contentAreas.entities.y + 80;
    for (let i = 0; i < Math.min(entities.length, 5); i++) {
      const entity = entities[i];
      try {
        await axios.post(`${MIRO_API_BASE}/boards/${boardId}/sticky_notes`, {
          data: {
            content: `${entityEmojis[entity] || "📌"} ${entity}`,
          },
          style: { fillColor: "light_yellow" },
          position: { 
            x: contentAreas.entities.x, 
            y: entityY 
          }
        }, {
          headers: { Authorization: `Bearer ${apiKey}` }
        });
        entityY += 60;
      } catch (e) {
        console.warn(`⚠️ Konnte Entität '${entity}' nicht hinzufügen:`, e.response?.data || e.message);
      }
    }
  }
  
  // Aufgaben hinzufügen
  if (tasks.length > 0 && contentAreas.tasks) {
    let taskY = contentAreas.tasks.y + 80;
    for (let i = 0; i < Math.min(tasks.length, 5); i++) {
      const task = tasks[i];
      try {
        await axios.post(`${MIRO_API_BASE}/boards/${boardId}/sticky_notes`, {
          data: {
            content: `✅ ${task}`,
          },
          style: { fillColor: "light_pink" },
          position: { 
            x: contentAreas.tasks.x, 
            y: taskY 
          }
        }, {
          headers: { Authorization: `Bearer ${apiKey}` }
        });
        taskY += 60;
      } catch (e) {
        console.warn(`⚠️ Konnte Aufgabe '${task}' nicht hinzufügen:`, e.response?.data || e.message);
      }
    }
  }
  
  console.log("✅ Inhalte erfolgreich hinzugefügt");
}

/**
 * Bestimmt Content-Bereiche basierend auf Template
 */
function getContentAreas(template) {
  const areas = {};
  
  for (const section of template.sections) {
    const title = section.title.toLowerCase();
    
    if (title.includes('zusammenfassung') || title.includes('notizen')) {
      areas.summary = section.position;
    } else if (title.includes('entitäten') || title.includes('ideen') || title.includes('diskussion')) {
      areas.entities = section.position;
    } else if (title.includes('aufgaben') || title.includes('action') || title.includes('schritte')) {
      areas.tasks = section.position;
    }
  }
  
  // Fallback Positionen
  if (!areas.summary) areas.summary = { x: 0, y: -150 };
  if (!areas.entities) areas.entities = { x: -200, y: 50 };
  if (!areas.tasks) areas.tasks = { x: 200, y: 50 };
  
  return areas;
}

/**
 * Extrahiert Aufgaben aus dem Transkript
 * @param {string} text
 * @returns {string[]}
 */
function extractTasks(text) {
  const tasks = [];
  const lines = text.split("\n");
  
  for (const line of lines) {
    const match =
      line.match(/- \[ \] (.+)/) ||
      line.match(/\* (.+)/) ||
      line.match(/\d+\. (.+)/) ||
      line.match(/todo:?\s*(.+)/i) ||
      line.match(/aufgabe:?\s*(.+)/i) ||
      line.match(/task:?\s*(.+)/i);
    
    if (match) {
      tasks.push(match[1].trim());
    }
  }
  
  // Zusätzlich: Erkenne Action Items im Text
  const actionWords = ['muss', 'soll', 'wird', 'brauchen', 'müssen', 'sollten', 'action', 'todo'];
  const sentences = text.split(/[.!?]+/);
  
  for (const sentence of sentences) {
    for (const word of actionWords) {
      if (sentence.toLowerCase().includes(word) && sentence.length < 100) {
        tasks.push(sentence.trim());
        break;
      }
    }
  }
  
  return [...new Set(tasks)]; // Entferne Duplikate
}

module.exports = { 
  exportToMiro, 
  selectTemplate, 
  MIRO_TEMPLATES 
};
