const { summarize } = require("./gemini");

/**
 * Generates a dynamic title based on a transcript
 * @param {string} transcript - The text to analyze
 * @param {string} defaultTitle - The default title if no keywords are found
 * @returns {Promise<string>} - The generated title
 */
async function generateTitle(transcript, defaultTitle = "Notiz") {
  // If no transcript is available, use default title with date
  if (!transcript || transcript.trim() === "") {
    return `${defaultTitle} ${new Date().toLocaleString("de-DE")}`;
  }

  try {
    // Use Google Gemini to summarize the transcript
    const summary = await summarize(transcript);
    return `${defaultTitle}: ${summary.substring(0, 50)}... - ${formatDate(new Date())}`;
  } catch (error) {
    console.error("Error generating title with Gemini:", error.message);

    // Fallback: Use existing keyword extraction logic
    const keywords = extractKeywords(transcript);
    if (keywords.length > 0) {
      const topKeywords = keywords.slice(0, 3).join(", ");
      return `${defaultTitle}: ${topKeywords} - ${formatDate(new Date())}`;
    }

    // Fallback: Use the first few words of the transcript
    const firstWords = transcript.trim().split(" ").slice(0, 5).join(" ");
    return `${defaultTitle}: ${firstWords}... - ${formatDate(new Date())}`;
  }
}

/**
 * Extracts important keywords from a text
 * @param {string} text - The text to analyze
 * @returns {string[]} - List of important keywords
 */
function extractKeywords(text) {
  // Remove special characters and split into words
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/);

  // Remove stopwords
  const stopwords = [
    "der", "die", "das", "und", "in", "zu", "mit", "für", "von", "auf", "ist",
    "ich", "es", "du", "wir", "sie", "nicht", "ein", "eine", "als", "aber",
    "oder", "wenn", "dann", "so", "auch", "sich", "um", "wie", "bei", "aus",
    "dass", "da", "vom", "zum", "zur", "am", "im", "an", "noch", "nur", "sehr",
    "über", "vor", "nach", "mal", "ja", "wird", "sein", "einen", "keine", "hat",
    "schon", "bis", "war", "habe", "doch", "können", "mir", "uns", "dem", "den",
    "einem", "einen", "einer", "eines", "welche", "welcher",
  ];

  const filteredWords = words.filter(
    (word) => word.length > 3 && !stopwords.includes(word)
  );

  // Count word frequency
  const wordCounts = {};
  for (const word of filteredWords) {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  }

  // Sort by frequency
  const sortedWords = Object.keys(wordCounts).sort(
    (a, b) => wordCounts[b] - wordCounts[a]
  );

  return sortedWords;
}

/**
 * Formats a date for title display
 * @param {Date} date - The date to format
 * @returns {string} - Formatted date
 */
function formatDate(date) {
  return date.toLocaleDateString("de-DE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

module.exports = {
  generateTitle,
  formatDate,
};
