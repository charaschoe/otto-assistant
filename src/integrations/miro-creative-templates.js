/**
 * Erweiterte Miro-Templates für Kreativ-Agenturen
 * Optimiert für große Whiteboards/TVs und interaktive Meeting-Unterstützung
 */

const CREATIVE_MIRO_TEMPLATES = {
  CREATIVE_BRIEFING_BOARD: {
    name: "Creative Briefing Workshop",
    keywords: ["briefing", "kunde", "kampagne", "marke", "brand", "requirements", "client"],
    description: "Strukturiertes Layout für Kreativ-Briefings mit interaktiven Bereichen",
    sections: [
      // Header-Bereich mit Projekt-Info
      { 
        title: "🎯 PROJEKT BRIEFING", 
        color: "blue", 
        position: { x: 0, y: -400 },
        type: "title",
        size: "large"
      },
      
      // Kunde & Context
      { 
        title: "👤 KUNDE & KONTEXT", 
        color: "light_green", 
        position: { x: -600, y: -200 },
        type: "section_header"
      },
      { 
        title: "Kunde/Marke", 
        color: "light_green", 
        position: { x: -600, y: -120 },
        type: "input_field"
      },
      { 
        title: "Projekttyp", 
        color: "light_green", 
        position: { x: -600, y: -40 },
        type: "input_field"
      },
      
      // Zielgruppe & Botschaft
      { 
        title: "🎯 ZIELGRUPPE & BOTSCHAFT", 
        color: "light_yellow", 
        position: { x: -200, y: -200 },
        type: "section_header"
      },
      { 
        title: "Target Audience", 
        color: "light_yellow", 
        position: { x: -200, y: -120 },
        type: "input_field"
      },
      { 
        title: "Key Message", 
        color: "light_yellow", 
        position: { x: -200, y: -40 },
        type: "input_field"
      },
      
      // Design-Anforderungen
      { 
        title: "🎨 DESIGN-ANFORDERUNGEN", 
        color: "light_pink", 
        position: { x: 200, y: -200 },
        type: "section_header"
      },
      { 
        title: "Stil & Look", 
        color: "light_pink", 
        position: { x: 200, y: -120 },
        type: "input_field"
      },
      { 
        title: "Farben & Fonts", 
        color: "light_pink", 
        position: { x: 200, y: -40 },
        type: "input_field"
      },
      
      // Deliverables & Timeline
      { 
        title: "📦 DELIVERABLES", 
        color: "light_blue", 
        position: { x: 600, y: -200 },
        type: "section_header"
      },
      { 
        title: "Assets Liste", 
        color: "light_blue", 
        position: { x: 600, y: -120 },
        type: "input_field"
      },
      { 
        title: "Timeline", 
        color: "light_blue", 
        position: { x: 600, y: -40 },
        type: "input_field"
      },
      
      // Interaktive Bereiche für Live-Diskussion
      { 
        title: "💡 IDEEN & INSPIRATION", 
        color: "yellow", 
        position: { x: -400, y: 150 },
        type: "sticky_area"
      },
      { 
        title: "❓ FRAGEN & KLÄRUNGEN", 
        color: "orange", 
        position: { x: 0, y: 150 },
        type: "sticky_area"
      },
      { 
        title: "⚠️ RISIKEN & CONSTRAINTS", 
        color: "red", 
        position: { x: 400, y: 150 },
        type: "sticky_area"
      }
    ]
  },

  DESIGN_REVIEW_BOARD: {
    name: "Design Review & Feedback",
    keywords: ["design", "review", "feedback", "iteration", "version", "mockup"],
    description: "Strukturiertes Feedback-Board für Design-Reviews",
    sections: [
      // Header
      { 
        title: "🔍 DESIGN REVIEW SESSION", 
        color: "blue", 
        position: { x: 0, y: -400 },
        type: "title"
      },
      
      // Design-Versionen (Links zu den Designs)
      { 
        title: "🎨 PRÄSENTIERTE DESIGNS", 
        color: "light_green", 
        position: { x: -500, y: -200 },
        type: "section_header"
      },
      { 
        title: "Version 1", 
        color: "light_green", 
        position: { x: -500, y: -120 },
        type: "design_placeholder"
      },
      { 
        title: "Version 2", 
        color: "light_green", 
        position: { x: -500, y: -40 },
        type: "design_placeholder"
      },
      
      // Feedback-Kategorien
      { 
        title: "👍 WAS FUNKTIONIERT GUT", 
        color: "green", 
        position: { x: -150, y: -200 },
        type: "feedback_positive"
      },
      { 
        title: "👎 VERBESSERUNGSBEDARF", 
        color: "red", 
        position: { x: 150, y: -200 },
        type: "feedback_negative"
      },
      { 
        title: "💭 NEUE IDEEN & VARIANTEN", 
        color: "purple", 
        position: { x: 500, y: -200 },
        type: "feedback_ideas"
      },
      
      // Aktionsbereich
      { 
        title: "🚀 NÄCHSTE SCHRITTE", 
        color: "orange", 
        position: { x: -300, y: 100 },
        type: "action_items"
      },
      { 
        title: "⏰ TIMELINE UPDATES", 
        color: "light_blue", 
        position: { x: 0, y: 100 },
        type: "timeline"
      },
      { 
        title: "👥 VERANTWORTLICHKEITEN", 
        color: "light_yellow", 
        position: { x: 300, y: 100 },
        type: "responsibilities"
      }
    ]
  },

  CREATIVE_BRAINSTORMING_BOARD: {
    name: "Creative Brainstorming Canvas",
    keywords: ["brainstorming", "ideen", "kreativ", "innovation", "ideation"],
    description: "Offenes Canvas für kreative Ideenfindung",
    sections: [
      // Challenge Definition
      { 
        title: "🎯 CREATIVE CHALLENGE", 
        color: "red", 
        position: { x: 0, y: -400 },
        type: "challenge_statement"
      },
      
      // Inspiration Sources
      { 
        title: "✨ INSPIRATION", 
        color: "purple", 
        position: { x: -600, y: -200 },
        type: "inspiration_area"
      },
      
      // Main Ideation Space (große freie Fläche)
      { 
        title: "💡 IDEEN SAMMLUNG", 
        color: "yellow", 
        position: { x: 0, y: -100 },
        type: "large_ideation_space"
      },
      
      // Clustering Areas
      { 
        title: "🔥 TOP IDEEN", 
        color: "orange", 
        position: { x: 400, y: -200 },
        type: "top_ideas"
      },
      { 
        title: "🚀 QUICK WINS", 
        color: "green", 
        position: { x: -400, y: 200 },
        type: "quick_wins"
      },
      { 
        title: "🌟 BIG BETS", 
        color: "blue", 
        position: { x: 0, y: 200 },
        type: "big_bets"
      },
      { 
        title: "🔬 RESEARCH NEEDED", 
        color: "light_blue", 
        position: { x: 400, y: 200 },
        type: "research_needed"
      }
    ]
  },

  BRAND_WORKSHOP_BOARD: {
    name: "Brand Strategy Workshop",
    keywords: ["brand", "marke", "identity", "strategy", "positioning"],
    description: "Umfassendes Brand-Strategy-Canvas",
    sections: [
      // Header
      { 
        title: "🏷️ BRAND STRATEGY WORKSHOP", 
        color: "blue", 
        position: { x: 0, y: -500 },
        type: "title"
      },
      
      // Core Brand Elements
      { 
        title: "💎 BRAND ESSENCE", 
        color: "purple", 
        position: { x: -400, y: -350 },
        type: "brand_core"
      },
      { 
        title: "Mission", 
        color: "purple", 
        position: { x: -400, y: -280 },
        type: "input_field"
      },
      { 
        title: "Vision", 
        color: "purple", 
        position: { x: -400, y: -220 },
        type: "input_field"
      },
      { 
        title: "Values", 
        color: "purple", 
        position: { x: -400, y: -160 },
        type: "input_field"
      },
      
      // Target Audience
      { 
        title: "👥 ZIELGRUPPEN", 
        color: "green", 
        position: { x: 0, y: -350 },
        type: "audience_section"
      },
      { 
        title: "Primary Persona", 
        color: "green", 
        position: { x: 0, y: -280 },
        type: "persona_card"
      },
      { 
        title: "Secondary Persona", 
        color: "light_green", 
        position: { x: 0, y: -220 },
        type: "persona_card"
      },
      
      // Brand Personality
      { 
        title: "🎭 BRAND PERSONALITY", 
        color: "orange", 
        position: { x: 400, y: -350 },
        type: "personality_section"
      },
      { 
        title: "Tonalität", 
        color: "orange", 
        position: { x: 400, y: -280 },
        type: "input_field"
      },
      { 
        title: "Charakteristika", 
        color: "orange", 
        position: { x: 400, y: -220 },
        type: "input_field"
      },
      
      // Visual Identity
      { 
        title: "🎨 VISUAL IDENTITY", 
        color: "pink", 
        position: { x: -400, y: -50 },
        type: "visual_section"
      },
      { 
        title: "Farben", 
        color: "pink", 
        position: { x: -400, y: 20 },
        type: "color_palette"
      },
      { 
        title: "Typografie", 
        color: "pink", 
        position: { x: -400, y: 80 },
        type: "typography"
      },
      
      // Touchpoints
      { 
        title: "📱 TOUCHPOINTS", 
        color: "blue", 
        position: { x: 0, y: -50 },
        type: "touchpoints_section"
      },
      
      // Differentiation
      { 
        title: "⚡ DIFFERENZIERUNG", 
        color: "yellow", 
        position: { x: 400, y: -50 },
        type: "differentiation_section"
      },
      
      // Brand Architecture
      { 
        title: "🏗️ BRAND ARCHITECTURE", 
        color: "light_blue", 
        position: { x: 0, y: 200 },
        type: "architecture_section"
      }
    ]
  },

  SPRINT_PLANNING_BOARD: {
    name: "Creative Sprint Planning",
    keywords: ["sprint", "planning", "aufgaben", "timeline", "workflow"],
    description: "Agile Sprint-Planung für kreative Projekte",
    sections: [
      // Sprint Goal
      { 
        title: "🎯 SPRINT GOAL", 
        color: "blue", 
        position: { x: 0, y: -400 },
        type: "sprint_goal"
      },
      
      // Backlog
      { 
        title: "📋 BACKLOG", 
        color: "light_gray", 
        position: { x: -500, y: -200 },
        type: "backlog_column"
      },
      
      // Sprint Columns
      { 
        title: "📝 TO DO", 
        color: "red", 
        position: { x: -250, y: -200 },
        type: "kanban_column"
      },
      { 
        title: "🔄 IN PROGRESS", 
        color: "yellow", 
        position: { x: 0, y: -200 },
        type: "kanban_column"
      },
      { 
        title: "👀 REVIEW", 
        color: "orange", 
        position: { x: 250, y: -200 },
        type: "kanban_column"
      },
      { 
        title: "✅ DONE", 
        color: "green", 
        position: { x: 500, y: -200 },
        type: "kanban_column"
      },
      
      // Team Capacity
      { 
        title: "👥 TEAM CAPACITY", 
        color: "light_blue", 
        position: { x: -300, y: 200 },
        type: "team_section"
      },
      
      // Impediments
      { 
        title: "🚫 IMPEDIMENTS", 
        color: "red", 
        position: { x: 0, y: 200 },
        type: "impediments_section"
      },
      
      // Definition of Done
      { 
        title: "✅ DEFINITION OF DONE", 
        color: "green", 
        position: { x: 300, y: 200 },
        type: "dod_section"
      }
    ]
  },

  CLIENT_PRESENTATION_BOARD: {
    name: "Client Presentation Setup",
    keywords: ["präsentation", "pitch", "client", "proposal", "stakeholder"],
    description: "Vorbereitungs-Board für Kundenpräsentationen",
    sections: [
      // Presentation Flow
      { 
        title: "📊 PRESENTATION FLOW", 
        color: "blue", 
        position: { x: 0, y: -400 },
        type: "presentation_header"
      },
      
      // Key Messages
      { 
        title: "🎯 KEY MESSAGES", 
        color: "green", 
        position: { x: -400, y: -200 },
        type: "key_messages"
      },
      
      // Presented Solutions
      { 
        title: "💡 LÖSUNGSANSÄTZE", 
        color: "yellow", 
        position: { x: 0, y: -200 },
        type: "solutions_section"
      },
      
      // Q&A Preparation
      { 
        title: "❓ Q&A VORBEREITUNG", 
        color: "orange", 
        position: { x: 400, y: -200 },
        type: "qa_section"
      },
      
      // Live Feedback Capture
      { 
        title: "💬 CLIENT FEEDBACK (LIVE)", 
        color: "pink", 
        position: { x: -200, y: 100 },
        type: "live_feedback"
      },
      
      // Next Steps
      { 
        title: "🚀 NEXT STEPS", 
        color: "light_blue", 
        position: { x: 200, y: 100 },
        type: "next_steps"
      }
    ]
  }
};

/**
 * Template-Auswahl für kreative Meetings
 */
const creativeMiroSelector = {
  selectTemplate(content, summary, options = {}) {
    const combinedContent = (content + " " + summary).toLowerCase();
    
    // Priorisierte Template-Erkennung
    for (const [templateKey, template] of Object.entries(CREATIVE_MIRO_TEMPLATES)) {
      let score = 0;
      
      for (const keyword of template.keywords) {
        if (combinedContent.includes(keyword)) {
          score++;
        }
      }
      
      // Bonus für Meeting-Typ im Options
      if (options.meetingType === templateKey.toLowerCase()) {
        score += 5;
      }
      
      // Mindest-Score für Template-Auswahl
      if (score >= 2) {
        console.log(`🎯 Miro Template gewählt: ${template.name} (Score: ${score})`);
        return template;
      }
    }
    
    // Default Fallback
    console.log("🎯 Miro Template: Creative Briefing (Default)");
    return CREATIVE_MIRO_TEMPLATES.CREATIVE_BRIEFING_BOARD;
  },

  /**
   * Erstellt Template-spezifische Inhalte für verschiedene Sticky-Bereiche
   */
  getTemplateSpecificContent(template, transcript, summary, entities) {
    const content = {
      sections: [],
      interactions: []
    };

    switch (template.name) {
      case "Creative Briefing Workshop":
        content.sections.push(
          ...this.createBriefingContent(transcript, summary, entities)
        );
        break;
        
      case "Design Review & Feedback":
        content.sections.push(
          ...this.createReviewContent(transcript, summary, entities)
        );
        break;
        
      case "Creative Brainstorming Canvas":
        content.sections.push(
          ...this.createBrainstormingContent(transcript, summary, entities)
        );
        break;
        
      case "Brand Strategy Workshop":
        content.sections.push(
          ...this.createBrandContent(transcript, summary, entities)
        );
        break;
        
      default:
        content.sections.push(
          ...this.createDefaultContent(transcript, summary, entities)
        );
    }

    return content;
  },

  createBriefingContent(transcript, summary, entities) {
    // Extrahiere spezifische Informationen für Briefing
    const briefingElements = this.extractBriefingElements(transcript);
    
    return [
      { area: "kunde_kontext", items: [briefingElements.client, briefingElements.project] },
      { area: "zielgruppe", items: [briefingElements.audience, briefingElements.message] },
      { area: "design", items: [briefingElements.style, briefingElements.colors] },
      { area: "deliverables", items: [briefingElements.assets, briefingElements.timeline] }
    ];
  },

  createReviewContent(transcript, summary, entities) {
    // Extrahiere Feedback-Kategorien
    const feedback = this.extractFeedback(transcript);
    
    return [
      { area: "positive_feedback", items: feedback.positive },
      { area: "improvement_areas", items: feedback.negative },
      { area: "new_ideas", items: feedback.ideas },
      { area: "action_items", items: feedback.actions }
    ];
  },

  createBrainstormingContent(transcript, summary, entities) {
    // Extrahiere und kategorisiere Ideen
    const ideas = this.extractIdeas(transcript);
    
    return [
      { area: "all_ideas", items: ideas.raw },
      { area: "top_ideas", items: ideas.top },
      { area: "quick_wins", items: ideas.quickWins },
      { area: "big_bets", items: ideas.bigBets }
    ];
  },

  createBrandContent(transcript, summary, entities) {
    // Extrahiere Brand-Elemente
    const brandElements = this.extractBrandElements(transcript);
    
    return [
      { area: "brand_essence", items: [brandElements.mission, brandElements.vision] },
      { area: "personality", items: brandElements.personality },
      { area: "visual_identity", items: brandElements.visual },
      { area: "touchpoints", items: brandElements.touchpoints }
    ];
  },

  createDefaultContent(transcript, summary, entities) {
    return [
      { area: "summary", items: [summary] },
      { area: "entities", items: entities.slice(0, 10) },
      { area: "actions", items: this.extractTasks(transcript) }
    ];
  },

  // Hilfsmethoden für Content-Extraktion
  extractBriefingElements(text) {
    // Vereinfachte Extraktion - könnte durch NLP erweitert werden
    return {
      client: this.findPattern(text, /(?:kunde|client|marke|brand):\s*([^\n]+)/i),
      project: this.findPattern(text, /(?:projekt|project|kampagne):\s*([^\n]+)/i),
      audience: this.findPattern(text, /(?:zielgruppe|target|audience):\s*([^\n]+)/i),
      message: this.findPattern(text, /(?:botschaft|message|kommunikation):\s*([^\n]+)/i),
      style: this.findPattern(text, /(?:stil|style|look):\s*([^\n]+)/i),
      colors: this.findPattern(text, /(?:farbe|color|palette):\s*([^\n]+)/i),
      assets: this.findPattern(text, /(?:asset|deliverable|format):\s*([^\n]+)/i),
      timeline: this.findPattern(text, /(?:timeline|deadline|termin):\s*([^\n]+)/i)
    };
  },

  extractFeedback(text) {
    const sentences = text.split(/[.!?]+/);
    return {
      positive: sentences.filter(s => 
        s.toLowerCase().includes('gut') || 
        s.toLowerCase().includes('gefällt') ||
        s.toLowerCase().includes('super')
      ).slice(0, 3),
      negative: sentences.filter(s => 
        s.toLowerCase().includes('nicht') || 
        s.toLowerCase().includes('problem') ||
        s.toLowerCase().includes('ändern')
      ).slice(0, 3),
      ideas: sentences.filter(s => 
        s.toLowerCase().includes('idee') || 
        s.toLowerCase().includes('vorschlag') ||
        s.toLowerCase().includes('alternativ')
      ).slice(0, 3),
      actions: sentences.filter(s => 
        s.toLowerCase().includes('muss') || 
        s.toLowerCase().includes('soll') ||
        s.toLowerCase().includes('todo')
      ).slice(0, 3)
    };
  },

  extractIdeas(text) {
    const sentences = text.split(/[.!?]+/);
    const ideas = sentences.filter(s => 
      s.length > 10 && s.length < 100 &&
      (s.toLowerCase().includes('idee') || 
       s.toLowerCase().includes('konzept') ||
       s.toLowerCase().includes('ansatz'))
    );
    
    return {
      raw: ideas,
      top: ideas.slice(0, 5),
      quickWins: ideas.filter(i => 
        i.toLowerCase().includes('einfach') || 
        i.toLowerCase().includes('schnell')
      ).slice(0, 3),
      bigBets: ideas.filter(i => 
        i.toLowerCase().includes('innovation') || 
        i.toLowerCase().includes('revolutionär')
      ).slice(0, 3)
    };
  },

  extractBrandElements(text) {
    return {
      mission: this.findPattern(text, /(?:mission|zweck|purpose):\s*([^\n]+)/i),
      vision: this.findPattern(text, /(?:vision|zukunft|future):\s*([^\n]+)/i),
      personality: text.split(/[.!?]+/).filter(s => 
        s.toLowerCase().includes('charakter') || 
        s.toLowerCase().includes('persönlichkeit')
      ).slice(0, 3),
      visual: text.split(/[.!?]+/).filter(s => 
        s.toLowerCase().includes('farbe') || 
        s.toLowerCase().includes('design') ||
        s.toLowerCase().includes('logo')
      ).slice(0, 3),
      touchpoints: text.split(/[.!?]+/).filter(s => 
        s.toLowerCase().includes('kanal') || 
        s.toLowerCase().includes('medium') ||
        s.toLowerCase().includes('plattform')
      ).slice(0, 3)
    };
  },

  extractTasks(text) {
    const taskPatterns = [
      /(?:aufgabe|task|todo):\s*([^\n]+)/gi,
      /(?:muss|soll|wird):\s*([^\n]+)/gi,
      /(?:action|handlung):\s*([^\n]+)/gi
    ];
    
    const tasks = [];
    for (const pattern of taskPatterns) {
      const matches = [...text.matchAll(pattern)];
      tasks.push(...matches.map(m => m[1].trim()));
    }
    
    return tasks.slice(0, 8);
  },

  findPattern(text, pattern) {
    const match = text.match(pattern);
    return match ? match[1].trim() : '';
  }
};

module.exports = {
  CREATIVE_MIRO_TEMPLATES,
  creativeMiroSelector
};
