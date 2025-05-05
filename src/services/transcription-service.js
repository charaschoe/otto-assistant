// Vereinfachter Transkriptionsdienst - nur lokales Whisper
const { transcribeWithLocalWhisper } = require("./local-whisper");

/**
 * Transkriptionsdienst, der nur lokales Whisper verwendet
 * @param {string} audioPath Pfad zur Audio-Datei
 * @param {object} options Optionen für die Transkription
 * @returns {Promise<string>} Transkriptionstext
 */
async function transcribe(audioPath, options = {}) {
	try {
		console.log(`Starte lokale Whisper-Transkription für: ${audioPath}`);

		// Extrahiere nur die relevanten Optionen für lokales Whisper
		const { outputDir = null } = options;

		const result = await transcribeWithLocalWhisper(audioPath, {
			outputDir,
		});
		console.log(`Transkription erfolgreich abgeschlossen`);

		return result;
	} catch (error) {
		console.error(
			`Fehler bei der lokalen Whisper-Transkription:`,
			error.message
		);
		throw new Error(`Transkriptionsfehler: ${error.message}`);
	}
}

module.exports = {
	transcribe,
	transcribeWithLocalWhisper,
};
