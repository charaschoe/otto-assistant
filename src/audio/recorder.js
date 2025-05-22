// recorder.js
const fs = require("fs");
const path = require("path");
const mic = require("mic");

// Konfiguration für die Aufnahmeeinstellungen
const KEEP_RECORDINGS_COUNT = 5; // Anzahl der zu behaltenden Aufnahmen
const RECORDING_DURATION = 25000; // Standard-Aufnahmedauer in Millisekunden

/**
 * Generiert einen Dateinamen mit aktuellem Datum und Uhrzeit
 * @returns {string} - Der generierte Dateiname im Format "recording-YYYY-MM-DD-HH-MM-SS.wav"
 */
function generateTimestampedFilename() {
	const now = new Date();
	return `recording-${now.getFullYear()}-${String(
		now.getMonth() + 1
	).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}-${String(
		now.getHours()
	).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}-${String(
		now.getSeconds()
	).padStart(2, "0")}.wav`;
}

/**
 * Behält nur die neuesten n Dateien im Verzeichnis
 * @param {string} directory - Das zu bereinigende Verzeichnis
 * @param {number} keepCount - Anzahl der zu behaltenden Dateien
 * @returns {Array<string>} - Die Pfade der behaltenen Dateien, sortiert nach Änderungsdatum (neuste zuerst)
 */
function keepLatestFiles(directory, keepCount = KEEP_RECORDINGS_COUNT) {
	if (!fs.existsSync(directory)) return [];

	try {
		// Lese alle Dateien und sortiere sie nach Änderungsdatum (neuste zuerst)
		const files = fs
			.readdirSync(directory)
			.filter((file) => file.endsWith(".wav"))
			.map((file) => {
				const filePath = path.join(directory, file);
				return {
					path: filePath,
					mtime: fs.statSync(filePath).mtime.getTime(),
				};
			})
			.sort((a, b) => b.mtime - a.mtime);

		// Lösche überschüssige Dateien
		if (files.length > keepCount) {
			files.slice(keepCount).forEach((file) => {
				try {
					fs.unlinkSync(file.path);
					console.log(
						`🗑️ Alte Aufnahme gelöscht: ${path.basename(file.path)}`
					);
				} catch (err) {
					console.error(`Fehler beim Löschen von ${file.path}:`, err);
				}
			});
		}

		// Gib die Pfade der behaltenen Dateien zurück
		return files.slice(0, keepCount).map((file) => file.path);
	} catch (err) {
		console.error(
			`Fehler beim Verwalten der Dateien in ${directory}:`,
			err
		);
		return [];
	}
}

/**
 * Records audio for a specified duration
 * @param {string} fileName - The name of the target file (wird ignoriert, wenn useTimestampedName=true)
 * @param {number} duration - The recording duration in milliseconds
 * @param {boolean} useTimestampedName - Ob ein zeitgestempelter Name verwendet werden soll
 * @returns {Promise<string>} - The full path to the saved audio file
 */
function recordAudio(
	fileName = "test.wav",
	duration = RECORDING_DURATION,
	useTimestampedName = true
) {
	return new Promise((resolve, reject) => {
		try {
			// Generiere zeitgestempelten Dateinamen, falls gewünscht
			const actualFileName = useTimestampedName
				? generateTimestampedFilename()
				: fileName;

			// Create the output paths
			const outputDir = path.join(__dirname, "audio");
			const outputFile = path.join(outputDir, actualFileName);

			// Additionally save in the recordings directory for test mode
			const recordingsDir = path.join(__dirname, "..", "recordings");
			const recordingsFile = path.join(recordingsDir, actualFileName);

			// Ensure the output directories exist
			if (!fs.existsSync(outputDir)) {
				fs.mkdirSync(outputDir, { recursive: true });
			}
			if (!fs.existsSync(recordingsDir)) {
				fs.mkdirSync(recordingsDir, { recursive: true });
			}

			const micInstance = mic({
				rate: "16000",
				channels: "1",
				fileType: "wav",
				encoding: "signed-integer",
				device: "default", // A specific device could be specified here
			});

			const micInputStream = micInstance.getAudioStream();
			const outputFileStream = fs.createWriteStream(outputFile);

			micInputStream.pipe(outputFileStream);

			micInputStream.on("error", (err) => {
				console.error("Error during recording:", err);
				reject(err);
			});

			micInstance.start();
			console.log(`Recording started... (${duration / 1000} seconds)`);

			// Beende die Aufnahme nach der angegebenen Dauer
			setTimeout(() => {
				console.log("The recording will end in 5 seconds...");
				setTimeout(() => {
					micInstance.stop();
					console.log("Recording ended.");

					// Wait briefly to ensure the file is fully written
					setTimeout(() => {
						// Kopiere die Datei auch in das recordings-Verzeichnis für den Testmodus
						try {
							fs.copyFileSync(outputFile, recordingsFile);
							console.log(
								`✅ Aufnahme für Tests gespeichert: ${recordingsFile}`
							);

							// Symlink für "test.wav" als einfachen Zugriff auf die neueste Datei
							const latestLinkFile = path.join(
								recordingsDir,
								"test.wav"
							);
							try {
								if (fs.existsSync(latestLinkFile)) {
									fs.unlinkSync(latestLinkFile);
								}
								fs.copyFileSync(recordingsFile, latestLinkFile);
								console.log(
									`🔗 Neueste Aufnahme verlinkt als: test.wav`
								);
							} catch (err) {
								console.error(
									"Fehler beim Erstellen des Links:",
									err
								);
							}

							// Verwalte die letzten Aufnahmen (konfigurierbare Anzahl)
							const latestFiles = keepLatestFiles(
								recordingsDir,
								KEEP_RECORDINGS_COUNT
							);
							if (latestFiles.length > 0) {
								console.log(
									`📂 Letzte ${latestFiles.length} Aufnahmen verfügbar für Tests.`
								);
							}
						} catch (err) {
							console.error(
								"Fehler beim Speichern der Test-Kopie:",
								err
							);
						}
						resolve(outputFile);
					}, 500);
				}, 5000);
			}, duration - 5000);
		} catch (error) {
			console.error("Error starting the recording:", error);
			reject(error);
		}
	});
}

/**
 * Gibt die verfügbaren Testaufnahmen zurück
 * @param {number} count - Anzahl der zurückzugebenden Aufnahmen (0 für alle)
 * @returns {Array<string>} - Die Pfade der verfügbaren Testaufnahmen, sortiert nach Datum (neuste zuerst)
 */
function getAvailableRecordings(count = 0) {
	const recordingsDir = path.join(__dirname, "..", "recordings");
	if (!fs.existsSync(recordingsDir)) return [];

	try {
		const files = fs
			.readdirSync(recordingsDir)
			.filter((file) => file.endsWith(".wav") && file !== "test.wav") // Exclude the test.wav link
			.map((file) => {
				const filePath = path.join(recordingsDir, file);
				return {
					path: filePath,
					name: file,
					mtime: fs.statSync(filePath).mtime.getTime(),
				};
			})
			.sort((a, b) => b.mtime - a.mtime); // Sort by modification time, newest first

		return count > 0 ? files.slice(0, count) : files;
	} catch (err) {
		console.error("Fehler beim Lesen der verfügbaren Aufnahmen:", err);
		return [];
	}
}

/**
 * Gibt den Pfad zur neuesten Testaufnahme zurück
 * @returns {string|null} - Der Pfad zur neuesten Testaufnahme oder null, wenn keine verfügbar
 */
function getLatestRecording() {
	const recordings = getAvailableRecordings(1);
	return recordings.length > 0 ? recordings[0].path : null;
}

module.exports = {
	recordAudio,
	getAvailableRecordings,
	getLatestRecording,
};
