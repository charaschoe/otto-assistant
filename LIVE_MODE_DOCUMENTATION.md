# 🎤 Otto Assistant Live Mode

## Overview

Otto Live Mode provides continuous speech recognition and real-time processing, eliminating the 25-second audio segment limitation. The system maintains persistent listening, provides immediate feedback, handles continuous speech input with proper audio buffering, and implements real-time speech-to-text conversion with low latency.

## ✨ Key Features

### 🎯 Continuous Recognition
- **No Time Limits**: Speak naturally without 25-second restrictions
- **Persistent Listening**: Maintains active audio monitoring
- **Real-time Processing**: Immediate transcription and feedback
- **Context Persistence**: Maintains conversation context across entire session

### 🔊 Advanced Audio Processing
- **Voice Activity Detection (VAD)**: Automatic detection of speech vs silence
- **Audio Buffering**: Smart buffering with overflow handling
- **Low Latency**: ~2-second processing chunks for responsive feedback
- **Noise Handling**: Configurable silence thresholds and detection

### 🗣️ Natural Speech Interface
- **Voice Commands**: Execute actions through natural speech
- **Interruption Handling**: Graceful management of overlapping speech
- **Command Recognition**: Real-time detection of control phrases
- **Context Awareness**: Commands understand current session state

### 📱 Real-time Visual Interface
- **Live Status Indicators**: Visual feedback for system state
- **Audio Activity Display**: Real-time visualization of voice detection
- **Processing Indicators**: Shows when system is actively processing
- **Session Statistics**: Live display of current session metrics

## 🚀 Getting Started

### Prerequisites
```bash
# Install audio tools (macOS)
brew install sox

# Install speech recognition
pip install openai-whisper

# Ensure Node.js 14+
node --version
```

### Quick Start
```bash
# Start live mode
node live-mode.js

# Test the system
node test-live-mode.js
```

### Configuration
Create or update `config.json`:
```json
{
  "KITEGG_API_KEY": "your-kitegg-key",
  "MIRO_API_KEY": "your-miro-key", 
  "NOTION_API_KEY": "your-notion-key",
  "MIRO_TEAM_ID": "your-team-id"
}
```

## 🎮 Usage

### Starting Live Mode
```bash
node live-mode.js
```

The interface will show:
```
╔═══════════════════════════════════════════════════════════════════╗
║                    🤖 OTTO LIVE ASSISTANT                        ║
║                   Continuous Speech Recognition                   ║
╚═══════════════════════════════════════════════════════════════════╝

📊 LIVE STATUS:
┌─────────────────────────────────────────────────────────────────┐
│ System: 🎤 Actively listening...                               │
│ Audio: 🗣️ Voice detected                                        │
│ Context: 📝 5 entries                                           │
│ Last Activity: Just now                                         │
└─────────────────────────────────────────────────────────────────┘
```

### Voice Commands

#### Session Control
- **"Stop listening"** - Pause audio processing
- **"Neue session"** - Clear context and start fresh
- **"Meeting ende"** - Complete session and export

#### Information Commands  
- **"Status"** - Get current session status
- **"Zusammenfassung"** - Generate live summary of session

#### Export Commands
- **"Export now"** - Export to all platforms immediately
- **"Export to Miro"** - Create optimized Miro board
- **"Export to Obsidian"** - Save to Obsidian vault
- **"Export to Notion"** - Create Notion page

### Keyboard Controls
```
q + Enter    - Quit live mode
s + Enter    - Show detailed status
e + Enter    - Export current session  
c + Enter    - Clear session context
h + Enter    - Show help
```

## 🏗️ System Architecture

### Core Components

#### 1. LiveAudioProcessor
```javascript
const processor = new LiveAudioProcessor({
  sampleRate: 16000,        // Audio sample rate
  chunkDuration: 2000,      // Processing chunk size (ms)
  silenceThreshold: 0.01,   // Voice activity threshold
  maxSilenceDuration: 3000, // Max silence before processing (ms)
  contextWindow: 1800000    // Context retention time (30 min)
});
```

**Features:**
- Real-time audio capture with SoX
- Voice Activity Detection (VAD)
- Audio buffering and chunk management
- Whisper integration for transcription
- Context window management

#### 2. LiveInterface
```javascript
const interface = new LiveInterface();
interface.connectToAudioProcessor(processor);
```

**Features:**
- Real-time status display
- Visual activity indicators
- Command input handling
- Session statistics display
- Error reporting

#### 3. LiveModeManager
```javascript
const manager = new LiveModeManager({
  autoExport: true,         // Enable auto-export
  exportInterval: 300000,   // Export every 5 minutes
  minSegmentLength: 50,     // Minimum content for processing
  maxContextAge: 1800000    // 30-minute context window
});
```

**Features:**
- Orchestrates all components
- Manages session state
- Handles export triggers
- Context management
- Entity extraction

### Audio Processing Pipeline

```
Microphone → SoX → Audio Chunks → VAD → Buffer → Whisper → Text → Processing
                      ↓                           ↓
                Voice Activity              Transcription
                Detection                   Recognition
                      ↓                           ↓
                Status Update              Context Update
```

### Real-time Processing Flow

```
Speech Input → VAD → Buffer Management → Transcription → Entity Extraction
     ↓              ↓                        ↓               ↓
Voice Detected → Chunk Ready → Text Output → Context Update → Export Trigger
```

## ⚙️ Configuration Options

### Audio Processing
```javascript
{
  sampleRate: 16000,          // Audio quality (16kHz recommended)
  channels: 1,                // Mono audio
  chunkDuration: 2000,        // Process every 2 seconds
  silenceThreshold: 0.01,     // Voice detection sensitivity
  maxSilenceDuration: 3000,   // Wait 3s of silence before processing
  bufferSize: 8192,           // Audio buffer size
  vadSensitivity: 0.5         // Voice activity detection sensitivity
}
```

### Session Management
```javascript
{
  autoExport: true,           // Enable automatic exports
  exportInterval: 300000,     // Export every 5 minutes
  minSegmentLength: 50,       // Minimum text length for processing
  maxContextAge: 1800000,     // Keep context for 30 minutes
  contextWindow: 30000        // Context sliding window
}
```

### Display Settings
```javascript
{
  updateInterval: 500,        // Status update frequency (ms)
  maxTranscriptions: 10,      // Keep last N transcriptions
  statusLines: 4              // Number of status lines to display
}
```

## 🎯 Command Recognition

### Trigger Words

#### Completion Triggers
- "fertig", "abschluss", "ende", "das wars"
- "meeting ende", "session beenden"
- "exportieren", "speichern"

#### Immediate Commands
- "stop listening", "pause"
- "neue session", "clear context"
- "status", "zusammenfassung"
- "export now"

#### Export Triggers
- "export to miro", "create board"
- "obsidian export", "save to vault"
- "notion export"

### Command Processing

```javascript
// Voice command detection
if (isCompletionTrigger(text)) {
  await processCompleteSegment();
} else if (isImmediateCommand(text)) {
  await executeImmediateCommand(text);
} else if (isExportTrigger(text)) {
  await triggerExport(text);
}
```

## 📊 Real-time Monitoring

### Status Indicators

#### System Status
- 🎤 **Listening** - Actively monitoring audio
- ⚡ **Processing** - Transcribing or analyzing
- ✅ **Ready** - Idle, waiting for input
- ❌ **Error** - System issue detected

#### Audio Status  
- 🗣️ **Voice** - Speech detected
- 🔇 **Silence** - No audio activity
- 📊 **Level** - Audio input level

#### Context Status
- 📝 **Entries** - Number of context items
- ⏱️ **Age** - Time since last activity
- 🧹 **Cleaned** - Old entries removed

### Performance Metrics

```javascript
// Live performance monitoring
{
  vadProcessingTime: "< 1ms per chunk",
  transcriptionLatency: "2-3 seconds",
  layoutCalculation: "< 1ms per element", 
  memoryUsage: "~50MB base + 5MB per hour",
  cpuUsage: "5-15% during active speech"
}
```

## 🔄 Export Integration

### Automatic Export
- **Interval-based**: Every 5 minutes by default
- **Content-based**: When significant content accumulated
- **Command-triggered**: Via voice commands
- **Session-end**: Final export when stopping

### Platform-Specific Features

#### Miro Export
- Uses optimized layout engine
- No overlapping elements
- 4000x3000px canvas for large displays
- Grid-based positioning
- Interactive discussion areas

#### Obsidian Export
- Structured markdown format
- Entity linking with [[brackets]]
- Template-based organization
- Emoji categorization

#### Notion Export
- Rich text formatting
- Database integration
- Hierarchical organization
- Collaborative features

## 🧪 Testing & Debugging

### Run Test Suite
```bash
node test-live-mode.js
```

Test Coverage:
- ✅ Audio processor functionality
- ✅ Live interface operations
- ✅ Mode manager integration
- ✅ System integration
- ✅ Performance benchmarks
- ✅ Command recognition
- ✅ Real-time features

### Debug Mode
```bash
DEBUG=otto:* node live-mode.js
```

### Performance Monitoring
```javascript
// Built-in performance tracking
const stats = manager.getSessionData();
console.log('Session duration:', stats.sessionDuration);
console.log('Context entries:', stats.context.length);
console.log('Export count:', stats.exportCount);
```

## 🚨 Error Handling

### Graceful Degradation
- Audio failure → Text input fallback
- API failure → Local storage
- Network issues → Retry with backoff
- Memory limits → Context cleanup

### Recovery Mechanisms
- Automatic reconnection for audio
- Context persistence across restarts
- Export retry on failure
- Session state backup

### Error Reporting
```javascript
processor.on('error', (error) => {
  console.error('Audio error:', error);
  // Attempt recovery
});

manager.on('export-failed', (platform, error) => {
  console.warn(`${platform} export failed:`, error);
  // Try alternative export
});
```

## 📈 Performance Optimization

### Audio Processing
- **Chunk-based processing**: 2-second chunks for low latency
- **VAD optimization**: Efficient voice detection algorithm
- **Buffer management**: Circular buffers prevent memory leaks
- **Concurrent processing**: Overlapped transcription and analysis

### Memory Management
- **Context windowing**: Automatic cleanup of old entries
- **Buffer limits**: Prevent unlimited growth
- **Object pooling**: Reuse audio processing objects
- **Garbage collection**: Explicit cleanup triggers

### Network Efficiency
- **Batch exports**: Group API calls when possible
- **Compression**: Reduce payload sizes
- **Caching**: Store frequently used data
- **Retry logic**: Exponential backoff for failures

## 🔒 Privacy & Security

### Local Processing
- Audio stays on device until transcription
- No audio data sent to APIs (only text)
- Context managed locally
- Session data encrypted at rest

### API Security
- Secure key storage in config.json
- HTTPS-only API communication
- Rate limiting protection
- Error message sanitization

## 🛠️ Troubleshooting

### Common Issues

#### Audio Not Detected
```bash
# Check audio devices
sox -t coreaudio -d -n trim 0 5

# Test microphone
sox -t coreaudio -d test.wav trim 0 5
```

#### Whisper Errors
```bash
# Reinstall Whisper
pip uninstall openai-whisper
pip install openai-whisper

# Test Whisper
whisper test.wav --language German
```

#### High CPU Usage
- Reduce chunk duration: `chunkDuration: 3000`
- Increase silence threshold: `silenceThreshold: 0.02`
- Disable auto-export: `autoExport: false`

#### Memory Leaks
- Reduce context window: `maxContextAge: 900000` (15 min)
- Clear context regularly: Voice command "neue session"
- Monitor with: `process.memoryUsage()`

### System Requirements

#### Minimum Requirements
- Node.js 14+
- 4GB RAM
- 1GB free disk space
- Microphone access

#### Recommended Setup
- Node.js 18+
- 8GB RAM
- SSD storage
- Quality USB microphone
- Stable internet connection

## 🚀 Advanced Usage

### Custom Voice Commands
```javascript
// Add custom command recognition
processor.customCommands = {
  'create wireframe': () => exportToMiro('wireframe'),
  'save notes': () => exportToObsidian('notes'),
  'team meeting': () => setMeetingType('team')
};
```

### Integration Examples
```javascript
// Custom export handling
manager.on('export-triggered', async (data) => {
  if (data.command.includes('slack')) {
    await sendToSlack(data.currentText);
  }
});

// Real-time processing hooks
processor.on('transcription', (data) => {
  // Custom processing logic
  if (data.text.includes('action item')) {
    highlightActionItem(data.text);
  }
});
```

### API Extensions
```javascript
// Add custom AI processing
const customAI = new CustomAIService();

manager.processTranscription = async (text) => {
  const enhanced = await customAI.enhance(text);
  return enhanced;
};
```

Otto Live Mode transforms your creative sessions into a seamless, continuous dialogue with AI assistance, making audio capture and processing as natural as having a conversation.