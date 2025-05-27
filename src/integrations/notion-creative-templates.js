/**
 * Erweiterte Notion-Templates für Kreativ-Agenturen
 * Optimiert für strukturierte Archivierung und Projektmanagement
 */

const CREATIVE_NOTION_TEMPLATES = {
  creative_briefing: {
    name: "Creative Briefing Database",
    properties: {
      "Name": { type: "title" },
      "Client": { type: "rich_text" },
      "Brand": { type: "rich_text" },
      "Project Type": { type: "select", options: ["Campaign", "Brand Identity", "Website", "Print", "Digital", "Video", "Event"] },
      "Status": { type: "select", options: ["Briefing", "Concept", "Execution", "Review", "Completed", "On Hold"] },
      "Priority": { type: "select", options: ["High", "Medium", "Low"] },
      "Budget Range": { type: "select", options: ["< 10k", "10-50k", "50-100k", "100k+", "TBD"] },
      "Target Audience": { type: "rich_text" },
      "Key Message": { type: "rich_text" },
      "Deliverables": { type: "multi_select", options: ["Logo", "Website", "Print Ads", "Digital Ads", "Social Media", "Video", "Packaging", "Brand Guidelines"] },
      "Timeline": { type: "date" },
      "Team": { type: "multi_select", options: ["Creative Director", "Art Director", "Copywriter", "Designer", "Developer", "Project Manager"] },
      "Tags": { type: "multi_select" },
      "Created": { type: "created_time" },
      "Last Edited": { type: "last_edited_time" }
    },
    content: `
# Creative Brief

## Project Overview
**Client:** {Client}
**Brand:** {Brand}
**Project Type:** {Project Type}
**Status:** {Status}

## Creative Challenge
{Key Message}

## Target Audience
{Target Audience}

## Deliverables & Timeline
{Deliverables}
**Deadline:** {Timeline}

## Team & Resources
{Team}

## Meeting Notes
{transcript}

---
*Archived from Otto Assistant - {created_at}*
    `
  },

  design_review: {
    name: "Design Review Archive",
    properties: {
      "Name": { type: "title" },
      "Project": { type: "relation", database: "Projects" },
      "Client": { type: "rollup", property: "Client" },
      "Review Phase": { type: "select", options: ["Concept", "Design Development", "Final Review", "Client Presentation"] },
      "Review Date": { type: "date" },
      "Participants": { type: "multi_select" },
      "Feedback Status": { type: "select", options: ["Positive", "Minor Changes", "Major Revisions", "Rejected"] },
      "Version": { type: "number" },
      "Next Review": { type: "date" },
      "Action Items": { type: "rich_text" },
      "Tags": { type: "multi_select" },
      "Created": { type: "created_time" }
    },
    content: `
# Design Review Session

## Review Context
**Project:** {Project}
**Phase:** {Review Phase}
**Date:** {Review Date}
**Version:** {Version}

## Participants
{Participants}

## Feedback Summary

### ✅ Positive Feedback
{positive_feedback}

### ⚠️ Required Changes
{required_changes}

### 💡 New Ideas
{new_ideas}

## Action Items
{Action Items}

**Next Review:** {Next Review}

## Full Meeting Transcript
{transcript}

---
*Design Review archived from Otto Assistant - {created_at}*
    `
  },

  creative_brainstorming: {
    name: "Creative Ideas Archive",
    properties: {
      "Name": { type: "title" },
      "Challenge": { type: "rich_text" },
      "Session Type": { type: "select", options: ["Initial Brainstorming", "Concept Development", "Problem Solving", "Innovation Workshop"] },
      "Participants": { type: "multi_select" },
      "Session Date": { type: "date" },
      "Ideas Count": { type: "number" },
      "Top Ideas": { type: "rich_text" },
      "Next Steps": { type: "rich_text" },
      "Innovation Level": { type: "select", options: ["Incremental", "Radical", "Breakthrough"] },
      "Feasibility": { type: "select", options: ["High", "Medium", "Low", "Research Needed"] },
      "Client": { type: "rich_text" },
      "Project": { type: "rich_text" },
      "Tags": { type: "multi_select" },
      "Created": { type: "created_time" }
    },
    content: `
# Creative Brainstorming Session

## Creative Challenge
{Challenge}

## Session Overview
**Type:** {Session Type}
**Date:** {Session Date}
**Participants:** {Participants}

## Generated Ideas
**Total Ideas:** {Ideas Count}

### 🔥 Top Ideas
{Top Ideas}

### 🚀 Quick Wins
{quick_wins}

### 🌟 Big Bets
{big_bets}

## Innovation Assessment
**Level:** {Innovation Level}
**Feasibility:** {Feasibility}

## Next Steps
{Next Steps}

## Full Session Transcript
{transcript}

---
*Brainstorming session archived from Otto Assistant - {created_at}*
    `
  },

  client_presentation: {
    name: "Client Presentations Archive",
    properties: {
      "Name": { type: "title" },
      "Client": { type: "rich_text" },
      "Project": { type: "relation", database: "Projects" },
      "Presentation Type": { type: "select", options: ["Initial Pitch", "Concept Presentation", "Design Review", "Final Presentation"] },
      "Date": { type: "date" },
      "Attendees": { type: "multi_select" },
      "Outcome": { type: "select", options: ["Approved", "Approved with Changes", "Needs Revision", "Rejected", "Pending Decision"] },
      "Client Satisfaction": { type: "select", options: ["Very High", "High", "Medium", "Low", "Very Low"] },
      "Follow-up Required": { type: "checkbox" },
      "Next Meeting": { type: "date" },
      "Revenue Impact": { type: "select", options: ["High", "Medium", "Low", "TBD"] },
      "Tags": { type: "multi_select" },
      "Created": { type: "created_time" }
    },
    content: `
# Client Presentation

## Presentation Details
**Client:** {Client}
**Project:** {Project}
**Type:** {Presentation Type}
**Date:** {Date}

## Attendees
{Attendees}

## Presented Solutions
{presented_solutions}

### Key Messages
{key_messages}

## Client Feedback
**Overall Satisfaction:** {Client Satisfaction}
**Outcome:** {Outcome}

### Client Reactions
{client_reactions}

### Decisions Made
{decisions}

## Follow-up Actions
**Follow-up Required:** {Follow-up Required}
**Next Meeting:** {Next Meeting}

## Full Presentation Transcript
{transcript}

---
*Client presentation archived from Otto Assistant - {created_at}*
    `
  },

  brand_workshop: {
    name: "Brand Strategy Archive",
    properties: {
      "Name": { type: "title" },
      "Brand": { type: "rich_text" },
      "Client": { type: "rich_text" },
      "Workshop Type": { type: "select", options: ["Brand Strategy", "Brand Identity", "Brand Positioning", "Brand Refresh", "New Brand"] },
      "Workshop Date": { type: "date" },
      "Facilitator": { type: "rich_text" },
      "Participants": { type: "multi_select" },
      "Brand Maturity": { type: "select", options: ["Startup", "Growing", "Established", "Mature", "Legacy"] },
      "Market Position": { type: "select", options: ["Leader", "Challenger", "Follower", "Niche"] },
      "Brand Values": { type: "multi_select" },
      "Target Segments": { type: "multi_select" },
      "Implementation Phase": { type: "select", options: ["Strategy", "Design", "Implementation", "Launch", "Monitoring"] },
      "Tags": { type: "multi_select" },
      "Created": { type: "created_time" }
    },
    content: `
# Brand Strategy Workshop

## Brand Overview
**Brand:** {Brand}
**Client:** {Client}
**Workshop Type:** {Workshop Type}
**Date:** {Workshop Date}

## Brand Essence
### Mission
{brand_mission}

### Vision
{brand_vision}

### Core Values
{Brand Values}

## Target Audience
**Segments:** {Target Segments}

### Primary Persona
{primary_persona}

## Brand Positioning
**Market Position:** {Market Position}
**Differentiation:** {differentiation}

## Visual Identity Direction
{visual_identity}

## Implementation Roadmap
**Current Phase:** {Implementation Phase}
{implementation_plan}

## Full Workshop Transcript
{transcript}

---
*Brand workshop archived from Otto Assistant - {created_at}*
    `
  },

  project_postmortem: {
    name: "Project Learnings Archive",
    properties: {
      "Name": { type: "title" },
      "Project": { type: "relation", database: "Projects" },
      "Client": { type: "rollup", property: "Client" },
      "Project Type": { type: "rollup", property: "Type" },
      "Success Rating": { type: "select", options: ["Excellent", "Good", "Satisfactory", "Poor", "Failed"] },
      "Client Satisfaction": { type: "select", options: ["Very High", "High", "Medium", "Low", "Very Low"] },
      "Team Performance": { type: "select", options: ["Excellent", "Good", "Average", "Below Average", "Poor"] },
      "Budget Performance": { type: "select", options: ["Under Budget", "On Budget", "Over Budget"] },
      "Timeline Performance": { type: "select", options: ["Early", "On Time", "Delayed"] },
      "Key Learnings": { type: "rich_text" },
      "Process Improvements": { type: "rich_text" },
      "Tool Recommendations": { type: "multi_select" },
      "Skill Gaps": { type: "multi_select" },
      "Date Completed": { type: "date" },
      "Tags": { type: "multi_select" },
      "Created": { type: "created_time" }
    },
    content: `
# Project Post-Mortem

## Project Overview
**Project:** {Project}
**Client:** {Client}
**Completion Date:** {Date Completed}

## Success Metrics
**Overall Success:** {Success Rating}
**Client Satisfaction:** {Client Satisfaction}
**Team Performance:** {Team Performance}
**Budget:** {Budget Performance}
**Timeline:** {Timeline Performance}

## What Went Well
{what_went_well}

## Challenges Faced
{challenges}

## Key Learnings
{Key Learnings}

### Process Learnings
{process_learnings}

### Technical Learnings
{technical_learnings}

### Creative Learnings
{creative_learnings}

## Recommendations
### Process Improvements
{Process Improvements}

### Tool Recommendations
{Tool Recommendations}

### Skill Development
{Skill Gaps}

## Full Post-Mortem Discussion
{transcript}

---
*Post-mortem archived from Otto Assistant - {created_at}*
    `
  },

  workflow_optimization: {
    name: "Process Optimization Archive",
    properties: {
      "Name": { type: "title" },
      "Process Area": { type: "select", options: ["Creative Process", "Project Management", "Client Communication", "Design System", "Development", "Quality Assurance"] },
      "Current State": { type: "rich_text" },
      "Proposed Solution": { type: "rich_text" },
      "Expected ROI": { type: "select", options: ["High", "Medium", "Low", "TBD"] },
      "Implementation Effort": { type: "select", options: ["Low", "Medium", "High", "Very High"] },
      "Priority": { type: "select", options: ["Critical", "High", "Medium", "Low"] },
      "Status": { type: "select", options: ["Proposed", "Approved", "In Progress", "Pilot", "Implemented", "Rejected"] },
      "Impact Areas": { type: "multi_select", options: ["Efficiency", "Quality", "Client Satisfaction", "Team Morale", "Revenue", "Cost Reduction"] },
      "Tools Involved": { type: "multi_select" },
      "Team Members": { type: "multi_select" },
      "Implementation Date": { type: "date" },
      "Tags": { type: "multi_select" },
      "Created": { type: "created_time" }
    },
    content: `
# Workflow Optimization

## Process Area
**Focus:** {Process Area}
**Priority:** {Priority}
**Status:** {Status}

## Current State Analysis
{Current State}

### Identified Bottlenecks
{bottlenecks}

## Proposed Solution
{Proposed Solution}

### Expected Benefits
**ROI:** {Expected ROI}
**Impact Areas:** {Impact Areas}

### Implementation Requirements
**Effort:** {Implementation Effort}
**Tools:** {Tools Involved}
**Team:** {Team Members}

## Timeline
**Implementation Date:** {Implementation Date}

## Success Metrics
{success_metrics}

## Full Discussion Transcript
{transcript}

---
*Workflow optimization archived from Otto Assistant - {created_at}*
    `
  }
};

/**
 * Notion Creative Template Selector
 */
const notionCreativeSelector = {
  selectTemplate(content, summary, templateType) {
    // Direkte Zuordnung basierend auf Template-Typ
    if (CREATIVE_NOTION_TEMPLATES[templateType]) {
      return CREATIVE_NOTION_TEMPLATES[templateType];
    }
    
    // Content-basierte Erkennung als Fallback
    const combinedContent = (content + " " + summary).toLowerCase();
    
    if (this.hasKeywords(combinedContent, ['briefing', 'kunde', 'kampagne', 'deliverables'])) {
      return CREATIVE_NOTION_TEMPLATES.creative_briefing;
    }
    
    if (this.hasKeywords(combinedContent, ['review', 'feedback', 'iteration', 'design'])) {
      return CREATIVE_NOTION_TEMPLATES.design_review;
    }
    
    if (this.hasKeywords(combinedContent, ['brainstorming', 'ideen', 'innovation', 'kreativ'])) {
      return CREATIVE_NOTION_TEMPLATES.creative_brainstorming;
    }
    
    if (this.hasKeywords(combinedContent, ['präsentation', 'client', 'pitch', 'proposal'])) {
      return CREATIVE_NOTION_TEMPLATES.client_presentation;
    }
    
    if (this.hasKeywords(combinedContent, ['brand', 'marke', 'identity', 'positioning'])) {
      return CREATIVE_NOTION_TEMPLATES.brand_workshop;
    }
    
    if (this.hasKeywords(combinedContent, ['post-mortem', 'abschluss', 'learnings', 'retrospective'])) {
      return CREATIVE_NOTION_TEMPLATES.project_postmortem;
    }
    
    if (this.hasKeywords(combinedContent, ['workflow', 'prozess', 'optimization', 'efficiency'])) {
      return CREATIVE_NOTION_TEMPLATES.workflow_optimization;
    }
    
    // Default fallback
    return CREATIVE_NOTION_TEMPLATES.creative_briefing;
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
   * Erstellt Notion Page Properties basierend auf Template und Content
   */
  createPageProperties(template, content, summary, templateType, entities = [], entityEmojis = {}) {
    const properties = {};
    const templateData = this.extractTemplateData(content, summary, templateType, entities, entityEmojis);
    
    // Basis-Properties, die alle Templates haben
    if (template.properties.Name) {
      properties.Name = {
        title: [{ text: { content: templateData.title } }]
      };
    }
    
    // Template-spezifische Properties
    Object.entries(template.properties).forEach(([key, config]) => {
      if (key === 'Name') return; // Bereits behandelt
      
      switch (config.type) {
        case 'rich_text':
          if (templateData[key.toLowerCase().replace(/\s+/g, '_')]) {
            properties[key] = {
              rich_text: [{ text: { content: templateData[key.toLowerCase().replace(/\s+/g, '_')] } }]
            };
          }
          break;
          
        case 'select':
          const selectValue = this.mapToSelectOption(templateData, key, config.options);
          if (selectValue) {
            properties[key] = { select: { name: selectValue } };
          }
          break;
          
        case 'multi_select':
          const multiSelectValues = this.mapToMultiSelectOptions(templateData, key, entities);
          if (multiSelectValues.length > 0) {
            properties[key] = {
              multi_select: multiSelectValues.map(value => ({ name: value }))
            };
          }
          break;
          
        case 'date':
          if (key === 'Created' || key === 'Review Date' || key === 'Session Date') {
            properties[key] = {
              date: { start: new Date().toISOString().split('T')[0] }
            };
          }
          break;
          
        case 'number':
          if (key === 'Ideas Count') {
            properties[key] = { number: entities.length };
          }
          break;
          
        case 'checkbox':
          if (key === 'Follow-up Required') {
            properties[key] = { checkbox: this.hasFollowUpNeeded(content) };
          }
          break;
      }
    });
    
    return properties;
  },

  /**
   * Erstellt Page Content basierend auf Template
   */
  createPageContent(template, content, summary, templateData) {
    let pageContent = template.content;
    
    // Ersetze Template-Variablen
    Object.entries(templateData).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      pageContent = pageContent.replace(new RegExp(placeholder, 'g'), value || 'TBD');
    });
    
    // Spezielle Variablen
    pageContent = pageContent.replace('{transcript}', content);
    pageContent = pageContent.replace('{summary}', summary || '');
    pageContent = pageContent.replace('{created_at}', new Date().toLocaleString('de-DE'));
    
    return pageContent;
  },

  // Hilfsmethoden für Template-Datenextraktion
  extractTemplateData(content, summary, templateType, entities, entityEmojis) {
    const baseData = {
      title: this.generateTitle(content, templateType),
      client: this.findPattern(content, /(?:kunde|client):\s*([^\n]+)/i),
      project: this.findPattern(content, /(?:projekt|project):\s*([^\n]+)/i),
      brand: this.findPattern(content, /(?:marke|brand):\s*([^\n]+)/i)
    };

    // Template-spezifische Extraktion
    switch (templateType) {
      case 'creative_briefing':
        return {
          ...baseData,
          target_audience: this.findPattern(content, /(?:zielgruppe|target|audience):\s*([^\n]+)/i),
          key_message: this.findPattern(content, /(?:botschaft|message|kommunikation):\s*([^\n]+)/i),
          timeline: this.findPattern(content, /(?:timeline|deadline|termin):\s*([^\n]+)/i)
        };
        
      case 'design_review':
        return {
          ...baseData,
          review_phase: this.findPattern(content, /(?:phase|version|review):\s*([^\n]+)/i),
          positive_feedback: this.extractSentences(content, ['gut', 'gefällt', 'super']).slice(0, 3).join(', '),
          required_changes: this.extractSentences(content, ['ändern', 'anpassen', 'problem']).slice(0, 3).join(', ')
        };
        
      case 'creative_brainstorming':
        return {
          ...baseData,
          challenge: this.findPattern(content, /(?:challenge|herausforderung|aufgabe):\s*([^\n]+)/i),
          quick_wins: this.extractSentences(content, ['schnell', 'einfach', 'sofort']).slice(0, 3).join(', '),
          big_bets: this.extractSentences(content, ['innovation', 'revolutionär', 'breakthrough']).slice(0, 3).join(', ')
        };
        
      case 'client_presentation':
        return {
          ...baseData,
          presented_solutions: this.extractSentences(content, ['lösung', 'konzept', 'ansatz']).slice(0, 5).join(', '),
          key_messages: this.extractSentences(content, ['botschaft', 'message', 'kommunikation']).slice(0, 3).join(', '),
          client_reactions: this.extractSentences(content, ['client', 'kunde', 'feedback']).slice(0, 3).join(', ')
        };
        
      case 'brand_workshop':
        return {
          ...baseData,
          brand_mission: this.findPattern(content, /(?:mission|zweck|purpose):\s*([^\n]+)/i),
          brand_vision: this.findPattern(content, /(?:vision|zukunft|future):\s*([^\n]+)/i),
          primary_persona: this.findPattern(content, /(?:persona|zielgruppe|target):\s*([^\n]+)/i)
        };
        
      case 'project_postmortem':
        return {
          ...baseData,
          what_went_well: this.extractSentences(content, ['gut', 'erfolg', 'positiv']).slice(0, 5).join(', '),
          challenges: this.extractSentences(content, ['problem', 'schwierigkeit', 'herausforderung']).slice(0, 5).join(', ')
        };
        
      case 'workflow_optimization':
        return {
          ...baseData,
          bottlenecks: this.extractSentences(content, ['bottleneck', 'problem', 'langsam']).slice(0, 3).join(', '),
          success_metrics: this.extractSentences(content, ['erfolg', 'metric', 'kpi']).slice(0, 3).join(', ')
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
    const client = this.findPattern(content, /(?:kunde|client):\s*([^\n]+)/i);
    const project = this.findPattern(content, /(?:projekt|project):\s*([^\n]+)/i);
    
    if (client && project) {
      return `${emoji} ${client} - ${project} - ${date}`;
    } else if (client) {
      return `${emoji} ${client} - ${date}`;
    } else {
      return `${emoji} Creative Session - ${date}`;
    }
  },

  mapToSelectOption(templateData, key, options) {
    const keyLower = key.toLowerCase().replace(/\s+/g, '_');
    const value = templateData[keyLower];
    
    if (!value) return null;
    
    // Versuche direkten Match
    const directMatch = options.find(option => 
      option.toLowerCase() === value.toLowerCase()
    );
    
    if (directMatch) return directMatch;
    
    // Versuche partiellen Match
    const partialMatch = options.find(option => 
      value.toLowerCase().includes(option.toLowerCase()) ||
      option.toLowerCase().includes(value.toLowerCase())
    );
    
    return partialMatch || options[0]; // Fallback zum ersten Option
  },

  mapToMultiSelectOptions(templateData, key, entities) {
    if (key === 'Tags') {
      return entities.slice(0, 5); // Erste 5 Entitäten als Tags
    }
    
    const keyLower = key.toLowerCase().replace(/\s+/g, '_');
    const value = templateData[keyLower];
    
    if (typeof value === 'string') {
      return value.split(',').map(v => v.trim()).filter(v => v.length > 0);
    }
    
    return [];
  },

  hasFollowUpNeeded(content) {
    const followUpKeywords = ['follow-up', 'nächste schritte', 'action items', 'todo', 'nachfassen'];
    return followUpKeywords.some(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    );
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
  }
};

module.exports = {
  CREATIVE_NOTION_TEMPLATES,
  notionCreativeSelector
};
