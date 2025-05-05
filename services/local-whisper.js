// Local Whisper Transkriptionsservice
import { exec } from "child_process";
import util from "util";
import fs from "fs";
import path from "path";

const execPromise = util.promisify(exec);

/**
 * Prüft, ob Whisper auf dem System installiert ist
 * @returns {Promise<boolean>}
 */
export async function checkWhisperInstallation() {
	try {
		// Versuche, die whisper-Version abzurufen
		const { stdout } = await execPromise("whisper --version");
		return stdout.trim() !== "";
	} catch (error) {
		return false;
	}
}

/**
 * Transkribiert eine Audiodatei mit Whisper
 * @param {string} audioFilePath - Pfad zur Audiodatei
 * @param {Object} options - Transkriptionsoptionen
 * @returns {Promise<string>} - Die Transkription
 */
export async function transcribeAudio(audioFilePath, options = {}) {
	const {
		model = "base",
		language = "de",
		outputFormat = "txt",
		timestamps = false,
	} = options;

	// Basisverzeichnis für Ausgabedateien
	const outputDir = path.dirname(audioFilePath);
	const fileNameWithoutExt = path.basename(
		audioFilePath,
		path.extname(audioFilePath)
	);
	const outputPath = path.join(outputDir, fileNameWithoutExt);

	// Whisper-Befehl erstellen
	let command = `whisper "${audioFilePath}" --model ${model} --output_dir "${outputDir}" --output_format ${outputFormat}`;

	// Sprache hinzufügen, falls nicht "auto"
	if (language !== "auto") {
		command += ` --language ${language}`;
	}

	// Timestamps-Option hinzufügen
	if (timestamps) {
		command += " --word_timestamps true";
	}

	try {
		// Whisper ausführen
		console.log(`Führe Befehl aus: ${command}`);
		const { stdout, stderr } = await execPromise(command);

		if (stderr) {
			console.warn("Whisper Warnungen:", stderr);
		}

		console.log("Whisper Ausgabe:", stdout);

		// Ausgabedatei bestimmen und lesen
		const outputFilePath = `${outputPath}.${outputFormat}`;

		if (!fs.existsSync(outputFilePath)) {
			throw new Error(`Ausgabedatei nicht gefunden: ${outputFilePath}`);
		}

		const transcription = fs.readFileSync(outputFilePath, "utf8");

		// Optional: Ausgabedatei löschen
		// fs.unlinkSync(outputFilePath);

		return transcription;
	} catch (error) {
		console.error("Fehler bei der Whisper-Transkription:", error);
		throw new Error(`Transkriptionsfehler: ${error.message}`);
	}
}

export default {
	transcribeAudio,
	checkWhisperInstallation,
};
