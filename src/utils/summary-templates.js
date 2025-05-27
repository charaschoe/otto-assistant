/**
 * Sammlung verschiedener Vorlagen für die Zusammenfassung mit Gemini
 * Erweitert für Kreativ-Agenturen und Designschaffende
 */

// Importiere Creative Agency Templates
const { creativeTemplates, templateSelector } = require('./creative-agency-templates');

const templates = {
  // Creative Agency Templates (neu - optimiert für Archivierung)
  ...creativeTemplates,

  /**
   * Standardvorlage für allgemeine Zusammenfassungen
   */
  standard: `
    Bitte fasse den folgenden Text prägnant zusammen und extrahiere die wichtigsten Punkte.
    Formatiere das Ergebnis in Markdown.
    
    Text: {{transcript}}
  `,

  /**
   * Vorlage für Meetings und Besprechungen (erweitert für Kreativ-Agenturen)
   */
  meeting: `
    Fasse das folgende Meeting-Transkript zusammen mit Fokus auf kreative Entscheidungen:
    
    1. **Meeting-Kontext**: Extrahiere Teilnehmer, Projekt/Kunde, Zielsetzung
    2. **Kreative Diskussionspunkte**: Sammle alle Design- und Konzept-Entscheidungen
    3. **Entscheidungen & Freigaben**: Liste wichtige Beschlüsse und Genehmigungen auf
    4. **Action Items**: Notiere Aufgaben mit Verantwortlichkeiten und Deadlines
    5. **Kreative Insights**: Erfasse wichtige Erkenntnisse für das Projekt-Archiv
    6. **Follow-up**: Definiere nächste Schritte und geplante Meetings
    
    Formatiere deine Antwort in Markdown mit entsprechenden Überschriften und Tags für bessere Archivierung.
    
    Meeting-Transkript: {{transcript}}
  `,

  /**
   * Vorlage für Ideen und Brainstorming (erweitert für Creative Teams)
   */
  brainstorming: `
    Analysiere die folgenden Brainstorming-Ideen und strukturiere sie für das Creative Archive:
    
    1. **Creative Challenge**: Definiere die ursprüngliche Aufgabenstellung
    2. **Ideenclustering**: Kategorisiere Ideen nach Themen und Ansätzen
    3. **Innovation-Level**: Bewerte Ideen nach Originalität und Umsetzbarkeit
    4. **Prototyping-Potential**: Identifiziere Ideen für schnelle Prototypen
    5. **Inspiration-Quellen**: Sammle erwähnte Referenzen und Benchmarks
    6. **Next Steps**: Schlage konkrete Weiterentwicklungen vor
    
    Antworte in Markdown-Format mit visuellen Markern und Tags für bessere Archivierung.
    
    Brainstorming-Text: {{transcript}}
  `,

  /**
   * Vorlage für Lern- und Bildungsinhalte
   */
  learning: `
    Erstelle Lernnotizen aus dem folgenden Bildungsinhalt:
    
    1. Identifiziere die Hauptkonzepte und Schlüsselbegriffe
    2. Erstelle eine zusammenfassende Erklärung jedes wichtigen Konzepts
    3. Liste Definitionen wichtiger Fachbegriffe auf
    4. Füge Beispiele oder Anwendungsfälle hinzu, falls im Text erwähnt
    
    Formatiere deine Antwort als strukturierte Lernnotizen in Markdown.
    
    Lerninhalt: {{transcript}}
  `,

  /**
   * Vorlage für Projekte und Aufgaben (erweitert für Creative Projects)
   */
  project: `
    Strukturiere die folgenden Projektinformationen für das Projekt-Archiv:
    
    1. **Projektkontext**: Kunde, Marke, Kampagnentyp, Budget-Range
    2. **Creative Brief**: Zielgruppe, Botschaft, gewünschte Wirkung
    3. **Deliverables**: Assets, Formate, technische Anforderungen
    4. **Timeline & Meilensteine**: Wichtige Deadlines und Review-Termine
    5. **Team & Ressourcen**: Beteiligte Personen, externe Partner, Tools
    6. **Risiken & Dependencies**: Potenzielle Herausforderungen und Abhängigkeiten
    
    Formatiere als strukturierte Projektübersicht in Markdown mit Tags für Archivierung.
    
    Projektinformationen: {{transcript}}
  `,

  /**
   * Vorlage für Forschung und Analyse (erweitert für Market Research)
   */
  research: `
    Analysiere den folgenden Forschungs- oder Marktanalyse-Text:
    
    1. **Forschungsziel**: Definiere die ursprüngliche Fragestellung
    2. **Key Findings**: Fasse die wichtigsten Erkenntnisse zusammen
    3. **Zielgruppen-Insights**: Extrahiere relevante Nutzer- und Marktdaten
    4. **Competitive Analysis**: Notiere Wettbewerber und Marktpositionierung
    5. **Trend-Identifikation**: Sammle relevante Markt- und Design-Trends
    6. **Strategic Implications**: Leite Handlungsempfehlungen für Projekte ab
    
    Strukturiere deine Antwort als analytische Zusammenfassung in Markdown mit Tags.
    
    Forschungstext: {{transcript}}
  `,

  /**
   * Vorlage für persönliche Gedanken und Reflexionen
   */
  personal: `
    Fasse die folgenden persönlichen Gedanken oder Reflexionen zusammen:
    
    1. Identifiziere die Hauptthemen oder Anliegen
    2. Extrahiere wichtige Einsichten oder persönliche Erkenntnisse
    3. Notiere erwähnte Gefühle oder emotionale Reaktionen
    4. Erkenne mögliche Ziele oder Absichten
    
    Formatiere als reflektierende Zusammenfassung in Markdown.
    
    Persönliche Gedanken: {{transcript}}
  `,

  /**
   * Neue Creative Agency spezifische Templates
   */

  /**
   * Vorlage für Client Feedback Sessions
   */
  client_feedback: `
    Dokumentiere die folgende Client-Feedback-Session für das Projekt-Archiv:
    
    1. **Session Context**: Projekt, präsentierte Designs/Konzepte, Teilnehmer
    2. **Positive Feedback**: Was dem Client gefallen hat und warum
    3. **Änderungswünsche**: Konkrete Anpassungen und deren Begründung
    4. **Brand Alignment**: Feedback zur Markenkonformität und Zielgruppenwirkung
    5. **Technical Feedback**: Technische Anforderungen und Constraints
    6. **Approval Status**: Was freigegeben wurde und was überarbeitet werden muss
    7. **Next Steps**: Geplante Iterations-Zyklen und Timeline
    
    Erstelle eine strukturierte Feedback-Dokumentation in Markdown.
    
    Feedback-Session: {{transcript}}
  `,

  /**
   * Vorlage für Design System Discussions
   */
  design_system: `
    Strukturiere die folgende Design-System-Diskussion für das Design-Archiv:
    
    1. **Design System Scope**: Betroffene Komponenten, Patterns, Guidelines
    2. **Consistency Decisions**: Entscheidungen zu Einheitlichkeit und Standards
    3. **Component Specifications**: Detaillierte Spezifikationen für UI-Komponenten
    4. **Implementation Guidelines**: Technische Umsetzungsrichtlinien
    5. **Accessibility Considerations**: Barrierefreiheit und Usability-Aspekte
    6. **Documentation Updates**: Notwendige Aktualisierungen der Dokumentation
    
    Formatiere als technische Design-Dokumentation in Markdown.
    
    Design System Diskussion: {{transcript}}
  `,

  /**
   * Vorlage für Creative Strategy Sessions
   */
  creative_strategy: `
    Analysiere die folgende Creative-Strategy-Session für das Strategy-Archiv:
    
    1. **Strategic Challenge**: Die zu lösende kreative Herausforderung
    2. **Brand Positioning**: Markenpositionierung und Differenzierung
    3. **Creative Direction**: Gewählte kreative Richtung und Begründung
    4. **Campaign Architecture**: Struktur und Komponenten der Kampagne
    5. **Channel Strategy**: Multi-Channel-Ansatz und Medienverteilung
    6. **Success Metrics**: KPIs und Erfolgsmessung
    7. **Implementation Roadmap**: Zeitplan und Rollout-Strategie
    
    Erstelle eine umfassende Strategie-Dokumentation in Markdown.
    
    Strategy Session: {{transcript}}
  `
};

/**
 * Intelligente Template-Auswahl basierend auf Inhalt
 * @param {string} content - Der zu analysierende Inhalt
 * @param {object} metadata - Zusätzliche Metadaten
 * @returns {string} - Der Name des am besten passenden Templates
 */
function selectBestTemplate(content, metadata = {}) {
  // Verwende den Creative Agency Template Selector
  const creativeTemplate = templateSelector.detectTemplate(content, metadata);
  
  if (creativeTemplate && creativeTemplate !== 'creative_briefing') {
    return creativeTemplate;
  }
  
  // Fallback zu Standard-Logic für andere Templates
  const lowercaseContent = content.toLowerCase();
  
  // Client Feedback Keywords
  if (hasKeywords(lowercaseContent, ['feedback', 'client', 'kunde', 'freigabe', 'approval', 'änderung'])) {
    return 'client_feedback';
  }
  
  // Design System Keywords
  if (hasKeywords(lowercaseContent, ['component', 'design system', 'pattern', 'guideline', 'konsistenz'])) {
    return 'design_system';
  }
  
  // Creative Strategy Keywords
  if (hasKeywords(lowercaseContent, ['strategy', 'strategie', 'kampagne', 'positioning', 'brand direction'])) {
    return 'creative_strategy';
  }
  
  // Standard Template Logic
  if (hasKeywords(lowercaseContent, ['meeting', 'besprechung', 'protokoll', 'agenda'])) {
    return 'meeting';
  }
  
  if (hasKeywords(lowercaseContent, ['brainstorming', 'ideen', 'kreativ', 'innovation'])) {
    return 'brainstorming';
  }
  
  if (hasKeywords(lowercaseContent, ['projekt', 'project', 'aufgabe', 'task', 'milestone'])) {
    return 'project';
  }
  
  if (hasKeywords(lowercaseContent, ['forschung', 'research', 'analyse', 'studie', 'daten'])) {
    return 'research';
  }
  
  if (hasKeywords(lowercaseContent, ['lernen', 'learning', 'tutorial', 'erklärung', 'bildung'])) {
    return 'learning';
  }
  
  if (hasKeywords(lowercaseContent, ['persönlich', 'personal', 'reflexion', 'gedanken', 'gefühl'])) {
    return 'personal';
  }
  
  // Fallback
  return 'standard';
}

/**
 * Hilfsfunktion zur Keyword-Erkennung
 */
function hasKeywords(content, keywords) {
  let matchCount = 0;
  for (const keyword of keywords) {
    if (content.includes(keyword)) {
      matchCount++;
      if (matchCount >= 2) return true;
    }
  }
  return false;
}

module.exports = {
  templates,
  selectBestTemplate
};
