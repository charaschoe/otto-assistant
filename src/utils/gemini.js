// gemini.js
const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const templates = require("./summary-templates");

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

// Initialisiere die Gemini API
const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);

/**
 * Analysiert einen Text und identifiziert den besten Vorlagentyp basierend auf dem Inhalt
 * @param {string} text - Der zu analysierende Text
 * @returns {string} - Der passende Vorlagentyp
 */
function detectTemplateType(text) {
	text = text.toLowerCase();

	// Erkennung von Meetings und Besprechungen
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

	// Erkennung von Brainstorming
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

	// Erkennung von Lerninhalten
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

	// Erkennung von Projekten
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

	// Erkennung von Forschung und Analyse
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

	// Erkennung von persönlichen Inhalten
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

	// Standardvorlage, wenn keine spezifische Kategorie erkannt wurde
	return "standard";
}

/**
 * Füllt eine Vorlage mit Transkript-Daten aus
 * @param {string} template - Die zu verwendende Vorlage
 * @param {string} transcript - Das Transkript, das eingefügt werden soll
 * @returns {string} - Die ausgefüllte Vorlage
 */
function applyTemplate(template, transcript) {
	return template.replace("{{transcript}}", transcript);
}

/**
 * Fasst einen Text mit Gemini zusammen
 * @param {string} text - Der zu zusammenfassende Text
 * @param {string} templateType - Optionaler Vorlagentyp (falls null, automatische Erkennung)
 * @returns {Promise<string>} - Die Zusammenfassung
 */
async function summarize(text, templateType = null) {
	try {
		// Verwende gemini-1.5-pro oder generative-ai-vision statt gemini-pro
		const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

		// Verwende den angegebenen Vorlagentyp oder erkenne ihn automatisch
		const type = templateType || detectTemplateType(text);
		console.log(`🔍 Erkannter Vorlagentyp: ${type}`);

		// Hole die passende Vorlage
		const template = templates[type] || templates.standard;

		// Fülle die Vorlage aus
		const prompt = applyTemplate(template, text);

		// Sende die Anfrage an Gemini
		const result = await model.generateContent(prompt);
		const summary = result.response.text();

		return summary;
	} catch (error) {
		// Fallback-Option für den Fall, dass gemini-1.5-pro nicht verfügbar ist
		try {
			console.log(
				"⚠️ Primäres Modell nicht verfügbar, versuche Fallback-Modell..."
			);
			const fallbackModel = genAI.getGenerativeModel({
				model: "gemini-pro",
			});

			const type = templateType || detectTemplateType(text);
			const template = templates[type] || templates.standard;
			const prompt = applyTemplate(template, text);

			const result = await fallbackModel.generateContent(prompt);
			const summary = result.response.text();

			return summary;
		} catch (fallbackError) {
			console.error("Fehler bei der Zusammenfassung:", error.message);
			console.error("Fallback-Fehler:", fallbackError.message);

			// Einfache Zusammenfassung ohne API
			return `Zusammenfassung (ohne KI): ${text.substring(0, 100)}...`;
		}
	}
}

/**
 * Alte Funktion für Abwärtskompatibilität
 */
async function summarizeTranscript(transcript) {
	return summarize(transcript);
}

module.exports = {
	summarize,
	summarizeTranscript,
	detectTemplateType,
};
