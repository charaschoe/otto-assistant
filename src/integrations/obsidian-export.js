const fs = require("fs");
const path = require("path");

/**
 * Exportiert eine Transkription nach Obsidian
 *
 * @param {string} text Der zu exportierende Transkriptionstext
 * @param {string} vaultPath Pfad zum Obsidian-Vault
 * @returns {Promise<string>} Pfad zur erstellten Markdown-Datei
 */
async function exportToObsidian(text, vaultPath) {
	return new Promise((resolve, reject) => {
		try {
			// Prüfe, ob Vault-Pfad angegeben wurde
			if (!vaultPath) {
				throw new Error("Kein Obsidian-Vault-Pfad angegeben");
			}

			// Prüfe, ob der Vault existiert
			if (!fs.existsSync(vaultPath)) {
				throw new Error(
					`Der angegebene Obsidian-Vault existiert nicht: ${vaultPath}`
				);
			}

			// Erstelle einen Transkriptions-Ordner im Vault, falls er nicht existiert
			const transcriptionsDir = path.join(vaultPath, "Transkriptionen");
			if (!fs.existsSync(transcriptionsDir)) {
				fs.mkdirSync(transcriptionsDir, { recursive: true });
			}

			// Generiere Dateinamen basierend auf dem aktuellen Datum und der Uhrzeit
			const now = new Date();
			const formattedDate = now.toISOString().split("T")[0];
			const formattedTime = now
				.toTimeString()
				.split(" ")[0]
				.replace(/:/g, "-");
			const filename = `Transkription ${formattedDate} ${formattedTime}.md`;

			// Vollständiger Pfad zur Markdown-Datei
			const filePath = path.join(transcriptionsDir, filename);

			// Formatiere den Inhalt als Markdown
			const markdown = `---
alias: [Transkription ${formattedDate}]
tags: [transkription]
erstellungsdatum: ${formattedDate}
---

# Transkription ${formattedDate} ${formattedTime}

## Metadata
- **Erstellungsdatum:** ${now.toLocaleString()}
- **Quelle:** Otto Transkriptions-Assistent

## Inhalt

${text}
`;

			// Speichere die Datei
			fs.writeFileSync(filePath, markdown, "utf8");
			console.log("📤 Notiz an Obsidian gesendet:", filePath);

			resolve(filePath);
		} catch (error) {
			reject(error);
		}
	});
}

module.exports = { exportToObsidian };
