// Gemini-Service für KI-Zusammenfassungen
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
const fs = require("fs");

// Lade API-Schlüssel
let apiKey = process.env.GEMINI_API_KEY;

// Versuche Schlüssel aus Konfigurationsdatei zu laden, falls Umgebungsvariable nicht existiert
if (!apiKey) {
	try {
		const configPath = path.join(__dirname, "../../config.json");
		if (fs.existsSync(configPath)) {
			const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
			apiKey = config.GEMINI_API_KEY;
		}
	} catch (error) {
		console.error("Fehler beim Laden der Konfiguration:", error);
	}
}

/**
 * Erstellt eine Zusammenfassung eines Textes mit Google Gemini AI
 *
 * @param {string} text Der zu analysierende Text
 * @returns {Promise<string>} HTML-formatierte Zusammenfassung
 */
async function summarizeText(text) {
	try {
		if (!apiKey) {
			throw new Error("Kein Gemini API-Schlüssel gefunden");
		}

		// Initialisiere Google AI
		const genAI = new GoogleGenerativeAI(apiKey);
		const model = genAI.getGenerativeModel({ model: "gemini-pro" });

		// Erstelle Prompt für die Zusammenfassung
		const prompt = `
    Du bist ein hilfreicher Assistent, der Transkriptionen analysiert und zusammenfasst.
    Bitte analysiere folgende Transkription und erstelle:
    
    1. Eine kurze Zusammenfassung der Hauptpunkte (ca. 3-5 Sätze)
    2. Die wichtigsten Stichpunkte (maximal 5)
    3. Wenn vorhanden: Aufgaben oder Aktionen, die aus dem Text hervorgehen
    
    Formatiere deine Antwort als HTML-Struktur mit Überschriften (h3) und Listen (ul/li) für eine übersichtliche Darstellung.
    
    Hier ist die Transkription:
    ${text}
    `;

		// Generiere Antwort
		const result = await model.generateContent(prompt);
		const response = await result.response;
		return response.text();
	} catch (error) {
		console.error("Fehler bei der Gemini-Zusammenfassung:", error);
		throw new Error(`Fehler bei der Zusammenfassung: ${error.message}`);
	}
}

module.exports = { summarizeText };
