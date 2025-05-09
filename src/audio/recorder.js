// recorder.js
const fs = require("fs");
const path = require("path");
const mic = require("mic");

/**
 * Records audio for a specified duration
 * @param {string} fileName - The name of the target file
 * @param {number} duration - The recording duration in milliseconds
 * @returns {Promise<string>} - The full path to the saved audio file
 */
function recordAudio(fileName, duration = 25000) {
	return new Promise((resolve, reject) => {
		try {
			    // Create the output path
			const outputDir = path.join(__dirname, "audio");
			const outputFile = path.join(outputDir, fileName);

			    // Ensure the output directory exists
			if (!fs.existsSync(outputDir)) {
				fs.mkdirSync(outputDir, { recursive: true });
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

/** Legacy function for backward compatibility */
function record(duration, outputFile, callback) {
	recordAudio(path.basename(outputFile), duration)
		.then((file) => callback())
		.catch((err) => console.error("Fehler bei der Aufnahme:", err));
}

module.exports = {
	recordAudio,
	record,
};
