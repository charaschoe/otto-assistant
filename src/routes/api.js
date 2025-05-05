// API-Route für die Transkription
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { transcribe } = require("../services/transcription-service");
const { exportToObsidian } = require("../integrations/obsidian-export");
const { exportToNotion } = require("../integrations/notion-export");

// Multer-Konfiguration für Datei-Uploads
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const uploadDir = path.resolve(__dirname, "../../uploads");
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true });
		}
		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		const timestamp = Date.now();
		const ext = path.extname(file.originalname);
		cb(null, `audio_${timestamp}${ext}`);
	},
});

const upload = multer({
	storage: storage,
	limits: { fileSize: 100 * 1024 * 1024 }, // 100MB Limit
	fileFilter: (req, file, cb) => {
		const allowedMimes = [
			"audio/mpeg",
			"audio/mp3",
			"audio/wav",
			"audio/x-m4a",
			"audio/m4a",
			"audio/mp4",
		];
		if (allowedMimes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(
				new Error(
					`Nicht unterstütztes Audioformat. Erlaubte Formate: ${allowedMimes.join(
						", "
					)}`
				)
			);
		}
	},
});

/**
 * POST /api/transcribe
 * Transkribiert eine hochgeladene Audiodatei
 */
router.post("/transcribe", upload.single("audio"), async (req, res) => {
	if (!req.file) {
		return res.status(400).json({ error: "Keine Audiodatei hochgeladen" });
	}

	try {
		// Extrahiere Optionen aus der Anfrage
		let options = {};
		if (req.body.options) {
			try {
				options = JSON.parse(req.body.options);
			} catch (e) {
				console.error("Fehler beim Parsen der Optionen:", e);
			}
		}

		const audioPath = req.file.path;
		const outputDir = path.resolve(__dirname, "../../output");

		// Stelle sicher, dass das Ausgabeverzeichnis existiert
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true });
		}

		// Transkribiere die Audiodatei
		console.log(`Starte Transkription für ${audioPath}`);
		const transcription = await transcribe(audioPath, { outputDir });
		console.log("Transkription abgeschlossen");

		// Exportoptionen verarbeiten
		const exports = [];
		const exportResults = {};

		// Textdatei exportieren
		if (options.txt) {
			const filename = `${path.basename(
				audioPath,
				path.extname(audioPath)
			)}_transcript.txt`;
			const outputPath = path.join(outputDir, filename);
			fs.writeFileSync(outputPath, transcription, "utf8");
			exports.push(outputPath);
			exportResults.text = "success";
			console.log(`Transkription als Text exportiert: ${outputPath}`);
		}

		// Markdown exportieren
		if (options.markdown) {
			const filename = `${path.basename(
				audioPath,
				path.extname(audioPath)
			)}_transcript.md`;
			const outputPath = path.join(outputDir, filename);
			const markdown = `# Transkription ${new Date().toLocaleDateString()}\n\n${transcription}`;
			fs.writeFileSync(outputPath, markdown, "utf8");
			exports.push(outputPath);
			exportResults.markdown = "success";
			console.log(`Transkription als Markdown exportiert: ${outputPath}`);
		}

		// PDF exportieren
		if (options.pdf) {
			try {
				const filename = `${path.basename(
					audioPath,
					path.extname(audioPath)
				)}_transcript.pdf`;
				const outputPath = path.join(outputDir, filename);

				// PDF-Generierung mit PDFKit
				const PDFDocument = require("pdfkit");
				const doc = new PDFDocument({ margin: 50, size: "A4" });
				const stream = fs.createWriteStream(outputPath);

				doc.pipe(stream);

				// PDF-Metadaten
				doc.info.Title = "Transkription";
				doc.info.Author = "Otto Assistant";

				// Titel
				doc.fontSize(24).font("Helvetica-Bold").text("Transkription", {
					align: "center",
				});

				// Datum
				doc.moveDown()
					.fontSize(12)
					.font("Helvetica-Oblique")
					.text(`Erstellt am ${new Date().toLocaleDateString()}`, {
						align: "center",
					});

				// Inhalt
				doc.moveDown()
					.font("Helvetica")
					.fontSize(12)
					.text(transcription, {
						align: "justify",
						lineGap: 5,
					});

				doc.end();

				await new Promise((resolve, reject) => {
					stream.on("finish", resolve);
					stream.on("error", reject);
				});

				exports.push(outputPath);
				exportResults.pdf = "success";
				console.log(`Transkription als PDF exportiert: ${outputPath}`);
			} catch (error) {
				console.error("Fehler beim PDF-Export:", error);
				exportResults.pdf = "error";
			}
		}

		// Obsidian exportieren
		if (options.obsidian) {
			try {
				const vaultPath = options.obsidian; // Pfad zum Obsidian-Vault
				await exportToObsidian(transcription, vaultPath);
				exportResults.obsidian = "success";
				console.log(`Transkription zu Obsidian exportiert`);
			} catch (error) {
				console.error("Fehler beim Obsidian-Export:", error);
				exportResults.obsidian = error.message.includes("credentials")
					? "no_credentials"
					: "error";
			}
		}

		// Notion exportieren
		if (options.notion) {
			try {
				// Verwende die vorhandene Notion-Integration
				const title = `Transkription vom ${new Date().toLocaleDateString()}`;
				await exportToNotion(title, transcription);
				exportResults.notion = "success";
				console.log(`Transkription zu Notion exportiert`);
			} catch (error) {
				console.error("Fehler beim Notion-Export:", error);
				exportResults.notion = error.message.includes("credentials")
					? "no_credentials"
					: "error";
			}
		}

		// Untertitel exportieren
		if (options.subtitles) {
			try {
				const srtFilename = `${path.basename(
					audioPath,
					path.extname(audioPath)
				)}_subtitles.srt`;
				const vttFilename = `${path.basename(
					audioPath,
					path.extname(audioPath)
				)}_subtitles.vtt`;

				const srtPath = path.join(outputDir, srtFilename);
				const vttPath = path.join(outputDir, vttFilename);

				// Einfache Implementierung für Untertitel
				const generateSubtitles = (text, options) => {
					return new Promise((resolve) => {
						const { srtPath, vttPath } = options;

						// Text in Teile aufteilen (nach Punkten)
						let sentences = text.split(/(?<=[.!?])\s+/);

						// SRT-Format generieren
						let srtContent = "";
						let vttContent = "WEBVTT\n\n";

						sentences.forEach((segment, index) => {
							const segmentIndex = index + 1;
							const startTime = index * 3000; // 3 Sekunden pro Untertitel
							const endTime = startTime + 3000;

							// Formatierte Zeitangaben
							const formatSRTTime = (ms) => {
								const totalSeconds = Math.floor(ms / 1000);
								const hours = Math.floor(totalSeconds / 3600)
									.toString()
									.padStart(2, "0");
								const minutes = Math.floor(
									(totalSeconds % 3600) / 60
								)
									.toString()
									.padStart(2, "0");
								const seconds = (totalSeconds % 60)
									.toString()
									.padStart(2, "0");
								const milliseconds = (ms % 1000)
									.toString()
									.padStart(3, "0");
								return `${hours}:${minutes}:${seconds},${milliseconds}`;
							};

							const formatVTTTime = (ms) => {
								const totalSeconds = Math.floor(ms / 1000);
								const hours = Math.floor(totalSeconds / 3600)
									.toString()
									.padStart(2, "0");
								const minutes = Math.floor(
									(totalSeconds % 3600) / 60
								)
									.toString()
									.padStart(2, "0");
								const seconds = (totalSeconds % 60)
									.toString()
									.padStart(2, "0");
								const milliseconds = (ms % 1000)
									.toString()
									.padStart(3, "0");
								return `${hours}:${minutes}:${seconds}.${milliseconds}`;
							};

							const startTimeFormatted = formatSRTTime(startTime);
							const endTimeFormatted = formatSRTTime(endTime);
							const startTimeFormattedVTT =
								formatVTTTime(startTime);
							const endTimeFormattedVTT = formatVTTTime(endTime);

							// SRT-Format
							srtContent += `${segmentIndex}\n`;
							srtContent += `${startTimeFormatted} --> ${endTimeFormatted}\n`;
							srtContent += `${segment}\n\n`;

							// VTT-Format
							vttContent += `${segmentIndex}\n`;
							vttContent += `${startTimeFormattedVTT} --> ${endTimeFormattedVTT}\n`;
							vttContent += `${segment}\n\n`;
						});

						// Dateien speichern
						if (srtPath) {
							fs.writeFileSync(srtPath, srtContent, "utf8");
						}

						if (vttPath) {
							fs.writeFileSync(vttPath, vttContent, "utf8");
						}

						resolve({ srt: srtPath, vtt: vttPath });
					});
				};

				await generateSubtitles(transcription, { srtPath, vttPath });
				exports.push(srtPath, vttPath);
				exportResults.subtitles = "success";
				console.log(`Untertitel exportiert: ${srtPath}, ${vttPath}`);
			} catch (error) {
				console.error("Fehler beim Untertitel-Export:", error);
				exportResults.subtitles = "error";
			}
		}

		// Antwort senden
		res.json({
			success: true,
			transcription,
			exports,
			exportResults,
		});

		// Audiodatei nach erfolgreicher Transkription löschen, wenn keine Fehler aufgetreten sind
		try {
			fs.unlinkSync(audioPath);
			console.log(`Temporäre Audiodatei gelöscht: ${audioPath}`);
		} catch (error) {
			console.error(
				`Fehler beim Löschen der temporären Audiodatei: ${error.message}`
			);
		}
	} catch (error) {
		console.error("Transkriptionsfehler:", error);
		res.status(500).json({
			error: `Fehler bei der Transkription: ${error.message}`,
			success: false,
		});
	}
});

/**
 * GET /api/system-status
 * Gibt den Status des Transkriptionssystems zurück
 */
router.get("/system-status", async (req, res) => {
	try {
		console.log("Systemstatus wird abgerufen...");

		// Prüfe, ob Whisper installiert ist
		let whisperVersion = null;
		try {
			const { execSync } = require("child_process");
			whisperVersion = execSync(
				'python -c "import whisper; print(whisper.__version__)"'
			)
				.toString()
				.trim();
			console.log("Whisper-Version gefunden:", whisperVersion);
		} catch (e) {
			console.warn(
				"Whisper nicht gefunden oder Fehler beim Prüfen:",
				e.message
			);
		}

		// Unterstützte Exportformate
		const supportedExports = [
			"Textdatei (.txt)",
			"Markdown (.md)",
			"PDF-Dokument (.pdf)",
			"Obsidian",
			"Notion",
			"Untertitel (.srt/.vtt)",
		];

		console.log(
			"Sende Systemstatus mit unterstützten Exporten:",
			supportedExports
		);

		res.json({
			success: true,
			whisper: whisperVersion,
			supportedExports,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Fehler beim Abrufen des Systemstatus:", error);
		res.status(500).json({
			success: false,
			error: `Fehler beim Abrufen des Systemstatus: ${error.message}`,
		});
	}
});

/**
 * POST /api/summarize
 * Erstellt eine KI-Zusammenfassung mit Google Gemini
 */
router.post("/summarize", async (req, res) => {
	try {
		const { text } = req.body;

		if (!text) {
			return res.status(400).json({
				error: "Kein Text zur Zusammenfassung übermittelt",
				success: false,
			});
		}

		// Importiere Gemini-Service
		const { summarizeText } = require("../services/gemini-service");

		// Erstelle Zusammenfassung
		const summary = await summarizeText(text);

		res.json({
			success: true,
			summary,
		});
	} catch (error) {
		console.error("Fehler bei der Zusammenfassung:", error);
		res.status(500).json({
			error: `Fehler bei der Zusammenfassung: ${error.message}`,
			success: false,
		});
	}
});

module.exports = router;
