/**
 * Live Mode Manager for Otto Assistant
 * Orchestrates continuous speech recognition and real-time processing
 */

const LiveAudioProcessor = require('./live-audio-processor');
const LiveInterface = require('./live-interface');
const RealTimeUpdater = require('./real-time-updater');
const { generateSummaryFromTranscript } = require('../utils/kitegg-service');
const { exportToObsidian } = require('../integrations/obsidian-export');
const { exportToNotion } = require('../integrations/notion-export');
const { exportToMiro } = require('../integrations/miro-export');
const { identifyEntitiesWithEmojis } = require('../utils/entity-linker');

class LiveModeManager {
  constructor(options = {}) {
    this.config = {
      autoExport: options.autoExport !== false,
      exportInterval: options.exportInterval || 300000, // 5 minutes
      minSegmentLength: options.minSegmentLength || 50,
      maxContextAge: options.maxContextAge || 1800000, // 30 minutes
      ...options
    };
    
    this.state = {
      isActive: false,
      sessionStartTime: null,
      lastExport: null,
      accumulatedContent: '',
      sessionData: {
        fullTranscript: '',
        segments: [],
        entities: [],
        exportCount: 0
      }
    };
    
    // Initialize components
    this.audioProcessor = new LiveAudioProcessor({
      chunkDuration: 2000,
      silenceThreshold: 0.01,
      maxSilenceDuration: 3000,
      contextWindow: 1800000
    });
    
    this.interface = new LiveInterface();
    
    // Initialize real-time updater
    this.realTimeUpdater = new RealTimeUpdater({
      updateInterval: 3000,     // Update every 3 seconds
      batchSize: 3,             // Max 3 items per update
      enableMiroUpdates: true,
      enableObsidianUpdates: true,
      enableNotionUpdates: true
    });
    
    this.setupEventHandlers();
  }

  /**
   * Start live mode
   */
  async startLiveMode() {
    if (this.state.isActive) {
      console.log("🎤 Live mode already active");
      return;
    }

    try {
      console.log("🚀 Starting Otto Live Mode...");
      
      this.state.isActive = true;
      this.state.sessionStartTime = Date.now();
      this.state.lastExport = Date.now();
      
      // Start interface
      this.interface.start();
      
      // Connect interface to audio processor
      this.interface.connectToAudioProcessor(this.audioProcessor);
      
      // Initialize real-time session
      const sessionData = await this.realTimeUpdater.initializeLiveSession("Otto Live Session");
      console.log("📱 Live boards initialized:", sessionData);
      
      // Start audio processing
      await this.audioProcessor.startListening();
      
      // Setup auto-export if enabled
      if (this.config.autoExport) {
        this.setupAutoExport();
      }
      
      console.log("✅ Otto Live Mode active - speak naturally!");
      console.log("🔄 Real-time updates enabled - content appears as you speak!");
      
    } catch (error) {
      console.error("❌ Failed to start live mode:", error);
      this.state.isActive = false;
      throw error;
    }
  }

  /**
   * Stop live mode
   */
  async stopLiveMode() {
    if (!this.state.isActive) return;

    console.log("🛑 Stopping Otto Live Mode...");
    
    this.state.isActive = false;
    
    // Stop audio processing
    await this.audioProcessor.stopListening();
    
    // Stop interface
    this.interface.stop();
    
    // Clear auto-export interval
    if (this.autoExportInterval) {
      clearInterval(this.autoExportInterval);
    }
    
    // Finalize real-time session
    await this.realTimeUpdater.finalizeSession();
    
    // Final export if there's content
    if (this.state.sessionData.fullTranscript.trim().length > 0) {
      await this.performFinalExport();
    }
    
    console.log("✅ Otto Live Mode stopped");
  }

  /**
   * Setup event handlers for all components
   */
  setupEventHandlers() {
    // Audio processor events
    this.audioProcessor.on('transcription', async (data) => {
      await this.handleTranscription(data);
    });

    this.audioProcessor.on('segment-complete', async (data) => {
      await this.handleSegmentComplete(data);
    });

    this.audioProcessor.on('command-executed', async (data) => {
      await this.handleCommand(data);
    });

    this.audioProcessor.on('export-triggered', async (data) => {
      await this.handleExportTrigger(data);
    });

    // Interface events
    this.interface.on('quit-requested', async () => {
      await this.stopLiveMode();
      process.exit(0);
    });

    this.interface.on('export-requested', async () => {
      await this.exportCurrentSession();
    });

    this.interface.on('clear-requested', () => {
      this.clearSession();
    });
  }

  /**
   * Handle new transcription
   */
  async handleTranscription(data) {
    // Add to accumulated content
    this.state.accumulatedContent += (this.state.accumulatedContent ? ' ' : '') + data.text;
    this.state.sessionData.fullTranscript += (this.state.sessionData.fullTranscript ? ' ' : '') + data.text;
    
    // Add transcription to real-time updates
    this.realTimeUpdater.addContentUpdate('transcription', data.text, {
      timestamp: data.timestamp,
      confidence: data.confidence || 1.0
    });
    
    // Update entities
    const newEntities = await this.extractEntitiesFromText(data.text);
    this.mergeEntities(newEntities);
    
    // Add entities to real-time updates
    Object.keys(newEntities).forEach(entity => {
      this.realTimeUpdater.addContentUpdate('entity', entity, {
        emoji: newEntities[entity],
        timestamp: Date.now()
      });
    });
    
    // Check for action items in transcription
    const actionItems = this.extractActionItemsFromText(data.text);
    actionItems.forEach(item => {
      this.realTimeUpdater.addContentUpdate('action_item', item, {
        timestamp: Date.now(),
        priority: 'high'
      });
    });
    
    // Check if we should trigger intermediate processing
    if (this.shouldProcessIntermediate()) {
      await this.processIntermediateContent();
    }
  }

  /**
   * Handle segment completion
   */
  async handleSegmentComplete(data) {
    console.log("📄 Segment completed, processing...");
    
    // Add segment to session data
    const segment = {
      text: data.fullText,
      timestamp: Date.now(),
      entities: await this.extractEntitiesFromText(data.fullText)
    };
    
    this.state.sessionData.segments.push(segment);
    
    // Generate intermediate summary if segment is substantial
    if (data.fullText.length > this.config.minSegmentLength) {
      try {
        const summary = await generateSummaryFromTranscript(data.fullText);
        console.log(`📝 Segment summary: ${summary.substring(0, 100)}...`);
        
        segment.summary = summary;
        this.interface.showIndicator('success');
        
      } catch (error) {
        console.warn("⚠️ Could not generate segment summary:", error.message);
      }
    }
    
    // Reset accumulated content
    this.state.accumulatedContent = '';
  }

  /**
   * Handle voice commands
   */
  async handleCommand(data) {
    const command = data.command.toLowerCase();
    
    if (command.includes('export now') || command.includes('exportieren')) {
      await this.exportCurrentSession();
      
    } else if (command.includes('neue session') || command.includes('clear context')) {
      this.clearSession();
      
    } else if (command.includes('zusammenfassung') || command.includes('summary')) {
      await this.generateLiveSummary();
      
    } else if (command.includes('status')) {
      this.showSessionStatus();
    }
  }

  /**
   * Handle export triggers
   */
  async handleExportTrigger(data) {
    const command = data.command.toLowerCase();
    
    if (command.includes('miro') || command.includes('board')) {
      await this.exportToMiroOnly();
      
    } else if (command.includes('obsidian') || command.includes('vault')) {
      await this.exportToObsidianOnly();
      
    } else if (command.includes('notion')) {
      await this.exportToNotionOnly();
      
    } else {
      // Export to all platforms
      await this.exportCurrentSession();
    }
  }

  /**
   * Extract entities from text
   */
  async extractEntitiesFromText(text) {
    try {
      return identifyEntitiesWithEmojis(text);
    } catch (error) {
      console.warn("⚠️ Entity extraction failed:", error.message);
      return {};
    }
  }

  /**
   * Merge new entities with existing ones
   */
  mergeEntities(newEntities) {
    Object.entries(newEntities).forEach(([entity, emoji]) => {
      if (!this.state.sessionData.entities.find(e => e.name === entity)) {
        this.state.sessionData.entities.push({
          name: entity,
          emoji: emoji,
          firstMentioned: Date.now()
        });
      }
    });
  }

  /**
   * Check if we should process intermediate content
   */
  shouldProcessIntermediate() {
    const contentLength = this.state.accumulatedContent.length;
    const timeSinceLastProcess = Date.now() - (this.state.lastIntermediateProcess || 0);
    
    return contentLength > 200 && timeSinceLastProcess > 30000; // 30 seconds
  }

  /**
   * Process intermediate content for live feedback
   */
  async processIntermediateContent() {
    if (!this.state.accumulatedContent.trim()) return;
    
    this.state.lastIntermediateProcess = Date.now();
    
    try {
      // Quick entity update
      const entities = await this.extractEntitiesFromText(this.state.accumulatedContent);
      this.mergeEntities(entities);
      
      console.log(`🔄 Intermediate processing: ${Object.keys(entities).length} entities found`);
      
    } catch (error) {
      console.warn("⚠️ Intermediate processing failed:", error.message);
    }
  }

  /**
   * Extract action items from text
   */
  extractActionItemsFromText(text) {
    const actionItems = [];
    const lowerText = text.toLowerCase();
    
    // Action item patterns
    const patterns = [
      /(?:todo|aufgabe|task|muss|soll|wird|action)[\s:]*([^.!?]+)/gi,
      /(?:wir müssen|ich muss|du musst|er muss)[\s]*([^.!?]+)/gi,
      /(?:next step|nächster schritt)[\s:]*([^.!?]+)/gi,
      /(?:follow up|nachfassen)[\s:]*([^.!?]+)/gi
    ];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const item = match[1].trim();
        if (item.length > 10 && item.length < 100) {
          actionItems.push(item);
        }
      }
    });
    
    return [...new Set(actionItems)]; // Remove duplicates
  }

  /**
   * Generate live summary of current session
   */
  async generateLiveSummary() {
    if (!this.state.sessionData.fullTranscript.trim()) {
      console.log("📝 No content to summarize yet");
      return;
    }

    try {
      console.log("🔄 Generating live summary...");
      
      const summary = await generateSummaryFromTranscript(
        this.state.sessionData.fullTranscript
      );
      
      // Add summary to real-time updates
      this.realTimeUpdater.addContentUpdate('summary', summary, {
        timestamp: Date.now(),
        type: 'generated'
      });
      
      console.log("\n" + "═".repeat(70));
      console.log("📝 LIVE SESSION SUMMARY");
      console.log("═".repeat(70));
      console.log(summary);
      console.log("═".repeat(70));
      
      this.interface.showIndicator('success');
      
    } catch (error) {
      console.error("❌ Summary generation failed:", error.message);
      this.interface.showError("Summary generation failed");
    }
  }

  /**
   * Show current session status
   */
  showSessionStatus() {
    const sessionDuration = Date.now() - this.state.sessionStartTime;
    const minutes = Math.floor(sessionDuration / 60000);
    const seconds = Math.floor((sessionDuration % 60000) / 1000);
    
    console.log("\n" + "═".repeat(70));
    console.log("📊 LIVE SESSION STATUS");
    console.log("═".repeat(70));
    console.log(`Duration: ${minutes}m ${seconds}s`);
    console.log(`Transcript length: ${this.state.sessionData.fullTranscript.length} characters`);
    console.log(`Segments: ${this.state.sessionData.segments.length}`);
    console.log(`Entities: ${this.state.sessionData.entities.length}`);
    console.log(`Exports: ${this.state.sessionData.exportCount}`);
    console.log(`Last export: ${this.getLastExportTime()}`);
    console.log("═".repeat(70));
  }

  /**
   * Export current session to all platforms
   */
  async exportCurrentSession() {
    if (!this.state.sessionData.fullTranscript.trim()) {
      console.log("⚠️ No content to export yet");
      return;
    }

    console.log("📤 Exporting current session...");
    this.interface.showIndicator('export');
    
    try {
      // Generate summary for export
      const summary = await generateSummaryFromTranscript(
        this.state.sessionData.fullTranscript
      );
      
      // Prepare entity data
      const entities = this.state.sessionData.entities.map(e => e.name);
      const entityEmojis = {};
      this.state.sessionData.entities.forEach(e => {
        entityEmojis[e.name] = e.emoji;
      });
      
      // Export to all platforms
      const results = await Promise.allSettled([
        exportToObsidian(this.state.sessionData.fullTranscript, summary, entities, entityEmojis),
        exportToNotion(this.state.sessionData.fullTranscript, summary, entities, entityEmojis),
        exportToMiro(this.state.sessionData.fullTranscript, summary, {
          useOptimizedLayout: true,
          meetingType: 'Live Session'
        })
      ]);
      
      // Report results
      this.reportExportResults(results);
      
      this.state.sessionData.exportCount++;
      this.state.lastExport = Date.now();
      
      this.interface.showIndicator('success');
      
    } catch (error) {
      console.error("❌ Export failed:", error.message);
      this.interface.showError("Export failed");
    }
  }

  /**
   * Export to specific platforms only
   */
  async exportToMiroOnly() {
    await this.exportToPlatform('Miro', () => 
      exportToMiro(this.state.sessionData.fullTranscript, '', {
        useOptimizedLayout: true,
        meetingType: 'Live Session'
      })
    );
  }

  async exportToObsidianOnly() {
    await this.exportToPlatform('Obsidian', async () => {
      const summary = await generateSummaryFromTranscript(this.state.sessionData.fullTranscript);
      const entities = this.state.sessionData.entities.map(e => e.name);
      const entityEmojis = {};
      this.state.sessionData.entities.forEach(e => {
        entityEmojis[e.name] = e.emoji;
      });
      
      return exportToObsidian(this.state.sessionData.fullTranscript, summary, entities, entityEmojis);
    });
  }

  async exportToNotionOnly() {
    await this.exportToPlatform('Notion', async () => {
      const summary = await generateSummaryFromTranscript(this.state.sessionData.fullTranscript);
      const entities = this.state.sessionData.entities.map(e => e.name);
      const entityEmojis = {};
      this.state.sessionData.entities.forEach(e => {
        entityEmojis[e.name] = e.emoji;
      });
      
      return exportToNotion(this.state.sessionData.fullTranscript, summary, entities, entityEmojis);
    });
  }

  /**
   * Helper for single platform export
   */
  async exportToPlatform(platformName, exportFunction) {
    if (!this.state.sessionData.fullTranscript.trim()) {
      console.log("⚠️ No content to export yet");
      return;
    }

    console.log(`📤 Exporting to ${platformName}...`);
    this.interface.showIndicator('export');
    
    try {
      const result = await exportFunction();
      
      if (result) {
        console.log(`✅ ${platformName} export successful: ${result}`);
        this.interface.showIndicator('success');
      } else {
        console.log(`⚠️ ${platformName} export completed with warnings`);
      }
      
    } catch (error) {
      console.error(`❌ ${platformName} export failed:`, error.message);
      this.interface.showError(`${platformName} export failed`);
    }
  }

  /**
   * Report export results from Promise.allSettled
   */
  reportExportResults(results) {
    const platforms = ['Obsidian', 'Notion', 'Miro'];
    
    console.log("\n📤 Export Results:");
    results.forEach((result, index) => {
      const platform = platforms[index];
      
      if (result.status === 'fulfilled') {
        if (result.value) {
          console.log(`✅ ${platform}: ${result.value}`);
        } else {
          console.log(`⚠️ ${platform}: Completed with warnings`);
        }
      } else {
        console.log(`❌ ${platform}: Failed - ${result.reason.message}`);
      }
    });
  }

  /**
   * Setup auto-export functionality
   */
  setupAutoExport() {
    this.autoExportInterval = setInterval(async () => {
      if (this.shouldAutoExport()) {
        console.log("⏰ Auto-export triggered");
        await this.exportCurrentSession();
      }
    }, 60000); // Check every minute
  }

  /**
   * Check if auto-export should trigger
   */
  shouldAutoExport() {
    const timeSinceLastExport = Date.now() - this.state.lastExport;
    const hasContent = this.state.sessionData.fullTranscript.length > this.config.minSegmentLength;
    
    return hasContent && timeSinceLastExport > this.config.exportInterval;
  }

  /**
   * Perform final export when stopping
   */
  async performFinalExport() {
    console.log("📄 Performing final session export...");
    
    this.interface.showSessionSummary({
      fullText: this.state.sessionData.fullTranscript,
      context: this.state.sessionData.segments
    });
    
    await this.exportCurrentSession();
  }

  /**
   * Clear current session
   */
  clearSession() {
    this.state.sessionData = {
      fullTranscript: '',
      segments: [],
      entities: [],
      exportCount: 0
    };
    
    this.state.accumulatedContent = '';
    this.audioProcessor.clearContext();
    
    console.log("🧹 Session cleared");
    this.interface.showIndicator('success');
  }

  /**
   * Get last export time as string
   */
  getLastExportTime() {
    if (!this.state.lastExport) return "Never";
    
    const minutesAgo = Math.floor((Date.now() - this.state.lastExport) / 60000);
    
    if (minutesAgo < 1) return "Just now";
    if (minutesAgo < 60) return `${minutesAgo}m ago`;
    
    const hoursAgo = Math.floor(minutesAgo / 60);
    return `${hoursAgo}h ago`;
  }

  /**
   * Get current session data
   */
  getSessionData() {
    return {
      ...this.state.sessionData,
      isActive: this.state.isActive,
      sessionDuration: Date.now() - this.state.sessionStartTime,
      lastExport: this.state.lastExport
    };
  }
}

module.exports = LiveModeManager;