// recorder.js
const fs = require("fs");
const mic = require("mic");
const path = require("path");

function recordAudio(filename = "recording.wav", duration = 10000) {
	return new Promise((resolve, reject) => {
		const filePath = path.join(__dirname, "audio", filename);
		const micInstance = mic({
			rate: "16000",
			channels: "1",
			debug: false,
			exitOnSilence: 6,
			fileType: "wav",
		});

		const micInputStream = micInstance.getAudioStream();
		const outputFileStream = fs.WriteStream(filePath);

		micInputStream.pipe(outputFileStream);

		micInputStream.on("error", (err) => reject(err));
		outputFileStream.on("finish", () => resolve(filePath));

		micInstance.start();

		setTimeout(() => {
			micInstance.stop();
		}, duration); // Aufnahmezeit in ms
	});
}

module.exports = { recordAudio };
