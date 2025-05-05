// Database-Handler für sichere Datenspeicherung
const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");
const path = require("path");
const crypto = require("crypto");

// Encryption-Key (sollte in Umgebungsvariablen gesetzt werden)
const ENCRYPTION_KEY =
	process.env.ENCRYPTION_KEY || "defaultDevKey_ChangeThisInProduction!";

// Verschlüsselungsfunktionen
function encrypt(text) {
	const iv = crypto.randomBytes(16);
	const cipher = crypto.createCipheriv(
		"aes-256-cbc",
		Buffer.from(ENCRYPTION_KEY),
		iv
	);
	let encrypted = cipher.update(text);
	encrypted = Buffer.concat([encrypted, cipher.final()]);
	return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(text) {
	const textParts = text.split(":");
	const iv = Buffer.from(textParts[0], "hex");
	const encryptedText = Buffer.from(textParts[1], "hex");
	const decipher = crypto.createDecipheriv(
		"aes-256-cbc",
		Buffer.from(ENCRYPTION_KEY),
		iv
	);
	let decrypted = decipher.update(encryptedText);
	decrypted = Buffer.concat([decrypted, decipher.final()]);
	return decrypted.toString();
}

// Datenbankverbindung
async function getDb() {
	return open({
		filename: path.join(__dirname, "database.sqlite"),
		driver: sqlite3.Database,
	});
}

// Initialisierung der Datenbank
async function initDb() {
	const db = await getDb();
	await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS credentials (
      user_id TEXT,
      service TEXT,
      data TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, service),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    
    CREATE TABLE IF NOT EXISTS transcripts (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      content TEXT,
      title TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

	console.log("Database initialized");
	await db.close();
}

// Benutzer-Verwaltung
async function getOrCreateUser(userId) {
	const db = await getDb();

	try {
		// Prüfen ob Benutzer existiert
		const user = await db.get("SELECT * FROM users WHERE id = ?", userId);

		if (!user) {
			// Neuen Benutzer erstellen
			await db.run("INSERT INTO users (id) VALUES (?)", userId);
		}

		return userId;
	} finally {
		await db.close();
	}
}

// Credential-Verwaltung
async function saveCredential(userId, service, data) {
	const db = await getDb();

	try {
		// Verschlüsselte Daten speichern
		const encryptedData = encrypt(data);
		await db.run(
			"INSERT OR REPLACE INTO credentials (user_id, service, data, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)",
			[userId, service, encryptedData]
		);

		return true;
	} catch (error) {
		console.error("Error saving credential:", error);
		return false;
	} finally {
		await db.close();
	}
}

async function getCredential(userId, service) {
	const db = await getDb();

	try {
		const credential = await db.get(
			"SELECT data FROM credentials WHERE user_id = ? AND service = ?",
			[userId, service]
		);

		if (credential && credential.data) {
			return decrypt(credential.data);
		}

		return null;
	} catch (error) {
		console.error("Error getting credential:", error);
		return null;
	} finally {
		await db.close();
	}
}

// Transkript-Verwaltung
async function saveTranscript(userId, content, title) {
	const db = await getDb();
	const id = crypto.randomUUID();

	try {
		await db.run(
			"INSERT INTO transcripts (id, user_id, content, title) VALUES (?, ?, ?, ?)",
			[id, userId, content, title]
		);

		return id;
	} catch (error) {
		console.error("Error saving transcript:", error);
		return null;
	} finally {
		await db.close();
	}
}

async function getTranscripts(userId) {
	const db = await getDb();

	try {
		return await db.all(
			"SELECT id, title, created_at FROM transcripts WHERE user_id = ? ORDER BY created_at DESC",
			userId
		);
	} catch (error) {
		console.error("Error getting transcripts:", error);
		return [];
	} finally {
		await db.close();
	}
}

async function getTranscript(id) {
	const db = await getDb();

	try {
		return await db.get("SELECT * FROM transcripts WHERE id = ?", id);
	} catch (error) {
		console.error("Error getting transcript:", error);
		return null;
	} finally {
		await db.close();
	}
}

module.exports = {
	initDb,
	getOrCreateUser,
	saveCredential,
	getCredential,
	saveTranscript,
	getTranscripts,
	getTranscript,
};
