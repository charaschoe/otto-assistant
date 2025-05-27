/**
 * Spezialisierte Vorlagen für Kreativ-Agenturen und Designschaffende
 * Optimiert für Archivierung in Notion/Obsidian und Meeting-Unterstützung in Miro
 */

const creativeTemplates = {
  /**
   * Vorlage für Kreativ-Briefings und Projektbesprechungen
   */
  creative_briefing: `
    Analysiere das folgende Kreativ-Briefing und strukturiere es für die Archivierung:
    
    1. **Projektkontext**: Extrahiere Kunde, Marke, Kampagne oder Projektname
    2. **Kreative Zielsetzung**: Identifiziere die gewünschte Botschaft und Zielgruppe
    3. **Design-Anforderungen**: Sammle Stilrichtungen, Farben, Typografie, Format-Vorgaben
    4. **Deliverables**: Liste alle zu erstellenden Assets und Medienformate auf
    5. **Timeline & Meilensteine**: Extrahiere Deadlines und wichtige Termine
    6. **Budget & Ressourcen**: Notiere verfügbare Ressourcen und Einschränkungen
    
    Formatiere als strukturiertes Kreativ-Briefing in Markdown mit entsprechenden Tags.
    
    Briefing-Inhalt: {{transcript}}
  `,

  /**
   * Vorlage für Design-Reviews und Feedback-Sessions
   */
  design_review: `
    Strukturiere das folgende Design-Review für die Projektdokumentation:
    
    1. **Präsentierte Designs**: Beschreibe die vorgestellten Konzepte und Varianten
    2. **Stakeholder-Feedback**: Kategorisiere Feedback nach Quelle (Kunde, Team, etc.)
    3. **Designentscheidungen**: Dokumentiere begründete Design-Choices
    4. **Änderungswünsche**: Liste konkrete Anpassungen und Iterationen auf
    5. **Nächste Schritte**: Definiere Follow-up Aufgaben und Verantwortlichkeiten
    6. **Learnings**: Extrahiere wichtige Erkenntnisse für zukünftige Projekte
    
    Erstelle eine strukturierte Design-Review-Dokumentation in Markdown.
    
    Review-Inhalt: {{transcript}}
  `,

  /**
   * Vorlage für Brainstorming und Ideenfindung
   */
  creative_brainstorming: `
    Organisiere die folgende Brainstorming-Session für das Creative Archive:
    
    1. **Kreative Challenge**: Definiere die zu lösende Aufgabenstellung
    2. **Ideencluster**: Gruppiere ähnliche Konzepte und Ansätze
    3. **Innovative Ansätze**: Hebe besonders kreative oder unkonventionelle Ideen hervor
    4. **Machbarkeitsanalyse**: Bewerte Ideen nach Umsetzbarkeit und Ressourcenbedarf
    5. **Prototyping-Kandidaten**: Identifiziere Ideen für schnelle Prototypen
    6. **Inspiration & Referenzen**: Sammle erwähnte Inspirationsquellen und Benchmarks
    
    Formatiere als Kreativ-Ideensammlung mit visuellen Markern.
    
    Brainstorming-Inhalt: {{transcript}}
  `,

  /**
   * Vorlage für Kundenpräsentationen und Pitches
   */
  client_presentation: `
    Dokumentiere die folgende Kundenpräsentation für das Projekt-Archiv:
    
    1. **Präsentationskontext**: Kunde, Anlass, Teilnehmer, Zielsetzung
    2. **Präsentierte Lösungen**: Beschreibe vorgestellte Konzepte und Kampagnen
    3. **Kundenfeedback**: Erfasse direkte Reaktionen und Kommentare
    4. **Fragen & Antworten**: Dokumentiere wichtige Diskussionspunkte
    5. **Entscheidungen**: Notiere getroffene Beschlüsse und Richtungsänderungen
    6. **Follow-up Actions**: Liste Nacharbeiten und nächste Schritte auf
    
    Erstelle eine vollständige Präsentationsdokumentation.
    
    Präsentations-Inhalt: {{transcript}}
  `,

  /**
   * Vorlage für technische Design-Diskussionen
   */
  technical_design: `
    Strukturiere die folgende technische Design-Diskussion:
    
    1. **Technische Anforderungen**: Extrahiere Plattformen, Formate, technische Specs
    2. **Design-System Entscheidungen**: Dokumentiere Komponenten, Patterns, Guidelines
    3. **Implementierungsdetails**: Sammle Code-Referenzen, Tools, Workflows
    4. **Performance-Überlegungen**: Notiere Optimierungen und technische Constraints
    5. **Responsive Strategie**: Erfasse Multi-Device und Accessibility-Aspekte
    6. **Technische Risiken**: Identifiziere potenzielle Herausforderungen
    
    Formatiere als technische Design-Dokumentation.
    
    Tech-Diskussion: {{transcript}}
  `,

  /**
   * Vorlage für Marken-Workshops und Brand Strategy
   */
  brand_workshop: `
    Dokumentiere den folgenden Marken-Workshop für das Brand Archive:
    
    1. **Brand Vision & Mission**: Extrahiere Markenkern und Positionierung
    2. **Zielgruppen-Insights**: Sammle Persona-Definitionen und User Journeys
    3. **Brand Personality**: Definiere Markenwerte, Tonalität, Charakteristika
    4. **Visual Identity**: Dokumentiere Farben, Typografie, Bildsprache, Logo-Ansätze
    5. **Touchpoint-Strategie**: Erfasse Kanäle und Anwendungsbereiche
    6. **Differenzierung**: Identifiziere Unique Selling Points und Marktabgrenzung
    
    Erstelle eine umfassende Brand-Strategie-Dokumentation.
    
    Workshop-Inhalt: {{transcript}}
  `,

  /**
   * Vorlage für Post-Mortem und Projektabschluss
   */
  project_postmortem: `
    Analysiere das folgende Projekt-Post-Mortem für das Agentur-Learning-Archive:
    
    1. **Projekterfolg**: Bewerte Zielerreichung und KPIs
    2. **Was lief gut**: Dokumentiere erfolgreiche Prozesse und Entscheidungen
    3. **Herausforderungen**: Erfasse Probleme und deren Lösungsansätze
    4. **Team-Performance**: Notiere Stärken und Verbesserungspotenziale
    5. **Client-Relationship**: Bewerte Kundenzufriedenheit und Kommunikation
    6. **Learnings für nächste Projekte**: Extrahiere konkrete Handlungsempfehlungen
    
    Formatiere als strukturiertes Post-Mortem mit Handlungsempfehlungen.
    
    Post-Mortem-Inhalt: {{transcript}}
  `,

  /**
   * Vorlage für Tool- und Workflow-Diskussionen
   */
  workflow_optimization: `
    Strukturiere die folgende Workflow-Diskussion für das Operations-Archiv:
    
    1. **Aktuelle Tools & Prozesse**: Dokumentiere verwendete Software und Workflows
    2. **Effizienz-Bottlenecks**: Identifiziere Zeitfresser und Reibungspunkte
    3. **Neue Tool-Evaluierung**: Erfasse evaluierte Lösungen und deren Bewertung
    4. **Prozess-Optimierungen**: Sammle Verbesserungsvorschläge und Automatisierungen
    5. **Team-Adoption**: Notiere Change-Management und Trainingsbedarfe
    6. **ROI & Metrics**: Dokumentiere erwartete Effizienzgewinne
    
    Erstelle eine strukturierte Workflow-Optimierungs-Dokumentation.
    
    Workflow-Diskussion: {{transcript}}
  `
};

/**
 * Template-Auswahl basierend auf Inhalt und Kontext
 * Optimiert für Creative Agency Use Cases
 */
const templateSelector = {
  /**
   * Erkennt das passende Template basierend auf Keywords und Kontext
   */
  detectTemplate(content, metadata = {}) {
    const lowercaseContent = content.toLowerCase();
    
    // Creative Briefing Keywords
    if (this.hasKeywords(lowercaseContent, [
      'briefing', 'kunde', 'kampagne', 'marke', 'brand', 'zielgruppe', 'target',
      'client', 'campaign', 'brief', 'requirements', 'deliverables'
    ])) {
      return 'creative_briefing';
    }
    
    // Design Review Keywords
    if (this.hasKeywords(lowercaseContent, [
      'design', 'review', 'feedback', 'iteration', 'änderung', 'anpassung',
      'version', 'konzept', 'layout', 'mockup', 'prototype'
    ])) {
      return 'design_review';
    }
    
    // Brainstorming Keywords
    if (this.hasKeywords(lowercaseContent, [
      'brainstorming', 'ideen', 'kreativ', 'innovation', 'konzept', 'ideas',
      'creative', 'inspiration', 'mind', 'thinking', 'ideation'
    ])) {
      return 'creative_brainstorming';
    }
    
    // Client Presentation Keywords
    if (this.hasKeywords(lowercaseContent, [
      'präsentation', 'pitch', 'client', 'kunde', 'vorstellen', 'present',
      'meeting', 'vorschlag', 'proposal', 'stakeholder'
    ])) {
      return 'client_presentation';
    }
    
    // Technical Design Keywords
    if (this.hasKeywords(lowercaseContent, [
      'technisch', 'code', 'development', 'implementation', 'responsive',
      'technical', 'system', 'component', 'framework', 'performance'
    ])) {
      return 'technical_design';
    }
    
    // Brand Workshop Keywords
    if (this.hasKeywords(lowercaseContent, [
      'brand', 'marke', 'identity', 'workshop', 'positioning', 'vision',
      'mission', 'values', 'personality', 'strategy'
    ])) {
      return 'brand_workshop';
    }
    
    // Post-Mortem Keywords
    if (this.hasKeywords(lowercaseContent, [
      'post-mortem', 'abschluss', 'learnings', 'retrospective', 'lessons',
      'learned', 'erfolg', 'herausforderung', 'challenge', 'improvement'
    ])) {
      return 'project_postmortem';
    }
    
    // Workflow Keywords
    if (this.hasKeywords(lowercaseContent, [
      'workflow', 'prozess', 'tool', 'effizienz', 'optimization', 'process',
      'automation', 'efficiency', 'bottleneck', 'productivity'
    ])) {
      return 'workflow_optimization';
    }
    
    // Default fallback
    return 'creative_briefing';
  },
  
  /**
   * Prüft ob mindestens 2 Keywords aus der Liste im Content vorhanden sind
   */
  hasKeywords(content, keywords) {
    let matchCount = 0;
    for (const keyword of keywords) {
      if (content.includes(keyword)) {
        matchCount++;
        if (matchCount >= 2) return true;
      }
    }
    return false;
  }
};

module.exports = {
  creativeTemplates,
  templateSelector
};
