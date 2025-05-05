/**
 * Generiert einen dynamischen Titel basierend auf einem Transkript
 * @param {string} transcript - Der zu analysierende Text
 * @param {string} defaultTitle - Der Standardtitel, falls keine Schlüsselwörter gefunden werden
 * @returns {string} - Der generierte Titel
 */
function generateTitle(transcript, defaultTitle = "Notiz") {
	// Wenn kein Transkript vorhanden ist, verwende Standardtitel mit Datum
	if (!transcript || transcript.trim() === "") {
		return `${defaultTitle} ${new Date().toLocaleString("de-DE")}`;
	}

	// Einfache Schlüsselwortextraktion
	const keywords = extractKeywords(transcript);

	// Wenn Schlüsselwörter gefunden wurden, erzeuge Titel mit den Top-Keywords
	if (keywords.length > 0) {
		const topKeywords = keywords.slice(0, 3).join(", ");
		return `${defaultTitle}: ${topKeywords} - ${formatDate(new Date())}`;
	}

	// Fallback: Verwende die ersten Wörter des Transkripts
	const firstWords = transcript.trim().split(" ").slice(0, 5).join(" ");
	return `${defaultTitle}: ${firstWords}... - ${formatDate(new Date())}`;
}

/**
 * Extrahiert wichtige Schlüsselwörter aus einem Text
 * @param {string} text - Der zu analysierende Text
 * @returns {string[]} - Liste der wichtigsten Schlüsselwörter
 */
function extractKeywords(text) {
	// Entferne Sonderzeichen und teile in Wörter
	const words = text
		.toLowerCase()
		.replace(/[^\w\s]/g, "")
		.split(/\s+/);

	// Entferne Stoppwörter
	const stopwords = [
		"der",
		"die",
		"das",
		"und",
		"in",
		"zu",
		"mit",
		"für",
		"von",
		"auf",
		"ist",
		"ich",
		"es",
		"du",
		"wir",
		"sie",
		"nicht",
		"ein",
		"eine",
		"als",
		"aber",
		"oder",
		"wenn",
		"dann",
		"so",
		"auch",
		"sich",
		"um",
		"wie",
		"bei",
		"aus",
		"dass",
		"da",
		"vom",
		"zum",
		"zur",
		"am",
		"im",
		"an",
		"noch",
		"nur",
		"sehr",
		"über",
		"vor",
		"nach",
		"mal",
		"ja",
		"wird",
		"sein",
		"einen",
		"keine",
		"hat",
		"schon",
		"bis",
		"war",
		"habe",
		"doch",
		"können",
		"mir",
		"uns",
		"dem",
		"den",
		"einem",
		"einen",
		"einer",
		"eines",
		"welche",
		"welcher",
	];

	const filteredWords = words.filter(
		(word) => word.length > 3 && !stopwords.includes(word)
	);

	// Zähle die Worthäufigkeit
	const wordCounts = {};
	for (const word of filteredWords) {
		wordCounts[word] = (wordCounts[word] || 0) + 1;
	}

	// Sortiere nach Häufigkeit
	const sortedWords = Object.keys(wordCounts).sort(
		(a, b) => wordCounts[b] - wordCounts[a]
	);

	return sortedWords;
}

/**
 * Formatiert ein Datum für die Titelanzeige
 * @param {Date} date - Das zu formatierende Datum
 * @returns {string} - Formatiertes Datum
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
