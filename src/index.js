// index.js
const fs = require("fs");
let config;
try {
  const configPath = path.resolve(__dirname, "../config.json");
  config = JSON.parse(fs.readFileSync(configPath, "utf8"));
} catch (error) {
  console.warn("⚠️ config.json not found or invalid. Using default values.");
  config = {
    GEMINI_API_KEY: "default-key",
    NOTION_API_KEY: "default-key",
    NOTION_DATABASE_ID: "default-id",
  };
}
const { recordAudio } = require("./audio/recorder");
const {
	saveTranscriptToObsidian,
	saveSummaryToObsidian,
} = require("./integrations/obsidian-writer");
const { summarize, detectTemplateType } = require("./utils/gemini");
const { exportToNotion } = require("./integrations/notion-export");
const { spawn } = require("child_process");
const path = require("path");
const { generateTitle } = require("./utils/title-generator");

const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter 'start' to begin recording: ", async (answer) => {
  if (answer.trim().toLowerCase() === "start") {
    console.log("🎙️ Starting recording (25 seconds)...");
    const file = await recordAudio("test.wav", 25000);
    console.log("✅ Recording saved:", file);

	const transcript = await transcribeAudio(file);

	if (transcript.trim()) {
		// Erkenne den Vorlagentyp basierend auf dem Transkript
		const templateType = detectTemplateType(transcript.trim());
		console.log(`🔍 Erkannter Inhalt-Typ: ${templateType}`);

		// Erstelle dynamischen Titel
		const title = generateTitle(transcript.trim(), "Otto");
		console.log(`📝 Generierter Titel: ${title}`);

		// Erstelle Zusammenfassung mit passendem Template
		console.log(
			`🤖 Erstelle Zusammenfassung mit ${templateType}-Vorlage...`
		);
		const summary = await summarize(transcript.trim(), templateType);

		// Speichere Transkript in Obsidian
		console.log(`📔 Speichere in Obsidian...`);
		const savedTitle = saveTranscriptToObsidian(
			transcript.trim(),
			summary,
			title
		);

		// Speichere separate Zusammenfassung in Obsidian (optional)
		// saveSummaryToObsidian(summary, savedTitle);

		// Exportiere zu Notion mit Kontext-Informationen
		console.log(`📘 Exportiere zu Notion...`);
		await exportToNotion(summary, title, {
			templateType: templateType,
			tags: [templateType, "Otto-Assistant"],
			status: "Neu",
			priority: templateType === "meeting" ? "Hoch" : "Medium",
		});

		console.log("✨ Verarbeitung abgeschlossen!");
	} else {
		console.log("⚠️ No transcript found.");
	}
    rl.close();
  } else {
    console.log("Invalid input. Please enter 'start'.");
    rl.close();
  }
});

function transcribeAudio(audioFile) {
	console.log("🧠 Starte Transkription...");
	return new Promise((resolve, reject) => {
		const whisperScript = path.join(
			__dirname,
			"transcription",
			"whisper-transcribe.py"
		);
		const python = spawn("python3", [whisperScript, audioFile]);

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
			resolve(transcript);
		});
	});
}
