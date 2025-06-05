/**
 * Optimized Miro Export for Large Office Whiteboards
 * Designed for optimal spacing, no overlapping, and clear visual presentation
 */

// Lade .env Umgebungsvariablen
require('dotenv').config();

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { extractEntities, identifyEntitiesWithEmojis } = require("../utils/entity-linker");
const { creativeMiroSelector } = require("./miro-creative-templates");

// Load configuration (fallback)
let config = {};
try {
  const configPath = path.resolve(__dirname, "../../config.json");
  config = JSON.parse(fs.readFileSync(configPath, "utf8"));
} catch (e) {
  console.warn("⚠️ Konnte config.json nicht laden, verwende Umgebungsvariablen.");
}

const MIRO_API_BASE = "https://api.miro.com/v2";

// Optimized layout constants for large displays
const LAYOUT_CONFIG = {
  // Canvas dimensions for large whiteboards (4K+ displays)
  CANVAS_WIDTH: 4000,
  CANVAS_HEIGHT: 3000,
  
  // Grid system for consistent spacing
  GRID_SIZE: 200,
  
  // Sticky note dimensions
  STICKY_WIDTH: 300,
  STICKY_HEIGHT: 120,
  
  // Minimum spacing between elements
  MIN_SPACING: 100,
  
  // Section spacing
  SECTION_SPACING: 400,
  
  // Header spacing
  HEADER_HEIGHT: 150,
  
  // Colors optimized for visibility on large screens
  COLORS: {
    PRIMARY: "blue",
    SECONDARY: "light_blue", 
    SUCCESS: "green",
    WARNING: "yellow",
    DANGER: "red",
    INFO: "purple",
    NEUTRAL: "light_gray",
    ACCENT: "orange"
  },
  
  // Text sizes for large displays
  TEXT_SIZES: {
    TITLE: "72",
    HEADER: "48", 
    SUBHEADER: "36",
    BODY: "24",
    SMALL: "18"
  }
};

// Enhanced layout calculator for optimal spacing
class LayoutCalculator {
  constructor() {
    this.occupiedAreas = [];
    this.currentY = -LAYOUT_CONFIG.CANVAS_HEIGHT / 2;
  }

  // Calculate position with collision detection
  calculateOptimalPosition(width, height, preferredX = 0, preferredY = null) {
    const y = preferredY || this.currentY;
    let x = preferredX;
    
    // Check for collisions and adjust position
    while (this.hasCollision(x, y, width, height)) {
      x += LAYOUT_CONFIG.GRID_SIZE;
      
      // Wrap to next row if exceeding canvas width
      if (x + width > LAYOUT_CONFIG.CANVAS_WIDTH / 2) {
        x = -LAYOUT_CONFIG.CANVAS_WIDTH / 2;
        this.currentY += height + LAYOUT_CONFIG.MIN_SPACING;
        return this.calculateOptimalPosition(width, height, x, this.currentY);
      }
    }
    
    // Mark area as occupied
    this.occupiedAreas.push({
      x: x - width / 2,
      y: y - height / 2,
      width,
      height
    });
    
    return { x, y };
  }

  // Check if position would cause collision
  hasCollision(x, y, width, height) {
    const newArea = {
      x: x - width / 2 - LAYOUT_CONFIG.MIN_SPACING / 2,
      y: y - height / 2 - LAYOUT_CONFIG.MIN_SPACING / 2,
      width: width + LAYOUT_CONFIG.MIN_SPACING,
      height: height + LAYOUT_CONFIG.MIN_SPACING
    };
    
    return this.occupiedAreas.some(area => 
      this.rectanglesOverlap(newArea, area)
    );
  }

  // Check if two rectangles overlap
  rectanglesOverlap(rect1, rect2) {
    return !(rect1.x + rect1.width < rect2.x || 
             rect2.x + rect2.width < rect1.x || 
             rect1.y + rect1.height < rect2.y || 
             rect2.y + rect2.height < rect1.y);
  }

  // Move to next section
  nextSection() {
    this.currentY += LAYOUT_CONFIG.SECTION_SPACING;
  }

  // Reset for new column
  newColumn(x) {
    this.currentY = -LAYOUT_CONFIG.CANVAS_HEIGHT / 2;
    return this.calculateOptimalPosition(
      LAYOUT_CONFIG.STICKY_WIDTH, 
      LAYOUT_CONFIG.STICKY_HEIGHT, 
      x
    );
  }
}

/**
 * Enhanced Miro board creation with optimal layout
 */
async function exportToMiro(transcript, summary, options = {}) {
  const apiKey = config.MIRO_API_TOKEN || process.env.MIRO_API_TOKEN || config.MIRO_API_KEY || process.env.MIRO_API_KEY;
  const teamId = config.MIRO_TEAM_ID || process.env.MIRO_TEAM_ID;
  
  if (!apiKey) {
    console.error("❌ Miro API key missing.");
    return null;
  }

  try {
    // 1. Create board with optimized settings
    const board = await createOptimizedBoard(apiKey, teamId, options);
    console.log(`✅ Optimized Miro Board created: ${board.viewLink}`);
    
    // 2. Setup layout calculator
    const layoutCalc = new LayoutCalculator();
    
    // 3. Create title and main sections
    await createBoardTitle(board.id, apiKey, layoutCalc, options);
    
    // 4. Create content areas with optimal spacing
    await createContentAreas(board.id, apiKey, layoutCalc, transcript, summary, options);
    
    // 5. Add interactive elements
    await addInteractiveElements(board.id, apiKey, layoutCalc, transcript, summary);
    
    return board.viewLink;
    
  } catch (error) {
    console.error("❌ Optimized Miro export failed:", error.response?.data || error.message);
    return null;
  }
}

/**
 * Create board with optimal settings for large displays
 */
async function createOptimizedBoard(apiKey, teamId, options) {
  const boardData = {
    name: `Otto Creative Session - ${new Date().toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`,
    description: "Auto-generated board optimized for large office displays"
  };
  
  // Only add team if teamId is valid format (numeric string)
  if (teamId && /^\d+$/.test(teamId)) {
    boardData.team = { id: teamId };
  }
  
  const response = await axios.post(`${MIRO_API_BASE}/boards`, boardData, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.data;
}

/**
 * Create prominent title section
 */
async function createBoardTitle(boardId, apiKey, layoutCalc, options) {
  const titlePos = layoutCalc.calculateOptimalPosition(800, 150, 0, -LAYOUT_CONFIG.CANVAS_HEIGHT / 2 + 100);
  
  // Main title
  await createStickyNote(boardId, apiKey, {
    content: `🎨 ${options.meetingType || 'Creative Session'}\n${new Date().toLocaleDateString('de-DE')}`,
    position: titlePos,
    style: {
      fillColor: LAYOUT_CONFIG.COLORS.PRIMARY,
      textAlign: "center",
      textAlignVertical: "middle"
    },
    width: 800,
    height: 150
  });
  
  layoutCalc.nextSection();
}

/**
 * Create main content areas with intelligent spacing
 */
async function createContentAreas(boardId, apiKey, layoutCalc, transcript, summary, options) {
  // Extract and organize content
  const entities = extractEntities(transcript);
  const entityEmojis = identifyEntitiesWithEmojis(transcript);
  const tasks = extractTasks(transcript);
  const keyPoints = extractKeyPoints(transcript, summary);
  
  // Create structured sections based on content type
  await createSummarySection(boardId, apiKey, layoutCalc, summary);
  await createKeyPointsSection(boardId, apiKey, layoutCalc, keyPoints);
  await createEntitiesSection(boardId, apiKey, layoutCalc, entities, entityEmojis);
  await createTasksSection(boardId, apiKey, layoutCalc, tasks);
  await createDiscussionArea(boardId, apiKey, layoutCalc);
}

/**
 * Create summary section with optimal readability
 */
async function createSummarySection(boardId, apiKey, layoutCalc, summary) {
  if (!summary) return;
  
  // Section header
  const headerPos = layoutCalc.calculateOptimalPosition(400, 80, -800);
  await createStickyNote(boardId, apiKey, {
    content: "📝 ZUSAMMENFASSUNG",
    position: headerPos,
    style: {
      fillColor: LAYOUT_CONFIG.COLORS.SUCCESS,
      textAlign: "center",
      textAlignVertical: "middle"
    },
    width: 400,
    height: 80
  });
  
  // Summary content - split into readable chunks
  const summaryChunks = splitTextIntoChunks(summary, 150);
  let yOffset = 100;
  
  for (const chunk of summaryChunks) {
    const pos = layoutCalc.calculateOptimalPosition(600, 120, -800, headerPos.y + yOffset);
    await createStickyNote(boardId, apiKey, {
      content: chunk,
      position: pos,
      style: {
        fillColor: LAYOUT_CONFIG.COLORS.NEUTRAL
      },
      width: 600,
      height: 120
    });
    yOffset += 140;
  }
  
  layoutCalc.nextSection();
}

/**
 * Create key points section with visual hierarchy
 */
async function createKeyPointsSection(boardId, apiKey, layoutCalc, keyPoints) {
  if (keyPoints.length === 0) return;
  
  const headerPos = layoutCalc.calculateOptimalPosition(400, 80, 0);
  await createStickyNote(boardId, apiKey, {
    content: "🎯 WICHTIGE PUNKTE",
    position: headerPos,
    style: {
      fillColor: LAYOUT_CONFIG.COLORS.WARNING,
      textAlign: "center"
    },
    width: 400,
    height: 80
  });
  
  // Arrange key points in a grid
  const pointsPerRow = 3;
  let currentRow = 0;
  let currentCol = 0;
  
  for (let i = 0; i < Math.min(keyPoints.length, 9); i++) {
    const x = -400 + (currentCol * 300);
    const y = headerPos.y + 120 + (currentRow * 150);
    
    const pos = layoutCalc.calculateOptimalPosition(280, 120, x, y);
    await createStickyNote(boardId, apiKey, {
      content: `${i + 1}. ${keyPoints[i]}`,
      position: pos,
      style: {
        fillColor: LAYOUT_CONFIG.COLORS.INFO
      },
      width: 280,
      height: 120
    });
    
    currentCol++;
    if (currentCol >= pointsPerRow) {
      currentCol = 0;
      currentRow++;
    }
  }
  
  layoutCalc.nextSection();
}

/**
 * Create entities section with emoji visualization
 */
async function createEntitiesSection(boardId, apiKey, layoutCalc, entities, entityEmojis) {
  if (entities.length === 0) return;
  
  const headerPos = layoutCalc.calculateOptimalPosition(400, 80, -800);
  await createStickyNote(boardId, apiKey, {
    content: "🏷️ ERKANNTE ENTITÄTEN",
    position: headerPos,
    style: {
      fillColor: LAYOUT_CONFIG.COLORS.ACCENT,
      textAlign: "center"
    },
    width: 400,
    height: 80
  });
  
  // Create entity cloud with smart positioning
  const entitiesPerRow = 4;
  let currentRow = 0;
  let currentCol = 0;
  
  for (let i = 0; i < Math.min(entities.length, 12); i++) {
    const entity = entities[i];
    const emoji = entityEmojis[entity] || "📌";
    
    const x = -600 + (currentCol * 200);
    const y = headerPos.y + 120 + (currentRow * 100);
    
    const pos = layoutCalc.calculateOptimalPosition(180, 80, x, y);
    await createStickyNote(boardId, apiKey, {
      content: `${emoji} ${entity}`,
      position: pos,
      style: {
        fillColor: LAYOUT_CONFIG.COLORS.SECONDARY
      },
      width: 180,
      height: 80
    });
    
    currentCol++;
    if (currentCol >= entitiesPerRow) {
      currentCol = 0;
      currentRow++;
    }
  }
  
  layoutCalc.nextSection();
}

/**
 * Create tasks section with clear action items
 */
async function createTasksSection(boardId, apiKey, layoutCalc, tasks) {
  if (tasks.length === 0) return;
  
  const headerPos = layoutCalc.calculateOptimalPosition(400, 80, 800);
  await createStickyNote(boardId, apiKey, {
    content: "✅ ACTION ITEMS",
    position: headerPos,
    style: {
      fillColor: LAYOUT_CONFIG.COLORS.DANGER,
      textAlign: "center"
    },
    width: 400,
    height: 80
  });
  
  // List tasks vertically for easy checking
  for (let i = 0; i < Math.min(tasks.length, 8); i++) {
    const y = headerPos.y + 120 + (i * 110);
    const pos = layoutCalc.calculateOptimalPosition(500, 100, 800, y);
    
    await createStickyNote(boardId, apiKey, {
      content: `☐ ${tasks[i]}`,
      position: pos,
      style: {
        fillColor: LAYOUT_CONFIG.COLORS.WARNING
      },
      width: 500,
      height: 100
    });
  }
  
  layoutCalc.nextSection();
}

/**
 * Create interactive discussion areas
 */
async function createDiscussionArea(boardId, apiKey, layoutCalc) {
  layoutCalc.nextSection();
  
  const areas = [
    { title: "💭 IDEEN & VORSCHLÄGE", color: LAYOUT_CONFIG.COLORS.SUCCESS, x: -600 },
    { title: "❓ FRAGEN & KLARSTELLUNGEN", color: LAYOUT_CONFIG.COLORS.WARNING, x: 0 },
    { title: "⚠️ RISIKEN & BEDENKEN", color: LAYOUT_CONFIG.COLORS.DANGER, x: 600 }
  ];
  
  for (const area of areas) {
    const pos = layoutCalc.calculateOptimalPosition(400, 300, area.x);
    
    // Create interaction area with border
    await createStickyNote(boardId, apiKey, {
      content: `${area.title}\n\n\n← Fügen Sie hier Post-Its hinzu →\n\n\n`,
      position: pos,
      style: {
        fillColor: area.color,
        textAlign: "center",
        textAlignVertical: "middle"
      },
      width: 400,
      height: 300
    });
  }
}

/**
 * Add interactive elements for live collaboration
 */
async function addInteractiveElements(boardId, apiKey, layoutCalc, transcript, summary) {
  // Add voting dots and connectors for live session interaction
  layoutCalc.nextSection();
  
  const instructionsPos = layoutCalc.calculateOptimalPosition(800, 100, 0);
  await createStickyNote(boardId, apiKey, {
    content: "🔴 Verwenden Sie ROTE PUNKTE zum Bewerten • 🔗 VERBINDER für Beziehungen • ✏️ NEUE POST-ITS für Ergänzungen",
    position: instructionsPos,
    style: {
      fillColor: LAYOUT_CONFIG.COLORS.PRIMARY,
      textAlign: "center"
    },
    width: 800,
    height: 100
  });
}

/**
 * Create optimized sticky note with enhanced styling
 */
async function createStickyNote(boardId, apiKey, noteData) {
  const stickyData = {
    data: {
      content: noteData.content
    },
    style: {
      fillColor: noteData.style?.fillColor || LAYOUT_CONFIG.COLORS.NEUTRAL
    },
    position: noteData.position
  };
  
  // Add width/height if provided
  if (noteData.width) stickyData.width = noteData.width;
  if (noteData.height) stickyData.height = noteData.height;
  
  try {
    await axios.post(`${MIRO_API_BASE}/boards/${boardId}/sticky_notes`, stickyData, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.warn(`⚠️ Could not create sticky note: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Utility functions
 */
function splitTextIntoChunks(text, maxLength) {
  if (!text || text.length <= maxLength) return [text];
  
  const sentences = text.split(/[.!?]+/);
  const chunks = [];
  let currentChunk = "";
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxLength) {
      currentChunk += sentence + ". ";
    } else {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence + ". ";
    }
  }
  
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

function extractKeyPoints(transcript, summary) {
  const text = transcript + " " + summary;
  const sentences = text.split(/[.!?]+/);
  
  return sentences
    .filter(s => 
      s.length > 20 && s.length < 120 && 
      (s.toLowerCase().includes('wichtig') || 
       s.toLowerCase().includes('key') ||
       s.toLowerCase().includes('haupt') ||
       s.toLowerCase().includes('zentral'))
    )
    .map(s => s.trim())
    .slice(0, 6);
}

function extractTasks(text) {
  const tasks = [];
  const lines = text.split("\n");
  
  // Extract explicit tasks
  for (const line of lines) {
    const taskMatch = line.match(/(?:todo|aufgabe|task|muss|soll|wird|action):?\s*(.+)/i);
    if (taskMatch) {
      tasks.push(taskMatch[1].trim());
    }
  }
  
  // Extract implicit action items
  const actionSentences = text.split(/[.!?]+/).filter(sentence => {
    const lower = sentence.toLowerCase();
    return (lower.includes('muss') || lower.includes('soll') || 
            lower.includes('wird') || lower.includes('action')) && 
           sentence.length < 100;
  });
  
  tasks.push(...actionSentences.map(s => s.trim()));
  
  return [...new Set(tasks)].slice(0, 10);
}

module.exports = {
  exportToMiro,
  LAYOUT_CONFIG,
  LayoutCalculator
};