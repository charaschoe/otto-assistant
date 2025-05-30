/**
 * Mac-optimized Whisper Streaming for Otto Assistant
 * Uses Core Audio for real-time audio capture and OpenAI Whisper for transcription
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

class MacWhisperStream extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.config = {
      language: options.language || 'German',
      model: options.model || 'base',
      device: options.device || 'default',
      sampleRate: options.sampleRate || 16000,
      channels: options.channels || 1,
      chunkDuration: options.chunkDuration || 3000,  // 3 seconds for optimal balance
      bufferDuration: options.bufferDuration || 1000, // 1 second overlap
      quality: options.quality || 'good',
      enableVAD: options.enableVAD !== false,
      silenceThreshold: options.silenceThreshold || 0.01,
      ...options
    };
    
    this.state = {
      isRecording: false,
      isTranscribing: false,
      audioBuffer: [],
      tempFiles: new Set(),
      transcriptionQueue: [],
      lastTranscription: null,
      recordingStartTime: null
    };
    
    this.processes = {
      audioCapture: null,
      whisperInstances: []
    };
    
    // Setup temp directory for audio chunks
    this.tempDir = path.join(__dirname, '../../temp/whisper-stream');
    this.ensureTempDirectory();
  }

  /**
   * Start real-time audio streaming and transcription
   */
  async startStreaming() {
    if (this.state.isRecording) {
      console.log("🎤 Already streaming...");
      return;
    }

    try {
      console.log("🎤 Starting Mac Whisper streaming...");
      
      this.state.isRecording = true;
      this.state.recordingStartTime = Date.now();
      
      // Start Core Audio capture
      await this.startAudioCapture();
      
      // Start transcription processing loop
      this.startTranscriptionLoop();
      
      console.log("✅ Mac Whisper streaming active");
      this.emit('streaming-started');
      
    } catch (error) {
      console.error("❌ Failed to start Mac Whisper streaming:", error);
      this.state.isRecording = false;
      throw error;
    }
  }

  /**
   * Stop streaming and cleanup
   */
  async stopStreaming() {
    if (!this.state.isRecording) return;

    console.log("🛑 Stopping Mac Whisper streaming...");
    
    this.state.isRecording = false;
    
    // Stop audio capture
    if (this.processes.audioCapture) {
      this.processes.audioCapture.kill('SIGTERM');
      this.processes.audioCapture = null;
    }
    
    // Stop all Whisper processes
    this.processes.whisperInstances.forEach(process => {
      if (!process.killed) {
        process.kill('SIGTERM');
      }
    });
    this.processes.whisperInstances = [];
    
    // Process any remaining audio
    if (this.state.audioBuffer.length > 0) {
      await this.processAudioBuffer();
    }
    
    // Cleanup temp files
    this.cleanupTempFiles();
    
    console.log("✅ Mac Whisper streaming stopped");
    this.emit('streaming-stopped');
  }

  /**
   * Start Core Audio capture using SoX
   */
  async startAudioCapture() {
    return new Promise((resolve, reject) => {
      // Use Core Audio with SoX for Mac
      const soxArgs = [
        '-t', 'coreaudio',
        this.config.device === 'default' ? '-d' : this.config.device,
        '-t', 'wav',
        '-r', this.config.sampleRate.toString(),
        '-c', this.config.channels.toString(),
        '-b', '16',
        '-'  // Output to stdout
      ];

      console.log(`🎧 Starting Core Audio capture: sox ${soxArgs.join(' ')}`);
      
      this.processes.audioCapture = spawn('sox', soxArgs);
      
      let audioData = Buffer.alloc(0);
      const chunkSize = Math.floor(this.config.sampleRate * this.config.chunkDuration / 1000) * 2; // 16-bit samples
      
      this.processes.audioCapture.stdout.on('data', (chunk) => {
        if (!this.state.isRecording) return;
        
        audioData = Buffer.concat([audioData, chunk]);
        
        // Process when we have enough data
        while (audioData.length >= chunkSize) {
          const audioChunk = audioData.slice(0, chunkSize);
          audioData = audioData.slice(chunkSize);
          
          this.handleAudioChunk(audioChunk);
        }
      });

      this.processes.audioCapture.stderr.on('data', (data) => {
        const message = data.toString();
        if (!message.includes('Press Ctrl+C') && !message.includes('Input File')) {
          console.warn("🎤 Audio capture warning:", message);
        }
      });

      this.processes.audioCapture.on('error', (error) => {
        console.error("❌ Audio capture error:", error);
        reject(error);
      });

      this.processes.audioCapture.on('spawn', () => {
        console.log("✅ Core Audio capture started");
        resolve();
      });

      // Timeout for startup
      setTimeout(() => {
        if (this.processes.audioCapture && !this.processes.audioCapture.killed) {
          resolve();
        } else {
          reject(new Error("Audio capture failed to start"));
        }
      }, 2000);
    });
  }

  /**
   * Handle incoming audio chunks
   */
  handleAudioChunk(chunk) {
    // Add WAV header for compatibility
    const wavChunk = this.addWavHeader(chunk);
    
    // Add to buffer
    this.state.audioBuffer.push({
      data: wavChunk,
      timestamp: Date.now(),
      processed: false
    });
    
    // Emit audio activity
    const hasVoice = this.detectVoiceActivity(chunk);
    this.emit('audio-activity', {
      hasVoice,
      bufferLength: this.state.audioBuffer.length,
      timestamp: Date.now()
    });
    
    // Trigger processing if buffer is full
    if (this.state.audioBuffer.length >= 3) { // 3 chunks = ~9 seconds with overlap
      this.processAudioBuffer();
    }
  }

  /**
   * Add WAV header to raw audio data
   */
  addWavHeader(audioData) {
    const header = Buffer.alloc(44);
    
    // RIFF header
    header.write('RIFF', 0);
    header.writeUInt32LE(36 + audioData.length, 4);
    header.write('WAVE', 8);
    
    // Format chunk
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20);  // PCM
    header.writeUInt16LE(this.config.channels, 22);
    header.writeUInt32LE(this.config.sampleRate, 24);
    header.writeUInt32LE(this.config.sampleRate * this.config.channels * 2, 28);
    header.writeUInt16LE(this.config.channels * 2, 32);
    header.writeUInt16LE(16, 34);
    
    // Data chunk
    header.write('data', 36);
    header.writeUInt32LE(audioData.length, 40);
    
    return Buffer.concat([header, audioData]);
  }

  /**
   * Simple Voice Activity Detection
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
   * Process accumulated audio buffer
   */
  async processAudioBuffer() {
    if (this.state.audioBuffer.length === 0 || this.state.isTranscribing) return;
    
    this.state.isTranscribing = true;
    
    try {
      // Take oldest unprocessed chunks with overlap
      const chunksToProcess = this.state.audioBuffer
        .filter(chunk => !chunk.processed)
        .slice(0, 2); // Process 2 chunks at a time
      
      if (chunksToProcess.length === 0) {
        this.state.isTranscribing = false;
        return;
      }
      
      // Mark chunks as processed
      chunksToProcess.forEach(chunk => chunk.processed = true);
      
      // Combine chunks for transcription
      const combinedAudio = this.combineAudioChunks(chunksToProcess);
      
      // Save to temp file
      const tempFile = path.join(this.tempDir, `audio-${Date.now()}.wav`);
      fs.writeFileSync(tempFile, combinedAudio);
      this.state.tempFiles.add(tempFile);
      
      // Transcribe asynchronously
      this.transcribeAudio(tempFile, chunksToProcess[0].timestamp);
      
      // Remove old processed chunks
      this.state.audioBuffer = this.state.audioBuffer.filter(chunk => !chunk.processed);
      
    } catch (error) {
      console.error("❌ Audio buffer processing failed:", error);
    } finally {
      this.state.isTranscribing = false;
    }
  }

  /**
   * Combine multiple audio chunks
   */
  combineAudioChunks(chunks) {
    // Remove headers and combine raw audio data
    const audioDataParts = chunks.map(chunk => chunk.data.slice(44)); // Skip WAV header
    const combinedAudioData = Buffer.concat(audioDataParts);
    
    // Add new WAV header for combined data
    return this.addWavHeader(combinedAudioData);
  }

  /**
   * Transcribe audio file with Whisper
   */
  async transcribeAudio(audioFile, timestamp) {
    try {
      const whisperArgs = [
        audioFile,
        '--model', this.config.model,
        '--language', this.config.language,
        '--output_format', 'txt',
        '--output_dir', this.tempDir,
        '--verbose', 'False',
        '--no_speech_threshold', '0.6',
        '--condition_on_previous_text', 'True'
      ];

      const whisperProcess = spawn('whisper', whisperArgs);
      this.processes.whisperInstances.push(whisperProcess);

      let transcriptionText = '';
      
      whisperProcess.on('close', (code) => {
        // Remove from active processes
        this.processes.whisperInstances = this.processes.whisperInstances
          .filter(p => p !== whisperProcess);
        
        if (code === 0) {
          // Read transcription result
          const txtFile = audioFile.replace('.wav', '.txt');
          if (fs.existsSync(txtFile)) {
            transcriptionText = fs.readFileSync(txtFile, 'utf8').trim();
            
            // Cleanup transcription file
            fs.unlinkSync(txtFile);
            
            if (transcriptionText && transcriptionText.length > 0) {
              this.handleTranscriptionResult(transcriptionText, timestamp);
            }
          }
        } else {
          console.warn(`⚠️ Whisper process exited with code ${code}`);
        }
        
        // Cleanup audio file
        if (fs.existsSync(audioFile)) {
          fs.unlinkSync(audioFile);
          this.state.tempFiles.delete(audioFile);
        }
      });

      whisperProcess.on('error', (error) => {
        console.error("❌ Whisper transcription error:", error);
      });

    } catch (error) {
      console.error("❌ Transcription failed:", error);
    }
  }

  /**
   * Handle transcription result
   */
  handleTranscriptionResult(text, timestamp) {
    // Filter out common Whisper artifacts
    if (this.isValidTranscription(text)) {
      const transcriptionData = {
        text: text.trim(),
        timestamp: timestamp,
        confidence: this.estimateConfidence(text),
        duration: Date.now() - timestamp
      };
      
      this.state.lastTranscription = transcriptionData;
      
      console.log(`🗣️ [${new Date(timestamp).toLocaleTimeString()}] ${text}`);
      
      this.emit('transcription', transcriptionData);
    }
  }

  /**
   * Check if transcription is valid (not Whisper artifacts)
   */
  isValidTranscription(text) {
    const invalidPatterns = [
      /^[\s\.,;!?\-]*$/,           // Only punctuation/whitespace
      /^(uh|uhm|äh|ähm)+[\s\.,]*$/i, // Only filler words
      /^\[[^\]]*\]$/,              // Only [brackets]
      /^[a-z]$/,                   // Single lowercase letter
      /^\d+$/                      // Only numbers
    ];
    
    const cleaned = text.trim();
    
    // Must have minimum length
    if (cleaned.length < 3) return false;
    
    // Check against invalid patterns
    return !invalidPatterns.some(pattern => pattern.test(cleaned));
  }

  /**
   * Estimate transcription confidence based on text characteristics
   */
  estimateConfidence(text) {
    let confidence = 0.8; // Base confidence
    
    // Longer text generally more reliable
    if (text.length > 20) confidence += 0.1;
    if (text.length > 50) confidence += 0.1;
    
    // Proper capitalization and punctuation
    if (/^[A-ZÄÖÜ]/.test(text)) confidence += 0.05;
    if (/[.!?]$/.test(text)) confidence += 0.05;
    
    // Contains common German words
    const germanWords = ['der', 'die', 'das', 'und', 'ist', 'ich', 'wir', 'sie', 'haben', 'sind'];
    if (germanWords.some(word => text.toLowerCase().includes(word))) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Start transcription processing loop
   */
  startTranscriptionLoop() {
    // Process audio buffer every 2 seconds
    this.transcriptionInterval = setInterval(() => {
      if (this.state.isRecording && !this.state.isTranscribing) {
        this.processAudioBuffer();
      }
    }, 2000);
  }

  /**
   * Ensure temp directory exists
   */
  ensureTempDirectory() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Cleanup temporary files
   */
  cleanupTempFiles() {
    this.state.tempFiles.forEach(file => {
      try {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      } catch (error) {
        console.warn(`⚠️ Could not cleanup ${file}:`, error.message);
      }
    });
    
    this.state.tempFiles.clear();
  }

  /**
   * Get streaming status
   */
  getStatus() {
    return {
      isRecording: this.state.isRecording,
      isTranscribing: this.state.isTranscribing,
      bufferLength: this.state.audioBuffer.length,
      activeTranscriptions: this.processes.whisperInstances.length,
      uptime: this.state.recordingStartTime ? Date.now() - this.state.recordingStartTime : 0,
      lastTranscription: this.state.lastTranscription
    };
  }

  /**
   * List available audio devices (Mac Core Audio)
   */
  static async listAudioDevices() {
    return new Promise((resolve, reject) => {
      const soxProcess = spawn('sox', ['--help-device']);
      
      let output = '';
      soxProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      soxProcess.on('close', (code) => {
        if (code === 0) {
          const devices = output.match(/AUDIO DEVICE TYPE .+/g) || [];
          resolve(devices);
        } else {
          reject(new Error('Could not list audio devices'));
        }
      });
    });
  }

  /**
   * Test audio input
   */
  static async testAudioInput(duration = 5000) {
    console.log(`🧪 Testing audio input for ${duration}ms...`);
    
    return new Promise((resolve, reject) => {
      const testProcess = spawn('sox', [
        '-t', 'coreaudio', '-d',
        '-n', 'trim', '0', (duration / 1000).toString()
      ]);
      
      testProcess.on('close', (code) => {
        if (code === 0) {
          console.log("✅ Audio input test successful");
          resolve(true);
        } else {
          console.error("❌ Audio input test failed");
          resolve(false);
        }
      });
      
      testProcess.on('error', (error) => {
        console.error("❌ Audio test error:", error);
        reject(error);
      });
    });
  }
}

module.exports = MacWhisperStream;