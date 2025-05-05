const { spawn } = require("child_process");
const path = require("path");

/**
 * Transkribiere eine Audio-Datei mit lokalem Whisper
 * @param {string} audioPath Pfad zur Audio-Datei
 * @param {object} options Optionen für die Transkription
 * @returns {Promise<string>} Transkriptionstext
 */
async function transcribeWithLocalWhisper(audioPath, options = {}) {
	return new Promise((resolve, reject) => {
		const scriptPath = path.resolve(
			__dirname,
			"../transcription/whisper-transcribe.py"
		);

		let args = [scriptPath, audioPath];
		if (options.outputDir) {
			args.push("--output", options.outputDir);
		}

		const whisperProcess = spawn("python", args);

		let transcript = "";
		let inTranscript = false;

		whisperProcess.stdout.on("data", (data) => {
			const lines = data.toString().split("\n");

			for (const line of lines) {
				if (line.includes("📝 TRANSKRIPT_START")) {
					inTranscript = true;
					continue;
				}

				if (line.includes("📝 TRANSKRIPT_END")) {
					inTranscript = false;
					continue;
				}

				if (inTranscript) {
					transcript += line + "\n";
				}

				// Log processing info
				if (!inTranscript && line.trim()) {
					console.log(`[Whisper] ${line}`);
				}
			}
		});

		whisperProcess.stderr.on("data", (data) => {
			console.error(`[Whisper Error] ${data}`);
		});

		whisperProcess.on("close", (code) => {
			if (code === 0) {
				resolve(transcript.trim());
			} else {
				reject(
					new Error(`Whisper transcription failed with code ${code}`)
				);
			}
		});
	});
}

module.exports = { transcribeWithLocalWhisper };
