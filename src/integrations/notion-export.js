// notion-export.js
const { Client } = require("@notionhq/client");
require("dotenv").config();

const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function exportToNotion(title, content) {
	const response = await notion.pages.create({
		parent: { database_id: process.env.NOTION_DATABASE_ID },
		properties: {
			Name: {
				title: [
					{
						text: {
							content: title,
						},
					},
				],
			},
		},
		children: [
			{
				object: "block",
				type: "paragraph",
				paragraph: {
					rich_text: [
						{
							type: "text",
							text: {
								content,
							},
						},
					],
				},
			},
		],
	});

	console.log("📤 Notiz an Notion gesendet:", response.id);
}

module.exports = { exportToNotion };
