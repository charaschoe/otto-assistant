// index.js
const { recordAudio } = require("./src/audio/recorder");
const {
	saveTranscriptToObsidian,
} = require("./src/integrations/obsidian-writer");
const { summarizeTranscript } = require("./src/utils/gemini");
const { exportToNotion } = require("./src/integrations/notion-export");
const { spawn } = require("child_process");
const readline = require("readline");
const {
	exportToMarkdown,
	exportToPDF,
	exportToCSV,
} = require("./src/utils/exporters");
const {
	authenticateGoogle,
	uploadToGoogleDrive,
} = require("./src/integrations/google-drive");
const path = require("path");

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

console.log("📤 Select output options:");
console.log("1. Notion");
console.log("2. Obsidian");
console.log("3. Miro ❌ (not implemented)");
console.log("4. Slack ❌ (not implemented)");
console.log("5. Email ❌ (not implemented)");
console.log("6. Google Docs ❌ (not implemented)");
console.log("7. CSV Export ❌ (not implemented)");
console.log("8. PDF Export ❌ (not implemented)");
console.log("9. Microsoft Teams ❌ (not implemented)");
console.log("10. Trello ❌ (not implemented)");
console.log("11. Asana ❌ (not implemented)");
console.log("12. Google Drive ❌ (not implemented)");
console.log("13. Dropbox ❌ (not implemented)");
console.log("14. WhatsApp ❌ (not implemented)");
console.log("15. Telegram ❌ (not implemented)");
console.log("16. Sentiment Analysis ❌ (not implemented)");
console.log("17. Keyword Extraction ❌ (not implemented)");
console.log("18. Action Item Detection ❌ (not implemented)");
console.log("19. Zapier ❌ (not implemented)");
console.log("20. Custom Webhook ❌ (not implemented)");
console.log("21. Markdown ❌ (not implemented)");
console.log("22. HTML ❌ (not implemented)");
console.log("23. Translation ❌ (not implemented)");
console.log("24. Multilingual Support ❌ (not implemented)");

rl.question(
	"Enter the numbers of the options you want to use (e.g., 1,2): ",
	(answer) => {
		const selectedOptions = answer.split(",").map((opt) => opt.trim());

		rl.question(
			"Do you want a transcript? (yes/no): ",
			(transcriptAnswer) => {
				const wantsTranscript =
					transcriptAnswer.toLowerCase() === "yes";

				rl.close();

				(async () => {
					console.log("🎙️ Starte Aufnahme (10 Sekunden)...");
					const file = await recordAudio("test.wav", 10000);
					console.log("✅ Aufnahme gespeichert:", file);

					if (wantsTranscript) {
						console.log("🧠 Starte Transkription...");
						const python = spawn("python3", [
							"./src/transcription/whisper-transcribe.py",
							file,
						]);

						let transcript = "";
						let capture = false;

						const startTime = Date.now();

						python.stdout.on("data", (data) => {
							const lines = data.toString().split("\n");
							for (const line of lines) {
								if (line.includes("📝 TRANSKRIPT_START"))
									capture = true;
								else if (line.includes("📝 TRANSKRIPT_END"))
									capture = false;
								else if (capture) transcript += line + "\n";
							}
						});

						python.stderr.on("data", (data) => {
							console.error("Fehler:", data.toString());
						});

						python.on("close", (code) => {
							const endTime = Date.now();
							const duration = (
								(endTime - startTime) /
								1000
							).toFixed(2);
							console.log(
								`⏱️ Transcription completed in ${duration} seconds.`
							);

							if (transcript.trim()) {
								if (selectedOptions.includes("1")) {
									console.log("✅ Exporting to Notion...");
									exportToNotion(
										"Otto-Transkript",
										transcript.trim()
									);
								}

								if (selectedOptions.includes("2")) {
									console.log("✅ Exporting to Obsidian...");
									saveTranscriptToObsidian(
										transcript.trim(),
										"Otto-Transkript"
									);
								}

								if (selectedOptions.includes("21")) {
									exportToMarkdown(
										transcript.trim(),
										"Otto-Transkript"
									);
								}

								if (selectedOptions.includes("8")) {
									exportToPDF(
										transcript.trim(),
										"Otto-Transkript"
									);
								}

								if (selectedOptions.includes("7")) {
									const structuredData = [
										["Section", "Content"],
										["Summary", "This is a summary"],
										["Tasks", "Task 1, Task 2"],
									];
									exportToCSV(
										structuredData,
										"Otto-Transkript"
									);
								}

								if (selectedOptions.includes("12")) {
									(async () => {
										const auth = await authenticateGoogle();
										const filePath = path.join(
											__dirname,
											"./exports/Otto-Transkript.md"
										); // Example file
										const fileName = "Otto-Transkript.md";
										try {
											await uploadToGoogleDrive(
												auth,
												filePath,
												fileName
											);
											console.log("✅ File uploaded to Google Drive successfully.");
										} catch (error) {
											console.error("❌ Error uploading file to Google Drive:", error.message);
										}
									})();
								}
							} else {
								console.log("⚠️ Kein Transkript gefunden.");
							}
						});
					} else {
						if (selectedOptions.includes("1")) {
							console.log(
								"✅ Exporting to Notion without transcription..."
							);
							exportToNotion(
								"Otto-Transkript",
								"No transcription requested."
							);
						}

						if (selectedOptions.includes("2")) {
							console.log(
								"✅ Exporting to Obsidian without transcription..."
							);
							saveTranscriptToObsidian(
								"No transcription requested.",
								"Otto-Transkript"
							);
						}
					}
				})();
			}
		);
	}
);
