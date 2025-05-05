# Otto Sprachassistent

Ein einfacher Sprachassistent zur Transkription und Verarbeitung von Audiodateien mit dem Whisper-Modell.

## Überblick

Der Otto Sprachassistent ist ein Tool, das Audiodateien transkribiert und die Transkription verarbeitet, um nützliche Informationen zu extrahieren.

## Anforderungen

-   Python 3.8 oder höher
-   Installierte Abhängigkeiten (siehe [Installation](#installation))

## Installation

1. Repository klonen:

```bash
git clone https://github.com/yourusername/otto-assistant.git
cd otto-assistant
```

2. Abhängigkeiten installieren:

```bash
pip install -r requirements.txt
```

## Verwendung

### Audiodatei transkribieren

```bash
python src/transcription/whisper-transcribe.py pfad/zur/audiodatei.mp3
```

### Assistent verwenden

```bash
python src/transcription/whisper-transcribe.py pfad/zur/audiodatei.mp3
```

## Sicherheitshinweise

-   Die maximale Dateigröße für Audiodateien ist auf 100MB begrenzt
-   Es werden nur gültige Audiodateien akzeptiert
-   Alle Daten werden lokal verarbeitet und nicht dauerhaft gespeichert

## Lizenz

MIT

## Beitragende

Erstellt als Demo-Projekt für den Einsatz von KI-Modellen zur Sprachverarbeitung.
