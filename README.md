# Otto Creative Assistant 🎨🎙️

Ein intelligenter Sprachassistent speziell für Kreativ-Agenturen und Designschaffende. Otto transkribiert Audio von Creative Meetings, extrahiert wichtige Informationen und archiviert sie strukturiert in professionellen Wissensmanagement-Tools.

## Überblick

Otto Creative Assistant revolutioniert das Meeting-Management für Creative Teams. Das System erkennt automatisch verschiedene Meeting-Typen (Creative Briefings, Design Reviews, Brainstorming Sessions, etc.) und erstellt entsprechend strukturierte Dokumentationen in Miro, Obsidian und Notion.

## 🎯 Speziell für Creative Teams

### Unterstützte Meeting-Typen
- **🎯 Creative Briefings** - Projektbriefings und Kampagnen-Kickoffs
- **🔍 Design Reviews** - Feedback-Sessions und Iterationszyklen
- **💡 Creative Brainstorming** - Ideenfindung und Innovation-Workshops
- **📊 Client Presentations** - Kundenpräsentationen und Pitches
- **🏷️ Brand Workshops** - Brand-Strategie und Positionierung
- **📋 Project Post-Mortems** - Projektabschluss und Learnings
- **⚙️ Workflow Optimization** - Prozess-Verbesserung und Tool-Evaluierung

### Intelligente Content-Extraktion
Otto erkennt automatisch:
- Kunden und Marken
- Projekt-Details und Deliverables
- Zielgruppen und Key Messages
- Design-Anforderungen und Feedback
- Timeline und Team-Zuordnungen
- Action Items und Follow-ups

## 🚀 Quick Start

### Installation

1. Repository klonen:
```bash
git clone https://github.com/yourusername/otto-creative-assistant.git
cd otto-creative-assistant
```

2. Dependencies installieren:
```bash
npm install
pip install -r requirements.txt
```

3. Konfiguration einrichten:
```bash
cp config.example.json config.json
# Trage deine API-Keys ein (siehe Konfiguration)
```

### Erste Verwendung

```bash
# Otto starten
npm run start

# Optionen:
# - "start" für neue Audio-Aufnahme (25 Sekunden)
# - "test" für Testmodus mit vorhandenen Aufnahmen
```

### Was passiert nach der Aufnahme?

1. **🎤 Audio-Transkription** mit Whisper-Modell
2. **🎨 Meeting-Typ Erkennung** (Creative Briefing, Design Review, etc.)
3. **📊 Content-Analyse** und Entitäten-Extraktion
4. **🔄 Multi-Platform Export:**
   - **Miro Board** für Live-Kollaboration
   - **Obsidian Vault** für Wissensarchivierung
   - **Notion Database** für Projektmanagement

## 🛠️ Konfiguration

### API-Keys in config.json

```json
{
  "KITEGG_API_KEY": "your-kitegg-api-key",
  "MIRO_API_KEY": "your-miro-api-key",
  "MIRO_TEAM_ID": "your-miro-team-id",
  "NOTION_API_KEY": "your-notion-api-key",
  "NOTION_DATABASE_ID": "your-notion-database-id",
  "OBSIDIAN_VAULT_PATH": "/path/to/your/vault"
}
```

### Erweiterte Konfiguration

#### Miro Integration 🟦
- **Interaktive Whiteboards** für Creative Sessions
- **Optimiert für große Displays** (4K/Ultra-Wide)
- **Template-spezifische Layouts** je Meeting-Typ
- **Automatische Sticky Note Kategorisierung**

#### Obsidian Integration 📚
- **Strukturierte Markdown-Templates** mit Metadata
- **Automatische Cross-Links** zwischen Projekten/Clients
- **Creative Agency Ordnerstruktur**
- **Entity-Files** für bessere Verlinkung

#### Notion Integration 📊
- **7 spezialisierte Datenbanken** für verschiedene Meeting-Typen
- **Automatische Property-Zuordnung** aus Audio-Content
- **Client/Project Relations** für besseres Tracking
- **Rich Content-Formatierung**

## 🎨 Creative Agency Features

### Template-System
Jeder Meeting-Typ hat optimierte Templates für:
- **Miro:** Interaktive Workshop-Boards
- **Obsidian:** Strukturierte Wissensarchivierung
- **Notion:** Projekt- und Client-Management

### Beispiel: Creative Briefing Workflow

```
1. 🎤 Audio-Aufnahme des Client-Briefings
2. 🤖 Otto erkennt: "Creative Briefing" 
3. 📊 Extrahiert: Kunde, Projekt, Zielgruppe, Deliverables
4. 🔄 Erstellt automatisch:
   - Miro Board mit Briefing-Template
   - Obsidian Note mit Projekt-Links
   - Notion Database Entry mit Properties
```

### Intelligente Erkennung
Otto analysiert Sprach-Patterns und Keywords um den Meeting-Typ zu bestimmen:
- **Briefing-Keywords:** "Kunde", "Kampagne", "Zielgruppe", "Deliverables"
- **Review-Keywords:** "Feedback", "Iteration", "Änderungen", "Freigabe"
- **Brainstorming-Keywords:** "Ideen", "Innovation", "Kreativität", "Konzept"

## 📈 Workflow-Empfehlungen

### Für Client Briefings
```
✅ Verwende: Alle 3 Integrations
📋 Workflow:
1. Miro Board für Live Workshop mit Client
2. Obsidian für detaillierte Projekt-Dokumentation
3. Notion für Projekt-Setup und Tracking
```

### Für Design Reviews
```
✅ Verwende: Miro + Notion
📋 Workflow:
1. Miro für Live-Feedback-Session
2. Notion für Feedback-Tracking und Action Items
```

### Für Brainstorming Sessions
```
✅ Verwende: Miro + Obsidian
📋 Workflow:
1. Miro für interaktiven Ideation-Canvas
2. Obsidian für langfristige Idea-Archivierung
```

## 🧪 Testing

### Creative Agency Features testen
```bash
# Vollständiger Feature-Test
node test-creative-agency-features.js

# Einzelne Integrations testen
node -e "require('./src/integrations/notion-export').testNotionExport()"
node -e "require('./src/integrations/obsidian-export').testObsidianExport()"
```

### Test-Modi
- **Template-Auswahl:** Testet alle 7 Creative Templates
- **Content-Extraktion:** Mercedes EQS Kampagne Beispiel
- **Cross-Platform Kompatibilität:** Miro, Obsidian, Notion
- **Performance:** 1000 Iterationen Template-Selection

## 📊 Supported Audio Quality

### Optimiert für Creative Meetings
- **Mehrere Sprecher:** Erkennt verschiedene Team-Mitglieder
- **Fachbegriffe:** Creative/Design/Marketing Terminologie
- **Deutsch/Englisch:** Vollständige Mehrsprachigkeit
- **Meeting-Atmosphäre:** Funktioniert auch bei Hintergrundgeräuschen

### Transkriptions-Qualität
Otto nutzt das **Whisper-Large-v3** Modell für maximale Genauigkeit bei:
- Creative Begriffen und Markennamen
- Design-Terminologie
- Client-Namen und Projekttiteln
- Meeting-spezifischem Vokabular

## 🔧 Erweiterte Features

### Automatische Entities
- **Kunden/Marken:** Mercedes-Benz, Apple, Nike
- **Projektypen:** Kampagne, Website, Brand Identity
- **Tools/Software:** Figma, Photoshop, After Effects
- **Team-Rollen:** Creative Director, Art Director, Copywriter

### Smart Templates
- **Adaptive Layouts:** Je nach Meeting-Länge und Komplexität
- **Conditional Sections:** Zeigt nur relevante Bereiche
- **Auto-Linking:** Verknüpft automatisch verwandte Konzepte

### Quality Assurance
- **Backup-System:** 5 letzte Aufnahmen werden gespeichert
- **Error-Recovery:** Robust gegen API-Ausfälle
- **Offline-Modus:** Transkription funktioniert offline

## 📚 Dokumentation

Für detaillierte Informationen siehe:
- **[CREATIVE_AGENCY_FEATURES.md](./CREATIVE_AGENCY_FEATURES.md)** - Vollständige Feature-Dokumentation
- **[MIRO_API_STATUS.md](./MIRO_API_STATUS.md)** - Miro Integration Details

## 🤝 Support für Creative Teams

### Onboarding
1. **Team-Workshop:** Einführung in Otto Creative Assistant
2. **Template-Anpassung:** Customization für deine Agentur
3. **Workflow-Integration:** Einbindung in bestehende Prozesse

### Best Practices
- **Meeting-Vorbereitung:** Kurze Agenda zu Beginn sprechen
- **Klare Sprache:** Namen und Begriffe deutlich aussprechen
- **Follow-up:** Generated Content als Basis für weitere Bearbeitung

## 🔮 Roadmap

### Geplante Features
- [ ] **Figma Integration** für Design-Asset-Verlinkung
- [ ] **Slack Notifications** für Team-Updates
- [ ] **AI-Enhanced Summaries** mit GPT-4
- [ ] **Custom Template Builder** für Agenturen
- [ ] **Analytics Dashboard** für Meeting-Insights

### Community
- GitHub Issues für Bug-Reports
- Feature-Requests über Pull Requests
- Creative Agency Template-Sharing

## 📄 Lizenz

MIT License - Frei für kommerzielle Nutzung in Creative Agencies

## 🎨 Erstellt für Kreative

Otto Creative Assistant wurde von und für die Creative Community entwickelt. Optimiert für die realen Workflows von Designern, Art Directors, Creative Directors und Agency-Teams.

---

**Version:** 2.0.0 - Creative Agency Edition  
**Letzte Aktualisierung:** 27.05.2025  
**Kompatibilität:** Node.js 14+, Python 3.8+
