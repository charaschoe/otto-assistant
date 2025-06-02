#!/usr/bin/env node

/**
 * Otto Assistant Live Mode - Simple Version
 * Real-time audio recording with immediate board updates
 * Works without Whisper dependency
 */

const { SimpleLiveRecorder } = require('./src/core/simple-live-recorder');
const { RealTimeUpdater } = require('./src/core/real-time-updater');
const { identifyEntitiesWithEmojis } = require('./src/utils/entity-linker');

class OttoLiveSimple {
  constructor() {
    this.isActive = false;
    this.sessionStartTime = null;
    this.accumulatedText = '';
    this.currentSegment = '';

    // Initialize components
    this.recorder = new SimpleLiveRecorder({
      chunkDuration: 3000,
      enableSimulation: false, // Use real audio processing with Whisper
    });

    this.updater = new RealTimeUpdater({
      updateInterval: 2000, // Update every 2 seconds
      batchSize: 3,
      enableMiroUpdates: true,
      enableObsidianUpdates: true,
      enableNotionUpdates: true, // Enable Notion with fallback to local files
    });

    this.setupEventHandlers();
  }

  /**
   * Setup event handlers
   */
  setupEventHandlers() {
    // Recorder events
    this.recorder.on('recording-started', () => {
      console.log('🎤 Recording started - speak naturally!');
    });

    this.recorder.on('audio-activity', (data) => {
      if (data.hasVoice) {
        console.log(`🗣️ Voice detected in chunk ${data.chunkNumber}`);
        this.showLiveStatus();
      }
    });

    this.recorder.on('transcription', async (data) => {
      await this.handleTranscription(data);
    });

    this.recorder.on('chunk-saved', (data) => {
      console.log(`💾 Audio chunk saved: ${data.filename}`);
    });

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Stopping Otto Live Mode...');
      await this.stop();
      process.exit(0);
    });
  }

  /**
   * Start live mode
   */
  async start() {
    if (this.isActive) {
      console.log('🎤 Live mode already active');
      return;
    }

    try {
      console.log('🚀 Starting Otto Live Mode (Simple Version)...');
      console.log('═'.repeat(60));

      this.isActive = true;
      this.sessionStartTime = Date.now();

      // Initialize live session
      const sessionData = await this.updater.initializeLiveSession('Otto Live Session (Simple)');
      console.log('📱 Live boards initialized:');
      if (sessionData.miroBoard) console.log(`   🎨 Miro: ${sessionData.miroBoard}`);
      if (sessionData.obsidianFile) console.log(`   📝 Obsidian: ${sessionData.obsidianFile}`);
      if (sessionData.notionPage) console.log(`   📊 Notion: ${sessionData.notionPage}`);

      // Start recording
      await this.recorder.startRecording();

      this.showInterface();
    } catch (error) {
      console.error('❌ Failed to start live mode:', error);
      this.isActive = false;
      throw error;
    }
  }

  /**
   * Stop live mode
   */
  async stop() {
    if (!this.isActive) return;

    this.isActive = false;

    // Stop recording
    await this.recorder.stopRecording();

    // Finalize session
    await this.updater.finalizeSession();

    // Cleanup
    this.recorder.cleanup();

    console.log('✅ Otto Live Mode stopped');
  }

  /**
   * Handle transcription results
   */
  async handleTranscription(data) {
    const { text, isSimulated, timestamp } = data;

    console.log(`\n🗣️  [${new Date(timestamp).toLocaleTimeString()}] ${text}`);

    // Add to accumulated text
    this.accumulatedText += (this.accumulatedText ? ' ' : '') + text;
    this.currentSegment += (this.currentSegment ? ' ' : '') + text;

    // Add transcription to real-time updates
    this.updater.addContentUpdate('transcription', text, {
      timestamp,
      confidence: data.confidence,
      isSimulated,
    });

    // Extract and add entities
    try {
      const entities = await identifyEntitiesWithEmojis(text);
      Object.entries(entities).forEach(([entity, emoji]) => {
        this.updater.addContentUpdate('entity', entity, {
          emoji,
          timestamp: Date.now(),
        });
        console.log(`🏷️  Entity detected: ${emoji} ${entity}`);
      });
    } catch (error) {
      console.warn('⚠️ Entity extraction failed:', error.message);
    }

    // Check for action items
    const actionItems = this.extractActionItems(text);
    actionItems.forEach((item) => {
      this.updater.addContentUpdate('action_item', item, {
        timestamp: Date.now(),
        priority: 'high',
      });
      console.log(`✅ Action item: ${item}`);
    });

    // Check for export commands
    this.checkForCommands(text);

    // Update interface
    this.showLiveStatus();
  }

  /**
   * Extract action items from text
   */
  extractActionItems(text) {
    const actionItems = [];
    const lowerText = text.toLowerCase();

    const patterns = [
      /(?:action[\s:]*|todo[\s:]*|aufgabe[\s:]*|muss[\s]*|soll[\s]*)([^.!?]{10,80})/gi,
      /(?:wir müssen|ich muss|du musst)[\s]*([^.!?]{10,80})/gi,
      /(?:next step|nächster schritt)[\s:]*([^.!?]{10,80})/gi,
    ];

    patterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const item = match[1].trim();
        if (item.length > 5 && item.length < 100) {
          actionItems.push(item);
        }
      }
    });

    return [...new Set(actionItems)];
  }

  /**
   * Check for voice commands
   */
  checkForCommands(text) {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('export to miro') || lowerText.includes('miro export')) {
      console.log('🎨 Miro export triggered by voice command');
      this.triggerMiroExport();
    } else if (lowerText.includes('export now') || lowerText.includes('exportieren')) {
      console.log('📤 Full export triggered by voice command');
      this.triggerFullExport();
    } else if (lowerText.includes('summary') || lowerText.includes('zusammenfassung')) {
      console.log('📝 Summary triggered by voice command');
      this.generateSummary();
    } else if (lowerText.includes('meeting ende') || lowerText.includes('session ende')) {
      console.log('🏁 Session end triggered by voice command');
      setTimeout(() => this.stop(), 2000);
    }
  }

  /**
   * Trigger Miro export
   */
  async triggerMiroExport() {
    if (!this.accumulatedText.trim()) return;

    this.updater.addContentUpdate(
      'summary',
      `Miro Export: ${this.accumulatedText.substring(0, 200)}...`,
      {
        timestamp: Date.now(),
        type: 'export',
      }
    );
  }

  /**
   * Trigger full export
   */
  async triggerFullExport() {
    if (!this.accumulatedText.trim()) return;

    this.updater.addContentUpdate('summary', `Full Export: ${this.accumulatedText}`, {
      timestamp: Date.now(),
      type: 'full_export',
    });
  }

  /**
   * Generate summary
   */
  async generateSummary() {
    if (!this.accumulatedText.trim()) return;

    // Simple summary generation (word frequency based)
    const words = this.accumulatedText.toLowerCase().split(/\s+/);
    const wordCount = {};

    words.forEach((word) => {
      if (word.length > 3) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });

    const topWords = Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);

    const summary = `Hauptthemen: ${topWords.join(', ')}. Total: ${words.length} Wörter.`;

    this.updater.addContentUpdate('summary', summary, {
      timestamp: Date.now(),
      type: 'generated',
    });

    console.log(`📝 Generated summary: ${summary}`);
  }

  /**
   * Show live interface
   */
  showInterface() {
    console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
    console.log('║                    🤖 OTTO LIVE ASSISTANT                        ║');
    console.log('║                     Real-time Board Updates                      ║');
    console.log('╚═══════════════════════════════════════════════════════════════════╝');

    console.log('\n🎤 VOICE COMMANDS:');
    console.log("   • 'Export to Miro' - Create Miro board");
    console.log("   • 'Export now' - Export to all platforms");
    console.log("   • 'Summary' - Generate live summary");
    console.log("   • 'Meeting ende' - Stop session");

    console.log('\n📊 KEYBOARD COMMANDS:');
    console.log('   • Ctrl+C - Stop live mode');

    console.log('\n🔄 REAL-TIME FEATURES:');
    console.log('   ✅ Content appears on boards as you speak');
    console.log('   ✅ Entity recognition with emoji tagging');
    console.log('   ✅ Action item detection and highlighting');
    console.log('   ✅ Voice command execution');

    console.log('\n' + '═'.repeat(70));

    this.showLiveStatus();
  }

  /**
   * Show live status
   */
  showLiveStatus() {
    const sessionDuration = Date.now() - this.sessionStartTime;
    const minutes = Math.floor(sessionDuration / 60000);
    const seconds = Math.floor((sessionDuration % 60000) / 1000);

    const recorderStatus = this.recorder.getStatus();
    const updaterStatus = this.updater.getSessionStatus();

    console.log('\n📊 LIVE STATUS:');
    console.log('┌─────────────────────────────────────────────────────────────────┐');
    console.log(
      `│ Session: ${minutes}m ${seconds}s | Audio chunks: ${recorderStatus.chunkCount} | Updates queued: ${updaterStatus.queueLength}`
    );
    console.log(
      `│ Characters: ${this.accumulatedText.length} | Real-time updates: ${updaterStatus.isActive ? '🟢 Active' : '🔴 Inactive'}`
    );
    console.log('└─────────────────────────────────────────────────────────────────┘');
  }

  /**
   * Get session statistics
   */
  getSessionStats() {
    const recorderStatus = this.recorder.getStatus();
    const updaterStatus = this.updater.getSessionStatus();

    return {
      sessionDuration: Date.now() - this.sessionStartTime,
      audioChunks: recorderStatus.chunkCount,
      totalAudioTime: recorderStatus.totalAudioTime,
      charactersTranscribed: this.accumulatedText.length,
      updatesQueued: updaterStatus.queueLength,
      isActive: this.isActive,
    };
  }
}

/**
 * Test the simple live recorder
 */
async function testSimpleLiveRecorder() {
  console.log('🧪 Testing Simple Live Recorder...');

  const result = await SimpleLiveRecorder.testRecording(10000); // 10 seconds

  if (result.voiceDetected) {
    console.log('✅ Voice detection working - ready for live mode!');
    return true;
  } else {
    console.log('⚠️ No voice detected - check microphone settings');
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🤖 Otto Assistant Live Mode (Simple Version)');
  console.log('══════════════════════════════════════════════════════════════════');

  // Test system first
  console.log('🔍 Testing system requirements...');

  try {
    // Test microphone
    const micTest = await testSimpleLiveRecorder();
    if (!micTest) {
      console.log('❌ Microphone test failed. Run: node debug-microphone.js');
      process.exit(1);
    }

    console.log('✅ System ready for live mode!');
  } catch (error) {
    console.error('❌ System test failed:', error);
    process.exit(1);
  }

  // Start live mode
  const ottoLive = new OttoLiveSimple();

  try {
    await ottoLive.start();

    // Keep process alive
    console.log('\n🎤 Live mode is active. Speak naturally and watch your boards update!');

    // Show periodic status updates
    setInterval(() => {
      if (ottoLive.isActive) {
        ottoLive.showLiveStatus();
      }
    }, 30000); // Every 30 seconds
  } catch (error) {
    console.error('❌ Failed to start live mode:', error);
    process.exit(1);
  }
}

// Show usage information
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🎤 Otto Assistant Live Mode (Simple Version)

USAGE:
  node live-mode-simple.js

FEATURES:
  • Real-time audio recording with voice detection
  • Live Whisper transcription (German optimized)
  • Live board updates every 2 seconds
  • Voice command recognition
  • Entity detection with emoji tagging
  • Action item extraction
  • Real-time speech-to-text processing

VOICE COMMANDS:
  "Export to Miro"     - Create optimized Miro board
  "Export now"         - Export to all platforms
  "Summary"            - Generate content summary
  "Meeting ende"       - Stop session and export

REQUIREMENTS:
  • SoX audio tools (brew install sox)
  • OpenAI Whisper (pip install openai-whisper)
  • Node.js 14+
  • Microphone access permissions

TESTING:
  node debug-microphone.js     - Test microphone setup
  node live-mode-simple.js     - Start live mode
`);
  process.exit(0);
}

// Run main function
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { OttoLiveSimple, testSimpleLiveRecorder };
