# Otto Assistant

Ein intelligenter Sprachassistent, der Audio aufnimmt, transkribiert, zusammenfasst und in Obsidian und Notion speichert.

## Features

-   🎙️ Audioaufnahme
-   🧠 Transkription mit Whisper
-   📝 Speicherung in Obsidian
-   🤖 Zusammenfassung mit Google Gemini
-   📚 Export zu Notion

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
