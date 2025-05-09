# Otto Sprachassistent 🎙️

Ein intelligenter Sprachassistent zur Transkription und Verarbeitung von Audiodateien mit dem Whisper-Modell, semantischer Analyse und Integration mit Wissensmanagement-Tools.

## Überblick

Der Otto Sprachassistent ist ein leistungsstarkes Tool, das Audiodateien aufnimmt, transkribiert und die Transkription verarbeitet, um nützliche Informationen zu extrahieren. Die Ergebnisse werden in Wissensmanagement-Tools wie Obsidian und Notion strukturiert gespeichert und mit intelligenten Verknüpfungen versehen.

## Anforderungen

-   Node.js 14 oder höher
-   Python 3.8 oder höher
-   Installierte Abhängigkeiten (siehe [Installation](#installation))

## Installation

1. Repository klonen:

```bash
git clone https://github.com/yourusername/otto-assistant.git
cd otto-assistant
```

2. Node.js-Abhängigkeiten installieren:

```bash
npm install
```

3. Python-Abhängigkeiten installieren:

```bash
pip install -r requirements.txt
```

4. API-Schlüssel für Google Gemini in `config.json` hinzufügen:

```json
{
	"GEMINI_API_KEY": "your-api-key-here"
}
```

## Verwendung

### Programm starten

1. Öffnen Sie ein Terminal und navigieren Sie in das Projektverzeichnis.
2. Starten Sie das Programm mit:

```bash
npm run start
```

3. Geben Sie `start` ein, um die Aufnahme zu starten. Die Aufnahme dauert standardmäßig 25 Sekunden.

### Was passiert nach der Aufnahme?

-   Während der Aufnahme wird eine Benachrichtigung 5 Sekunden vor dem Ende angezeigt.
-   Nach der Aufnahme wird die Audiodatei mit dem Whisper-Modell transkribiert.
-   Die Transkription wird semantisch analysiert:
    -   Wichtige Konzepte und Entitäten werden identifiziert
    -   Passende Emojis werden zugeordnet
    -   Ein kontextrelevanter Titel wird mit Google Gemini generiert
-   Die verarbeitete Transkription wird:
    -   Mit intelligenten Verknüpfungen in Obsidian gespeichert
    -   In konfigurierte Notion-Datenbanken exportiert (wenn API-Schlüssel vorhanden)

### Mehrsprachige Unterstützung

Das System erkennt automatisch die Sprache der Aufnahme und passt die semantische Analyse entsprechend an. Aktuell werden unterstützt:

-   Deutsch: Vollständige Unterstützung mit deutscher Entitätserkennung und Verlinkung
-   Englisch: Vollständige Unterstützung mit englischer Entitätserkennung und Verlinkung

### Intelligente Wissensverknüpfung

Otto erstellt automatisch ein Netzwerk verknüpfter Informationen:

-   Verwandte Begriffe werden identifiziert und verlinkt
-   Entitäten werden optimal im Text platziert (nicht zu viele Verlinkungen)
-   Zu jeder wichtigen Entität wird eine separate Notiz erstellt
-   Passende Emojis werden basierend auf dem Kontext hinzugefügt

## Features

### Kernfunktionen

-   **Sprachaufnahme** 🎤: Aufnahme von Sprachnotizen mit konfigurierbarer Dauer (aktuell 25 Sekunden).
-   **Whisper-Transkription** 📝: Hochpräzise Spracherkennung mit OpenAI's Whisper-Modell.
-   **Mehrsprachige Unterstützung** 🌍: Unterstützt Transkription und semantische Analyse in:
    -   Deutsch
    -   Englisch
    -   [Weitere Sprachen werden kontinuierlich hinzugefügt]
-   **Intelligente Titelgenerierung** 🏷️: Automatische Erstellung sinnvoller Titel mit Google Gemini.
-   **Semantische Analyse** 🧠: Identifizierung wichtiger Konzepte und deren Beziehungen im Text.

### Wissensmanagement-Integrationen

#### Obsidian-Integration 📚

-   **Intelligentes Knowledge Graph** 🕸️: Automatische Erstellung von Verknüpfungen zwischen verwandten Konzepten.
-   **Kontextsensitive Verlinkung** 🔗: Strategische Platzierung von Verknüpfungen basierend auf Textkontexten.
-   **Automatische Entity-Erkennung** 🔍: Identifikation wichtiger Begriffe und Erstellung zugehöriger Notizen.
-   **Passende Emojis** 😀: Automatische Zuordnung relevanter Emojis zu Konzepten und Themen.

#### Notion-Integration 📋

-   **Datenbank-Integration** 📊: Strukturierte Speicherung von Transkripten in Notion-Datenbanken.
-   **Eigenschaftsverwaltung** 🏷️: Automatische Zuweisung von Tags, Status und Priorität.
-   **Emoji-Unterstützung** 🎯: Integration von passenden Emojis für bessere Visualisierung.

### Benutzerfreundlichkeit

-   **Benachrichtigungen** 🔔: Hinweise 5 Sekunden vor Ende der Aufnahme.
-   **Einfache Bedienung** ⚡: Starten des Programms mit `npm run start` und Beginn der Aufnahme mit dem Befehl `start`.
-   **Vorkonfigurierte Templates** 📜: Anpassbare Vorlagen für Notizen und Zusammenfassungen.

## Konfiguration

Für den vollen Funktionsumfang können Sie folgende Konfigurationen anpassen:

### Obsidian-Integration

Die Obsidian-Integration arbeitet standardmäßig mit einem lokalen Obsidian-Vault. Sie können den Pfad in der Datei `src/integrations/obsidian-writer.js` anpassen.

```javascript
// Pfad zu Ihrem Obsidian-Vault
const USER_OBSIDIAN_VAULT = "/path/to/your/vault";
```

### Notion-Integration

Um die Notion-Integration zu nutzen, müssen Sie Ihre Notion API-Schlüssel und Datenbank-ID in der `config.json` hinterlegen:

```json
{
	"GEMINI_API_KEY": "your-gemini-api-key",
	"NOTION_API_KEY": "your-notion-api-key",
	"NOTION_DATABASE_ID": "your-notion-database-id"
}
```

### Mehrsprachige Unterstützung

Das System unterstützt automatisch beide Sprachen (Deutsch und Englisch). Sie können die Spracherkennung in der Datei `src/utils/entity-linker.js` erweitern, indem Sie weitere sprachspezifische Begriffe und Muster hinzufügen.

### Emoji-Konfiguration

Sie können die automatische Emoji-Zuordnung anpassen, indem Sie die Kontexterkennung in den entsprechenden Modulen erweitern.

## Sicherheitshinweise

-   Die maximale Dateigröße für Audiodateien ist auf 100MB begrenzt.
-   Es werden nur gültige Audiodateien akzeptiert.
-   Alle Daten werden lokal verarbeitet und nicht dauerhaft gespeichert.

## Lizenz

MIT

## Beitragende

Erstellt als Demo-Projekt für den Einsatz von KI-Modellen zur Sprachverarbeitung.
