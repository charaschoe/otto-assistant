/**
 * This module identifies important entities and concepts in the text,
 * to create automatic links for Obsidian's Knowledge Graph
 */

/**
 * Identifies important entities and concepts in the text
 * @param {string} text - The text to analyze
 * @returns {string[]} - Array with identified entities
 */
function extractEntities(text) {
	 // Extract nouns and proper names based on capitalization and context
	const potentialEntities = [];

	 // Regular expression for words starting with uppercase letters (potential proper names)
	const capitalized = text.match(/\b[A-Z][a-zäöüß]{2,}\b/g) || [];

	 // Extract technical terms based on context
	const specialized = extractSpecializedTerms(text);

	 // Combine all potential entities and remove duplicates
	return [...new Set([...capitalized, ...specialized])];
}

/**
 * Extrahiert Fachbegriffe basierend auf Kontext
 * @param {string} text - Der zu analysierende Text
 * @returns {string[]} - Array mit Fachbegriffen
 */
function extractSpecializedTerms(text) {
	const terms = [];

	// Domänenspezifische Begriffe basierend auf Kontext extrahieren
	// Technologie und Programmierung
	const techTerms = extractByDomain(text, {
		domain: "tech",
		patterns: [
			/\b(?:API|SDK|Framework|Library|Interface|Class|Function|Method|Database|Server|Client|Cloud|DevOps|CI\/CD|Kubernetes|Docker)\b/g,
			/\b(?:JavaScript|Python|Java|C\+\+|Ruby|Go|Rust|TypeScript|React|Angular|Vue|Node\.js)\b/g,
		],
	});

	// Business und Management
	const businessTerms = extractByDomain(text, {
		domain: "business",
		patterns: [
			/\b(?:KPI|ROI|OKR|Umsatz|Gewinn|Marketing|Vertrieb|Kunde|Strategie|Planung|Budget|Forecast|Bilanz)\b/g,
			/\b(?:Meeting|Präsentation|Stakeholder|Wettbewerb|Markt|Produkt|Service|Roadmap)\b/g,
		],
	});

	// Wissenschaft und Forschung
	const scienceTerms = extractByDomain(text, {
		domain: "science",
		patterns: [
			/\b(?:Hypothese|Experiment|Methode|Analyse|Studie|Forschung|Daten|Statistik|Ergebnis|Evidenz)\b/g,
			/\b(?:Physik|Chemie|Biologie|Mathematik|Psychologie|Soziologie|Neurologie)\b/g,
		],
	});

	// Kombiniere alle Fachbegriffe
	return [...techTerms, ...businessTerms, ...scienceTerms];
}

/**
 * Extrahiert Begriffe einer bestimmten Domäne
 * @param {string} text - Der zu analysierende Text
 * @param {Object} config - Konfiguration mit Domäne und Mustern
 * @returns {string[]} - Array mit extrahierten Begriffen
 */
function extractByDomain(text, config) {
	let results = [];

	for (const pattern of config.patterns) {
		const matches = text.match(pattern) || [];
		results = [...results, ...matches];
	}

	return [...new Set(results)]; // Entferne Duplikate
}

/**
 * Konvertiert Text mit automatischen Obsidian-Verlinkungen
 * @param {string} text - Der zu konvertierende Text
 * @param {string[]} entities - Array mit zu verlinkenden Entitäten
 * @returns {string} - Text mit Obsidian-Verlinkungen
 */
function addObsidianLinks(text, entities) {
	// Sortiere Entitäten nach Länge (absteigend), um Verschachtelungen zu vermeiden
	const sortedEntities = [...entities].sort((a, b) => b.length - a.length);

	let linkedText = text;

	for (const entity of sortedEntities) {
		// Regulärer Ausdruck, der nach dem exakten Wort sucht, aber keine bereits verlinkten Begriffe ersetzt
		const regex = new RegExp(
			`\\b${escapeRegExp(entity)}\\b(?!\\]\\])`,
			"g"
		);

		// Ersetze nur das erste Vorkommen, um Überladung zu vermeiden
		let replaced = false;
		linkedText = linkedText.replace(regex, (match) => {
			if (!replaced) {
				replaced = true;
				return `[[${match}]]`;
			}
			return match;
		});
	}

	return linkedText;
}

/**
 * Escape-Funktion für reguläre Ausdrücke
 * @param {string} string - Der zu escapende String
 * @returns {string} - Escapeter String
 */
function escapeRegExp(string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Identifiziert verwandte Begriffe basierend auf Kontext
 * @param {string} text - Der zu analysierende Text
 * @param {string[]} entities - Bereits identifizierte Entitäten
 * @returns {Object} - Map von Entitäten zu verwandten Begriffen
 */
function identifyRelatedTerms(text, entities) {
	const relations = {};

	// Einfacher Ansatz: Begriffe, die häufig in der Nähe voneinander auftreten
	for (const entity of entities) {
		// Finde einen Kontext von 10 Wörtern um jede Entität herum
		const contextRegex = new RegExp(
			`(?:\\S+\\s+){0,10}\\b${escapeRegExp(entity)}\\b(?:\\s+\\S+){0,10}`,
			"g"
		);
		const contexts = text.match(contextRegex) || [];

		// Prüfe, welche anderen Entitäten in diesem Kontext vorkommen
		const related = [];
		for (const otherEntity of entities) {
			if (entity !== otherEntity) {
				const isRelated = contexts.some((context) =>
					new RegExp(`\\b${escapeRegExp(otherEntity)}\\b`, "i").test(
						context
					)
				);

				if (isRelated && !related.includes(otherEntity)) {
					related.push(otherEntity);
				}
			}
		}

		if (related.length > 0) {
			relations[entity] = related;
		}
	}

	return relations;
}

module.exports = {
	extractEntities,
	addObsidianLinks,
	identifyRelatedTerms,
};
