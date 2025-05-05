# Otto Assistant

Otto ist ein KI-gestützter persönlicher Assistent, der Audioaufnahmen transkribiert und in verschiedene Formate und Plattformen exportieren kann.

## Funktionen

-   **Audioaufnahme**: Nimmt Audio für eine bestimmte Dauer auf
-   **Transkription**: Verwendet Whisper zur Spracherkennung und Transkription
-   **Zusammenfassung**: Generiert Zusammenfassungen von Transkripten mit Google Gemini
-   **Integrationen**:
    -   ✅ Notion Export
    -   ✅ Obsidian Export
    -   ✅ Google Drive Upload
    -   ✅ Markdown Export
    -   ✅ PDF Export
    -   ✅ CSV Export
    -   ❌ Miro (noch nicht implementiert)
    -   ❌ Slack (noch nicht implementiert)
    -   ❌ Email (noch nicht implementiert)
    -   ❌ Google Docs (noch nicht implementiert)
    -   ❌ Microsoft Teams (noch nicht implementiert)
    -   ❌ Trello (noch nicht implementiert)
    -   ❌ Asana (noch nicht implementiert)
    -   ❌ Dropbox (noch nicht implementiert)
    -   ❌ WhatsApp (noch nicht implementiert)
    -   ❌ Telegram (noch nicht implementiert)
    -   ❌ Zapier (noch nicht implementiert)
    -   ❌ Custom Webhook (noch nicht implementiert)
    -   ❌ HTML Export (noch nicht implementiert)
-   **Analyseoptionen**:
    -   ❌ Stimmungsanalyse (noch nicht implementiert)
    -   ❌ Stichwortextraktion (noch nicht implementiert)
    -   ❌ Erkennung von Aktionspunkten (noch nicht implementiert)
    -   ❌ Übersetzung (noch nicht implementiert)
    -   ❌ Mehrsprachige Unterstützung (noch nicht implementiert)

## Voraussetzungen

-   Node.js
-   Python 3
-   Whisper (für Transkription)
-   Google Cloud API-Zugang (für Gemini und Google Drive)
-   Notion API-Zugang (für Notion-Export)
-   Obsidian (für lokale Markdown-Integration)

## Installation

```bash
# Repository klonen
git clone https://github.com/yourusername/otto-assistant.git
cd otto-assistant

# Abhängigkeiten installieren
npm install

# Python-Abhängigkeiten installieren
pip3 install -r requirements.txt
```

## Konfiguration

1. Erstellen Sie einen `.env` Datei im Hauptverzeichnis mit folgenden Umgebungsvariablen:
    ```
    NOTION_API_KEY=your_notion_api_key
    NOTION_DATABASE_ID=your_notion_database_id
    OBSIDIAN_VAULT_PATH=path_to_your_obsidian_vault
    GOOGLE_API_CREDENTIALS=path_to_your_google_credentials.json
    GEMINI_API_KEY=your_gemini_api_key
    ```

## Verwendung

Starten Sie die Anwendung mit:

```bash
node index.js
```

Folgen Sie den Anweisungen in der Konsole, um:

1. Die gewünschten Exportoptionen auszuwählen
2. Zu entscheiden, ob Sie ein Transkript möchten
3. Eine Audioaufnahme zu starten

## Projektstruktur

```
otto-assistant/
├── index.js                 # Hauptanwendungsdatei
├── src/
│   ├── audio/               # Audio-Aufnahmefunktionen
│   ├── transcription/       # Whisper-Transkription
│   ├── integrations/        # Integrationen mit externen Diensten
│   └── utils/               # Hilfsfunktionen und Exportfunktionen
├── exports/                 # Exportierte Dateien
└── README.md                # Projektdokumentation
```

## Lizenz

MIT

## Support

Bei Fragen oder Problemen, erstelle bitte ein Issue im Repository.
