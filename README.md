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

4. API-Schlüssel für Kitegg in `config.json` hinzufügen:

```json
{
	"KITEGG_API_KEY": "your-api-key-here"
}
```

## Verwendung

### Programm starten

1. Öffnen Sie ein Terminal und navigieren Sie in das Projektverzeichnis.
2. Starten Sie das Programm mit:

```bash
npm run start
```

3. Wählen Sie eine der folgenden Optionen:
    - Geben Sie `start` ein, um eine neue Aufnahme zu starten. Die Aufnahme dauert standardmäßig 25 Sekunden.
    - Geben Sie `test` ein, um den Testmodus zu verwenden, der die Auswahl bereits vorhandener Aufnahmen ermöglicht.

### Was passiert nach der Aufnahme?

-   Während der Aufnahme wird eine Benachrichtigung 5 Sekunden vor dem Ende angezeigt.
-   Nach der Aufnahme wird die Audiodatei mit dem Whisper-Modell transkribiert.
-   Die Transkription wird semantisch analysiert:
    -   Wichtige Konzepte und Entitäten werden identifiziert
    -   Passende Emojis werden zugeordnet
    -   Ein kontextrelevanter Titel wird mit der Kitegg-API generiert
-   Die verarbeitete Transkription wird:
    -   Mit intelligenten Verknüpfungen in Obsidian gespeichert
    -   In konfigurierte Notion-Datenbanken exportiert (wenn API-Schlüssel vorhanden)

### Testmodus

Der erweiterte Testmodus ermöglicht es, bereits aufgenommene Audio-Dateien wiederzuverwenden, was die Entwicklung und Tests beschleunigt:

-   Die letzten 5 Aufnahmen werden automatisch gespeichert
-   Jede Aufnahme erhält einen Zeitstempel im Format `recording-YYYY-MM-DD-HH-MM-SS.wav`
-   Die neueste Aufnahme ist immer als `test.wav` verfügbar
-   Ältere Aufnahmen werden automatisch gelöscht

Um den Testmodus zu nutzen:

1. Führen Sie mindestens eine Aufnahme mit `start` durch
2. Starten Sie das Programm neu und wählen Sie `test`
3. Wählen Sie eine der angezeigten Aufnahmen aus der Liste:
    - Option 0: Die neueste Aufnahme (test.wav)
    - Optionen 1-5: Frühere Aufnahmen mit Datums- und Zeitangabe

Vorteile des Testmodus:

-   Zeitsparend: Keine Wartezeit für neue Aufnahmen
-   Konsistenz: Gleiche Audiodaten für verschiedene Programmversionen
-   Flexibilität: Testen mit verschiedenen Aufnahmen möglich
-   Entwicklungsfreundlich: Schnelles Testen von Änderungen

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
-   **Intelligente Titelgenerierung** 🏷️: Automatische Erstellung sinnvoller Titel mit der Kitegg-API.
-   **Semantische Analyse** 🧠: Identifizierung wichtiger Konzepte und deren Beziehungen im Text.
-   **Testmodus** 🧪: Wiederverwendung vorheriger Aufnahmen für schnelles Testen und Entwicklung.

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

#### Miro-Integration 🟦

-   **Visualisierung als Miro-Board**: Exportiert automatisch die wichtigsten Informationen als Miro-Board.
-   **Was wird exportiert?**
    -   **Wichtige Entitäten/Konzepte**: Jede Entität wird als Sticky Note mit passendem Emoji dargestellt.
    -   **Beziehungen**: Beziehungen zwischen Entitäten werden als Linien/Verbindungen visualisiert.
    -   **Zusammenfassung**: Die Zusammenfassung erscheint als zentrale Sticky Note.
    -   **Aufgaben/ToDos**: Erkannte Aufgaben werden als eigene Sticky Notes hinzugefügt.
-   **Nicht exportiert:** Das komplette Transkript (nur die wichtigsten Strukturen und Aufgaben werden visualisiert).
-   **Nahtlose Integration**: Der Export kann direkt nach der Analyse erfolgen – das Board ist sofort im Miro-Account verfügbar.

#### Beispiel für den Export:

-   Entitäten: "Projekt", "KI", "Marketing"
-   Beziehungen: "Projekt" ↔ "KI", "KI" ↔ "Marketing"
-   Zusammenfassung: "Das Projekt nutzt KI für Marketing."
-   Aufgaben: "Daten sammeln", "Modell trainieren"

Das Board zeigt alle Entitäten als Sticky Notes, verbindet sie entsprechend und hebt die Zusammenfassung sowie Aufgaben hervor.

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

### KI-API Integration

Um die KI-Funktionen zu nutzen, muss ein Kitegg-API-Key in der `config.json` konfiguriert werden:

```json
{
	"KITEGG_API_KEY": "your-kitegg-api-key"
}
```

Die KI-Integration nutzt das Kitegg-API mit dem Mistral-Small-3.1-24B-Instruct-Modell für die Generierung von Zusammenfassungen und Titeln.

### Notion-Integration

Um die Notion-Integration zu nutzen, müssen Sie Ihre Notion API-Schlüssel und Datenbank-ID in der `config.json` hinterlegen:

```json
{
	"KITEGG_API_KEY": "your-kitegg-api-key",
	"NOTION_API_KEY": "your-notion-api-key",
	"NOTION_DATABASE_ID": "your-notion-database-id"
}
```

### Miro-Integration

Um die Miro-Integration zu nutzen, benötigen Sie einen Miro API-Key (OAuth2 oder persönlicher Token) und eine Team-ID. Diese können Sie als Umgebungsvariablen setzen oder beim Export übergeben:

```json
{
	"KITEGG_API_KEY": "your-kitegg-api-key",
	"NOTION_API_KEY": "your-notion-api-key",
	"NOTION_DATABASE_ID": "your-notion-database-id",
	"MIRO_API_KEY": "your-miro-api-key",
	"MIRO_TEAM_ID": "your-miro-team-id"
}
```

### Miro-Integration konfigurieren

Füge in deiner `config.json` folgende Felder hinzu:

```json
{
	"MIRO_CLIENT_ID": "deine-client-id",
	"MIRO_CLIENT_SECRET": "dein-client-secret"
}
```

Optional kannst du auch einen API-Key und Team-ID verwenden, falls du diese direkt von Miro hast:

```json
{
	"MIRO_API_KEY": "dein-miro-api-key",
	"MIRO_TEAM_ID": "dein-miro-team-id"
}
```

Die Integration nutzt automatisch die Werte aus der Konfiguration.

### Mehrsprachige Unterstützung

Das System unterstützt automatisch beide Sprachen (Deutsch und Englisch). Sie können die Spracherkennung in der Datei `src/utils/entity-linker.js` erweitern, indem Sie weitere sprachspezifische Begriffe und Muster hinzufügen.

### Emoji-Konfiguration

Sie können die automatische Emoji-Zuordnung anpassen, indem Sie die Kontexterkennung in den entsprechenden Modulen erweitern.

### Aufnahme-Konfiguration

Die Aufnahmeeinstellungen können in der Datei `src/audio/recorder.js` angepasst werden:

```javascript
// Anzahl der zu behaltenden Aufnahmen im recordings-Verzeichnis
const KEEP_RECORDINGS_COUNT = 5;

// Aufnahmedauer (in Millisekunden)
const RECORDING_DURATION = 25000;
```

## Sicherheitshinweise

-   Die maximale Dateigröße für Audiodateien ist auf 100MB begrenzt.
-   Es werden nur gültige Audiodateien akzeptiert.
-   Alle Daten werden lokal verarbeitet und nicht dauerhaft gespeichert.

## Lizenz

MIT

## Beitragende

Erstellt als Demo-Projekt für den Einsatz von KI-Modellen zur Sprachverarbeitung.
