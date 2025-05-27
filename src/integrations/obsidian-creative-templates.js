/**
 * Erweiterte Obsidian-Templates für Kreativ-Agenturen
 * Optimiert für Archivierung und Wissensmanagement
 */

const CREATIVE_OBSIDIAN_TEMPLATES = {
  creative_briefing: `# 🎯 {{title}}

## 📊 Projekt-Kontext
**Kunde:** {{client}}
**Marke:** {{brand}}
**Projekt-Typ:** {{project_type}}
**Status:** {{status}}
**Datum:** {{created_at}}

## 🎨 Creative Brief
### Zielgruppe
{{target_audience}}

### Key Message
{{key_message}}

### Design-Anforderungen
- **Stil:** {{design_style}}
- **Farben:** {{colors}}
- **Typografie:** {{typography}}
- **Format:** {{format_requirements}}

## 📦 Deliverables
{{deliverables}}

## ⏰ Timeline
{{timeline}}

## 💡 Kreative Inspiration
{{inspiration_sources}}

## 📝 Meeting-Notizen
{{transcript}}

{{#if entities.length}}
## 🔗 Verknüpfte Konzepte
{{#each entityEmojis}}
- {{value}} [[{{@key}}]]
{{/each}}
{{/if}}

---
**Tags:** #kreativ-briefing #{{client_slug}} #{{project_slug}} #otto
**Erstellt:** {{created_at}}
**Sprache:** {{language}}
`,

  design_review: `# 🔍 {{title}}

## 📋 Review-Kontext
**Projekt:** [[{{project_name}}]]
**Review-Datum:** {{created_at}}
**Teilnehmer:** {{participants}}
**Review-Phase:** {{review_phase}}

## 🎨 Präsentierte Designs
### Version {{version_number}}
{{presented_designs}}

## 📊 Feedback-Kategorien

### ✅ Positive Aspekte
{{positive_feedback}}

### ⚠️ Verbesserungsbedarf
{{improvement_areas}}

### 🆕 Neue Ideen & Varianten
{{new_ideas}}

### 🎯 Brand Alignment
{{brand_feedback}}

## 🚀 Action Items
{{action_items}}

### Verantwortlichkeiten
{{responsibilities}}

### Timeline Updates
{{timeline_updates}}

## 📝 Vollständiges Review-Protokoll
{{transcript}}

{{#if entities.length}}
## 🔗 Diskutierte Konzepte
{{#each entityEmojis}}
- {{value}} [[{{@key}}]]
{{/each}}
{{/if}}

## 📈 Learnings für zukünftige Reviews
{{learnings}}

---
**Tags:** #design-review #{{project_slug}} #feedback #iteration #otto
**Review-Phase:** {{review_phase}}
**Nächster Review:** {{next_review}}
**Erstellt:** {{created_at}}
`,

  creative_brainstorming: `# 💡 {{title}}

## 🎯 Creative Challenge
{{creative_challenge}}

## 🌟 Ideensammlung

### 🔥 Top-Ideen
{{top_ideas}}

### 🚀 Quick Wins
{{quick_wins}}

### 🌟 Big Bets
{{big_bets}}

### 🔬 Erforschungsbedarf
{{research_needed}}

## ✨ Inspiration & Referenzen
{{inspiration_sources}}

### Benchmarks
{{benchmarks}}

### Trends
{{relevant_trends}}

## 🎨 Kreative Ansätze
{{creative_approaches}}

## 🛠️ Prototyping-Kandidaten
{{prototyping_candidates}}

## 📝 Session-Protokoll
{{transcript}}

{{#if entities.length}}
## 🔗 Relevante Konzepte
{{#each entityEmojis}}
- {{value}} [[{{@key}}]]
{{/each}}
{{/if}}

## 📋 Nächste Schritte
{{next_steps}}

### Prioritäten
1. {{priority_1}}
2. {{priority_2}}
3. {{priority_3}}

---
**Tags:** #brainstorming #ideation #{{challenge_slug}} #innovation #otto
**Challenge:** {{challenge_type}}
**Session-Typ:** {{session_type}}
**Erstellt:** {{created_at}}
`,

  client_presentation: `# 📊 {{title}}

## 🎯 Präsentations-Kontext
**Kunde:** [[{{client_name}}]]
**Projekt:** [[{{project_name}}]]
**Präsentations-Typ:** {{presentation_type}}
**Datum:** {{created_at}}
**Teilnehmer:** {{participants}}

## 📈 Präsentierte Lösungen
{{presented_solutions}}

### Key Messages
{{key_messages}}

### Lösungsansätze
{{solution_approaches}}

## 💬 Client Feedback
### Direkte Reaktionen
{{client_reactions}}

### Positive Aspekte
{{positive_client_feedback}}

### Bedenken & Fragen
{{client_concerns}}

## ❓ Q&A Session
{{qa_session}}

### Wichtige Diskussionspunkte
{{discussion_points}}

## ✅ Entscheidungen
{{decisions_made}}

### Freigaben
{{approvals}}

### Änderungswünsche
{{change_requests}}

## 🚀 Follow-up Actions
{{followup_actions}}

### Timeline
{{updated_timeline}}

## 📝 Vollständiges Präsentations-Protokoll
{{transcript}}

{{#if entities.length}}
## 🔗 Diskutierte Themen
{{#each entityEmojis}}
- {{value}} [[{{@key}}]]
{{/each}}
{{/if}}

## 📊 Success Metrics
{{success_metrics}}

---
**Tags:** #client-presentation #{{client_slug}} #{{project_slug}} #pitch #otto
**Presentation-Status:** {{presentation_status}}
**Next Steps:** {{immediate_next_steps}}
**Erstellt:** {{created_at}}
`,

  brand_workshop: `# 🏷️ {{title}}

## 💎 Brand Essence
### Mission
{{brand_mission}}

### Vision
{{brand_vision}}

### Core Values
{{brand_values}}

## 👥 Zielgruppen-Definition
### Primary Persona
{{primary_persona}}

### Secondary Personas
{{secondary_personas}}

### User Journey Insights
{{user_journey}}

## 🎭 Brand Personality
### Tonalität
{{brand_tone}}

### Charakteristika
{{brand_characteristics}}

### Emotionale Wirkung
{{emotional_impact}}

## 🎨 Visual Identity
### Farbpalette
{{color_palette}}

### Typografie
{{typography_choices}}

### Bildsprache
{{visual_language}}

### Logo-Konzepte
{{logo_concepts}}

## 📱 Touchpoint-Strategie
{{touchpoint_strategy}}

### Digitale Kanäle
{{digital_channels}}

### Physische Touchpoints
{{physical_touchpoints}}

## ⚡ Differenzierung
### Unique Selling Points
{{unique_selling_points}}

### Competitive Advantages
{{competitive_advantages}}

### Market Positioning
{{market_positioning}}

## 📝 Workshop-Protokoll
{{transcript}}

{{#if entities.length}}
## 🔗 Brand-Konzepte
{{#each entityEmojis}}
- {{value}} [[{{@key}}]]
{{/each}}
{{/if}}

## 🏗️ Brand Architecture
{{brand_architecture}}

### Sub-Brands
{{sub_brands}}

### Brand Extensions
{{brand_extensions}}

## 📋 Implementation Roadmap
{{implementation_roadmap}}

---
**Tags:** #brand-workshop #brand-strategy #{{brand_slug}} #positioning #otto
**Workshop-Phase:** {{workshop_phase}}
**Brand-Maturity:** {{brand_maturity}}
**Erstellt:** {{created_at}}
`,

  project_postmortem: `# 📊 {{title}}

## 📈 Projekt-Übersicht
**Projekt:** [[{{project_name}}]]
**Kunde:** [[{{client_name}}]]
**Projekt-Typ:** {{project_type}}
**Laufzeit:** {{project_duration}}
**Team-Größe:** {{team_size}}
**Budget:** {{project_budget}}

## ✅ Projekterfolg
### KPI-Performance
{{kpi_performance}}

### Zielerreichung
{{goal_achievement}}

### Client Satisfaction
{{client_satisfaction}}

## 🌟 Was lief gut
{{what_went_well}}

### Erfolgreiche Prozesse
{{successful_processes}}

### Team-Stärken
{{team_strengths}}

### Tool-Effektivität
{{effective_tools}}

## ⚠️ Herausforderungen
{{challenges_faced}}

### Process-Probleme
{{process_issues}}

### Resource-Constraints
{{resource_constraints}}

### Communication-Gaps
{{communication_gaps}}

## 🔧 Lösungsansätze
{{solution_approaches}}

### Implementierte Fixes
{{implemented_fixes}}

### Workarounds
{{workarounds}}

## 👥 Team-Performance
### Individual Highlights
{{individual_highlights}}

### Collaboration-Qualität
{{collaboration_quality}}

### Skill-Entwicklung
{{skill_development}}

## 🤝 Client-Relationship
### Relationship-Qualität
{{relationship_quality}}

### Communication-Effectiveness
{{communication_effectiveness}}

### Feedback-Loops
{{feedback_loops}}

## 📚 Key Learnings
{{key_learnings}}

### Process-Learnings
{{process_learnings}}

### Technical-Learnings
{{technical_learnings}}

### Creative-Learnings
{{creative_learnings}}

## 🚀 Handlungsempfehlungen
{{action_recommendations}}

### Für ähnliche Projekte
{{recommendations_similar_projects}}

### Für Team-Entwicklung
{{recommendations_team_development}}

### Für Tool-Stack
{{recommendations_tools}}

## 📝 Vollständiges Post-Mortem-Protokoll
{{transcript}}

{{#if entities.length}}
## 🔗 Relevante Themen
{{#each entityEmojis}}
- {{value}} [[{{@key}}]]
{{/each}}
{{/if}}

## 📋 Follow-up Actions
{{followup_actions}}

### Process-Improvements
{{process_improvements}}

### Training-Needs
{{training_needs}}

### Documentation-Updates
{{documentation_updates}}

---
**Tags:** #post-mortem #{{project_slug}} #{{client_slug}} #learnings #process-improvement #otto
**Projekt-Status:** {{project_status}}
**Success-Rating:** {{success_rating}}
**Erstellt:** {{created_at}}
`,

  workflow_optimization: `# ⚙️ {{title}}

## 📊 Current State Analysis
### Aktuelle Tools
{{current_tools}}

### Bestehende Prozesse
{{current_processes}}

### Team-Workflows
{{team_workflows}}

## 🚧 Identifizierte Bottlenecks
{{bottlenecks}}

### Zeitfresser
{{time_wasters}}

### Reibungspunkte
{{friction_points}}

### Manual Tasks
{{manual_tasks}}

## 🔍 Tool-Evaluierung
### Evaluierte Lösungen
{{evaluated_solutions}}

### Vor- und Nachteile
{{pros_and_cons}}

### Cost-Benefit-Analyse
{{cost_benefit_analysis}}

## 🚀 Optimierungsvorschläge
{{optimization_proposals}}

### Process-Automation
{{process_automation}}

### Tool-Integrationen
{{tool_integrations}}

### Workflow-Vereinfachungen
{{workflow_simplifications}}

## 👥 Change Management
### Team-Adoption-Strategie
{{adoption_strategy}}

### Training-Requirements
{{training_requirements}}

### Rollout-Plan
{{rollout_plan}}

## 📈 Expected ROI
{{expected_roi}}

### Effizienz-Gewinne
{{efficiency_gains}}

### Zeitersparnis
{{time_savings}}

### Quality-Improvements
{{quality_improvements}}

## 📊 Success Metrics
{{success_metrics}}

### KPIs
{{workflow_kpis}}

### Measurement-Methods
{{measurement_methods}}

## 📝 Diskussions-Protokoll
{{transcript}}

{{#if entities.length}}
## 🔗 Relevante Tools & Konzepte
{{#each entityEmojis}}
- {{value}} [[{{@key}}]]
{{/each}}
{{/if}}

## 📋 Implementation Timeline
{{implementation_timeline}}

### Phase 1: {{phase_1}}
### Phase 2: {{phase_2}}
### Phase 3: {{phase_3}}

## 🎯 Next Steps
{{next_steps}}

---
**Tags:** #workflow-optimization #process-improvement #efficiency #{{workflow_type}} #otto
**Optimization-Scope:** {{optimization_scope}}
**Priority-Level:** {{priority_level}}
**Erstellt:** {{created_at}}
`
};

/**
 * Template-Selector für Obsidian Creative Templates
 */
const obsidianCreativeSelector = {
  selectTemplate(content, summary, templateType) {
    // Direkte Template-Zuordnung basierend auf templateType
    if (CREATIVE_OBSIDIAN_TEMPLATES[templateType]) {
      return CREATIVE_OBSIDIAN_TEMPLATES[templateType];
    }
    
    // Fallback zu Content-basierter Erkennung
    const combinedContent = (content + " " + summary).toLowerCase();
    
    if (this.hasKeywords(combinedContent, ['briefing', 'kunde', 'kampagne', 'deliverables'])) {
      return CREATIVE_OBSIDIAN_TEMPLATES.creative_briefing;
    }
    
    if (this.hasKeywords(combinedContent, ['review', 'feedback', 'iteration', 'design'])) {
      return CREATIVE_OBSIDIAN_TEMPLATES.design_review;
    }
    
    if (this.hasKeywords(combinedContent, ['brainstorming', 'ideen', 'innovation', 'kreativ'])) {
      return CREATIVE_OBSIDIAN_TEMPLATES.creative_brainstorming;
    }
    
    if (this.hasKeywords(combinedContent, ['präsentation', 'client', 'pitch', 'proposal'])) {
      return CREATIVE_OBSIDIAN_TEMPLATES.client_presentation;
    }
    
    if (this.hasKeywords(combinedContent, ['brand', 'marke', 'identity', 'positioning'])) {
      return CREATIVE_OBSIDIAN_TEMPLATES.brand_workshop;
    }
    
    if (this.hasKeywords(combinedContent, ['post-mortem', 'abschluss', 'learnings', 'retrospective'])) {
      return CREATIVE_OBSIDIAN_TEMPLATES.project_postmortem;
    }
    
    if (this.hasKeywords(combinedContent, ['workflow', 'prozess', 'optimization', 'efficiency'])) {
      return CREATIVE_OBSIDIAN_TEMPLATES.workflow_optimization;
    }
    
    // Default fallback
    return CREATIVE_OBSIDIAN_TEMPLATES.creative_briefing;
  },

  hasKeywords(content, keywords) {
    let matchCount = 0;
    for (const keyword of keywords) {
      if (content.includes(keyword)) {
        matchCount++;
        if (matchCount >= 2) return true;
      }
    }
    return false;
  },

  /**
   * Extrahiert strukturierte Daten aus dem Content für Template-Variablen
   */
  extractTemplateData(content, summary, templateType, entities = [], entityEmojis = {}) {
    const baseData = {
      title: this.generateTitle(content, templateType),
      transcript: content,
      summary: summary,
      created_at: new Date().toLocaleString('de-DE'),
      entities: entities,
      entityEmojis: entityEmojis,
      language: 'Deutsch'
    };

    // Template-spezifische Datenextraktion
    switch (templateType) {
      case 'creative_briefing':
        return {
          ...baseData,
          ...this.extractBriefingData(content)
        };
      
      case 'design_review':
        return {
          ...baseData,
          ...this.extractReviewData(content)
        };
      
      case 'creative_brainstorming':
        return {
          ...baseData,
          ...this.extractBrainstormingData(content)
        };
      
      case 'client_presentation':
        return {
          ...baseData,
          ...this.extractPresentationData(content)
        };
      
      case 'brand_workshop':
        return {
          ...baseData,
          ...this.extractBrandData(content)
        };
      
      case 'project_postmortem':
        return {
          ...baseData,
          ...this.extractPostMortemData(content)
        };
      
      case 'workflow_optimization':
        return {
          ...baseData,
          ...this.extractWorkflowData(content)
        };
      
      default:
        return baseData;
    }
  },

  generateTitle(content, templateType) {
    const date = new Date().toLocaleDateString('de-DE');
    const typeEmojis = {
      'creative_briefing': '🎯',
      'design_review': '🔍',
      'creative_brainstorming': '💡',
      'client_presentation': '📊',
      'brand_workshop': '🏷️',
      'project_postmortem': '📊',
      'workflow_optimization': '⚙️'
    };
    
    const emoji = typeEmojis[templateType] || '📝';
    const typeNames = {
      'creative_briefing': 'Creative Briefing',
      'design_review': 'Design Review',
      'creative_brainstorming': 'Brainstorming Session',
      'client_presentation': 'Client Presentation',
      'brand_workshop': 'Brand Workshop',
      'project_postmortem': 'Project Post-Mortem',
      'workflow_optimization': 'Workflow Optimization'
    };
    
    const typeName = typeNames[templateType] || 'Meeting';
    return `${emoji} ${typeName} - ${date}`;
  },

  extractBriefingData(content) {
    return {
      client: this.findPattern(content, /(?:kunde|client):\s*([^\n]+)/i) || 'TBD',
      brand: this.findPattern(content, /(?:marke|brand):\s*([^\n]+)/i) || 'TBD',
      project_type: this.findPattern(content, /(?:projekt|project|kampagne):\s*([^\n]+)/i) || 'TBD',
      target_audience: this.findPattern(content, /(?:zielgruppe|target|audience):\s*([^\n]+)/i) || 'TBD',
      key_message: this.findPattern(content, /(?:botschaft|message):\s*([^\n]+)/i) || 'TBD',
      deliverables: this.findPattern(content, /(?:deliverable|asset|format):\s*([^\n]+)/i) || 'TBD',
      timeline: this.findPattern(content, /(?:timeline|deadline|termin):\s*([^\n]+)/i) || 'TBD',
      status: 'In Bearbeitung',
      client_slug: this.slugify(this.findPattern(content, /(?:kunde|client):\s*([^\n]+)/i) || 'client'),
      project_slug: this.slugify(this.findPattern(content, /(?:projekt|project):\s*([^\n]+)/i) || 'project')
    };
  },

  extractReviewData(content) {
    return {
      project_name: this.findPattern(content, /(?:projekt|project):\s*([^\n]+)/i) || 'Current Project',
      review_phase: this.findPattern(content, /(?:phase|version):\s*([^\n]+)/i) || 'Concept Review',
      participants: this.findPattern(content, /(?:teilnehmer|participants):\s*([^\n]+)/i) || 'Team',
      positive_feedback: this.extractSentences(content, ['gut', 'gefällt', 'super', 'perfekt']),
      improvement_areas: this.extractSentences(content, ['ändern', 'anpassen', 'verbessern', 'problem']),
      next_review: 'TBD',
      project_slug: this.slugify(this.findPattern(content, /(?:projekt|project):\s*([^\n]+)/i) || 'project')
    };
  },

  extractBrainstormingData(content) {
    return {
      creative_challenge: this.findPattern(content, /(?:challenge|herausforderung|aufgabe):\s*([^\n]+)/i) || 'Creative Challenge',
      top_ideas: this.extractSentences(content, ['idee', 'konzept', 'ansatz']).slice(0, 5).join('\n- '),
      inspiration_sources: this.extractSentences(content, ['inspiration', 'referenz', 'beispiel']).slice(0, 3).join('\n- '),
      next_steps: this.extractSentences(content, ['nächste', 'schritte', 'action', 'todo']).slice(0, 3).join('\n- '),
      challenge_slug: this.slugify(this.findPattern(content, /(?:challenge|herausforderung):\s*([^\n]+)/i) || 'challenge'),
      session_type: 'Creative Brainstorming'
    };
  },

  extractPresentationData(content) {
    return {
      client_name: this.findPattern(content, /(?:kunde|client):\s*([^\n]+)/i) || 'Client',
      project_name: this.findPattern(content, /(?:projekt|project):\s*([^\n]+)/i) || 'Project',
      presentation_type: 'Concept Presentation',
      participants: this.findPattern(content, /(?:teilnehmer|participants):\s*([^\n]+)/i) || 'Team & Client',
      client_reactions: this.extractSentences(content, ['client', 'kunde', 'feedback', 'reaktion']).slice(0, 3).join('\n- '),
      decisions_made: this.extractSentences(content, ['entscheidung', 'beschluss', 'freigabe']).slice(0, 3).join('\n- '),
      client_slug: this.slugify(this.findPattern(content, /(?:kunde|client):\s*([^\n]+)/i) || 'client'),
      project_slug: this.slugify(this.findPattern(content, /(?:projekt|project):\s*([^\n]+)/i) || 'project'),
      presentation_status: 'Completed'
    };
  },

  extractBrandData(content) {
    return {
      brand_mission: this.findPattern(content, /(?:mission|zweck):\s*([^\n]+)/i) || 'TBD',
      brand_vision: this.findPattern(content, /(?:vision|zukunft):\s*([^\n]+)/i) || 'TBD',
      brand_values: this.extractSentences(content, ['wert', 'value', 'prinzip']).slice(0, 3).join('\n- '),
      primary_persona: this.findPattern(content, /(?:zielgruppe|persona|target):\s*([^\n]+)/i) || 'TBD',
      brand_tone: this.findPattern(content, /(?:tonalität|tone|kommunikation):\s*([^\n]+)/i) || 'TBD',
      color_palette: this.findPattern(content, /(?:farbe|color|palette):\s*([^\n]+)/i) || 'TBD',
      brand_slug: this.slugify(this.findPattern(content, /(?:marke|brand):\s*([^\n]+)/i) || 'brand'),
      workshop_phase: 'Strategy Development'
    };
  },

  extractPostMortemData(content) {
    return {
      project_name: this.findPattern(content, /(?:projekt|project):\s*([^\n]+)/i) || 'Completed Project',
      client_name: this.findPattern(content, /(?:kunde|client):\s*([^\n]+)/i) || 'Client',
      what_went_well: this.extractSentences(content, ['gut', 'erfolg', 'positiv']).slice(0, 5).join('\n- '),
      challenges_faced: this.extractSentences(content, ['problem', 'schwierigkeit', 'herausforderung']).slice(0, 5).join('\n- '),
      key_learnings: this.extractSentences(content, ['lernen', 'erkenntnis', 'lesson']).slice(0, 5).join('\n- '),
      project_slug: this.slugify(this.findPattern(content, /(?:projekt|project):\s*([^\n]+)/i) || 'project'),
      client_slug: this.slugify(this.findPattern(content, /(?:kunde|client):\s*([^\n]+)/i) || 'client'),
      project_status: 'Completed',
      success_rating: '⭐⭐⭐⭐⭐'
    };
  },

  extractWorkflowData(content) {
    return {
      current_tools: this.extractSentences(content, ['tool', 'software', 'system']).slice(0, 5).join('\n- '),
      bottlenecks: this.extractSentences(content, ['bottleneck', 'problem', 'langsam']).slice(0, 3).join('\n- '),
      optimization_proposals: this.extractSentences(content, ['verbesser', 'optimier', 'effizienz']).slice(0, 5).join('\n- '),
      expected_roi: this.findPattern(content, /(?:roi|gewinn|ersparnis):\s*([^\n]+)/i) || 'TBD',
      workflow_type: this.findPattern(content, /(?:workflow|prozess):\s*([^\n]+)/i) || 'General Workflow',
      priority_level: 'High'
    };
  },

  // Hilfsmethoden
  findPattern(text, pattern) {
    const match = text.match(pattern);
    return match ? match[1].trim() : '';
  },

  extractSentences(text, keywords) {
    const sentences = text.split(/[.!?]+/);
    return sentences.filter(sentence => 
      keywords.some(keyword => 
        sentence.toLowerCase().includes(keyword.toLowerCase())
      ) && sentence.trim().length > 10
    ).map(s => s.trim());
  },

  slugify(text) {
    return text.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
};

module.exports = {
  CREATIVE_OBSIDIAN_TEMPLATES,
  obsidianCreativeSelector
};
