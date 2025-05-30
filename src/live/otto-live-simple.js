/**
 * Otto Live Simple - Modern Live Audio Processing System
 * Streamlined live mode with comprehensive real-time updates
 */

const { EventEmitter } = require('events');
const { SimpleLiveRecorder } = require('../core/simple-live-recorder');
const { RealTimeUpdater } = require('../core/real-time-updater');
const { ContentProcessor } = require('../utils/content-processor');
const { LiveInterface } = require('../core/live-interface');
const chalk = require('chalk');

class OttoLiveSimple extends EventEmitter {
  constructor(options = {}) {
    super();

    this.config = {
      enableSimulation: options.enableSimulation || false,
      enableMiroUpdates: options.enableMiroUpdates !== false,
      enableNotionUpdates: options.enableNotionUpdates !== false,
      enableObsidianUpdates: options.enableObsidianUpdates !== false,
      debugMode: options.debugMode || false,
      quietMode: options.quietMode || false,
      chunkDuration: options.chunkDuration || 3000,
      updateInterval: options.updateInterval || 2000,
      sessionName: options.sessionName || 'Otto Live Session (Simple)',
      ...options,
    };

    this.state = {
      isRunning: false,
      sessionStartTime: null,
      totalChunks: 0,
      totalCharacters: 0,
      lastActivityTime: null,
      accumulatedContent: '',
      entities: new Set(),
      actionItems: [],
      voiceCommands: [],
    };

    // Initialize components
    this.recorder = null;
    this.updater = null;
    this.processor = null;
    this.interface = null;

    // Simulation data for testing
    this.simulationTexts = [
      'Hallo, ich teste das neue Live-System von Otto',
      'Das Mikrofon funktioniert sehr gut',
      'Ich spreche jetzt über die Mercedes Kampagne',
      'Wir brauchen ein neues Moodboard für das Projekt',
      'Die Zielgruppe sind Premium-Kunden zwischen 35 und 55',
      'Action Item: Research zu Konkurrenz durchführen',
      'Nächster Termin ist am Freitag um 14 Uhr',
      'Export to Miro für die Präsentation',
      'Das war ein erfolgreicher Test',
    ];
    this.simulationIndex = 0;

    this.setupEventHandlers();
  }

  /**
   * Setup event handlers for all components
   */
  setupEventHandlers() {
    // Handle process termination gracefully
    process.on('SIGINT', this.gracefulShutdown.bind(this));
    process.on('SIGTERM', this.gracefulShutdown.bind(this));

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      console.error(chalk.red('💥 Uncaught Exception:'), error.message);
      this.gracefulShutdown();
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error(chalk.red('💥 Unhandled Rejection:'), reason);
      this.gracefulShutdown();
    });
  }

  /**
   * Start the live processing system
   */
  async start() {
    if (this.state.isRunning) {
      throw new Error('Otto Live is already running');
    }

    try {
      console.log(chalk.blue.bold('🤖 Otto Assistant Live Mode (Simple Version)'));
      console.log('═'.repeat(66));

      // System checks
      await this.runSystemChecks();

      // Initialize components
      await this.initializeComponents();

      // Start live session
      await this.startLiveSession();

      // Start recording
      await this.startRecording();

      // Setup simulation if enabled
      if (this.config.enableSimulation) {
        this.startSimulation();
      }

      this.state.isRunning = true;
      this.state.sessionStartTime = Date.now();

      console.log(chalk.green.bold('🚀 Otto Live Mode is now active!'));
      console.log(
        chalk.cyan('💬 Speak naturally - your content will appear on boards in real-time...')
      );
      console.log(chalk.gray('Press Ctrl+C to stop recording and finalize exports.\n'));

      this.emit('started');

      // Keep the process running
      this.keepAlive();
    } catch (error) {
      console.error(chalk.red('❌ Failed to start live mode:'), error.message);
      if (this.config.debugMode) {
        console.error(error.stack);
      }
      throw error;
    }
  }

  /**
   * Stop the live processing system
   */
  async stop() {
    if (!this.state.isRunning) {
      return;
    }

    console.log(chalk.yellow('\n🛑 Stopping Otto Live Mode...'));

    try {
      this.state.isRunning = false;

      // Stop recording
      if (this.recorder) {
        await this.recorder.stop();
        console.log(chalk.green('✅ Audio recording stopped'));
      }

      // Finalize real-time updates
      if (this.updater) {
        await this.updater.finalizeSession();
        console.log(chalk.green('✅ Real-time updates finalized'));
      }

      // Stop interface
      if (this.interface) {
        this.interface.stop();
        console.log(chalk.green('✅ Live interface stopped'));
      }

      // Print session summary
      this.printSessionSummary();

      this.emit('stopped');
    } catch (error) {
      console.error(chalk.red('❌ Error during shutdown:'), error.message);
      throw error;
    }
  }

  /**
   * Run initial system checks
   */
  async runSystemChecks() {
    if (!this.config.quietMode) {
      console.log(chalk.blue('🔍 Testing system requirements...'));
    }

    try {
      // Test SimpleLiveRecorder
      console.log(chalk.blue('🧪 Testing Simple Live Recorder...'));
      const testRecorder = new SimpleLiveRecorder({
        chunkDuration: 10000,
        enableVoiceDetection: true,
        outputDir: './temp-test',
      });

      console.log(chalk.blue(`🧪 Testing audio recording for ${10000}ms...`));
      const testResult = await SimpleLiveRecorder.testRecording(10000);

      if (testResult.voiceDetected && testResult.chunksProcessed > 0) {
        console.log(chalk.green('✅ Voice detection working - ready for live mode!'));
      } else {
        console.log(
          chalk.yellow('⚠️ Audio test completed but no voice detected - continuing with simulation')
        );
      }
    } catch (error) {
      console.error(chalk.red('❌ System check failed:'), error.message);
      throw error;
    }
  }

  /**
   * Initialize all system components
   */
  async initializeComponents() {
    console.log(chalk.blue('🔧 Initializing components...'));

    // Initialize recorder
    this.recorder = new SimpleLiveRecorder({
      chunkDuration: this.config.chunkDuration,
      enableVoiceDetection: true,
      outputDir: './temp-audio',
      onVoiceDetected: this.handleVoiceChunk.bind(this),
      onError: this.handleRecordingError.bind(this),
    });

    // Initialize real-time updater
    this.updater = new RealTimeUpdater({
      updateInterval: this.config.updateInterval,
      batchSize: 3,
      enableMiroUpdates: this.config.enableMiroUpdates,
      enableObsidianUpdates: this.config.enableObsidianUpdates,
      enableNotionUpdates: this.config.enableNotionUpdates,
    });

    // Initialize content processor
    this.processor = new ContentProcessor({
      enableEntityRecognition: true,
      enableActionItemDetection: true,
      enableVoiceCommands: true,
      debugMode: this.config.debugMode,
    });

    // Initialize live interface
    if (!this.config.quietMode) {
      this.interface = new LiveInterface({
        updateInterval: 30000,
        showProgress: true,
        compact: false,
      });
    }

    console.log(chalk.green('✅ Components initialized'));
  }

  /**
   * Start live session with board creation
   */
  async startLiveSession() {
    console.log(chalk.blue('🎯 Initializing live session...'));

    const sessionName = `${this.config.sessionName} - ${new Date().toLocaleString('de-DE').replace(/[^a-zA-Z0-9\s-]/g, '')}`;

    await this.updater.initializeLiveSession(sessionName);

    console.log(chalk.green('✅ Live session initialized'));
  }

  /**
   * Start audio recording
   */
  async startRecording() {
    console.log(chalk.blue('🎤 Starting audio recording...'));

    await this.recorder.startRecording();

    console.log(chalk.green('✅ Audio recording active'));
  }

  /**
   * Handle voice chunk from recorder
   */
  async handleVoiceChunk(chunkData) {
    try {
      this.state.totalChunks++;
      this.state.lastActivityTime = Date.now();

      if (!this.config.quietMode) {
        console.log(
          chalk.cyan(`🎤 Chunk ${this.state.totalChunks}: 🗣️ Voice (${chunkData.duration}ms)`)
        );
        console.log(chalk.blue('🗣️ Voice detected in chunk ' + this.state.totalChunks));
      }

      // Process simulated content for now
      if (this.config.enableSimulation) {
        await this.processSimulatedContent();
      }

      // Update interface
      if (this.interface) {
        this.interface.updateStatus({
          sessionTime: Date.now() - this.state.sessionStartTime,
          chunks: this.state.totalChunks,
          characters: this.state.totalCharacters,
          isActive: true,
        });
      }

      this.emit('voiceDetected', chunkData);
    } catch (error) {
      console.error(chalk.red('❌ Error processing voice chunk:'), error.message);
    }
  }

  /**
   * Process simulated content for demonstration
   */
  async processSimulatedContent() {
    const text = this.simulationTexts[this.simulationIndex % this.simulationTexts.length];
    this.simulationIndex++;

    const timestamp = new Date().toLocaleTimeString();
    console.log(chalk.green(`🗣️  [${timestamp}] ${text}`));

    this.state.accumulatedContent += text + ' ';
    this.state.totalCharacters += text.length;

    // Add transcription update
    this.updater.addContentUpdate('transcription', text, {
      timestamp: Date.now(),
      confidence: 0.95,
    });

    // Process entities
    const entities = this.processor.extractEntities(text);
    for (const entity of entities) {
      if (!this.state.entities.has(entity.text)) {
        this.state.entities.add(entity.text);
        console.log(chalk.blue(`🏷️  Entity detected: ${entity.emoji} ${entity.text}`));

        this.updater.addContentUpdate('entity', entity.text, {
          timestamp: Date.now(),
          emoji: entity.emoji,
          type: entity.type,
        });
      }
    }

    // Process action items
    const actionItems = this.processor.extractActionItems(text);
    for (const item of actionItems) {
      this.state.actionItems.push(item);
      console.log(chalk.red(`✅ Action item: ${item}`));

      this.updater.addContentUpdate('action_item', item, {
        timestamp: Date.now(),
        priority: 'medium',
      });
    }

    // Process voice commands
    const commands = this.processor.detectVoiceCommands(text);
    for (const command of commands) {
      this.state.voiceCommands.push(command);
      await this.handleVoiceCommand(command, text);
    }
  }

  /**
   * Handle voice commands
   */
  async handleVoiceCommand(command, text) {
    switch (command.type) {
      case 'export_miro':
        console.log(chalk.magenta('🎨 Miro export triggered by voice command'));
        this.updater.addContentUpdate(
          'summary',
          `Miro Export: ${this.state.accumulatedContent.substring(0, 200)}...`,
          { timestamp: Date.now(), trigger: 'voice_command' }
        );
        break;

      case 'export_all':
        console.log(chalk.magenta('📤 Full export triggered by voice command'));
        break;

      case 'summary':
        console.log(chalk.magenta('📝 Summary requested by voice command'));
        break;

      case 'stop':
        console.log(chalk.magenta('🛑 Stop command detected'));
        setTimeout(() => this.stop(), 1000);
        break;
    }
  }

  /**
   * Handle recording errors
   */
  handleRecordingError(error) {
    console.error(chalk.red('🎤 Recording error:'), error.message);
    this.emit('error', error);
  }

  /**
   * Start simulation mode
   */
  startSimulation() {
    console.log(chalk.yellow('🎭 Simulation mode enabled - generating test content'));

    // Generate content every 4 seconds
    setInterval(() => {
      if (this.state.isRunning) {
        this.processSimulatedContent();
      }
    }, 4000);
  }

  /**
   * Keep the process alive
   */
  keepAlive() {
    // Use setInterval to prevent the process from exiting
    this.keepAliveInterval = setInterval(() => {
      if (!this.state.isRunning) {
        clearInterval(this.keepAliveInterval);
      }
    }, 1000);
  }

  /**
   * Graceful shutdown handler
   */
  async gracefulShutdown() {
    console.log(chalk.yellow('\n🔄 Graceful shutdown initiated...'));

    try {
      await this.stop();
      console.log(chalk.green('✅ Otto Assistant stopped successfully'));
      process.exit(0);
    } catch (error) {
      console.error(chalk.red('❌ Error during shutdown:'), error.message);
      process.exit(1);
    }
  }

  /**
   * Print session summary
   */
  printSessionSummary() {
    const duration = Date.now() - this.state.sessionStartTime;
    const durationMinutes = Math.floor(duration / 60000);
    const durationSeconds = Math.floor((duration % 60000) / 1000);

    console.log(chalk.blue.bold('\n📊 SESSION SUMMARY'));
    console.log('═'.repeat(50));
    console.log(`Duration: ${durationMinutes}m ${durationSeconds}s`);
    console.log(`Audio chunks: ${this.state.totalChunks}`);
    console.log(`Characters transcribed: ${this.state.totalCharacters}`);
    console.log(`Entities detected: ${this.state.entities.size}`);
    console.log(`Action items: ${this.state.actionItems.length}`);
    console.log(`Voice commands: ${this.state.voiceCommands.length}`);
    console.log('═'.repeat(50));

    if (this.state.entities.size > 0) {
      console.log(chalk.blue('\n🏷️ Detected Entities:'));
      Array.from(this.state.entities).forEach((entity) => {
        console.log(`  • ${entity}`);
      });
    }

    if (this.state.actionItems.length > 0) {
      console.log(chalk.blue('\n✅ Action Items:'));
      this.state.actionItems.forEach((item, i) => {
        console.log(`  ${i + 1}. ${item}`);
      });
    }

    console.log(chalk.green.bold('\n🎉 Session completed successfully!'));
  }

  /**
   * Get current session status
   */
  getStatus() {
    return {
      isRunning: this.state.isRunning,
      sessionTime: this.state.sessionStartTime ? Date.now() - this.state.sessionStartTime : 0,
      totalChunks: this.state.totalChunks,
      totalCharacters: this.state.totalCharacters,
      entitiesCount: this.state.entities.size,
      actionItemsCount: this.state.actionItems.length,
      lastActivity: this.state.lastActivityTime,
      config: this.config,
    };
  }
}

module.exports = { OttoLiveSimple };
