const { Client } = require("@notionhq/client");

/**
 * Exportiert eine Transkription zu Notion
 *
 * @param {string} text Der zu exportierende Transkriptionstext
 * @param {string} databaseId ID der Notion-Datenbank
 * @param {object} options Zusätzliche Optionen
 * @returns {Promise<object>} Erstellter Notion-Eintrag
 */
async function exportToNotion(text, databaseId, options = {}) {
	return new Promise(async (resolve, reject) => {
		try {
			// Prüfe, ob notwendige Parameter vorhanden sind
			if (!process.env.NOTION_API_KEY) {
				throw new Error(
					"NOTION_API_KEY fehlt in den Umgebungsvariablen"
				);
			}

			if (!databaseId) {
				throw new Error("Keine Notion-Datenbank-ID angegeben");
			}

			// Initialisiere Notion-Client
			const notion = new Client({
				auth: process.env.NOTION_API_KEY,
			});

			// Erstelle Titel für den Eintrag
			const now = new Date();
			const title =
				options.title ||
				`Transkription vom ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;

			// Erstelle einen neuen Eintrag in der Datenbank
			const response = await notion.pages.create({
				parent: {
					database_id: databaseId,
				},
				properties: {
					// Titel-Eigenschaft (angepasst an die typische Notion-Datenbank-Struktur)
					Name: {
						title: [
							{
								text: {
									content: title,
								},
							},
						],
					},
					// Datum-Eigenschaft
					Datum: {
						date: {
							start: now.toISOString(),
						},
					},
					// Weitere Eigenschaften können hier ergänzt werden
				},
				// Hauptinhalt der Seite
				children: [
					{
						object: "block",
						type: "heading_2",
						heading_2: {
							rich_text: [
								{
									type: "text",
									text: {
										content: "Transkription",
									},
								},
							],
						},
					},
					{
						object: "block",
						type: "paragraph",
						paragraph: {
							rich_text: [
								{
									type: "text",
									text: {
										content:
											"Quelle: Otto Transkriptions-Assistent",
									},
								},
							],
						},
					},
					{
						object: "block",
						type: "paragraph",
						paragraph: {
							rich_text: [],
						},
					},
					{
						object: "block",
						type: "paragraph",
						paragraph: {
							rich_text: [
								{
									type: "text",
									text: {
										content: text,
									},
								},
							],
						},
					},
				],
			});

			console.log("Transkription erfolgreich zu Notion exportiert");
			resolve(response);
		} catch (error) {
			console.error("Fehler beim Export zu Notion:", error);
			reject(error);
		}
	});
}

module.exports = { exportToNotion };
