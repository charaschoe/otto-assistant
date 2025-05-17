// gemini.js
const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const templates = require("./summary-templates");

// Load the configuration from config.json in the root directory
let config;
try {
	const configPath = path.resolve(__dirname, "../../config.json");
	config = JSON.parse(fs.readFileSync(configPath, "utf8"));
} catch (error) {
	console.error("Error loading configuration:", error.message);
	console.error(
		"Please ensure a valid config.json exists in the root directory."
	);
	process.exit(1);
}

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);

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
	return template.replace("{{transcript}}", transcript);
}

/**
 * Summarizes a text using Gemini
 * @param {string} text - The text to summarize
 * @param {string} templateType - Optional template type (if null, automatic detection)
 * @returns {Promise<string>} - The summary
 */
async function summarize(text, templateType = null) {
	try {
		// Use gemini-1.5-pro or generative-ai-vision instead of gemini-pro
		const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

		// Use the specified template type or detect it automatically
		const type = templateType || detectTemplateType(text);
		console.log(`🔍 Erkannter Vorlagentyp: ${type}`);

		// Retrieve the appropriate template
		const template = templates[type] || templates.standard;

		// Populate the template
		const prompt = applyTemplate(template, text);

		// Send the request to Gemini
		const result = await model.generateContent(prompt);
		const summary = result.response.text();

		return summary;
	} catch (error) {
		console.error("Error during summarization:", error.message);
		// Immer eine lokale Zusammenfassung zurückgeben, nie eine API-Limit-Fehlermeldung
		return `Zusammenfassung (ohne KI): ${text
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
