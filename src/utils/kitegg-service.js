// kitegg-service.js (früher gemini.js) - vollständig überarbeitet für Kitegg
const fs = require("fs");
const path = require("path");
const templates = require("./summary-templates");

// Lade die Konfiguration aus config.json im Root-Verzeichnis
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

/**
 * Analyzes a text and identifies the best template type based on the content
 * @param {string} text - The text to analyze
 * @returns {string} - The appropriate template type
 */
function detectTemplateType(text) {
	text = text.toLowerCase();

	// Detection of meetings and discussions
	if (
		text.includes("meeting") ||
		text.includes("besprechung") ||
		text.includes("sitzung") ||
		text.includes("teilnehmer") ||
		text.includes("agenda") ||
		text.includes("protokoll")
	) {
		return "meeting";
	}

	// Detection of brainstorming
	if (
		text.includes("brainstorming") ||
		text.includes("ideen") ||
		text.includes("kreativ") ||
		text.includes("konzept") ||
		text.includes("innovation") ||
		text.includes("lösungen")
	) {
		return "brainstorming";
	}

	// Detection of learning content
	if (
		text.includes("lernen") ||
		text.includes("studium") ||
		text.includes("vorlesung") ||
		text.includes("kurs") ||
		text.includes("seminar") ||
		text.includes("bildung") ||
		text.includes("wissen") ||
		text.includes("verstehen")
	) {
		return "learning";
	}

	// Detection of projects
	if (
		text.includes("projekt") ||
		text.includes("aufgabe") ||
		text.includes("deadline") ||
		text.includes("meilenstein") ||
		text.includes("plan") ||
		text.includes("ressourcen") ||
		text.includes("umsetzung")
	) {
		return "project";
	}

	// Detection of research and analysis
	if (
		text.includes("forschung") ||
		text.includes("analyse") ||
		text.includes("studie") ||
		text.includes("daten") ||
		text.includes("ergebnisse") ||
		text.includes("methodik") ||
		text.includes("evidenz") ||
		text.includes("statistik")
	) {
		return "research";
	}

	// Detection of personal content
	if (
		text.includes("ich fühle") ||
		text.includes("persönlich") ||
		text.includes("gedanken") ||
		text.includes("meine") ||
		text.includes("tagebuch") ||
		text.includes("reflexion") ||
		text.includes("emotion") ||
		text.includes("gefühl")
	) {
		return "personal";
	}

	// Default template if no specific category is detected
	return "standard";
}

/**
 * Populates a template with transcript data
 * @param {string} template - The template to use
 * @param {string} transcript - The transcript to insert
 * @returns {string} - The populated template
 */
function applyTemplate(template, transcript) {
if (!template || typeof template !== 'string') {
console.warn('⚠️ Template ist ungültig, verwende Fallback');
return `Bitte fasse den folgenden Text zusammen:\n\n${transcript}`;
}
if (!transcript || typeof transcript !== 'string') {
console.warn('⚠️ Transcript ist ungültig');
return template;
}
return template.replace("{{transcript}}", transcript);
}

/**
 * Summarizes a text using Kitegg API
 * @param {string} text - The text to summarize
 * @param {string} templateType - Optional template type (if null, automatic detection)
 * @returns {Promise<string>} - The summary
 */
async function summarize(text, templateType = null) {
	const apiKey = config.KITEGG_API_KEY;
	if (!apiKey) {
		console.error("❌ KITEGG_API_KEY nicht in config.json gefunden.");
		return `Zusammenfassung (ohne KI - Konfigurationsfehler): ${text
			.split(".")
			.slice(0, 2)
			.join(".")}...`;
	}

	try {
		// Erkenne Vorlagentyp (meeting, projekt, etc.)
		const type = templateType || detectTemplateType(text);
		console.log(`🔍 Erkannter Vorlagentyp (für Kitegg): ${type}`);

        // Wähle passende Vorlage aus und befülle sie
        const templateToUse = templates.templates[type] || templates.templates.standard;
        const promptContent = applyTemplate(templateToUse, text);

		console.log(
			`🤖 Sende Anfrage an Kitegg API (${promptContent.length} Zeichen)...`
		);

		// Bereite Anfrage vor
		const messages = [{ role: "user", content: promptContent }];
		const response = await fetch(
			"https://chat1.kitegg.de/api/chat/completions",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${apiKey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					model: "mistralai/Mistral-Small-3.1-24B-Instruct-2503",
					messages: messages,
					stream: false,
				}),
			}
		);

		// Fehlerbehandlung der API-Antwort
		if (!response.ok) {
			const status = response.status;
			let errorText = "";
			try {
				errorText = await response.text();
			} catch (e) {
				errorText = "Fehler beim Lesen der Antwort";
			}

			console.error(`❌ Kitegg API Fehler (${status}):`, errorText);

			if (status === 401 || status === 403) {
				throw new Error(
					"Ungültiger API-Schlüssel oder Berechtigungsproblem"
				);
			} else if (status === 429) {
				throw new Error("API-Limit erreicht");
			} else {
				throw new Error(`HTTP-Fehler ${status}`);
			}
		}

		// Erfolgreiche Antwort verarbeiten
		const data = await response.json();
		console.log("✅ Kitegg-Antwort erhalten");

		if (
			data.choices &&
			data.choices[0] &&
			data.choices[0].message &&
			data.choices[0].message.content
		) {
			const summary = data.choices[0].message.content.trim();
			console.log(`📝 Zusammenfassungslänge: ${summary.length} Zeichen`);
			return summary;
		} else {
			console.error(
				"❌ Unerwartete Antwortstruktur von Kitegg API:",
				JSON.stringify(data).substring(0, 200) + "..."
			);
			throw new Error("Ungültige Antwort von Kitegg API");
		}
	} catch (error) {
		console.error(
			"❌ Fehler bei der Zusammenfassung mit Kitegg:",
			error.message
		);
		return `Zusammenfassung (ohne KI - ${error.message}): ${text
			.split(".")
			.slice(0, 2)
			.join(".")}...`;
	}
}

/**
 * Legacy function for backward compatibility
 */
async function summarizeTranscript(transcript) {
	return summarize(transcript);
}

module.exports = {
	summarize,
	summarizeTranscript,
	detectTemplateType,
};
