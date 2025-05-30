/**
 * Live Interface for Otto Assistant
 * Provides visual indicators and real-time feedback
 */

const readline = require('readline');
const EventEmitter = require('events');

class LiveInterface extends EventEmitter {
  constructor() {
    super();
    
    this.state = {
      isActive: false,
      lastUpdate: Date.now(),
      statusLine: '',
      transcriptionBuffer: [],
      commandHistory: []
    };
    
    this.indicators = {
      listening: '🎤',
      processing: '⚡',
      voice: '🗣️',
      silence: '🔇',
      export: '📤',
      save: '💾',
      error: '❌',
      success: '✅'
    };
    
    this.setupInterface();
  }

  /**
   * Initialize the live interface
   */
  setupInterface() {
    // Create readline interface for user input
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    // Handle keyboard input
    this.setupKeyboardHandlers();
    
    // Setup periodic status updates
    this.statusInterval = setInterval(() => {
      this.updateStatusDisplay();
    }, 500);
  }

  /**
   * Start the live interface
   */
  start() {
    this.state.isActive = true;
    this.clearScreen();
    this.displayHeader();
    this.displayControls();
    this.displayStatusArea();
    
    console.log("\n🎤 Otto Live Mode - Speak naturally or type commands");
    console.log("─".repeat(70));
    
    this.emit('interface-started');
  }

  /**
   * Stop the live interface
   */
  stop() {
    this.state.isActive = false;
    
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
    }
    
    if (this.rl) {
      this.rl.close();
    }
    
    console.log("\n👋 Otto Live Mode stopped");
    this.emit('interface-stopped');
  }

  /**
   * Display header with branding
   */
  displayHeader() {
    console.log("╔═══════════════════════════════════════════════════════════════════╗");
    console.log("║                    🤖 OTTO LIVE ASSISTANT                        ║");
    console.log("║                   Continuous Speech Recognition                   ║");
    console.log("╚═══════════════════════════════════════════════════════════════════╝");
  }

  /**
   * Display control instructions
   */
  displayControls() {
    console.log("\n📋 LIVE CONTROLS:");
    console.log("┌─────────────────────────────────────────────────────────────────┐");
    console.log("│ Voice Commands:                                                 │");
    console.log("│ • 'Stop listening' - Pause audio processing                    │");
    console.log("│ • 'Export now' - Trigger immediate export                      │");
    console.log("│ • 'Neue session' - Clear context and start fresh              │");
    console.log("│ • 'Status' - Get current session status                       │");
    console.log("│ • 'Meeting ende' - Complete and process session               │");
    console.log("│                                                                 │");
    console.log("│ Keyboard:                                                       │");
    console.log("│ • 'q' + Enter - Quit live mode                                │");
    console.log("│ • 's' + Enter - Show status                                   │");
    console.log("│ • 'e' + Enter - Export current session                        │");
    console.log("│ • 'c' + Enter - Clear context                                 │");
    console.log("└─────────────────────────────────────────────────────────────────┘");
  }

  /**
   * Display status area
   */
  displayStatusArea() {
    console.log("\n📊 LIVE STATUS:");
    console.log("┌─────────────────────────────────────────────────────────────────┐");
    console.log("│ System: Starting...                                             │");
    console.log("│ Audio: Initializing...                                          │");
    console.log("│ Context: Empty                                                  │");
    console.log("│ Last Activity: Never                                            │");
    console.log("└─────────────────────────────────────────────────────────────────┘");
    this.statusAreaOffset = 4; // Number of lines in status area
  }

  /**
   * Update status display in real-time
   */
  updateStatusDisplay() {
    if (!this.state.isActive) return;
    
    // Move cursor up to status area
    process.stdout.write(`\x1b[${this.statusAreaOffset}A`);
    
    // Clear and redraw status
    console.log("┌─────────────────────────────────────────────────────────────────┐");
    console.log(`│ System: ${this.getSystemStatus()}`.padEnd(66) + "│");
    console.log(`│ Audio: ${this.getAudioStatus()}`.padEnd(66) + "│");
    console.log(`│ Context: ${this.getContextStatus()}`.padEnd(66) + "│");
    console.log(`│ Last Activity: ${this.getActivityStatus()}`.padEnd(66) + "│");
    console.log("└─────────────────────────────────────────────────────────────────┘");
  }

  /**
   * Setup keyboard command handlers
   */
  setupKeyboardHandlers() {
    this.rl.on('line', (input) => {
      const command = input.trim().toLowerCase();
      
      switch (command) {
        case 'q':
        case 'quit':
        case 'exit':
          this.emit('quit-requested');
          break;
          
        case 's':
        case 'status':
          this.showDetailedStatus();
          break;
          
        case 'e':
        case 'export':
          this.emit('export-requested');
          break;
          
        case 'c':
        case 'clear':
          this.emit('clear-requested');
          break;
          
        case 'h':
        case 'help':
          this.displayControls();
          break;
          
        default:
          if (command.length > 0) {
            console.log(`❓ Unknown command: ${command}. Type 'h' for help.`);
          }
      }
    });
  }

  /**
   * Handle audio processor events
   */
  connectToAudioProcessor(audioProcessor) {
    audioProcessor.on('listening-started', () => {
      this.updateStatus('audio', 'listening', 'Actively listening...');
    });

    audioProcessor.on('listening-stopped', () => {
      this.updateStatus('audio', 'stopped', 'Stopped');
    });

    audioProcessor.on('voice-detected', () => {
      this.updateStatus('audio', 'voice', 'Voice detected');
      this.showIndicator('voice');
    });

    audioProcessor.on('silence-detected', () => {
      this.updateStatus('audio', 'silence', 'Silence detected');
      this.showIndicator('silence');
    });

    audioProcessor.on('processing-started', () => {
      this.updateStatus('system', 'processing', 'Processing audio...');
      this.showIndicator('processing');
    });

    audioProcessor.on('processing-finished', () => {
      this.updateStatus('system', 'ready', 'Ready');
    });

    audioProcessor.on('transcription', (data) => {
      this.handleTranscription(data);
    });

    audioProcessor.on('segment-complete', (data) => {
      this.handleSegmentComplete(data);
    });

    audioProcessor.on('command-executed', (data) => {
      this.handleCommandExecuted(data);
    });

    audioProcessor.on('export-triggered', (data) => {
      this.handleExportTriggered(data);
    });

    audioProcessor.on('error', (error) => {
      this.showError(error.message);
    });
  }

  /**
   * Handle new transcription
   */
  handleTranscription(data) {
    // Add to transcription buffer
    this.state.transcriptionBuffer.push({
      text: data.text,
      timestamp: data.timestamp
    });

    // Keep only last 10 transcriptions
    if (this.state.transcriptionBuffer.length > 10) {
      this.state.transcriptionBuffer.shift();
    }

    // Show live transcription
    this.showLiveTranscription(data.text);
    
    // Update context status
    this.updateStatus('context', 'active', `${data.context.length} entries`);
    this.state.lastUpdate = Date.now();
  }

  /**
   * Show live transcription
   */
  showLiveTranscription(text) {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`\n🗣️  [${timestamp}] ${text}`);
    
    // Show current segment if building up
    if (this.state.currentSegment) {
      console.log(`📝  Current: "${this.state.currentSegment.substring(0, 60)}..."`);
    }
  }

  /**
   * Handle segment completion
   */
  handleSegmentComplete(data) {
    console.log("\n" + "═".repeat(70));
    console.log("📄 SEGMENT COMPLETED");
    console.log("═".repeat(70));
    console.log(`Full text: ${data.fullText.substring(0, 200)}...`);
    console.log(`Context entries: ${data.context.length}`);
    console.log("═".repeat(70));
    
    this.showIndicator('success');
  }

  /**
   * Handle command execution
   */
  handleCommandExecuted(data) {
    console.log(`\n⚡ Command executed: ${data.command}`);
    this.state.commandHistory.push({
      command: data.command,
      timestamp: Date.now()
    });
    
    this.showIndicator('success');
  }

  /**
   * Handle export trigger
   */
  handleExportTriggered(data) {
    console.log(`\n📤 Export triggered: ${data.command}`);
    this.showIndicator('export');
  }

  /**
   * Show visual indicator
   */
  showIndicator(type) {
    const indicator = this.indicators[type] || '●';
    process.stdout.write(`${indicator} `);
  }

  /**
   * Show error message
   */
  showError(message) {
    console.log(`\n${this.indicators.error} Error: ${message}`);
  }

  /**
   * Update internal status
   */
  updateStatus(category, status, details) {
    this.state[`${category}Status`] = { status, details, timestamp: Date.now() };
  }

  /**
   * Get system status string
   */
  getSystemStatus() {
    const status = this.state.systemStatus;
    if (!status) return "Starting...";
    
    const indicator = status.status === 'processing' ? this.indicators.processing : 
                     status.status === 'ready' ? this.indicators.success : '●';
    
    return `${indicator} ${status.details}`;
  }

  /**
   * Get audio status string
   */
  getAudioStatus() {
    const status = this.state.audioStatus;
    if (!status) return "Initializing...";
    
    const indicator = status.status === 'listening' ? this.indicators.listening :
                     status.status === 'voice' ? this.indicators.voice :
                     status.status === 'silence' ? this.indicators.silence :
                     status.status === 'stopped' ? this.indicators.error : '●';
    
    return `${indicator} ${status.details}`;
  }

  /**
   * Get context status string
   */
  getContextStatus() {
    const status = this.state.contextStatus;
    if (!status) return "Empty";
    
    return `📝 ${status.details}`;
  }

  /**
   * Get activity status string
   */
  getActivityStatus() {
    if (!this.state.lastUpdate) return "Never";
    
    const secondsAgo = Math.floor((Date.now() - this.state.lastUpdate) / 1000);
    
    if (secondsAgo < 5) return "Just now";
    if (secondsAgo < 60) return `${secondsAgo}s ago`;
    if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
    
    return "Long time ago";
  }

  /**
   * Show detailed status
   */
  showDetailedStatus() {
    console.log("\n" + "═".repeat(70));
    console.log("📊 DETAILED STATUS");
    console.log("═".repeat(70));
    console.log(`System: ${this.getSystemStatus()}`);
    console.log(`Audio: ${this.getAudioStatus()}`);
    console.log(`Context: ${this.getContextStatus()}`);
    console.log(`Last Activity: ${this.getActivityStatus()}`);
    console.log(`Transcriptions: ${this.state.transcriptionBuffer.length} recent`);
    console.log(`Commands: ${this.state.commandHistory.length} executed`);
    console.log("═".repeat(70));
  }

  /**
   * Clear screen (platform independent)
   */
  clearScreen() {
    console.clear();
  }

  /**
   * Show session summary
   */
  showSessionSummary(data) {
    console.log("\n" + "═".repeat(70));
    console.log("📝 SESSION SUMMARY");
    console.log("═".repeat(70));
    console.log(`Total text length: ${data.fullText.length} characters`);
    console.log(`Context entries: ${data.context.length}`);
    console.log(`Active time: ${this.getActiveTimeString()}`);
    console.log(`Commands executed: ${this.state.commandHistory.length}`);
    console.log("─".repeat(70));
    console.log("Recent transcriptions:");
    
    this.state.transcriptionBuffer.slice(-5).forEach((item, index) => {
      const time = new Date(item.timestamp).toLocaleTimeString();
      console.log(`  ${index + 1}. [${time}] ${item.text}`);
    });
    
    console.log("═".repeat(70));
  }

  /**
   * Get active time as string
   */
  getActiveTimeString() {
    // Calculate based on first transcription to now
    if (this.state.transcriptionBuffer.length === 0) return "0 minutes";
    
    const firstTimestamp = this.state.transcriptionBuffer[0].timestamp;
    const duration = Date.now() - firstTimestamp;
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    
    return `${minutes}m ${seconds}s`;
  }
}

module.exports = { LiveInterface };