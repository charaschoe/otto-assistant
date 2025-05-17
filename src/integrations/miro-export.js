// miro-export.js
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const {
	extractEntities,
	identifyRelatedTerms,
	identifyEntitiesWithEmojis,
} = require("../utils/entity-linker");

// Lade Miro-API-Konfiguration aus config.json
let config = {};
try {
	const configPath = path.resolve(__dirname, "../../config.json");
	config = JSON.parse(fs.readFileSync(configPath, "utf8"));
} catch (e) {
	console.warn("⚠️ Konnte config.json nicht laden, Miro-Export deaktiviert.");
}

const MIRO_API_BASE = "https://api.miro.com/v2";

/**
 * Exportiert Entitäten, Beziehungen, Zusammenfassung und Aufgaben als Miro-Board
 * @param {string} transcript - Das Transkript
 * @param {string} summary - Die Zusammenfassung
 * @param {object} [options] - Zusätzliche Optionen
 * @returns {Promise<string|null>} - Die URL des erstellten Boards oder null
 */
async function exportToMiro(transcript, summary, options = {}) {
	const apiKey = config.MIRO_API_KEY || process.env.MIRO_API_KEY;
	const teamId = config.MIRO_TEAM_ID || process.env.MIRO_TEAM_ID;
	if (!apiKey || !teamId) {
		console.error("❌ Miro API-Key oder Team-ID fehlt.");
		return null;
	}

	// 1. Board anlegen
	const boardRes = await axios.post(
		`${MIRO_API_BASE}/boards`,
		{
			name: summary ? summary.slice(0, 60) : "Otto Export",
			team_id: teamId,
		},
		{
			headers: { Authorization: `Bearer ${apiKey}` },
		}
	);
	const board = boardRes.data;

	// 2. Entitäten, Beziehungen, Zusammenfassung, Aufgaben extrahieren
	const entities = extractEntities(transcript);
	const entityEmojis = identifyEntitiesWithEmojis(transcript);
	const relations = identifyRelatedTerms(transcript, entities);
	const tasks = extractTasks(transcript);

	// 3. Shapes für Entitäten anlegen
	const entityIdToWidgetId = {};
	for (const entity of entities) {
		try {
			const res = await axios.post(
				`${MIRO_API_BASE}/boards/${board.id}/sticky_notes`,
				{
					data: {
						content: `${entityEmojis[entity] || "📌"} ${entity}`,
						shape: "square",
					},
					style: { fillColor: "light_yellow" },
				},
				{ headers: { Authorization: `Bearer ${apiKey}` } }
			);
			entityIdToWidgetId[entity] = res.data.id;
		} catch (e) {
			console.warn(
				`⚠️ Konnte Sticky Note für ${entity} nicht anlegen:`,
				e.response?.data || e.message
			);
		}
	}

	// 4. Beziehungen als Linien anlegen
	for (const entity of entities) {
		if (!relations[entity] || !entityIdToWidgetId[entity]) continue;
		for (const related of relations[entity].related) {
			if (entityIdToWidgetId[related]) {
				try {
					await axios.post(
						`${MIRO_API_BASE}/boards/${board.id}/connectors`,
						{
							startWidgetId: entityIdToWidgetId[entity],
							endWidgetId: entityIdToWidgetId[related],
							style: { color: "black" },
						},
						{ headers: { Authorization: `Bearer ${apiKey}` } }
					);
				} catch (e) {
					// Nicht kritisch
				}
			}
		}
	}

	// 5. Zusammenfassung als zentrale Sticky Note
	if (summary) {
		try {
			await axios.post(
				`${MIRO_API_BASE}/boards/${board.id}/sticky_notes`,
				{
					data: {
						content: `📝 Zusammenfassung\n${summary}`,
						shape: "rectangle",
					},
					style: { fillColor: "light_green" },
				},
				{ headers: { Authorization: `Bearer ${apiKey}` } }
			);
		} catch (e) {
			// Nicht kritisch
		}
	}

	// 6. Aufgaben als Sticky Notes
	if (tasks.length > 0) {
		for (const task of tasks) {
			try {
				await axios.post(
					`${MIRO_API_BASE}/boards/${board.id}/sticky_notes`,
					{
						data: {
							content: `☑️ ${task}`,
							shape: "square",
						},
						style: { fillColor: "light_pink" },
					},
					{ headers: { Authorization: `Bearer ${apiKey}` } }
				);
			} catch (e) {
				// Nicht kritisch
			}
		}
	}

	return board.viewLink || board.link || null;
}

/**
 * Extrahiert Aufgaben aus dem Transkript (Markdown-Checkboxen oder Listen)
 * @param {string} text
 * @returns {string[]}
 */
function extractTasks(text) {
	const tasks = [];
	const lines = text.split("\n");
	for (const line of lines) {
		const match =
			line.match(/- \[ \] (.+)/) ||
			line.match(/\* (.+)/) ||
			line.match(/\d+\. (.+)/);
		if (match) tasks.push(match[1].trim());
	}
	return tasks;
}

module.exports = { exportToMiro };
