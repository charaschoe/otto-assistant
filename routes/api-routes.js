// API-Routen für die Transkription mit Supabase-Integration
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { authMiddleware } from "../src/auth/auth-service.js";
import {
	saveTranscript,
	getTranscripts,
	getTranscript,
} from "../src/database/db-service.js";
import {
	transcribeWithWhisper,
	exportToNotion,
	exportToObsidian,
	generateWithGemini,
} from "../src/services/api-service.js";

const router = express.Router();

// Erhalte Verzeichnispfad für diese Datei
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Konfiguriere multer für den Datei-Upload
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const dir = path.join(__dirname, "../uploads");
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
		cb(null, dir);
	},
	filename: (req, file, cb) => {
		cb(null, `recording-${Date.now()}.wav`);
	},
});

const upload = multer({ storage });

// Transkriptions-Endpunkt
router.post(
	"/transcribe",
	authMiddleware,
	upload.single("audio"),
	async (req, res) => {
		try {
			if (!req.file) {
				return res
					.status(400)
					.json({ error: "Keine Audiodatei hochgeladen" });
			}

			// Audiodatei-Pfad
			const audioFilePath = req.file.path;

			// Output-Optionen extrahieren
			const outputOptions = req.body.outputOptions
				? req.body.outputOptions.split(",")
				: [];

			// User-ID aus dem authentifizierten Request
			const userId = req.user.id;

			// Titel für die Transkription
			const title =
				req.body.title ||
				`Transkript ${new Date().toLocaleDateString()}`;

			try {
				// Audiodatei in Buffer einlesen
				const audioBuffer = fs.readFileSync(audioFilePath);

				// Transkription mit Whisper API
				const transcript = await transcribeWithWhisper(
					audioBuffer,
					userId
				);

				// Transkript in der Datenbank speichern
				const transcriptId = await saveTranscript(
					userId,
					transcript,
					title
				);

				// Ergebnisobjekt
				const results = {
					transcript,
					transcriptId,
					exportResults: {},
				};

				// Verarbeite alle ausgewählten Export-Optionen
				const exportPromises = [];

				// Notion Export
				if (outputOptions.includes("1")) {
					exportPromises.push(
						exportToNotion(title, transcript, userId)
							.then((pageId) => {
								results.exportResults.notion = {
									status: "success",
									pageId,
								};
							})
							.catch((error) => {
								console.error("Notion Export Error:", error);
								results.exportResults.notion = {
									status: "error",
									message: error.message,
								};
							})
					);
				}

				// Obsidian Export
				if (outputOptions.includes("2")) {
					exportPromises.push(
						exportToObsidian(title, transcript, userId)
							.then(() => {
								results.exportResults.obsidian = {
									status: "success",
								};
							})
							.catch((error) => {
								console.error("Obsidian Export Error:", error);
								results.exportResults.obsidian = {
									status: "error",
									message: error.message,
								};
							})
					);
				}

				// Zusammenfassung mit Gemini
				if (outputOptions.includes("summary")) {
					exportPromises.push(
						generateWithGemini(
							`Fasse den folgenden Text kurz zusammen:\n\n${transcript}`,
							userId
						)
							.then((summary) => {
								results.summary = summary;
							})
							.catch((error) => {
								console.error("Gemini Summary Error:", error);
								results.summaryError = error.message;
							})
					);
				}

				// Warte auf alle Export-Prozesse
				await Promise.allSettled(exportPromises);

				// Entferne temporäre Audiodatei
				fs.unlinkSync(audioFilePath);

				// Sende das Ergebnis
				res.json(results);
			} catch (error) {
				// Entferne temporäre Audiodatei im Fehlerfall
				if (fs.existsSync(audioFilePath)) {
					fs.unlinkSync(audioFilePath);
				}

				console.error("Transkriptions-Fehler:", error);
				res.status(500).json({
					error: error.message || "Fehler bei der Transkription",
				});
			}
		} catch (error) {
			console.error("Server-Fehler:", error);
			res.status(500).json({ error: "Serverfehler" });
		}
	}
);

// Endpunkt zum Abrufen aller Transkriptionen eines Benutzers
router.get("/transcripts", authMiddleware, async (req, res) => {
	try {
		const transcripts = await getTranscripts(req.user.id);
		res.json({ transcripts });
	} catch (error) {
		console.error("Transkriptions-Abruf-Fehler:", error);
		res.status(500).json({
			error: "Fehler beim Abrufen der Transkriptionen",
		});
	}
});

// Endpunkt zum Abrufen einer bestimmten Transkription
router.get("/transcripts/:id", authMiddleware, async (req, res) => {
	try {
		const transcript = await getTranscript(req.params.id, req.user.id);

		if (!transcript) {
			return res
				.status(404)
				.json({ error: "Transkription nicht gefunden" });
		}

		res.json({ transcript });
	} catch (error) {
		console.error("Transkriptions-Detail-Fehler:", error);
		res.status(500).json({
			error: "Fehler beim Abrufen der Transkription",
		});
	}
});

export default router;
