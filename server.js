import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import cors from "cors";
import {
	checkWhisperInstallation,
	transcribeAudio,
} from "./services/local-whisper.js";

// __dirname-Äquivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Uploads-Verzeichnis erstellen, falls nicht vorhanden
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer für Datei-Uploads konfigurieren
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadsDir);
	},
	filename: (req, file, cb) => {
		// Originalnamen behalten, aber Timestamp hinzufügen
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		cb(
			null,
			path.basename(file.originalname, ext) + "-" + uniqueSuffix + ext
		);
	},
});

const upload = multer({
	storage: storage,
	limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB Limit
});

// API-Endpunkte
app.get("/api/status", async (req, res) => {
	try {
		const whisperInstalled = await checkWhisperInstallation();

		res.json({
			status: "online",
			whisperInstalled,
			version: "1.0.0",
			maxFileSize: "100 MB",
		});
	} catch (error) {
		console.error("Statusprüfung fehlgeschlagen:", error);
		res.status(500).json({ error: "Statusprüfung fehlgeschlagen" });
	}
});

app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
	if (!req.file) {
		return res.status(400).json({ error: "Keine Audiodatei hochgeladen" });
	}

	try {
		const startTime = Date.now();

		const options = {
			model: req.body.model || "base",
			language: req.body.language || "de",
			outputFormat: req.body.format || "txt",
			timestamps: req.body.timestamps === "true",
		};

		console.log(`Transkribiere Datei: ${req.file.path}`);
		console.log(`Optionen: ${JSON.stringify(options)}`);

		const transcription = await transcribeAudio(req.file.path, options);
		const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);

		res.json({
			success: true,
			filename: req.file.originalname,
			filesize: (req.file.size / 1024 / 1024).toFixed(2) + " MB",
			processingTime: processingTime + " Sekunden",
			transcription: transcription,
		});

		// Optional: Audiodatei nach Verarbeitung löschen
		// fs.unlinkSync(req.file.path);
	} catch (error) {
		console.error("Transkriptionsfehler:", error);
		res.status(500).json({
			error: "Transkriptionsfehler",
			message: error.message,
		});
	}
});

// Server starten
app.listen(port, () => {
	console.log(`Server läuft auf Port ${port}`);
});
