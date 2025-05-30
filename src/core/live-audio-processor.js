/**
 * Continuous Live Audio Processor for Otto Assistant
 * Handles real-time speech recognition with persistent listening
 */

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const { spawn } = require('child_process');
const MacWhisperStream = require('./mac-whisper-stream');

class LiveAudioProcessor extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.config = {
      sampleRate: options.sampleRate || 16000,
      channels: options.channels || 1,
      chunkDuration: options.chunkDuration || 2000, // ms
      silenceThreshold: options.silenceThreshold || 0.01,
      maxSilenceDuration: options.maxSilenceDuration || 3000, // ms
      bufferSize: options.bufferSize || 8192,
      vadSensitivity: options.vadSensitivity || 0.5,
      contextWindow: options.contextWindow || 30000, // ms
      ...options
    };
    
    this.state = {
      isListening: false,
      isProcessing: false,
      audioBuffer: Buffer.alloc(0),
      textBuffer: '',
      silenceStart: null,
      lastActivity: Date.now(),
      sessionContext: [],
      currentSegment: '',
      confidenceThreshold: 0.7
    };
    
    this.processes = {
      recorder: null,
      transcriber: null
    };
    
    // Initialize Mac Whisper Stream for optimized performance
    this.whisperStream = new MacWhisperStream({
      language: 'German',
      model: 'base',
      chunkDuration: this.config.chunkDuration,
      silenceThreshold: this.config.silenceThreshold,
      enableVAD: true
    });
    
    this.setupAudioProcessing();
    this.setupWhisperStreamEvents();
  }

  /**
   * Setup Whisper Stream event handlers
   */
  setupWhisperStreamEvents() {
    this.whisperStream.on('transcription', (data) => {
      this.handleTranscriptionResult(data);
    });

    this.whisperStream.on('audio-activity', (data) => {
      if (data.hasVoice) {
        this.state.lastActivity = Date.now();
        this.emit('voice-detected');
      } else {
        this.emit('silence-detected');
      }
      
      this.emit('audio-activity', data);
    });

    this.whisperStream.on('streaming-started', () => {
      this.emit('listening-started');
    });

    this.whisperStream.on('streaming-stopped', () => {
      this.emit('listening-stopped');
    });
  }

  /**
   * Start continuous listening mode
   */
  async startListening() {
    if (this.state.isListening) {
      console.log("🎤 Already listening...");
      return;
    }

    try {
      console.log("🎤 Starting Mac optimized continuous listening...");
      this.state.isListening = true;
      this.state.lastActivity = Date.now();
      
      // Use optimized Mac Whisper Stream
      await this.whisperStream.startStreaming();
      
      console.log("✅ Live mode active - Speak naturally!");
      
    } catch (error) {
      console.error("❌ Failed to start listening:", error);
      this.state.isListening = false;
      this.emit('error', error);
    }
  }

  /**
   * Handle transcription result from Whisper Stream
   */
  handleTranscriptionResult(data) {
    console.log(`🗣️ Live: "${data.text}"`);
    
    // Add to current segment
    this.state.currentSegment += (this.state.currentSegment ? ' ' : '') + data.text;
    
    // Update context
    this.updateSessionContext(data.text);
    
    // Emit transcription event
    this.emit('transcription', {
      text: data.text,
      currentSegment: this.state.currentSegment,
      context: this.state.sessionContext,
      timestamp: data.timestamp,
      confidence: data.confidence
    });
    
    // Check for commands or completion triggers
    this.processTranscriptionForCommands(data.text);
  }

  /**
   * Stop listening mode
   */
  async stopListening() {
    if (!this.state.isListening) return;

    console.log("🛑 Stopping continuous listening...");
    this.state.isListening = false;
    
    // Stop Whisper Stream
    await this.whisperStream.stopStreaming();
    
    // Cleanup legacy processes if any
    if (this.processes.recorder) {
      this.processes.recorder.kill();
      this.processes.recorder = null;
    }
    
    if (this.processes.transcriber) {
      this.processes.transcriber.kill();
      this.processes.transcriber = null;
    }
    
    this.emit('listening-stopped');
    console.log("✅ Live mode stopped");
  }

  /**
   * Initialize real-time audio recording with SoX
   */
  async initializeAudioRecording() {
    return new Promise((resolve, reject) => {
      // Use SoX for cross-platform audio recording
      const soxArgs = [
        '-t', 'coreaudio',  // macOS input
        '-d',               // default device
        '-t', 'wav',        // output format
        '-r', this.config.sampleRate.toString(),
        '-c', this.config.channels.toString(),
        '-b', '16',         // 16-bit
        '-'                 // output to stdout
      ];

      this.processes.recorder = spawn('sox', soxArgs);
      
      this.processes.recorder.stdout.on('data', (chunk) => {
        this.handleAudioChunk(chunk);
      });

      this.processes.recorder.stderr.on('data', (data) => {
        console.warn("🎤 Audio warning:", data.toString());
      });

      this.processes.recorder.on('error', (error) => {
        console.error("❌ Audio recording error:", error);
        reject(error);
      });

      // Give recorder time to initialize
      setTimeout(() => {
        if (this.processes.recorder && !this.processes.recorder.killed) {
          resolve();
        } else {
          reject(new Error("Failed to start audio recorder"));
        }
      }, 1000);
    });
  }

  /**
   * Handle incoming audio chunks with Voice Activity Detection
   */
  handleAudioChunk(chunk) {
    if (!this.state.isListening) return;

    // Add to audio buffer
    this.state.audioBuffer = Buffer.concat([this.state.audioBuffer, chunk]);
    
    // Voice Activity Detection
    const hasVoice = this.detectVoiceActivity(chunk);
    
    if (hasVoice) {
      this.state.lastActivity = Date.now();
      this.state.silenceStart = null;
      
      this.emit('voice-detected');
      
      // Process if we have enough audio data
      if (this.shouldProcessAudioBuffer()) {
        this.processAudioBuffer();
      }
      
    } else {
      // Handle silence
      if (!this.state.silenceStart) {
        this.state.silenceStart = Date.now();
      }
      
      const silenceDuration = Date.now() - this.state.silenceStart;
      
      if (silenceDuration > this.config.maxSilenceDuration) {
        this.emit('silence-detected', silenceDuration);
        
        // Process accumulated audio if any
        if (this.state.audioBuffer.length > 0) {
          this.processAudioBuffer();
        }
      }
    }
    
    // Emit listening indicator
    this.emit('audio-activity', {
      hasVoice,
      bufferSize: this.state.audioBuffer.length,
      isProcessing: this.state.isProcessing
    });
  }

  /**
   * Simple Voice Activity Detection using energy levels
   */
  detectVoiceActivity(audioChunk) {
    if (audioChunk.length < 2) return false;
    
    let energy = 0;
    for (let i = 0; i < audioChunk.length; i += 2) {
      const sample = audioChunk.readInt16LE(i);
      energy += sample * sample;
    }
    
    const averageEnergy = energy / (audioChunk.length / 2);
    const normalizedEnergy = Math.sqrt(averageEnergy) / 32768;
    
    return normalizedEnergy > this.config.silenceThreshold;
  }

  /**
   * Check if we should process the current audio buffer
   */
  shouldProcessAudioBuffer() {
    const bufferDuration = (this.state.audioBuffer.length / 2) / this.config.sampleRate * 1000;
    return bufferDuration >= this.config.chunkDuration && !this.state.isProcessing;
  }

  /**
   * Process accumulated audio buffer
   */
  async processAudioBuffer() {
    if (this.state.isProcessing || this.state.audioBuffer.length === 0) return;

    this.state.isProcessing = true;
    this.emit('processing-started');

    try {
      // Save audio chunk to temporary file
      const tempFile = path.join(__dirname, '../../temp', `live-${Date.now()}.wav`);
      await this.saveAudioBuffer(tempFile);
      
      // Transcribe audio
      const transcription = await this.transcribeAudio(tempFile);
      
      if (transcription && transcription.trim().length > 0) {
        await this.handleTranscription(transcription);
      }
      
      // Cleanup
      fs.unlinkSync(tempFile);
      this.state.audioBuffer = Buffer.alloc(0);
      
    } catch (error) {
      console.error("❌ Processing error:", error);
      this.emit('processing-error', error);
    } finally {
      this.state.isProcessing = false;
      this.emit('processing-finished');
    }
  }

  /**
   * Save audio buffer to WAV file
   */
  async saveAudioBuffer(filePath) {
    return new Promise((resolve, reject) => {
      // Create WAV header
      const audioData = this.state.audioBuffer;
      const wavHeader = this.createWavHeader(audioData.length);
      const wavFile = Buffer.concat([wavHeader, audioData]);
      
      // Ensure temp directory exists
      const tempDir = path.dirname(filePath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      fs.writeFile(filePath, wavFile, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  /**
   * Create WAV file header
   */
  createWavHeader(dataLength) {
    const header = Buffer.alloc(44);
    
    // RIFF header
    header.write('RIFF', 0);
    header.writeUInt32LE(36 + dataLength, 4);
    header.write('WAVE', 8);
    
    // Format chunk
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16); // Format chunk size
    header.writeUInt16LE(1, 20);  // PCM format
    header.writeUInt16LE(this.config.channels, 22);
    header.writeUInt32LE(this.config.sampleRate, 24);
    header.writeUInt32LE(this.config.sampleRate * this.config.channels * 2, 28); // Byte rate
    header.writeUInt16LE(this.config.channels * 2, 32); // Block align
    header.writeUInt16LE(16, 34); // Bits per sample
    
    // Data chunk
    header.write('data', 36);
    header.writeUInt32LE(dataLength, 40);
    
    return header;
  }

  /**
   * Transcribe audio using Whisper
   */
  async transcribeAudio(filePath) {
    return new Promise((resolve, reject) => {
      const whisperProcess = spawn('whisper', [
        filePath,
        '--model', 'base',
        '--language', 'German',
        '--output_format', 'txt',
        '--output_dir', path.dirname(filePath),
        '--verbose', 'False'
      ]);

      let output = '';
      whisperProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      whisperProcess.on('close', (code) => {
        if (code === 0) {
          // Read transcription from generated file
          const txtFile = filePath.replace('.wav', '.txt');
          if (fs.existsSync(txtFile)) {
            const transcription = fs.readFileSync(txtFile, 'utf8').trim();
            fs.unlinkSync(txtFile); // Cleanup
            resolve(transcription);
          } else {
            resolve('');
          }
        } else {
          reject(new Error(`Whisper failed with code ${code}`));
        }
      });
    });
  }

  /**
   * Handle new transcription with context management
   */
  async handleTranscription(transcription) {
    console.log(`🗣️ Live: "${transcription}"`);
    
    // Add to current segment
    this.state.currentSegment += (this.state.currentSegment ? ' ' : '') + transcription;
    
    // Update context
    this.updateSessionContext(transcription);
    
    // Emit transcription event
    this.emit('transcription', {
      text: transcription,
      currentSegment: this.state.currentSegment,
      context: this.state.sessionContext,
      timestamp: Date.now()
    });
    
    // Check for commands or completion triggers
    await this.processTranscriptionForCommands(transcription);
  }

  /**
   * Update session context with sliding window
   */
  updateSessionContext(transcription) {
    const contextEntry = {
      text: transcription,
      timestamp: Date.now()
    };
    
    this.state.sessionContext.push(contextEntry);
    
    // Remove old context outside window
    const cutoff = Date.now() - this.config.contextWindow;
    this.state.sessionContext = this.state.sessionContext.filter(
      entry => entry.timestamp > cutoff
    );
  }

  /**
   * Process transcription for commands and triggers
   */
  async processTranscriptionForCommands(transcription) {
    const text = transcription.toLowerCase();
    
    // Check for completion triggers
    if (this.isCompletionTrigger(text)) {
      await this.processCompleteSegment();
      return;
    }
    
    // Check for immediate commands
    if (this.isImmediateCommand(text)) {
      await this.executeImmediateCommand(text);
      return;
    }
    
    // Check for export triggers
    if (this.isExportTrigger(text)) {
      await this.triggerExport(text);
      return;
    }
  }

  /**
   * Check if text contains completion trigger words
   */
  isCompletionTrigger(text) {
    const triggers = [
      'fertig', 'abschluss', 'ende', 'das wars', 'meeting ende',
      'session beenden', 'exportieren', 'speichern'
    ];
    
    return triggers.some(trigger => text.includes(trigger));
  }

  /**
   * Check if text contains immediate command
   */
  isImmediateCommand(text) {
    const commands = [
      'stop listening', 'pause', 'neue session', 'clear context',
      'status', 'zusammenfassung', 'export now'
    ];
    
    return commands.some(cmd => text.includes(cmd));
  }

  /**
   * Check if text contains export trigger
   */
  isExportTrigger(text) {
    const triggers = [
      'export to miro', 'create board', 'obsidian export',
      'notion export', 'save to vault'
    ];
    
    return triggers.some(trigger => text.includes(trigger));
  }

  /**
   * Process complete segment
   */
  async processCompleteSegment() {
    if (!this.state.currentSegment.trim()) return;

    console.log("🔄 Processing complete segment...");
    
    this.emit('segment-complete', {
      fullText: this.state.currentSegment,
      context: this.state.sessionContext
    });
    
    // Reset current segment
    this.state.currentSegment = '';
  }

  /**
   * Execute immediate command
   */
  async executeImmediateCommand(command) {
    console.log(`⚡ Executing command: ${command}`);
    
    if (command.includes('stop listening') || command.includes('pause')) {
      await this.stopListening();
    } else if (command.includes('neue session') || command.includes('clear context')) {
      this.clearContext();
    } else if (command.includes('status')) {
      this.reportStatus();
    } else if (command.includes('zusammenfassung')) {
      this.provideSummary();
    }
    
    this.emit('command-executed', { command });
  }

  /**
   * Trigger export process
   */
  async triggerExport(command) {
    console.log(`📤 Export triggered: ${command}`);
    
    this.emit('export-triggered', {
      command,
      currentText: this.state.currentSegment,
      context: this.state.sessionContext
    });
  }

  /**
   * Clear session context
   */
  clearContext() {
    this.state.sessionContext = [];
    this.state.currentSegment = '';
    console.log("🧹 Context cleared");
    this.emit('context-cleared');
  }

  /**
   * Report current status
   */
  reportStatus() {
    const status = {
      isListening: this.state.isListening,
      isProcessing: this.state.isProcessing,
      contextEntries: this.state.sessionContext.length,
      currentSegmentLength: this.state.currentSegment.length,
      lastActivity: this.state.lastActivity
    };
    
    console.log("📊 Status:", status);
    this.emit('status-report', status);
  }

  /**
   * Provide current summary
   */
  provideSummary() {
    const fullText = this.state.sessionContext
      .map(entry => entry.text)
      .join(' ') + ' ' + this.state.currentSegment;
    
    console.log("📝 Current session summary:");
    console.log(fullText.substring(0, 200) + '...');
    
    this.emit('summary-requested', { fullText });
  }

  /**
   * Setup additional audio processing
   */
  setupAudioProcessing() {
    // Ensure temp directory exists
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  }

  /**
   * Get current session data
   */
  getSessionData() {
    return {
      fullText: this.state.sessionContext.map(e => e.text).join(' ') + ' ' + this.state.currentSegment,
      currentSegment: this.state.currentSegment,
      context: this.state.sessionContext,
      isActive: this.state.isListening,
      lastActivity: this.state.lastActivity
    };
  }
}

module.exports = LiveAudioProcessor;