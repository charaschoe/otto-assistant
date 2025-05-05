// gemini.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

const config = JSON.parse(fs.readFileSync("./config.json", "utf-8"));
const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);

async function summarizeTranscript(text) {
	const model = genAI.getGenerativeModel({
		model: "gemini-2.5-flash-preview-04-17",
	});

	const prompt = `
Hier ist ein Transkript eines Meetings oder Brainstormings:

"${text}"

Erstelle bitte eine strukturierte Zusammenfassung mit folgenden Abschnitten:
- 📝 Kurze Zusammenfassung (1–2 Sätze)
- ✅ Besprochene Aufgaben oder To-Dos
- 💡 Ideen oder Konzepte
- ❓ Offene Fragen

Bitte formatiere das Ergebnis in Markdown.
`;

	const result = await model.generateContent(prompt);
	const response = await result.response;
	return response.text();
}

module.exports = { summarizeTranscript };
