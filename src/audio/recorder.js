// recorder.js
const fs = require("fs");
const path = require("path");
const mic = require("mic");

/**
 * Nimmt Audio für eine bestimmte Zeit auf
 * @param {string} fileName - Der Name der Zieldatei
 * @param {number} duration - Die Aufnahmedauer in Millisekunden
 * @returns {Promise<string>} - Der vollständige Pfad zur gespeicherten Audiodatei
 */
function recordAudio(fileName, duration = 10000) {
	return new Promise((resolve, reject) => {
		try {
			// Erstelle den Ausgabepfad
			const outputDir = path.join(__dirname, "audio");
			const outputFile = path.join(outputDir, fileName);

			// Stelle sicher, dass das Ausgabeverzeichnis existiert
			if (!fs.existsSync(outputDir)) {
				fs.mkdirSync(outputDir, { recursive: true });
			}

			const micInstance = mic({
				rate: "16000",
				channels: "1",
				fileType: "wav",
				encoding: "signed-integer",
				device: "default", // Hier könnte ein spezifisches Gerät angegeben werden
			});

			const micInputStream = micInstance.getAudioStream();
			const outputFileStream = fs.createWriteStream(outputFile);

			micInputStream.pipe(outputFileStream);

			micInputStream.on("error", (err) => {
				console.error("Fehler bei der Aufnahme:", err);
				reject(err);
			});

			micInstance.start();
			console.log(`Aufnahme gestartet... (${duration / 1000} Sekunden)`);

			// Beende die Aufnahme nach der angegebenen Dauer
			setTimeout(() => {
				micInstance.stop();
				console.log("Aufnahme beendet.");

				// Warte kurz, um sicherzustellen, dass die Datei vollständig geschrieben ist
				setTimeout(() => {
					resolve(outputFile);
				}, 500);
			}, duration);
		} catch (error) {
			console.error("Fehler beim Starten der Aufnahme:", error);
			reject(error);
		}
	});
}

// Alte Funktion für Abwärtskompatibilität
function record(duration, outputFile, callback) {
	recordAudio(path.basename(outputFile), duration)
		.then((file) => callback())
		.catch((err) => console.error("Fehler bei der Aufnahme:", err));
}

module.exports = {
	recordAudio,
	record,
};
