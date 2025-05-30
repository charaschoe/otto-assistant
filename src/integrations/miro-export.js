/**
 * Main Miro Export Integration
 * Uses the optimized layout engine for large whiteboards
 */

const { exportToMiro: exportOptimized } = require('./miro-export-optimized');
const { exportToMiro: exportImproved } = require('./miro-export-improved');

/**
 * Main Miro export function that chooses the best export method
 * @param {string} transcript - Das Transkript
 * @param {string} summary - Die Zusammenfassung
 * @param {object} options - Zusätzliche Optionen
 * @returns {Promise<string|null>} - Die URL des erstellten Boards oder null
 */
async function exportToMiro(transcript, summary, options = {}) {
  // Use optimized layout engine by default for better whiteboard presentation
  const useOptimized = options.useOptimizedLayout !== false;
  
  if (useOptimized) {
    console.log("🎨 Using optimized Miro layout for large displays...");
    return await exportOptimized(transcript, summary, options);
  } else {
    console.log("🎨 Using standard Miro layout...");
    return await exportImproved(transcript, summary, options);
  }
}

/**
 * Test-Funktion für Miro Export
 */
async function testMiroExport() {
  const testData = {
    transcript: `
      Creative Briefing für Mercedes EQS Kampagne
      Zielgruppe: Premium-Kunden, umweltbewusst
      Key Message: Luxus trifft Nachhaltigkeit
      
      Action Items:
      - Moodboard erstellen
      - Research vertiefen
      - Konzepte entwickeln
    `,
    summary: "Creative Briefing für Mercedes EQS Elektro-Kampagne",
    options: {
      meetingType: 'Creative Briefing Workshop',
      useOptimizedLayout: true
    }
  };
  
  console.log("🧪 Testing Miro Export...");
  
  const boardUrl = await exportToMiro(
    testData.transcript,
    testData.summary,
    testData.options
  );
  
  if (boardUrl) {
    console.log("✅ Miro Export Test erfolgreich!");
    console.log(`🔗 Board URL: ${boardUrl}`);
    return true;
  } else {
    console.log("⚠️ Miro Export mit Warnungen (API-Keys prüfen).");
    return false;
  }
}

module.exports = {
  exportToMiro,
  testMiroExport
};
