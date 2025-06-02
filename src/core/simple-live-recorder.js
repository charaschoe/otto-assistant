/**
 * Simple Live Recorder for Otto Assistant
 * Records audio and provides real-time transcription simulation
 * Works without Whisper for immediate testing
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

class SimpleLiveRecorder extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.config = {
      chunkDuration: options.chunkDuration || 3000,  // 3 seconds
      sampleRate: options.sampleRate || 16000,
      channels: options.channels || 1,
      enableSimulation: options.enableSimulation === true,  // Simulation nur wenn explizit aktiviert
      ...options
    };
    
    this.state = {
      isRecording: false,
      chunkCount: 0,
      sessionStartTime: null,
      totalAudioTime: 0
    };
    
    this.processes = {
      recorder: null
    };
    
    // Setup temp directory
    this.tempDir = path.join(__dirname, '../../temp/live-audio');
    this.ensureTempDirectory();
  }

  /**
   * Start live recording with real-time feedback
   */
  async startRecording() {
    if (this.state.isRecording) {
      console.log("🎤 Already recording...");
      return;
    }

    try {
      console.log("🎤 Starting live audio recording...");
      
      this.state.isRecording = true;
      this.state.sessionStartTime = Date.now();
      this.state.chunkCount = 0;
      
      // Start continuous recording
      await this.startContinuousRecording();
      
      // Start simulation if enabled, otherwise use real transcription
      if (this.config.enableSimulation) {
        this.startTranscriptionSimulation();
      } else {
        console.log("🎤 Real-time Whisper transcription enabled");
      }
      
      console.log("✅ Live recording active - speak naturally!");
      this.emit('recording-started');
      
    } catch (error) {
      console.error("❌ Failed to start recording:", error);
      this.state.isRecording = false;
      throw error;
    }
  }

  /**
   * Stop recording
   */
  async stopRecording() {
    if (!this.state.isRecording) return;

    console.log("🛑 Stopping live recording...");
    
    this.state.isRecording = false;
    
    // Stop recorder process
    if (this.processes.recorder) {
      this.processes.recorder.kill('SIGTERM');
      this.processes.recorder = null;
    }
    
    // Stop simulation
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    
    console.log("✅ Live recording stopped");
    this.emit('recording-stopped');
  }

  /**
   * Start continuous audio recording with SoX
   */
  async startContinuousRecording() {
    return new Promise((resolve, reject) => {
      // Use SoX to record in chunks
      const soxArgs = [
        '-t', 'coreaudio', '-d',       // Input: default Core Audio device
        '-t', 'wav',                   // Output format
        '-r', this.config.sampleRate.toString(),
        '-c', this.config.channels.toString(),
        '-b', '16',                    // 16-bit
        '-'                            // Output to stdout
      ];

      console.log(`🎧 Starting Core Audio recording: sox ${soxArgs.join(' ')}`);
      
      this.processes.recorder = spawn('sox', soxArgs);
      
      let audioBuffer = Buffer.alloc(0);
      const bytesPerSecond = this.config.sampleRate * this.config.channels * 2; // 16-bit = 2 bytes
      const chunkSize = Math.floor(bytesPerSecond * this.config.chunkDuration / 1000);
      
      this.processes.recorder.stdout.on('data', (chunk) => {
        if (!this.state.isRecording) return;
        
        audioBuffer = Buffer.concat([audioBuffer, chunk]);
        
        // Process when we have enough data for a chunk
        if (audioBuffer.length >= chunkSize) {
          const audioChunk = audioBuffer.slice(0, chunkSize);
          audioBuffer = audioBuffer.slice(chunkSize);
          
          this.processAudioChunk(audioChunk);
        }
      });

      this.processes.recorder.stderr.on('data', (data) => {
        const message = data.toString();
        // Filter out normal SoX progress messages
        if (!message.includes('Input File') && !message.includes('Progress')) {
          console.warn("🎤 Recording:", message.trim());
        }
      });

      this.processes.recorder.on('error', (error) => {
        console.error("❌ Recording error:", error);
        reject(error);
      });

      this.processes.recorder.on('spawn', () => {
        console.log("✅ Audio recording started");
        resolve();
      });

      // Timeout for startup
      setTimeout(() => {
        if (this.processes.recorder && !this.processes.recorder.killed) {
          resolve();
        } else {
          reject(new Error("Recording failed to start"));
        }
      }, 2000);
    });
  }

  /**
   * Process audio chunk
   */
  processAudioChunk(audioChunk) {
    this.state.chunkCount++;
    this.state.totalAudioTime += this.config.chunkDuration;
    
    // Detect voice activity
    const hasVoice = this.detectVoiceActivity(audioChunk);
    
    console.log(`🎤 Chunk ${this.state.chunkCount}: ${hasVoice ? '🗣️ Voice' : '🔇 Silence'} (${this.config.chunkDuration}ms)`);
    
    // Emit audio activity
    this.emit('audio-activity', {
      chunkNumber: this.state.chunkCount,
      hasVoice,
      duration: this.config.chunkDuration,
      timestamp: Date.now()
    });
    
    // Save chunk for potential processing
    if (hasVoice) {
      this.saveAudioChunk(audioChunk, this.state.chunkCount);
    }
  }

  /**
   * Simple Voice Activity Detection
   */
  detectVoiceActivity(audioChunk) {
    if (audioChunk.length < 2) return false;
    
    let energy = 0;
    let sampleCount = 0;
    
    // Calculate RMS energy
    for (let i = 44; i < audioChunk.length; i += 2) { // Skip WAV header if present
      const sample = audioChunk.readInt16LE(i);
      energy += sample * sample;
      sampleCount++;
    }
    
    if (sampleCount === 0) return false;
    
    const averageEnergy = energy / sampleCount;
    const rmsEnergy = Math.sqrt(averageEnergy);
    const normalizedEnergy = rmsEnergy / 32768; // Normalize to 0-1
    
    // Threshold for voice detection (adjustable)
    const threshold = 0.01;
    
    return normalizedEnergy > threshold;
  }

  /**
   * Save audio chunk to file
   */
  saveAudioChunk(audioChunk, chunkNumber) {
    try {
      // Add WAV header
      const wavData = this.addWavHeader(audioChunk);
      
      const filename = `chunk-${chunkNumber}-${Date.now()}.wav`;
      const filepath = path.join(this.tempDir, filename);
      
      fs.writeFileSync(filepath, wavData);
      
      console.log(`💾 Saved audio chunk: ${filename} (${wavData.length} bytes)`);
      
      // Emit chunk saved event
      this.emit('chunk-saved', {
        filename,
        filepath,
        chunkNumber,
        size: wavData.length
      });
      
      // If real transcription is enabled, transcribe the chunk
      if (!this.config.enableSimulation) {
        this.transcribeAudioChunk(filepath, chunkNumber);
      }
      
    } catch (error) {
      console.warn("⚠️ Could not save audio chunk:", error.message);
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
   * Start transcription simulation for immediate testing
   */
  startTranscriptionSimulation() {
    console.log("🎭 Starting transcription simulation...");
    
    const simulatedTranscriptions = [
      "Hallo, ich teste das neue Live-System von Otto",
      "Das Mikrofon funktioniert sehr gut",
      "Ich spreche jetzt über die Mercedes Kampagne",
      "Wir brauchen ein neues Moodboard für das Projekt",
      "Die Zielgruppe sind Premium-Kunden zwischen 35 und 55",
      "Action Item: Research zu Konkurrenz durchführen",
      "Nächster Termin ist am Freitag um 14 Uhr",
      "Export to Miro für die Präsentation",
      "Das war ein erfolgreicher Test"
    ];
    
    let simulationIndex = 0;
    
    this.simulationInterval = setInterval(() => {
      if (!this.state.isRecording) return;
      
      if (simulationIndex < simulatedTranscriptions.length) {
        const text = simulatedTranscriptions[simulationIndex];
        
        console.log(`🎭 Simulation: "${text}"`);
        
        this.emit('transcription', {
          text,
          timestamp: Date.now(),
          confidence: 0.85 + Math.random() * 0.1,
          isSimulated: true,
          chunkNumber: this.state.chunkCount
        });
        
        simulationIndex++;
      } else {
        // Reset simulation
        simulationIndex = 0;
      }
      
    }, 4000); // Every 4 seconds
  }

  /**
   * Transcribe audio chunk with Whisper
   */
  async transcribeAudioChunk(audioFilePath, chunkNumber) {
    try {
      console.log(`🔄 Transcribing chunk ${chunkNumber} with faster-whisper...`);
      
      // Create a simple Python script to use faster-whisper
      const pythonScript = `
import sys
from faster_whisper import WhisperModel

model = WhisperModel("base", device="cpu", compute_type="int8")
segments, info = model.transcribe("${audioFilePath}", language="de")

text = ""
for segment in segments:
    text += segment.text + " "

print(text.strip())
`;

      const fs = require('fs');
      const scriptPath = `${this.tempDir}/transcribe_${chunkNumber}.py`;
      fs.writeFileSync(scriptPath, pythonScript);

      const whisperProcess = spawn('python', [scriptPath]);
      
      let transcriptionText = '';
      
      whisperProcess.stdout.on('data', (data) => {
        transcriptionText += data.toString();
      });

      whisperProcess.on('close', (code) => {
        // Cleanup script file
        const fs = require('fs');
        const scriptPath = `${this.tempDir}/transcribe_${chunkNumber}.py`;
        if (fs.existsSync(scriptPath)) {
          fs.unlinkSync(scriptPath);
        }
        
        if (code === 0) {
          const cleanText = transcriptionText.trim();
          
          if (cleanText && cleanText.length > 0 && this.isValidTranscription(cleanText)) {
            console.log(`🗣️ faster-whisper [Chunk ${chunkNumber}]: "${cleanText}"`);
            
            this.emit('transcription', {
              text: cleanText,
              timestamp: Date.now(),
              confidence: this.estimateConfidence(cleanText),
              isSimulated: false,
              chunkNumber: chunkNumber
            });
          } else {
            console.log(`🔇 No valid speech detected in chunk ${chunkNumber}`);
          }
        } else {
          console.warn(`⚠️ faster-whisper process exited with code ${code} for chunk ${chunkNumber}`);
        }
        
        // Cleanup audio file
        if (fs.existsSync(audioFilePath)) {
          fs.unlinkSync(audioFilePath);
        }
      });

      whisperProcess.on('error', (error) => {
        console.error(`❌ faster-whisper transcription error for chunk ${chunkNumber}:`, error);
        
        // Cleanup script file on error
        const fs = require('fs');
        const scriptPath = `${this.tempDir}/transcribe_${chunkNumber}.py`;
        if (fs.existsSync(scriptPath)) {
          fs.unlinkSync(scriptPath);
        }
      });

    } catch (error) {
      console.error(`❌ Transcription failed for chunk ${chunkNumber}:`, error);
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
   * Get recording status
   */
  getStatus() {
    return {
      isRecording: this.state.isRecording,
      chunkCount: this.state.chunkCount,
      totalAudioTime: this.state.totalAudioTime,
      sessionDuration: this.state.sessionStartTime ? Date.now() - this.state.sessionStartTime : 0,
      tempDir: this.tempDir
    };
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
   * Clean up temp files
   */
  cleanup() {
    try {
      const files = fs.readdirSync(this.tempDir);
      files.forEach(file => {
        const filepath = path.join(this.tempDir, file);
        fs.unlinkSync(filepath);
      });
      console.log(`🧹 Cleaned up ${files.length} temp files`);
    } catch (error) {
      console.warn("⚠️ Cleanup warning:", error.message);
    }
  }

  /**
   * Test audio recording functionality
   */
  static async testRecording(duration = 5000) {
    console.log(`🧪 Testing audio recording for ${duration}ms...`);
    
    const recorder = new SimpleLiveRecorder({
      chunkDuration: 2000,
      enableSimulation: false
    });
    
    let voiceDetected = false;
    let chunksProcessed = 0;
    
    recorder.on('audio-activity', (data) => {
      if (data.hasVoice) voiceDetected = true;
      chunksProcessed++;
    });
    
    try {
      await recorder.startRecording();
      
      // Record for specified duration
      await new Promise(resolve => setTimeout(resolve, duration));
      
      await recorder.stopRecording();
      
      console.log(`✅ Test completed: ${chunksProcessed} chunks, voice detected: ${voiceDetected}`);
      
      recorder.cleanup();
      
      return { chunksProcessed, voiceDetected };
      
    } catch (error) {
      console.error("❌ Recording test failed:", error);
      return { chunksProcessed: 0, voiceDetected: false };
    }
  }
}

module.exports = { SimpleLiveRecorder };