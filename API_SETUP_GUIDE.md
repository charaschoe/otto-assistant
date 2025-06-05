# API Setup Guide für Otto Assistant Export-Funktionen

## Problem gelöst ✅

Das Problem mit den fehlenden Exporten in Notion und Miro lag an **falschen Funktionsparametern** im Live-Mode-Manager. Das wurde korrigiert.

## Nächste Schritte: API-Keys konfigurieren

Um die Export-Funktionen zu nutzen, müssen Sie die API-Keys in der `config.json` Datei eintragen:

### 1. Notion API Setup

1. Gehen Sie zu https://www.notion.so/my-integrations
2. Erstellen Sie eine neue Integration
3. Kopieren Sie den "Internal Integration Token"
4. Erstellen Sie eine Datenbank in Notion
5. Teilen Sie die Datenbank mit Ihrer Integration
6. Kopieren Sie die Database-ID aus der URL

```json
{
  "NOTION_API_KEY": "secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "NOTION_DATABASE_ID": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

### 2. Miro API Setup

1. Gehen Sie zu https://developers.miro.com/
2. Erstellen Sie eine neue App
3. Kopieren Sie den Access Token
4. Optional: Erstellen Sie ein Board und kopieren Sie die Board-ID

```json
{
  "MIRO_API_TOKEN": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "MIRO_BOARD_ID": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

### 3. Vollständige config.json

```json
{
  "NOTION_API_KEY": "IHR_NOTION_API_KEY",
  "NOTION_DATABASE_ID": "IHRE_NOTION_DATABASE_ID",
  "MIRO_API_TOKEN": "IHR_MIRO_API_TOKEN",
  "MIRO_BOARD_ID": "IHRE_MIRO_BOARD_ID",
  "KITEGG_API_KEY": "IHR_KITEGG_API_KEY",
  "KITEGG_API_URL": "https://api.kitegg.com/v1",
  "OBSIDIAN_VAULT_PATH": "./obsidian-vault",
  "EXPORT_SETTINGS": {
    "auto_export": true,
    "export_interval": 300000,
    "platforms": {
      "obsidian": true,
      "notion": true,
      "miro": true
    }
  }
}
```

## Test nach Konfiguration

Nach dem Eintragen der API-Keys, testen Sie mit:

```bash
node test-export-fix.js
```

## Was wurde korrigiert

1. **LiveModeManager Export-Aufrufe**: Die Parameter für `exportToNotion()` und `exportToMiro()` wurden korrigiert
2. **Konsistente Funktionssignaturen**: Alle Export-Funktionen haben jetzt die richtigen Parameter
3. **Konfigurationsdatei**: Eine vollständige `config.json` wurde erstellt

## Obsidian Export

Der Obsidian Export funktioniert bereits ohne API-Keys, da er direkt in das lokale Vault schreibt (`./obsidian-vault/`).

## Fehlerbehebung

- **"API-Key fehlt"**: Tragen Sie die korrekten API-Keys in `config.json` ein
- **"Database nicht gefunden"**: Stellen Sie sicher, dass die Notion-Integration Zugriff auf die Datenbank hat
- **"Board nicht gefunden"**: Überprüfen Sie die Miro Board-ID oder lassen Sie sie leer für automatische Board-Erstellung