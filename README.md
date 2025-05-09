# Otto Sprachassistent

Ein einfacher Sprachassistent zur Transkription und Verarbeitung von Audiodateien mit dem Whisper-Modell.

## Überblick

Der Otto Sprachassistent ist ein Tool, das Audiodateien aufnimmt, transkribiert und die Transkription verarbeitet, um nützliche Informationen zu extrahieren und in Obsidian zu speichern.

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

3. Geben Sie `start` ein, um die Aufnahme zu starten. Die Aufnahme dauert 25 Sekunden.

### Was passiert nach der Aufnahme?

- Während der Aufnahme wird eine Benachrichtigung 5 Sekunden vor dem Ende angezeigt.
- Nach der Aufnahme wird die Audiodatei transkribiert.
- Die Transkription wird analysiert, und ein sinnvoller Titel wird mithilfe von Google Gemini generiert.
- Die Transkription und die Zusammenfassung werden in Obsidian gespeichert.

## Änderungen

### Neu hinzugefügt

- **Aufnahmezeit:** Die Aufnahmezeit wurde auf 25 Sekunden erhöht.
- **Benachrichtigung:** Eine Benachrichtigung wird 5 Sekunden vor dem Ende der Aufnahme angezeigt.
- **Startbefehl:** Das Programm kann mit `npm run start` gestartet werden, und die Aufnahme beginnt mit der Eingabe von `start`.
- **Titelgenerierung:** Die Titel der Obsidian-Dateien werden jetzt mithilfe von Google Gemini sinnvoll generiert.

## Sicherheitshinweise

-   Die maximale Dateigröße für Audiodateien ist auf 100MB begrenzt.
-   Es werden nur gültige Audiodateien akzeptiert.
-   Alle Daten werden lokal verarbeitet und nicht dauerhaft gespeichert.

## Lizenz

MIT

## Beitragende

Erstellt als Demo-Projekt für den Einsatz von KI-Modellen zur Sprachverarbeitung.
