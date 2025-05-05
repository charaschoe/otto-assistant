// obsidian-writer.js
const fs = require("fs");
const path = require("path");

// 👉 Passe diesen Pfad an deinen Vault an:
const VAULT_PATH = "/Users/admin/Desktop/OTTO_Alpha"; // ⬅️ ÄNDERN!

function saveTranscriptToObsidian(content, filename = "Otto-Notiz") {
	const date = new Date().toISOString().split("T")[0];
	const fullPath = path.join(VAULT_PATH, `${date} ${filename}.md`);

	const mdContent = `# ${filename} (${date})\n\n${content}\n`;

	fs.writeFileSync(fullPath, mdContent);
	console.log("✅ Notiz gespeichert in Obsidian-Vault:", fullPath);
}

module.exports = { saveTranscriptToObsidian };
