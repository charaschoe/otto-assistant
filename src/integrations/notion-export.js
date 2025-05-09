// notion-export.js
const fs = require("fs");
const path = require("path");
const { Client } = require("@notionhq/client");
const { generateTitle } = require("../utils/title-generator");

// Lade die Konfiguration aus der config.json im Root-Verzeichnis
let config;
try {
	const configPath = path.resolve(__dirname, "../../config.json");
	config = JSON.parse(fs.readFileSync(configPath, "utf8"));
} catch (error) {
	console.error("Fehler beim Laden der Konfiguration:", error.message);
	console.error(
		"Bitte stelle sicher, dass eine gültige config.json im Root-Verzeichnis existiert."
	);
	process.exit(1);
}

// Initialisiere den Notion-Client
const notion = new Client({ auth: config.NOTION_API_KEY });
const databaseId = config.NOTION_DATABASE_ID;

/**
 * Holt die verfügbaren Eigenschaften einer Notion-Datenbank
 * @param {string} databaseId - Die ID der Datenbank
 * @returns {Promise<Object>} - Ein Objekt mit Informationen über die Datenbankeigenschaften
 */
async function getNotionDatabaseProperties() {
	try {
		if (!config.NOTION_API_KEY || !databaseId) {
			console.warn(
				"⚠️ Notion API-Schlüssel oder Datenbank-ID fehlt in der Konfiguration."
			);
			return null;
		}

		console.log("🔍 Prüfe Notion-Datenbank-Eigenschaften...");
		const response = await notion.databases.retrieve({
			database_id: databaseId,
		});
		return response.properties || {};
	} catch (error) {
		console.error(
			"Fehler beim Abrufen der Notion-Datenbank:",
			error.message
		);
		return null;
	}
}

/**
 * Exportiert einen Inhalt zu Notion mit dynamischem Titel
 * @param {string} content - Der zu exportierende Inhalt
 * @param {string} baseTitle - Optionaler Basis-Titel
 * @param {Object} options - Zusätzliche Optionen (templateType, tags, etc.)
 * @returns {Promise<string|null>} - URL der erstellten Notion-Seite oder null bei Fehler
 */
async function exportToNotion(content, baseTitle = "Notiz", options = {}) {
	try {
		if (!config.NOTION_API_KEY || !databaseId) {
			console.warn(
				"⚠️ Notion API-Schlüssel oder Datenbank-ID fehlt in der Konfiguration."
			);
			return null;
		}

		// Generiere einen dynamischen Titel
		const title = generateTitle(content, baseTitle);

		// Standardoptionen
		const defaultOptions = {
			templateType: null,
			tags: [],
			status: "Neu",
			priority: "Medium",
		};

		// Kombiniere Standardoptionen mit übergebenen Optionen
		const finalOptions = { ...defaultOptions, ...options };

		// Hole die Datenbankeigenschaften
		const dbProperties = await getNotionDatabaseProperties();

if (!dbProperties) {
console.warn(
"⚠️ Konnte Datenbankeigenschaften nicht abrufen, überprüfe die Konfiguration oder die Datenbank-ID."
);

			// Minimal-Version nur mit Name/Titel
			const response = await notion.pages.create({
				parent: { database_id: databaseId },
				properties: {
					// Die einzige universelle Eigenschaft ist "title", die in allen Datenbanken verfügbar ist
					Name: {
						title: [{ text: { content: title } }],
					},
				},
				children: createContentBlocks(content, {}),
			});

			console.log(
				`✅ Notiz mit minimalem Schema zu Notion exportiert: ${response.url}`
			);
			return response.url;
		}

		// Erstelle Eigenschaften basierend auf den tatsächlich verfügbaren Datenbank-Eigenschaften
		const properties = {};
if (!dbProperties || Object.keys(dbProperties).length === 0) {
  console.error("❌ Keine gültigen Datenbankeigenschaften gefunden. Export abgebrochen.");
  return null;
}

		// Titel hinzufügen (immer erforderlich)
		// Finde die Titel-Eigenschaft (normalerweise "Name", "Titel", "Title" usw.)
		const titleProperty = findTitleProperty(dbProperties);
		if (titleProperty) {
			properties[titleProperty] = {
				title: [{ text: { content: title } }],
			};
		} else {
			// Fallback: Versuche "Name" oder die erste Eigenschaft
			const firstProperty = Object.keys(dbProperties)[0];
			properties[firstProperty || "Name"] = {
				title: [{ text: { content: title } }],
			};
		}

		// Optionale Eigenschaften hinzufügen, aber nur wenn sie in der Datenbank existieren

		// Status
		if (dbProperties.Status && finalOptions.status) {
			if (dbProperties.Status.type === "select") {
				properties.Status = {
					select: { name: finalOptions.status },
				};
			}
		}

		// Tags
		if (
			dbProperties.Tags &&
			finalOptions.tags &&
			finalOptions.tags.length > 0
		) {
			if (dbProperties.Tags.type === "multi_select") {
				properties.Tags = {
					multi_select: finalOptions.tags.map((tag) => ({
						name: tag,
					})),
				};
			}
		}

		// Priorität
		if (dbProperties.Priority && finalOptions.priority) {
			if (dbProperties.Priority.type === "select") {
				properties.Priority = {
					select: { name: finalOptions.priority },
				};
			}
		}

		// Typ
		if (dbProperties.Type && finalOptions.templateType) {
			if (dbProperties.Type.type === "select") {
				properties.Type = {
					select: { name: finalOptions.templateType },
				};
			}
		}

		// Datum
		if (dbProperties.Created && dbProperties.Created.type === "date") {
			properties.Created = {
				date: { start: new Date().toISOString() },
			};
		} else if (dbProperties.Date && dbProperties.Date.type === "date") {
			properties.Date = {
				date: { start: new Date().toISOString() },
			};
		}

		// Erstelle die Seite in Notion
		const response = await notion.pages.create({
			parent: { database_id: databaseId },
			properties,
			children: createContentBlocks(content, finalOptions),
		});

		console.log(`✅ Inhalt zu Notion exportiert: ${response.url}`);
		return response.url;
	} catch (error) {
		console.error("Fehler beim Exportieren zu Notion:", error.message);
		return null;
	}
}

/**
 * Markiert Aufgaben im Text und erstellt Inhaltsblöcke für Notion basierend auf dem Inhalt und Optionen
 * @param {string} content - Der zu strukturierende Inhalt
 * @param {Object} options - Optionen für die Strukturierung
 * @returns {Array} - Array von Notion-Blocks
 */
function createContentBlocks(content, options = {}) {
  // Aufgaben im Text erkennen und markieren
  content = content.replace(/(?:-|\*|\d+\.)\s*(.*?)(?:\n|$)/g, "[] $1");
	const blocks = [];

	// Füge einen Notiztyp-Block hinzu, falls vorhanden
	if (options.templateType) {
		blocks.push({
			object: "block",
			callout: {
				rich_text: [
					{ text: { content: `Typ: ${options.templateType}` } },
				],
				icon: { emoji: "📝" },
				color: "blue_background",
			},
		});
	}

	// Füge Überschrift hinzu
	blocks.push({
		object: "block",
		heading_1: {
			rich_text: [{ text: { content: "Inhalt" } }],
		},
	});

	// Teile den Inhalt in kleinere Stücke, um Notion-Größenbeschränkungen zu umgehen
	const contentChunks = splitContentIntoChunks(content, 2000);

	// Füge die Inhaltsstücke als separate Paragraphen hinzu
	for (const chunk of contentChunks) {
		blocks.push({
			object: "block",
			paragraph: {
				rich_text: [{ text: { content: chunk } }],
			},
		});
	}

	// Füge Metadaten am Ende hinzu
	blocks.push({
		object: "block",
		divider: {},
	});

	blocks.push({
		object: "block",
		paragraph: {
			rich_text: [
				{
					text: {
						content: `Erstellt am: ${new Date().toLocaleString(
							"de-DE"
						)}`,
					},
				},
			],
		},
	});

	return blocks;
}

/**
 * Teilt einen langen Text in kleinere Stücke
 * @param {string} content - Der aufzuteilende Inhalt
 * @param {number} chunkSize - Die maximale Größe pro Stück
 * @returns {string[]} - Array von Textstücken
 */
function splitContentIntoChunks(content, chunkSize) {
	const chunks = [];
	let remaining = content;

	while (remaining.length > 0) {
		// Finde einen passenden Trennpunkt (Zeilenumbruch oder Leerzeichen)
		let splitPoint = Math.min(chunkSize, remaining.length);

		// Falls wir mitten in einem Wort trennen würden, gehe zum letzten Leerzeichen zurück
		if (
			splitPoint < remaining.length &&
			remaining[splitPoint] !== " " &&
			remaining[splitPoint] !== "\n"
		) {
			const lastSpace = remaining.lastIndexOf(" ", splitPoint);
			const lastNewline = remaining.lastIndexOf("\n", splitPoint);

			// Verwende den letzten natürlichen Trennpunkt
			splitPoint = Math.max(lastSpace, lastNewline);

			// Falls kein passender Trennpunkt gefunden wurde, trenne einfach beim Zeichenlimit
			if (splitPoint <= 0) {
				splitPoint = chunkSize;
			}
		}

		// Extrahiere das aktuelle Stück und entferne es vom verbleibenden Text
		chunks.push(remaining.substring(0, splitPoint).trim());
		remaining = remaining.substring(splitPoint).trim();
	}

	return chunks;
}

/**
 * Findet die Titel-Eigenschaft in einer Notion-Datenbank
 * @param {Object} properties - Die Eigenschaften der Datenbank
 * @returns {string|null} - Der Name der Titel-Eigenschaft oder null
 */
function findTitleProperty(properties) {
	// Typische Namen für Titel-Eigenschaften
	const titlePropertyNames = [
		"Name",
		"Titel",
		"Title",
		"name",
		"titel",
		"title",
	];

	// Suche nach einer Eigenschaft mit Typ 'title'
	for (const [key, value] of Object.entries(properties)) {
		if (value.type === "title") {
			return key;
		}
	}

	// Fallback: Suche nach typischen Namen
	for (const name of titlePropertyNames) {
		if (properties[name]) {
			return name;
		}
	}

	return null;
}

/**
 * Alte Funktion für Abwärtskompatibilität
 */
async function exportNote(title, content) {
	return exportToNotion(content, title);
}

module.exports = {
	exportToNotion,
	exportNote,
};
