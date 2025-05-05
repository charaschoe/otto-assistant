# Otto Assistant

Ein intelligenter Sprachassistent, der Audio aufnimmt, transkribiert, zusammenfasst und in Obsidian und Notion speichert.

## Features

### Implemented Features
- **Notion Integration**: Export transcripts and summaries to Notion.
- **Obsidian Integration**: Save transcripts and summaries to Obsidian.

### Planned Features (Not Yet Implemented)
- **Google Docs**: Export the transcript or summary to a Google Docs file.
- **CSV Export**: Save structured data (e.g., tasks, ideas) in a CSV format.
- **PDF Export**: Generate a PDF version of the transcript or summary.
- **Microsoft Teams**: Share the summary or transcript in a Teams channel.
- **Trello**: Add tasks or ideas as Trello cards.
- **Asana**: Create tasks in Asana based on the transcript.
- **Google Drive**: Save the transcript or summary to a Google Drive folder.
- **Dropbox**: Upload the file to Dropbox for easy sharing.
- **WhatsApp**: Send the summary or transcript via WhatsApp.
- **Telegram**: Share the output in a Telegram group or chat.
- **Sentiment Analysis**: Analyze the sentiment of the transcript (positive, neutral, negative).
- **Keyword Extraction**: Highlight key topics or phrases from the transcript.
- **Action Item Detection**: Automatically detect and list action items.
- **Zapier**: Trigger workflows in Zapier for further automation.
- **Custom Webhook**: Send the output to a custom webhook for integration with other systems.
- **Markdown**: Save the output in Markdown format (useful for developers or documentation).
- **HTML**: Generate an HTML file for web-based sharing.
- **Translation**: Translate the transcript or summary into another language.
- **Multilingual Support**: Allow transcription in multiple languages.

## Voraussetzungen

-   Node.js (v14 oder höher)
-   Python 3.x
-   Whisper (Python-Paket)
-   Notion API Token
-   Google Gemini API Key

## Installation

1. Repository klonen:

```bash
git clone [repository-url]
cd otto-assistant
```

2. Node.js Abhängigkeiten installieren:

```bash
npm install
```

3. Python Abhängigkeiten installieren:

```bash
pip install -r requirements.txt
```

4. Umgebungsvariablen einrichten:
   Erstelle eine `.env` Datei im Root-Verzeichnis mit folgenden Variablen:

```
NOTION_API_KEY=dein_notion_api_key
GEMINI_API_KEY=dein_gemini_api_key
NOTION_DATABASE_ID=dein_database_id
```

## Verwendung

1. Starte den Assistant:

```bash
npm start
```

oder direkt:

```bash
node src/index.js
```

2. Die Aufnahme startet automatisch und läuft für 10 Sekunden
3. Das Transkript wird automatisch in Obsidian gespeichert
4. Eine Zusammenfassung wird erstellt und in Obsidian und Notion gespeichert

## Projektstruktur

```
src/
├── audio/
│   └── recorder.js         # Audioaufnahme-Funktionalität
├── transcription/
│   └── whisper-transcribe.py # Whisper Transkription
├── integrations/
│   ├── obsidian-writer.js  # Obsidian Integration
│   └── notion-export.js    # Notion Export
├── utils/
│   └── gemini.js          # Gemini API Integration
└── index.js               # Hauptanwendung
```

## Abhängigkeiten

### Node.js Pakete

-   @google/generative-ai: ^0.24.1
-   @notionhq/client: ^2.3.0
-   mic: ^2.1.2
-   dotenv: ^16.4.1

### Python Pakete

-   openai-whisper: >=20231117
-   numpy: >=1.24.0
-   torch: >=2.0.0

## Lizenz

[Lizenzinformationen hier einfügen]

## Support

Bei Fragen oder Problemen, erstelle bitte ein Issue im Repository.
