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
	// Erkenne die Sprache des Textes
	const language = detectLanguage(text);

	// Extract nouns and proper names based on capitalization and context
	const potentialEntities = [];

	// Regular expression pattern angepasst an die erkannte Sprache
	let capitalized = [];
	if (language === "de") {
		// Deutsche Substantive beginnen mit Großbuchstaben
		capitalized = text.match(/\b[A-Z][a-zäöüß]{2,}\b/g) || [];
	} else {
		// Englische Eigennamen (konservativer bei der Erkennung)
		capitalized = text.match(/\b[A-Z][a-z]{2,}\b/g) || [];
	}

	// Filter out common words that shouldn't be entities based on language
	const commonWords =
		language === "de"
			? [
					"Ich",
					"Du",
					"Er",
					"Sie",
					"Es",
					"Wir",
					"Ihr",
					"Sie",
					"Diese",
					"Dieser",
					"Dieses",
					"Jene",
					"Jener",
					"Jenes",
					"Eine",
					"Einer",
					"Eines",
					"Einen",
					"Einem",
					"Die",
					"Der",
					"Das",
			  ]
			: [
					"I",
					"You",
					"He",
					"She",
					"It",
					"We",
					"They",
					"This",
					"That",
					"These",
					"Those",
					"The",
					"An",
					"A",
					"Some",
					"Any",
					"My",
					"Your",
					"His",
					"Her",
					"Our",
					"Their",
			  ];

	capitalized = capitalized.filter((word) => !commonWords.includes(word));

	// Erkennung von zusammengesetzten Begriffen (Komposita)
	const compoundTerms = extractCompoundTerms(text);

	// Extract technical terms based on context
	const specialized = extractSpecializedTerms(text);

	// Frequency analysis - prioritize terms that appear multiple times
	const termFrequency = analyzeTermFrequency(text, [
		...capitalized,
		...specialized,
		...compoundTerms,
	]);

	// Filter out terms that appear only once if there are more than 10 potential terms
	let allTerms = [...capitalized, ...specialized, ...compoundTerms];
	if (allTerms.length > 10) {
		allTerms = allTerms.filter((term) => termFrequency[term] > 1);
	}

	// Combine all potential entities and remove duplicates
	return [...new Set(allTerms)].slice(0, 15); // Limit to avoid too many links
}

/**
 * Extrahiert Fachbegriffe basierend auf Kontext
 * @param {string} text - Der zu analysierende Text
 * @returns {string[]} - Array mit Fachbegriffen
 */
function extractSpecializedTerms(text) {
	// Erkenne die Sprache des Textes
	const language = detectLanguage(text);

	// Domänenspezifische Begriffe basierend auf Kontext und Sprache extrahieren

	// Technologie und Programmierung (überwiegend sprachunabhängig)
	const techTerms = extractByDomain(text, {
		domain: "tech",
		patterns: [
			/\b(?:API|SDK|Framework|Library|Interface|Class|Function|Method|Database|Server|Client|Cloud|DevOps|CI\/CD|Kubernetes|Docker)\b/gi,
			/\b(?:JavaScript|Python|Java|C\+\+|Ruby|Go|Rust|TypeScript|React|Angular|Vue|Node\.js)\b/gi,
			language === "de"
				? /\b(?:KI|Künstliche Intelligenz|Deep Learning|NLP|Neuronales Netz|Transformer|LLM|GPT|Sprachmodell)\b/gi
				: /\b(?:AI|Artificial Intelligence|Machine Learning|Deep Learning|NLP|Neural Network|Transformer|LLM|GPT|Language Model)\b/gi,
			language === "de"
				? /\b(?:App|Anwendung|Software|Hardware|Plattform|System|Datenbank|Microservice|API|Backend|Frontend)\b/gi
				: /\b(?:App|Application|Software|Hardware|Platform|System|Database|Microservice|API|Backend|Frontend)\b/gi,
		],
	});

	// Business und Management
	const businessTerms = extractByDomain(text, {
		domain: "business",
		patterns:
			language === "de"
				? [
						/\b(?:KPI|ROI|OKR|Umsatz|Gewinn|Marketing|Vertrieb|Kunde|Strategie|Planung|Budget|Forecast|Bilanz)\b/gi,
						/\b(?:Meeting|Präsentation|Stakeholder|Wettbewerb|Markt|Produkt|Service|Roadmap)\b/gi,
						/\b(?:Projekt|Analyse|Management|Team|Agile|Scrum|Sprint|Kanban|Startup|Business Case)\b/gi,
						/\b(?:Innovation|Disruption|Transformation|Digital|Wachstum|Optimierung|Effizienz|Skalierung)\b/gi,
				  ]
				: [
						/\b(?:KPI|ROI|OKR|Revenue|Profit|Marketing|Sales|Customer|Strategy|Planning|Budget|Forecast|Balance Sheet)\b/gi,
						/\b(?:Meeting|Presentation|Stakeholder|Competition|Market|Product|Service|Roadmap)\b/gi,
						/\b(?:Project|Analysis|Management|Team|Agile|Scrum|Sprint|Kanban|Startup|Business Case)\b/gi,
						/\b(?:Innovation|Disruption|Transformation|Digital|Growth|Optimization|Efficiency|Scaling)\b/gi,
				  ],
	});

	// Wissenschaft und Forschung
	const scienceTerms = extractByDomain(text, {
		domain: "science",
		patterns:
			language === "de"
				? [
						/\b(?:Hypothese|Experiment|Methode|Analyse|Studie|Forschung|Daten|Statistik|Ergebnis|Evidenz)\b/gi,
						/\b(?:Physik|Chemie|Biologie|Mathematik|Psychologie|Soziologie|Neurologie)\b/gi,
						/\b(?:Algorithmus|Formel|Theorie|Modell|Parameter|Variable|Konstante|Funktion|Gleichung)\b/gi,
				  ]
				: [
						/\b(?:Hypothesis|Experiment|Method|Analysis|Study|Research|Data|Statistics|Result|Evidence)\b/gi,
						/\b(?:Physics|Chemistry|Biology|Mathematics|Psychology|Sociology|Neurology)\b/gi,
						/\b(?:Algorithm|Formula|Theory|Model|Parameter|Variable|Constant|Function|Equation)\b/gi,
				  ],
	});

	// Alltagsbegriffe und Themen
	const commonTerms = extractByDomain(text, {
		domain: "common",
		patterns:
			language === "de"
				? [
						/\b(?:Pizza|Pasta|Restaurant|Essen|Kochen|Rezept|Zutaten|Mahlzeit|Frühstück|Mittagessen|Abendessen)\b/gi,
						/\b(?:Film|Serie|Kino|Theater|Musik|Konzert|Festival|Buch|Autor|Regisseur|Schauspieler)\b/gi,
						/\b(?:Reise|Urlaub|Hotel|Flug|Strand|Berg|Wandern|Städtereise|Sightseeing)\b/gi,
				  ]
				: [
						/\b(?:Pizza|Pasta|Restaurant|Food|Cooking|Recipe|Ingredients|Meal|Breakfast|Lunch|Dinner)\b/gi,
						/\b(?:Movie|Series|Cinema|Theater|Music|Concert|Festival|Book|Author|Director|Actor)\b/gi,
						/\b(?:Travel|Vacation|Holiday|Hotel|Flight|Beach|Mountain|Hiking|City Trip|Sightseeing)\b/gi,
				  ],
	});

	// Kombiniere alle Fachbegriffe, gewichte aber technische Begriffe höher
	// (durch Duplikate, die bei der Set-Erstellung entfernt werden, aber die Frequenzanalyse beeinflussen)
	return [
		...techTerms,
		...techTerms,
		...businessTerms,
		...scienceTerms,
		...commonTerms,
	];
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

	// Analysiere Textabschnitte, um den Kontext zu verstehen
	const paragraphs = text.split(/\n\n+/);

	let linkedText = "";

	// Verarbeite jeden Absatz separat
	for (const paragraph of paragraphs) {
		let linkedParagraph = paragraph;

		// Für jeden Absatz, verfolge bereits verlinkte Begriffe
		const linkedEntitiesInParagraph = new Set();

		for (const entity of sortedEntities) {
			// Regulärer Ausdruck, der nach dem exakten Wort sucht, aber keine bereits verlinkten Begriffe ersetzt
			const regex = new RegExp(
				`\\b${escapeRegExp(entity)}\\b(?!\\]\\])`,
				"g"
			);

			// Zähle Vorkommen in diesem Absatz
			const matches = paragraph.match(regex) || [];
			const occurrences = matches.length;

			// Strategie für Verlinkungen:
			// - Bei 1-2 Vorkommen: Verlinke nur das erste
			// - Bei 3-5 Vorkommen: Verlinke das erste und letzte
			// - Bei >5 Vorkommen: Verlinke erste, mittlere und letzte Vorkommen
			if (occurrences > 0 && !linkedEntitiesInParagraph.has(entity)) {
				// Begrenze Anzahl der Verlinkungen pro Absatz
				const maxLinks =
					occurrences <= 2 ? 1 : occurrences <= 5 ? 2 : 3;

				// Strategisch bestimme, welche Positionen verlinkt werden sollen
				const positions = [];
				if (maxLinks >= 1) positions.push(0); // Erstes Vorkommen
				if (maxLinks >= 3) positions.push(Math.floor(occurrences / 2)); // Mittleres Vorkommen
				if (maxLinks >= 2) positions.push(occurrences - 1); // Letztes Vorkommen

				// Ersetze an den bestimmten Positionen
				let count = 0;
				linkedParagraph = linkedParagraph.replace(regex, (match) => {
					if (positions.includes(count)) {
						count++;
						linkedEntitiesInParagraph.add(entity);
						return `[[${match}]]`;
					}
					count++;
					return match;
				});
			}
		}

		linkedText += linkedParagraph + "\n\n";
	}

	// Entferne überschüssige Zeilenumbrüche am Ende
	return linkedText.trim();
}

/**
 * Extrahiert zusammengesetzte Begriffe (Komposita) aus dem Text
 * @param {string} text - Der zu analysierende Text
 * @returns {string[]} - Array mit Komposita
 */
function extractCompoundTerms(text) {
	const compounds = [];

	// Deutsche Komposita erkennen (zwei oder mehr großgeschriebene Substantive zusammen)
	const compoundRegex = /\b([A-Z][a-zäöüß]+){2,}\b/g;
	const matches = text.match(compoundRegex) || [];

	return matches;
}

/**
 * Analysiert die Häufigkeit von Begriffen im Text
 * @param {string} text - Der zu analysierende Text
 * @param {string[]} terms - Die zu analysierenden Begriffe
 * @returns {Object} - Map von Begriffen zu ihrer Häufigkeit
 */
function analyzeTermFrequency(text, terms) {
	const frequency = {};

	// Erstelle ein Objekt mit der Häufigkeit jedes Begriffs
	for (const term of terms) {
		const regex = new RegExp(`\\b${escapeRegExp(term)}\\b`, "gi");
		const matches = text.match(regex) || [];
		frequency[term] = matches.length;
	}

	return frequency;
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
 * Identifiziert verwandte Begriffe basierend auf Kontext und erstellt ein Beziehungsnetzwerk
 * @param {string} text - Der zu analysierende Text
 * @param {string[]} entities - Bereits identifizierte Entitäten
 * @returns {Object} - Map von Entitäten zu verwandten Begriffen mit Gewichtung
 */
function identifyRelatedTerms(text, entities) {
	const relations = {};
	const paragraphs = text.split(/\n\n+/); // Teile Text in Absätze

	// Initialisiere die Beziehungsstruktur
	for (const entity of entities) {
		relations[entity] = {
			related: [],
			relatedWeighted: {},
			paragraphCount: 0,
			frequency: 0,
		};
	}

	// Analysiere jeden Absatz nach Beziehungen
	paragraphs.forEach((paragraph, pIndex) => {
		const paragraphEntities = entities.filter((entity) =>
			new RegExp(`\\b${escapeRegExp(entity)}\\b`, "i").test(paragraph)
		);

		// Zähle die Anzahl der Absätze, in denen jede Entität vorkommt
		paragraphEntities.forEach((entity) => {
			relations[entity].paragraphCount++;

			// Zähle Häufigkeit
			const matches =
				paragraph.match(
					new RegExp(`\\b${escapeRegExp(entity)}\\b`, "gi")
				) || [];
			relations[entity].frequency += matches.length;
		});

		// Erstelle Beziehungen zwischen Entitäten im selben Absatz
		for (let i = 0; i < paragraphEntities.length; i++) {
			const entity = paragraphEntities[i];

			for (let j = 0; j < paragraphEntities.length; j++) {
				if (i !== j) {
					const otherEntity = paragraphEntities[j];

					// Füge zur Liste hinzu, wenn noch nicht vorhanden
					if (!relations[entity].related.includes(otherEntity)) {
						relations[entity].related.push(otherEntity);
					}

					// Erhöhe das Gewicht der Beziehung
					if (!relations[entity].relatedWeighted[otherEntity]) {
						relations[entity].relatedWeighted[otherEntity] = 1;
					} else {
						relations[entity].relatedWeighted[otherEntity]++;
					}
				}
			}
		}
	});

	// Verfeinere die Beziehungen basierend auf Gewichtung und Häufigkeit
	for (const entity of entities) {
		// Sortiere Beziehungen nach Gewichtung
		relations[entity].related.sort((a, b) => {
			return (
				relations[entity].relatedWeighted[b] -
				relations[entity].relatedWeighted[a]
			);
		});

		// Begrenze auf die wichtigsten Beziehungen
		relations[entity].related = relations[entity].related.slice(0, 5);
	}

	return relations;
}

/**
 * Erkennt die Hauptsprache eines Textes basierend auf Wortfrequenzen und Mustern
 * @param {string} text - Der zu analysierende Text
 * @returns {string} - Erkannte Sprache ('de' oder 'en')
 */
function detectLanguage(text) {
	// Einfache Spracherkennung basierend auf häufigen Wörtern
	const germanWords = [
		"der",
		"die",
		"das",
		"und",
		"ist",
		"in",
		"zu",
		"den",
		"mit",
		"nicht",
		"auch",
		"auf",
		"für",
		"eine",
	];
	const englishWords = [
		"the",
		"and",
		"is",
		"in",
		"to",
		"it",
		"that",
		"for",
		"you",
		"with",
		"on",
		"are",
		"this",
		"was",
	];

	// Verwende Lowercase für besseres Matching
	const lowerText = text.toLowerCase();

	let germanCount = 0;
	let englishCount = 0;

	// Zähle Vorkommen häufiger Wörter
	germanWords.forEach((word) => {
		const regex = new RegExp(`\\b${word}\\b`, "g");
		const matches = lowerText.match(regex) || [];
		germanCount += matches.length;
	});

	englishWords.forEach((word) => {
		const regex = new RegExp(`\\b${word}\\b`, "g");
		const matches = lowerText.match(regex) || [];
		englishCount += matches.length;
	});

	// Überprüfe auf Umlaute (starker Indikator für Deutsch)
	const umlautCount = (text.match(/[äöüÄÖÜß]/g) || []).length;
	germanCount += umlautCount * 2; // Gewichte Umlaute stärker

	return germanCount > englishCount ? "de" : "en";
}

/**
 * Weist passende Emojis basierend auf Kontext und Domäne zu
 * @param {string} entity - Die zu bewertende Entität
 * @param {string} context - Der Kontext, in dem die Entität vorkommt
 * @returns {string} - Ein passendes Emoji oder leerer String
 */
function assignEmoji(entity, context = "") {
	// Domänenspezifische Emoji-Mappings
	const emojiMap = {
		tech: {
			programming: "💻",
			javascript: "🟨",
			python: "🐍",
			java: "☕",
			database: "🗄️",
			cloud: "☁️",
			server: "🖥️",
			api: "🔌",
			mobile: "📱",
			app: "📲",
			web: "🌐",
			security: "🔒",
			code: "👨‍💻",
			bug: "🐛",
			ai: "🤖",
			ml: "🧠",
		},
		business: {
			marketing: "📣",
			sales: "💰",
			strategy: "🎯",
			meeting: "👥",
			presentation: "📊",
			growth: "📈",
			revenue: "💸",
			customer: "🤝",
			project: "📋",
			team: "👨‍👩‍👧‍👦",
			management: "👔",
			startup: "🚀",
			innovation: "💡",
		},
		science: {
			research: "🔬",
			experiment: "🧪",
			data: "📊",
			statistics: "📉",
			math: "🔢",
			physics: "⚛️",
			chemistry: "🧬",
			biology: "🔬",
			space: "🚀",
			medicine: "⚕️",
		},
		daily: {
			food: "🍽️",
			pizza: "🍕",
			pasta: "🍝",
			coffee: "☕",
			drink: "🥤",
			travel: "✈️",
			vacation: "🏖️",
			hotel: "🏨",
			beach: "🏝️",
			mountain: "⛰️",
			movie: "🎬",
			music: "🎵",
			book: "📚",
			sport: "🏅",
			football: "⚽",
			basketball: "🏀",
			home: "🏠",
			shopping: "🛒",
			car: "🚗",
		},
		time: {
			morning: "🌅",
			noon: "🌞",
			evening: "🌆",
			night: "🌙",
			weekend: "📅",
			month: "📆",
			year: "🗓️",
		},
	};

	// Kombiniere Kontext und Entität für eine bessere Bewertung
	const combinedText = `${entity.toLowerCase()} ${context.toLowerCase()}`;

	// Durchsuche kategorisierte Emoji-Mappings nach Schlüsselwörtern
	for (const domain in emojiMap) {
		for (const keyword in emojiMap[domain]) {
			if (combinedText.includes(keyword)) {
				return emojiMap[domain][keyword];
			}
		}
	}

	// Fallback-Logik für spezifische häufige Begriffe
	const lowerEntity = entity.toLowerCase();

	// Technologie-Begriffe
	if (/\b(?:api|sdk|server|client|code|app|software)\b/i.test(lowerEntity))
		return "💻";

	// KI und Daten
	if (/\b(?:ai|ki|ml|data|daten|analytics|intelligence)\b/i.test(lowerEntity))
		return "🤖";

	// Business-Begriffe
	if (/\b(?:meeting|projekt|kunden|strategie)\b/i.test(lowerEntity))
		return "📊";

	// Alltagsbegriffe
	if (/\b(?:essen|food|meal|drink|trinken)\b/i.test(lowerEntity)) return "🍽️";
	if (/\b(?:travel|reise|urlaub|trip)\b/i.test(lowerEntity)) return "✈️";
	if (/\b(?:film|movie|musik|music|entertainment)\b/i.test(lowerEntity))
		return "🎬";

	// Fallback-Emoji für unbekannte Kategorien
	return "📌";
}

/**
 * Identifiziert Entitäten und weist ihnen passende Emojis zu
 * @param {string} text - Der zu analysierende Text
 * @returns {Object} - Map von Entitäten zu Emojis
 */
function identifyEntitiesWithEmojis(text) {
	const entities = extractEntities(text);
	const entityEmojis = {};

	entities.forEach((entity) => {
		// Verwende einen Kontext um das Entity herum (100 Zeichen)
		const entityRegex = new RegExp(
			`(.{0,100}${escapeRegExp(entity)}.{0,100})`,
			"i"
		);
		const match = text.match(entityRegex);
		const context = match ? match[1] : "";

		// Weise ein passendes Emoji zu
		entityEmojis[entity] = assignEmoji(entity, context);
	});

	return entityEmojis;
}

module.exports = {
	extractEntities,
	addObsidianLinks,
	identifyRelatedTerms,
	detectLanguage,
	assignEmoji,
	identifyEntitiesWithEmojis,
};
