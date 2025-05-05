// obsidian-writer.js
const fs = require("fs");
const path = require("path");
const os = require("os");
const { generateTitle } = require("../utils/title-generator");
const {
	extractEntities,
	addObsidianLinks,
	identifyRelatedTerms,
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
	if (fs.existsSync(vaultPath)) {
		OBSIDIAN_VAULT = vaultPath;
		console.log(`✅ Verwende Obsidian-Vault: ${OBSIDIAN_VAULT}`);
		break;
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
## Verknüpfte Konzepte
{{#each entities}}
- [[{{this}}]]
{{/each}}
{{/if}}

---
Erstellt: {{created_at}}
`,
	summary: `# Zusammenfassung: {{title}}

{{summary}}

{{#if entities.length}}
## Verknüpfte Konzepte
{{#each entities}}
- [[{{this}}]]
{{/each}}
{{/if}}

---
Erstellt: {{created_at}}
Basierend auf: {{original_title}}
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
 * Speichert ein Transkript in Obsidian mit automatischen Verlinkungen
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
	try {
		// Erkenne wichtige Entitäten im Text für Verlinkungen
		const entities = extractEntities(transcript);
		console.log(
			`🔍 Erkannte Entitäten: ${
				entities.length > 0 ? entities.join(", ") : "keine"
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

		// Erstelle Dateinamen (ersetze ungültige Zeichen)
		const fileName = `${title.replace(/[/\\?%*:|"<>]/g, "-")}.md`;

		// Bereite Daten für die Vorlage vor
		const templateData = {
			title,
			transcript: linkedTranscript,
			summary: linkedSummary || "Keine Zusammenfassung verfügbar.",
			created_at: new Date().toLocaleString("de-DE"),
			entities: entities,
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
		// Generiere einen dynamischen Titel
		const title = generateTitle(summary, "Zusammenfassung");

		// Erstelle Dateinamen (ersetze ungültige Zeichen)
		const fileName = `${title.replace(/[/\\?%*:|"<>]/g, "-")}.md`;

		// Bereite Daten für die Vorlage vor
		const templateData = {
			title,
			summary,
			original_title: originalTitle || "Unbekanntes Transkript",
			created_at: new Date().toLocaleString("de-DE"),
			entities: extractEntities(summary),
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

	for (const entity of entities) {
		const entityFile = path.join(entitiesDir, `${entity}.md`);

		try {
			let entityContent = "";

			// Prüfe, ob die Datei bereits existiert
			if (fs.existsSync(entityFile)) {
				// Lese vorhandenen Inhalt
				entityContent = fs.readFileSync(entityFile, "utf8");

				// Füge Backlink zur Quelldatei hinzu, wenn er noch nicht existiert
				if (!entityContent.includes(`[[${sourceTitle}]]`)) {
					entityContent += `\n- Erwähnt in: [[${sourceTitle}]]\n`;
				}
			} else {
				// Erstelle eine neue Entitätsnotiz
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

				entityContent += "## Erwähnungen\n\n";
				entityContent += `- Erstmals erwähnt in: [[${sourceTitle}]]\n`;
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
