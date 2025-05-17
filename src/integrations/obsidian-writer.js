// obsidian-writer.js
const fs = require("fs");
const path = require("path");
const os = require("os");
const { generateTitle } = require("../utils/title-generator");
const {
	extractEntities,
	addObsidianLinks,
	identifyRelatedTerms,
	detectLanguage, // <--- hinzugefügt
} = require("../utils/entity-linker");

// Konfigurationsvariablen für Obsidian - angepasster Pfad
// Wir verwenden den vom Benutzer angegebenen Pfad
const USER_OBSIDIAN_VAULT = "/Users/admin/Desktop/OTTO_Alpha";
const DEFAULT_OBSIDIAN_VAULT = path.join(
	os.homedir(),
	"Documents",
	"Obsidian",
	"Main Vault"
);
const LOCAL_VAULT_PATH = path.resolve(__dirname, "../../obsidian-vault");

// Priorisierte Liste von Vault-Pfaden
const VAULT_PATHS = [
	USER_OBSIDIAN_VAULT, // 1. Vom Benutzer angegebener Pfad
	DEFAULT_OBSIDIAN_VAULT, // 2. Standard-Obsidian-Pfad
	LOCAL_VAULT_PATH, // 3. Lokaler Fallback-Pfad
];

// Finde den ersten existierenden Vault-Pfad
let OBSIDIAN_VAULT = null;
for (const vaultPath of VAULT_PATHS) {
	if (
		fs.existsSync(vaultPath) &&
		fs.accessSync(vaultPath, fs.constants.W_OK)
	) {
		OBSIDIAN_VAULT = vaultPath;
		console.log(`✅ Verwende Obsidian-Vault: ${OBSIDIAN_VAULT}`);
		break;
	} else {
		console.warn(
			`⚠️ Vault-Pfad existiert, ist aber nicht beschreibbar: ${vaultPath}`
		);
	}
}

// Wenn kein Vault gefunden wurde, erstelle den lokalen Vault
if (!OBSIDIAN_VAULT) {
	try {
		fs.mkdirSync(LOCAL_VAULT_PATH, { recursive: true });
		OBSIDIAN_VAULT = LOCAL_VAULT_PATH;
		console.log(`📁 Lokaler Obsidian-Vault erstellt: ${OBSIDIAN_VAULT}`);
	} catch (error) {
		console.error(
			"Fehler beim Erstellen des lokalen Vaults:",
			error.message
		);
		// Fallback zum Benutzer-Pfad, auch wenn er nicht existiert
		OBSIDIAN_VAULT = USER_OBSIDIAN_VAULT;
		console.warn(`⚠️ Verwende nicht existierenden Pfad: ${OBSIDIAN_VAULT}`);
	}
}

const OBSIDIAN_TEMPLATES = {
	transcript: `# {{title}}

## Zusammenfassung
{{summary}}

## Vollständiges Transkript
{{transcript}}

{{#if entities.length}}
## Wichtige Konzepte
{{#each entityEmojis}}
- {{value}} [[{{@key}}]]
{{/each}}
{{/if}}

---
Erstellt: {{created_at}}
Sprache: {{language}}
Tags: #transkript #otto
`,
	summary: `# Zusammenfassung: {{title}}

{{summary}}

{{#if entities.length}}
## Wichtige Konzepte
{{#each entityEmojis}}
- {{value}} [[{{@key}}]]
{{/each}}
{{/if}}

---
Erstellt: {{created_at}}
Basierend auf: [[{{original_title}}]]
Sprache: {{language}}
Tags: #zusammenfassung #otto
`,
};

/**
 * Erstellt eine Datei im Obsidian-Vault
 * @param {string} content - Der Inhalt der Datei
 * @param {string} fileName - Der Name der Datei
 * @returns {string|null} - Der vollständige Pfad der erstellten Datei oder null bei Fehler
 */
function createObsidianFile(content, fileName) {
	try {
		// Stelle sicher, dass das Obsidian-Verzeichnis existiert
		if (!fs.existsSync(OBSIDIAN_VAULT)) {
			console.warn(`⚠️ Obsidian-Vault nicht gefunden: ${OBSIDIAN_VAULT}`);
			console.warn("Bitte passe den Pfad in obsidian-writer.js an.");
			return null;
		}

		// Erstelle den vollständigen Pfad
		const filePath = path.join(OBSIDIAN_VAULT, fileName);

		// Speichere die Datei
		fs.writeFileSync(filePath, content);
		console.log(`✅ Datei in Obsidian gespeichert: ${fileName}`);

		return filePath;
	} catch (error) {
		console.error("Fehler beim Speichern in Obsidian:", error.message);
		return null;
	}
}

/**
 * Wendet eine Obsidian-Vorlage an und ersetzt Platzhalter
 * @param {string} templateName - Der Name der Vorlage
 * @param {Object} data - Die Daten für die Platzhalter
 * @returns {string} - Der erstellte Inhalt
 */
function applyTemplate(templateName, data) {
	let template = OBSIDIAN_TEMPLATES[templateName] || "";

	// Ersetze alle Platzhalter
	for (const [key, value] of Object.entries(data)) {
		if (typeof value === "string") {
			const placeholder = new RegExp(`{{${key}}}`, "g");
			template = template.replace(placeholder, value);
		} else if (Array.isArray(value)) {
			// Behandlung von Arraydaten (für Entitäten)
			const startPlaceholder = new RegExp(
				`{{#if ${key}.length}}([\\s\\S]*?){{#each ${key}}}([\\s\\S]*?){{/each}}([\\s\\S]*?){{/if}}`,
				"g"
			);

			let replacement = "";
			if (value.length > 0) {
				const match = startPlaceholder.exec(template);
				if (match) {
					const [fullMatch, prefix, itemTemplate, suffix] = match;

					replacement = prefix;
					for (const item of value) {
						const itemReplacement = itemTemplate.replace(
							/{{this}}/g,
							item
						);
						replacement += itemReplacement;
					}
					replacement += suffix;

					template = template.replace(fullMatch, replacement);
				}
			} else {
				// Entferne den gesamten Block, wenn das Array leer ist
				template = template.replace(startPlaceholder, "");
			}
		}
	}

	return template;
}

/**
 * Speichert ein Transkript in Obsidian mit automatischen Verlinkungen und markiert Aufgaben
 * @param {string} transcript - Das zu speichernde Transkript
 * @param {string} summary - Die Zusammenfassung des Transkripts
 * @param {string} baseTitle - Optionaler Basis-Titel
 * @returns {string|null} - Der Titel der erstellten Notiz oder null bei Fehler
 */
function saveTranscriptToObsidian(
	transcript,
	summary,
	baseTitle = "Transkript"
) {
	// Aufgaben im Transkript erkennen und markieren
	transcript = transcript.replace(
		/(?:-|\*|\d+\.)\s*(.*?)(?:\n|$)/g,
		"- [ ] $1"
	);
	try {
		// Erkenne Sprache des Textes
		const language = detectLanguage(transcript);
		console.log(
			`🌐 Erkannte Sprache: ${language === "de" ? "Deutsch" : "Englisch"}`
		);

		// Erkenne wichtige Entitäten im Text für Verlinkungen
		const entities = extractEntities(transcript);
		console.log(
			`🔍 Erkannte Entitäten: ${
				entities.length > 0 ? entities.join(", ") : "keine"
			}`
		);

		// Identifiziere Entitäten mit passenden Emojis
		const entityEmojis = identifyEntitiesWithEmojis(transcript);
		console.log(
			`🎯 Entitäten mit Emojis: ${
				Object.keys(entityEmojis).length > 0
					? Object.entries(entityEmojis)
							.map(([entity, emoji]) => `${emoji} ${entity}`)
							.join(", ")
					: "keine"
			}`
		);

		// Identifiziere verwandte Begriffe für zusätzliche Kontextinformationen
		const relations = identifyRelatedTerms(transcript, entities);

		// Füge Obsidian-Verlinkungen zum Transkript hinzu
		const linkedTranscript = addObsidianLinks(transcript, entities);

		// Füge Obsidian-Verlinkungen zur Zusammenfassung hinzu
		const linkedSummary = addObsidianLinks(summary, entities);

		// Generiere einen dynamischen Titel
		const title = generateTitle(transcript, baseTitle);

		// Wähle ein allgemeines Emoji für die Notiz basierend auf Inhalt
		const noteEmoji = Object.values(entityEmojis)[0] || "📝";
		const titleWithEmoji = `${noteEmoji} ${title}`;

		// Erstelle Dateinamen (ersetze ungültige Zeichen)
		const fileName = `${titleWithEmoji.replace(/[/\\?%*:|"<>]/g, "-")}.md`;

		// Bereite Daten für die Vorlage vor
		const templateData = {
			title: titleWithEmoji,
			transcript: linkedTranscript,
			summary: linkedSummary || "Keine Zusammenfassung verfügbar.",
			created_at: new Date().toLocaleString(
				language === "de" ? "de-DE" : "en-US"
			),
			entities: entities,
			entityEmojis: entityEmojis,
			language: language === "de" ? "Deutsch" : "Englisch",
		};

		// Wende die Vorlage an
		const content = applyTemplate("transcript", templateData);

		// Speichere die Datei
		createObsidianFile(content, fileName);

		// Optional: Erstelle Entitäts-Notizen für bisher unbekannte Entitäten
		createEntityNotes(entities, title, transcript);

		return title;
	} catch (error) {
		console.error("Fehler beim Speichern des Transkripts:", error.message);
		return null;
	}
}

/**
 * Speichert eine separate Zusammenfassung in Obsidian
 * @param {string} summary - Die zu speichernde Zusammenfassung
 * @param {string} originalTitle - Der Titel des Originaltranskripts
 * @returns {string|null} - Der Titel der erstellten Notiz oder null bei Fehler
 */
function saveSummaryToObsidian(summary, originalTitle) {
	try {
		// Erkenne Sprache des Textes
		const language = detectLanguage(summary);

		// Generiere einen dynamischen Titel
		const title = generateTitle(
			summary,
			language === "de" ? "Zusammenfassung" : "Summary"
		);

		// Identifiziere Entitäten und Emojis
		const entities = extractEntities(summary);
		const entityEmojis = identifyEntitiesWithEmojis(summary);

		// Wähle ein allgemeines Emoji für die Notiz basierend auf Inhalt
		const noteEmoji = Object.values(entityEmojis)[0] || "📋";
		const titleWithEmoji = `${noteEmoji} ${title}`;

		// Erstelle Dateinamen (ersetze ungültige Zeichen)
		const fileName = `${titleWithEmoji.replace(/[/\\?%*:|"<>]/g, "-")}.md`;

		// Bereite Daten für die Vorlage vor
		const templateData = {
			title: titleWithEmoji,
			summary,
			original_title: originalTitle || "Unbekanntes Transkript",
			created_at: new Date().toLocaleString(
				language === "de" ? "de-DE" : "en-US"
			),
			entities: entities,
			entityEmojis: entityEmojis,
			language: language === "de" ? "Deutsch" : "Englisch",
		};

		// Wende die Vorlage an
		const content = applyTemplate("summary", templateData);

		// Speichere die Datei
		createObsidianFile(content, fileName);

		return title;
	} catch (error) {
		console.error(
			"Fehler beim Speichern der Zusammenfassung:",
			error.message
		);
		return null;
	}
}

/**
 * Erstellt oder aktualisiert Notizen für Entitäten im Obsidian-Vault
 * @param {string[]} entities - Liste der Entitäten
 * @param {string} sourceTitle - Titel der Quelldatei
 * @param {string} sourceContent - Inhalt, aus dem die Entitäten stammen
 */
function createEntityNotes(entities, sourceTitle, sourceContent) {
	if (!entities || entities.length === 0) return;

	// Erstelle den Entitätsordner, falls er nicht existiert
	const entitiesDir = path.join(OBSIDIAN_VAULT, "Entities");
	if (!fs.existsSync(entitiesDir)) {
		fs.mkdirSync(entitiesDir, { recursive: true });
	}

	// Identifiziere Beziehungen zwischen den Entitäten
	const relations = identifyRelatedTerms(sourceContent, entities);

	for (const entity of entities) {
		const entityFile = path.join(entitiesDir, `${entity}.md`);

		try {
			let entityContent = "";
			let existingContent = "";
			let isNewEntity = false;

			// Prüfe, ob die Datei bereits existiert
			if (fs.existsSync(entityFile)) {
				// Lese vorhandenen Inhalt
				existingContent = fs.readFileSync(entityFile, "utf8");
				entityContent = existingContent;

				// Füge Backlink zur Quelldatei hinzu, wenn er noch nicht existiert
				if (!entityContent.includes(`[[${sourceTitle}]]`)) {
					// Finde den Abschnitt "Erwähnungen" oder füge ihn am Ende hinzu
					const mentionsSection =
						entityContent.match(/## Erwähnungen\n\n/);
					if (mentionsSection) {
						const position =
							entityContent.indexOf(mentionsSection[0]) +
							mentionsSection[0].length;
						entityContent =
							entityContent.substring(0, position) +
							`- Erwähnt in: [[${sourceTitle}]]\n` +
							entityContent.substring(position);
					} else {
						entityContent += `\n## Erwähnungen\n\n`;
						entityContent += `- Erwähnt in: [[${sourceTitle}]]\n`;
					}
				}
			} else {
				// Erstelle eine neue Entitätsnotiz
				isNewEntity = true;
				entityContent = `# ${entity}\n\n`;

				// Extrahiere Kontext für diese Entität
				const contextLines = extractEntityContext(
					sourceContent,
					entity
				);

				if (contextLines.length > 0) {
					entityContent += "## Kontext\n\n";
					for (const line of contextLines) {
						entityContent += `> ${line}\n\n`;
					}
				}

				// Füge Beziehungsinformationen hinzu
				if (relations[entity] && relations[entity].related.length > 0) {
					entityContent += "## Verbunden mit\n\n";
					for (const related of relations[entity].related) {
						// Zeige auch die Stärke der Beziehung an
						const weight =
							relations[entity].relatedWeighted[related] || 1;
						const strengthMarker = weight > 1 ? "**" : ""; // Starke Verbindungen markieren
						entityContent += `- ${strengthMarker}[[${related}]]${strengthMarker}\n`;
					}
					entityContent += "\n";
				}

				entityContent += "## Erwähnungen\n\n";
				entityContent += `- Erstmals erwähnt in: [[${sourceTitle}]]\n`;
			}

			// Bei bestehenden Entitäten, aktualisiere Beziehungen wenn sie sich geändert haben
			if (
				!isNewEntity &&
				relations[entity] &&
				relations[entity].related.length > 0
			) {
				// Prüfe, ob bereits ein Beziehungsabschnitt existiert
				let connectionSection = entityContent.match(
					/## Verbunden mit\n\n([^#]*)/
				);

				// Erstelle neue Beziehungsliste
				let newConnectionsContent = "## Verbunden mit\n\n";
				for (const related of relations[entity].related) {
					const weight =
						relations[entity].relatedWeighted[related] || 1;
					const strengthMarker = weight > 1 ? "**" : "";
					newConnectionsContent += `- ${strengthMarker}[[${related}]]${strengthMarker}\n`;
				}
				newConnectionsContent += "\n";

				if (connectionSection) {
					// Ersetze bestehenden Abschnitt
					entityContent = entityContent.replace(
						/## Verbunden mit\n\n([^#]*)/,
						newConnectionsContent
					);
				} else {
					// Füge nach Kontext oder vor Erwähnungen ein
					const contextSection = entityContent.match(
						/## Kontext\n\n([^#]*)/
					);
					const mentionSection =
						entityContent.match(/## Erwähnungen\n\n/);

					if (contextSection) {
						const position =
							entityContent.indexOf(contextSection[0]) +
							contextSection[0].length +
							contextSection[1].length;
						entityContent =
							entityContent.substring(0, position) +
							newConnectionsContent +
							entityContent.substring(position);
					} else if (mentionSection) {
						const position = entityContent.indexOf(
							mentionSection[0]
						);
						entityContent =
							entityContent.substring(0, position) +
							newConnectionsContent +
							entityContent.substring(position);
					} else {
						// Füge am Ende hinzu
						entityContent += "\n" + newConnectionsContent;
					}
				}
			}

			// Speichere die Entitätsnotiz
			fs.writeFileSync(entityFile, entityContent);
		} catch (error) {
			console.error(
				`Fehler beim Erstellen der Entitätsnotiz für "${entity}":`,
				error.message
			);
		}
	}

	console.log(`✅ ${entities.length} Entitätsnotizen erstellt/aktualisiert`);
}

/**
 * Extrahiert Kontextinformationen für eine Entität aus einem Text
 * @param {string} text - Der Quelltext
 * @param {string} entity - Die zu suchende Entität
 * @returns {string[]} - Array mit Kontextzeilen
 */
function extractEntityContext(text, entity) {
	const contextLines = [];
	const regex = new RegExp(
		`[^.!?]*\\b${escapeRegExp(entity)}\\b[^.!?]*[.!?]`,
		"gi"
	);

	let match;
	while ((match = regex.exec(text)) !== null && contextLines.length < 3) {
		const context = match[0].trim();
		if (context && !contextLines.includes(context)) {
			contextLines.push(context);
		}
	}

	return contextLines;
}

/**
 * Escape-Funktion für reguläre Ausdrücke
 * @param {string} string - Der zu escapende String
 * @returns {string} - Escapeter String
 */
function escapeRegExp(string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Für Abwärtskompatibilität
function saveNote(transcript, summary) {
	return saveTranscriptToObsidian(transcript, summary);
}

module.exports = {
	saveTranscriptToObsidian,
	saveSummaryToObsidian,
	saveNote,
};
