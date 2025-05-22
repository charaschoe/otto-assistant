// index.js
const fs = require("fs");
const path = require("path"); // Path-Modul hinzugefügt
let config;
try {
	const configPath = path.resolve(__dirname, "../config.json");
	if (fs.existsSync(configPath)) {
		config = JSON.parse(fs.readFileSync(configPath, "utf8"));
	} else {
		throw new Error("config.json not found");
	}
} catch (error) {
	console.warn("⚠️ config.json not found or invalid. Using default values.");
	config = {
		GEMINI_API_KEY: "default-key",
		KITEGG_API_KEY: "default-key", // Kitegg-Schlüssel hinzugefügt
		NOTION_API_KEY: "default-key",
		NOTION_DATABASE_ID: "default-id",
	};
}
const { recordAudio, getAvailableRecordings } = require("./audio/recorder");
const {
	saveTranscriptToObsidian,
	saveSummaryToObsidian,
} = require("./integrations/obsidian-writer");
const { summarize, detectTemplateType } = require("./utils/kitegg-service");
const { exportToNotion } = require("./integrations/notion-export");
const { exportToMiro } = require("./integrations/miro-export");
const { spawn } = require("child_process");
const { generateTitle } = require("./utils/title-generator");

const readline = require("readline");

// Test-Audiodateipfad - diese Datei wird für Tests verwendet
const TEST_AUDIO_FILE = path.resolve(__dirname, "recordings", "test.wav");

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

rl.question(
	"Enter 'start' to begin recording or 'test' to use test audio: ",
	async (answer) => {
		let audioFile;

		if (answer.trim().toLowerCase() === "test") {
			// Verbesserte Testmodus-Logik: Anzeige und Auswahl verfügbarer Aufnahmen
			const availableRecordings = getAvailableRecordings();

			if (availableRecordings.length === 0) {
				console.error("❌ Keine Testaufnahmen gefunden!");
				console.log(
					"Bitte nimm zuerst eine Testaufnahme auf mit 'start'"
				);
				rl.close();
				return;
			}

			console.log("\n📂 Verfügbare Testaufnahmen:");
			console.log("0. Neueste Aufnahme (test.wav)");

			// Anzeige der verfügbaren Aufnahmen mit Datum und Uhrzeit
			availableRecordings.forEach((recording, index) => {
				// Extrahiere Datum und Uhrzeit aus dem Dateinamen
				const nameParts = path
					.basename(recording.name, ".wav")
					.split("-");
				if (nameParts.length >= 7) {
					const date = `${nameParts[1]}-${nameParts[2]}-${nameParts[3]}`;
					const time = `${nameParts[4]}:${nameParts[5]}:${nameParts[6]}`;
					console.log(`${index + 1}. ${date} ${time}`);
				} else {
					console.log(
						`${index + 1}. ${path.basename(recording.name)}`
					);
				}
			});

			// Erzeugen einer neuen Readline-Instanz für die Unterauswahl
			const testRl = readline.createInterface({
				input: process.stdin,
				output: process.stdout,
			});

			try {
				const selection = await new Promise((resolve) => {
					testRl.question(
						"\nWähle eine Aufnahme (0-" +
							availableRecordings.length +
							"): ",
						(answer) => {
							testRl.close();
							resolve(answer.trim());
						}
					);
				});

				const selectionNum = parseInt(selection);
				if (
					isNaN(selectionNum) ||
					selectionNum < 0 ||
					selectionNum > availableRecordings.length
				) {
					console.log(
						"⚠️ Ungültige Auswahl, verwende die neueste Aufnahme."
					);
					audioFile = TEST_AUDIO_FILE;
				} else if (selectionNum === 0) {
					console.log("🎵 Verwende die neueste Aufnahme (test.wav)");
					audioFile = TEST_AUDIO_FILE;
				} else {
					audioFile = availableRecordings[selectionNum - 1].path;
					console.log(
						`🎵 Verwende Aufnahme: ${path.basename(audioFile)}`
					);
				}
			} catch (error) {
				console.error("Fehler bei der Auswahl:", error);
				console.log("⚠️ Verwende die neueste Aufnahme (test.wav)");
				audioFile = TEST_AUDIO_FILE;
			}
		} else if (answer.trim().toLowerCase() === "start") {
			// Normale Aufnahme
			console.log("🎙️ Starting recording (25 seconds)...");
			audioFile = await recordAudio("test.wav", 25000);
			console.log("✅ Recording saved:", audioFile);
		} else {
			console.log(
				"⚠️ Ungültige Eingabe. Bitte 'start' oder 'test' eingeben."
			);
			rl.close();
			return;
		}

		const transcript = await transcribeAudio(audioFile);

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

			// Exportiere zu Miro (automatisch, wie Notion/Obsidian)
			if (config.MIRO_API_KEY) {
				console.log("🟦 Exportiere als Miro-Board...");
				const miroUrl = await exportToMiro(transcript.trim(), summary, {
					apiKey: config.MIRO_API_KEY,
					teamId: config.MIRO_TEAM_ID, // optional, falls vorhanden
				});
				if (miroUrl) {
					console.log(`✅ Miro-Board erstellt: ${miroUrl}`);
				} else {
					console.log("⚠️ Miro-Export fehlgeschlagen.");
				}
			}

			console.log("✨ Verarbeitung abgeschlossen!");
		} else {
			console.log("⚠️ No transcript found.");
		}
		rl.close();
	}
);

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
