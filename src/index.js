// index.js
const { recordAudio } = require("./audio/recorder");
const { saveTranscriptToObsidian } = require("./integrations/obsidian-writer");
const { summarizeTranscript } = require("./utils/gemini");
const { exportToNotion } = require("./integrations/notion-export");
const { spawn } = require("child_process");

(async () => {
	console.log("🎙️ Starte Aufnahme (10 Sekunden)...");
	const file = await recordAudio("test.wav", 10000);
	console.log("✅ Aufnahme gespeichert:", file);

	console.log("🧠 Starte Transkription...");
	const python = spawn("python3", ["whisper-transcribe.py", file]);

	let transcript = "";
	let capture = false;

	python.stdout.on("data", (data) => {
		const lines = data.toString().split("\n");
		for (const line of lines) {
			if (line.includes("📝 TRANSKRIPT_START")) capture = true;
			else if (line.includes("📝 TRANSKRIPT_END")) capture = false;
			else if (capture) transcript += line + "\n";
		}
	});

	python.stderr.on("data", (data) => {
		console.error("Fehler:", data.toString());
	});

	python.on("close", (code) => {
		if (transcript.trim()) {
			(async () => {
				saveTranscriptToObsidian(transcript.trim(), "Otto-Transkript");

				const summary = await summarizeTranscript(transcript.trim());
				saveTranscriptToObsidian(summary, "Otto-Zusammenfassung");
				await exportToNotion("Otto-Zusammenfassung", summary);
			})();
		} else {
			console.log("⚠️ Kein Transkript gefunden.");
		}
	});
})();
