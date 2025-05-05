/**
 * Sammlung verschiedener Vorlagen für die Zusammenfassung mit Gemini
 */
const templates = {
	/**
	 * Standardvorlage für allgemeine Zusammenfassungen
	 */
	standard: `
    Bitte fasse den folgenden Text prägnant zusammen und extrahiere die wichtigsten Punkte.
    Formatiere das Ergebnis in Markdown.
    
    Text: {{transcript}}
  `,

	/**
	 * Vorlage für Meetings und Besprechungen
	 */
	meeting: `
    Fasse das folgende Meeting-Transkript zusammen:
    
    1. Extrahiere die Hauptthemen der Besprechung
    2. Liste wichtige Entscheidungen und Aktionspunkte auf
    3. Notiere Verantwortlichkeiten und Fristen, falls erwähnt
    4. Fasse die wichtigsten Diskussionspunkte zusammen
    
    Formatiere deine Antwort in Markdown mit entsprechenden Überschriften.
    
    Meeting-Transkript: {{transcript}}
  `,

	/**
	 * Vorlage für Ideen und Brainstorming
	 */
	brainstorming: `
    Analysiere die folgenden Brainstorming-Ideen und strukturiere sie:
    
    1. Kategorisiere die Ideen in logische Gruppen
    2. Hebe die innovativsten oder vielversprechendsten Konzepte hervor
    3. Identifiziere potenzielle Verbindungen zwischen verschiedenen Ideen
    4. Schlage mögliche nächste Schritte vor
    
    Antworte in Markdown-Format mit Überschriften und Listen.
    
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
	 * Vorlage für Projekte und Aufgaben
	 */
	project: `
    Strukturiere die folgenden Projektinformationen in einen übersichtlichen Plan:
    
    1. Definiere die Projektziele und den Umfang
    2. Identifiziere die wichtigsten Aufgaben und Meilensteine
    3. Extrahiere erwähnte Ressourcen und Anforderungen
    4. Erkenne potenzielle Herausforderungen oder Risiken
    
    Formatiere als Projektübersicht in Markdown.
    
    Projektinformationen: {{transcript}}
  `,

	/**
	 * Vorlage für Forschung und Analyse
	 */
	research: `
    Analysiere den folgenden Forschungs- oder Analysetext:
    
    1. Fasse die Haupterkenntnisse oder Thesen zusammen
    2. Extrahiere wichtige Daten, Statistiken oder Beweise
    3. Identifiziere die Methodik oder den Ansatz, falls erwähnt
    4. Notiere Schlussfolgerungen oder Empfehlungen
    
    Strukturiere deine Antwort als analytische Zusammenfassung in Markdown.
    
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
};

module.exports = templates;
