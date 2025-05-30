/**
 * Content Processor for Otto Assistant
 * Advanced content analysis, entity recognition, and action item detection
 */

class ContentProcessor {
  constructor(options = {}) {
    this.config = {
      enableEntityRecognition: options.enableEntityRecognition !== false,
      enableActionItemDetection: options.enableActionItemDetection !== false,
      enableVoiceCommands: options.enableVoiceCommands !== false,
      debugMode: options.debugMode || false,
      language: options.language || 'de',
      ...options
    };
    
    // Entity patterns with emojis
    this.entityPatterns = {
      person: {
        pattern: /\b([A-ZÄÖÜ][a-zäöüß]+\s+[A-ZÄÖÜ][a-zäöüß]+)\b/g,
        emoji: '👤'
      },
      company: {
        pattern: /\b(Mercedes|BMW|Audi|Volkswagen|Apple|Google|Microsoft|Amazon)\b/gi,
        emoji: '🏢'
      },
      project: {
        pattern: /\b(Projekt|Kampagne|Initiative|Moodboard|Brief|Konzept)\b/gi,
        emoji: '📊'
      },
      date: {
        pattern: /\b(Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|Sonntag|heute|morgen|nächste Woche)\b/gi,
        emoji: '📅'
      },
      time: {
        pattern: /\b(\d{1,2}:\d{2}|\d{1,2}\s*Uhr)\b/gi,
        emoji: '⏰'
      },
      location: {
        pattern: /\b(Berlin|München|Hamburg|Köln|Frankfurt|Stuttgart|Office|Büro)\b/gi,
        emoji: '📍'
      },
      technology: {
        pattern: /\b(AI|KI|Machine Learning|API|Software|App|Website|Digital)\b/gi,
        emoji: '💻'
      },
      automotive: {
        pattern: /\b(Mercedes|EQS|Elektro|Auto|Fahrzeug|Motor|Premium)\b/gi,
        emoji: '🚗'
      },
      marketing: {
        pattern: /\b(Zielgruppe|Target|Kunden|Marketing|Brand|Branding|Campaign)\b/gi,
        emoji: '📌'
      },
      research: {
        pattern: /\b(Research|Analyse|Studie|Konkurrenz|Markt|Trend)\b/gi,
        emoji: '🔬'
      }
    };
    
    // Action item patterns
    this.actionItemPatterns = [
      /(?:Action Item|TODO|To-Do|Aufgabe|Task):\s*(.+?)(?:\.|$)/gi,
      /(?:Wir müssen|Ich muss|Man sollte|Es ist wichtig)\s+(.+?)(?:\.|$)/gi,
      /(?:Research|Recherche)\s+(.+?)(?:\.|$)/gi,
      /(?:Vorbereitung|Planung|Organisation)\s+(.+?)(?:\.|$)/gi
    ];
    
    // Voice command patterns
    this.voiceCommandPatterns = {
      export_miro: /export\s+(?:to\s+)?miro/gi,
      export_all: /export\s+(?:all|everything|alles)/gi,
      summary: /(?:summary|zusammenfassung|übersicht)/gi,
      stop: /(?:meeting\s+ende|session\s+stop|aufnahme\s+beenden)/gi
    };
  }

  /**
   * Process a file and extract structured content
   */
  async processFile(filePath) {
    const fs = require('fs');
    const path = require('path');
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const extension = path.extname(filePath).toLowerCase();
    
    let processedContent;
    
    switch (extension) {
      case '.md':
        processedContent = this.processMarkdown(content);
        break;
      case '.txt':
        processedContent = this.processText(content);
        break;
      case '.json':
        processedContent = this.processJSON(content);
        break;
      default:
        processedContent = this.processText(content);
    }
    
    // Add metadata
    processedContent.metadata = {
      sourceFile: filePath,
      processedAt: new Date().toISOString(),
      processor: 'Otto Content Processor v2.0',
      language: this.config.language
    };
    
    return processedContent;
  }

  /**
   * Process markdown content
   */
  processMarkdown(content) {
    // Extract title from first heading
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : 'Untitled';
    
    // Extract sections
    const sections = this.extractMarkdownSections(content);
    
    // Process text content
    const textContent = content.replace(/#+\s+/g, '').replace(/\*\*(.+?)\*\*/g, '$1');
    
    return {
      title,
      content: textContent,
      sections,
      entities: this.extractEntities(textContent),
      actionItems: this.extractActionItems(textContent),
      voiceCommands: this.detectVoiceCommands(textContent),
      type: 'markdown',
      preview: this.generatePreview(textContent)
    };
  }

  /**
   * Process plain text content
   */
  processText(content) {
    // Generate title from first sentence
    const firstSentence = content.split('.')[0];
    const title = firstSentence.length > 50 ? 
      firstSentence.substring(0, 50) + '...' : firstSentence;
    
    return {
      title,
      content,
      entities: this.extractEntities(content),
      actionItems: this.extractActionItems(content),
      voiceCommands: this.detectVoiceCommands(content),
      type: 'text',
      preview: this.generatePreview(content)
    };
  }

  /**
   * Process JSON content (session data)
   */
  processJSON(content) {
    const data = JSON.parse(content);
    
    // Handle different JSON structures
    if (data.transcription) {
      return this.processText(data.transcription);
    } else if (data.content) {
      return this.processText(data.content);
    } else if (typeof data === 'string') {
      return this.processText(data);
    }
    
    // Fallback: stringify the JSON
    return this.processText(JSON.stringify(data, null, 2));
  }

  /**
   * Extract entities from text with categorization
   */
  extractEntities(text) {
    const entities = [];
    
    if (!this.config.enableEntityRecognition) {
      return entities;
    }
    
    for (const [type, config] of Object.entries(this.entityPatterns)) {
      const matches = [...text.matchAll(config.pattern)];
      
      for (const match of matches) {
        const entityText = match[1] || match[0];
        const entity = {
          text: entityText.trim(),
          type,
          emoji: config.emoji,
          position: match.index,
          confidence: this.calculateEntityConfidence(entityText, type)
        };
        
        // Avoid duplicates
        if (!entities.some(e => e.text.toLowerCase() === entity.text.toLowerCase())) {
          entities.push(entity);
        }
      }
    }
    
    return entities.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Extract action items from text
   */
  extractActionItems(text) {
    const actionItems = [];
    
    if (!this.config.enableActionItemDetection) {
      return actionItems;
    }
    
    for (const pattern of this.actionItemPatterns) {
      const matches = [...text.matchAll(pattern)];
      
      for (const match of matches) {
        const itemText = match[1] ? match[1].trim() : match[0].trim();
        
        if (itemText.length > 5) { // Filter out very short matches
          actionItems.push({
            text: itemText,
            priority: this.estimatePriority(itemText),
            category: this.categorizeActionItem(itemText),
            extractedFrom: match[0]
          });
        }
      }
    }
    
    return actionItems;
  }

  /**
   * Detect voice commands in text
   */
  detectVoiceCommands(text) {
    const commands = [];
    
    if (!this.config.enableVoiceCommands) {
      return commands;
    }
    
    for (const [commandType, pattern] of Object.entries(this.voiceCommandPatterns)) {
      const matches = [...text.matchAll(pattern)];
      
      for (const match of matches) {
        commands.push({
          type: commandType,
          text: match[0],
          position: match.index,
          confidence: 0.8
        });
      }
    }
    
    return commands;
  }

  /**
   * Extract markdown sections
   */
  extractMarkdownSections(content) {
    const sections = [];
    const lines = content.split('\n');
    let currentSection = null;
    
    for (const line of lines) {
      const headingMatch = line.match(/^(#+)\s+(.+)$/);
      
      if (headingMatch) {
        if (currentSection) {
          sections.push(currentSection);
        }
        
        currentSection = {
          level: headingMatch[1].length,
          title: headingMatch[2],
          content: ''
        };
      } else if (currentSection) {
        currentSection.content += line + '\n';
      }
    }
    
    if (currentSection) {
      sections.push(currentSection);
    }
    
    return sections;
  }

  /**
   * Calculate entity confidence score
   */
  calculateEntityConfidence(text, type) {
    let confidence = 0.5;
    
    // Length bonus
    if (text.length > 3) confidence += 0.1;
    if (text.length > 6) confidence += 0.1;
    
    // Capitalization bonus
    if (/^[A-ZÄÖÜ]/.test(text)) confidence += 0.1;
    
    // Type-specific bonuses
    switch (type) {
      case 'company':
        if (text.length > 3) confidence += 0.2;
        break;
      case 'person':
        if (text.includes(' ')) confidence += 0.2;
        break;
      case 'date':
        confidence += 0.3;
        break;
      case 'time':
        confidence += 0.3;
        break;
    }
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Estimate action item priority
   */
  estimatePriority(text) {
    const urgentWords = ['sofort', 'dringend', 'asap', 'urgent', 'wichtig', 'kritisch'];
    const mediumWords = ['bald', 'nächste woche', 'next week', 'sollte'];
    
    const lowerText = text.toLowerCase();
    
    if (urgentWords.some(word => lowerText.includes(word))) {
      return 'high';
    } else if (mediumWords.some(word => lowerText.includes(word))) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Categorize action items
   */
  categorizeActionItem(text) {
    const categories = {
      research: ['research', 'recherche', 'analyse', 'studie'],
      meeting: ['meeting', 'termin', 'besprechung', 'call'],
      documentation: ['dokumentation', 'protokoll', 'report', 'zusammenfassung'],
      development: ['entwicklung', 'implementation', 'coding', 'programmierung'],
      design: ['design', 'gestaltung', 'mockup', 'wireframe'],
      communication: ['email', 'call', 'kontakt', 'kommunikation']
    };
    
    const lowerText = text.toLowerCase();
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return category;
      }
    }
    
    return 'general';
  }

  /**
   * Generate content preview
   */
  generatePreview(content) {
    const maxLength = 200;
    const cleaned = content.replace(/\s+/g, ' ').trim();
    
    if (cleaned.length <= maxLength) {
      return cleaned;
    }
    
    return cleaned.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
  }

  /**
   * Generate content statistics
   */
  generateStatistics(content) {
    const words = content.split(/\s+/).length;
    const characters = content.length;
    const sentences = content.split(/[.!?]+/).length - 1;
    const paragraphs = content.split(/\n\s*\n/).length;
    
    return {
      words,
      characters,
      sentences,
      paragraphs,
      readingTime: Math.ceil(words / 200) // Assuming 200 WPM
    };
  }
}

module.exports = { ContentProcessor };