const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const { getCredential } = require("../database/db-service");

/**
 * Transkribiere eine Audio-Datei mit der OpenAI Whisper API
 * @param {string} audioPath Pfad zur Audio-Datei
 * @param {object} options Optionen für die Transkription
 * @returns {Promise<string>} Transkriptionstext
 */
async function transcribeWithOpenAI(audioPath, options = {}) {
	const { userId, language = "de" } = options;

	try {
		// API-Schlüssel beschaffen - entweder aus den Optionen oder aus der Datenbank
		let openaiKey = options.apiKey;

		if (!openaiKey && userId) {
			openaiKey = await getCredential(userId, "openai");
		}

		if (!openaiKey) {
			throw new Error(
				"Kein OpenAI API-Schlüssel gefunden. Bitte fügen Sie einen in den Einstellungen hinzu oder geben Sie ihn als Option an."
			);
		}

		// Datei in einen Buffer einlesen
		const audioData = fs.readFileSync(audioPath);

		// FormData für Multipart-Upload erstellen
		const formData = new FormData();
		formData.append("file", audioData, {
			filename: "audio.wav",
			contentType: "audio/wav",
		});
		formData.append("model", "whisper-1");
		formData.append("language", language);

		// API-Anfrage an OpenAI senden
		const response = await axios.post(
			"https://api.openai.com/v1/audio/transcriptions",
			formData,
			{
				headers: {
					Authorization: `Bearer ${openaiKey}`,
					...formData.getHeaders(),
				},
			}
		);

		return response.data.text;
	} catch (error) {
		console.error("Fehler bei der OpenAI-Transkription:", error);
		throw new Error(`OpenAI-Transkriptionsfehler: ${error.message}`);
	}
}

module.exports = { transcribeWithOpenAI };
