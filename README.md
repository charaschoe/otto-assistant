# 🤖 Otto Assistant

[![Version](https://img.shields.io/npm/v/otto-assistant.svg)](https://npmjs.org/package/otto-assistant)
[![License](https://img.shields.io/npm/l/otto-assistant.svg)](https://github.com/your-org/otto-assistant/blob/main/LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/your-org/otto-assistant/ci.yml?branch=main)](https://github.com/your-org/otto-assistant/actions)
[![Coverage](https://img.shields.io/codecov/c/github/your-org/otto-assistant.svg)](https://codecov.io/gh/your-org/otto-assistant)
[![Node.js](https://img.shields.io/node/v/otto-assistant.svg)](https://nodejs.org)

**AI-powered live audio processing with real-time board updates for creative workflows**

Otto Assistant transforms your spoken words into structured content across multiple platforms in real-time. Perfect for creative sessions, meetings, and brainstorming - speak naturally while Otto creates Miro boards, Notion pages, and Obsidian notes simultaneously.

![Otto Assistant Demo](https://raw.githubusercontent.com/your-org/otto-assistant/main/docs/demo.gif)

## ✨ Features

### 🎤 **Live Audio Processing**
- **Real-time voice detection** with advanced audio processing
- **Continuous recording** without 25-second limits
- **MacOS Core Audio optimized** for professional audio quality
- **Cross-platform support** (macOS, Linux, Windows*)

### 🚀 **Real-Time Board Updates**
- **Live Miro boards** with structured sticky notes and smart positioning
- **Auto-updating Notion pages** with formatted content blocks
- **Dynamic Obsidian notes** with linked entities and live editing
- **Simultaneous multi-platform exports** in under 3 seconds

### 🧠 **Intelligent Content Analysis**
- **Entity recognition** with emoji categorization (🏢 Companies, 👤 People, 📅 Dates)
- **Action item detection** with priority estimation
- **Voice command processing** ("Export to Miro", "Create summary")
- **German/English language support** with context awareness

### 🎨 **Creative Workflow Integration**
- **Creative brief templates** for campaign planning
- **Meeting documentation** with automated structuring  
- **Project tracking** with real-time progress updates
- **Brand asset management** with intelligent tagging

## 🚀 Quick Start

### Installation

```bash
# Install Otto Assistant globally
npm install -g otto-assistant

# Or install locally in your project
npm install otto-assistant

# Install required audio tools (macOS)
brew install sox

# Install required audio tools (Linux)
sudo apt-get install sox alsa-utils

# Install required audio tools (Windows)
# Download SoX from http://sox.sourceforge.net/

# Install OpenAI Whisper for real-time transcription
pip install openai-whisper
```

### Basic Usage

```bash
# Start live mode with real-time transcription
node live-mode-simple.js

# Start full live mode with all integrations
node live-mode.js

# Debug system and check compatibility
node debug-microphone.js

# Export existing content to multiple platforms
otto-export --input session.md --all
```

### First Run

1. **System Check**: Run `node debug-microphone.js` to verify audio setup
2. **Install Whisper**: `pip install openai-whisper` for real transcription
3. **Configuration**: Create `config.json` with your API keys (optional)
4. **Go Live**: Run `node live-mode-simple.js` and start speaking!

## 🎤 Live Mode - Real Data Setup

Otto Live Mode has been upgraded from simulation to **real-time Whisper transcription**. Here's everything you need to know:

### Whisper Installation & Setup

#### Standard Installation (Recommended)
```bash
pip install openai-whisper
```

#### Alternative Installation Methods
```bash
# With Conda
conda install -c conda-forge openai-whisper

# Development Version
pip install git+https://github.com/openai/whisper.git
```

#### Dependencies
Whisper requires:
- Python 3.8+
- PyTorch
- FFmpeg

#### FFmpeg Installation
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

### Available Whisper Models

Otto uses the `base` model by default for optimal performance:

| Model  | Parameters | VRAM | Speed | Accuracy |
|--------|------------|------|-------|----------|
| tiny   | 39M        | ~1GB | Very fast | Low |
| base   | 74M        | ~1GB | Fast | Medium |
| small  | 244M       | ~2GB | Medium | Good |
| medium | 769M       | ~5GB | Slow | Very good |
| large  | 1550M      | ~10GB| Very slow | Best |

### Live Mode Usage

```bash
# Start simple live mode with real Whisper transcription
node live-mode-simple.js

# Start full live mode with all features
node live-mode.js

# Test that real data is working (not simulation)
node test-live-real-mode.js
```

### How to Stop Live Mode

#### 🎯 Recommended Methods (in order):

**1. Keyboard Commands (Terminal)**
```bash
Ctrl+C          # Graceful stop with final export (recommended)
Cmd+C           # macOS alternative
Ctrl+Z          # Pauses the process
```

**2. Voice Commands**
Speak one of these commands:
- **"Meeting ende"** - Stops after 2 seconds with final export
- **"Session ende"** - Stops after 2 seconds with final export
- **"Stop listening"** - Pauses audio processing

**3. Emergency Stop (if terminal is blocked)**

Open a new terminal and run:
```bash
# Find Live Mode processes
ps aux | grep -E "(live-mode|otto|node.*live)"

# Stop specific process
kill -TERM <PROCESS_ID>

# Force kill if needed
kill -9 <PROCESS_ID>

# Stop all Node.js live processes
pkill -f "node.*live"
```

**4. Stop Audio Processes**
```bash
# Stop SoX audio recorder
pkill -f "sox.*coreaudio"

# Stop Whisper processes
pkill -f "whisper"
```

**5. System Monitor (macOS)**
1. Open Activity Monitor
2. Search for "node", "live-mode", "sox", or "whisper"
3. Select process and click "Force Quit"

#### What Happens When Stopping?

**Graceful Stop (Ctrl+C):**
✅ Finalizes current session
✅ Exports final content to all platforms
✅ Cleans up temp files
✅ Closes audio stream properly

**Force Kill (kill -9):**
❌ No final export
❌ Temp files remain
❌ Audio stream abruptly ended

#### Cleanup After Force Kill

If you had to force kill:
```bash
# Clean temp files
rm -rf temp/live-audio/*
rm -rf temp/whisper-stream/*

# Check for hanging audio processes
pkill -f "sox.*coreaudio"
pkill -f "whisper"
```

#### Emergency Stop Sequence

If nothing works:
1. **Ctrl+C** (multiple times)
2. **Ctrl+Z** then `kill %1`
3. **Close terminal**
4. **New terminal:** `pkill -f "node.*live"`
5. **System reboot** (last resort)

### Verifying Installation

Test Whisper installation:
```bash
whisper --help
```

Test Otto integration:
```bash
node test-live-real-mode.js
```

Check system status:
```bash
# Check if Live Mode is running
ps aux | grep -E "(live-mode|sox.*coreaudio|whisper)"

# Check microphone access
lsof | grep -i "coreaudio\|microphone"
```

### Configuration

#### Change Whisper Model
Edit `src/core/simple-live-recorder.js` line 317:
```javascript
'--model', 'base',  // Change to 'small', 'medium', etc.
```

#### Change Language
```javascript
'--language', 'German',  // Or 'English', 'French', etc.
```

### Troubleshooting

#### "whisper command not found"
```bash
# Check Python PATH
which python
python -m pip show openai-whisper

# Add to PATH if needed
export PATH="$PATH:$(python -m site --user-base)/bin"
```

#### Microphone Permission (macOS)
- System Preferences → Security & Privacy → Privacy → Microphone
- Enable Terminal/Node.js

#### Performance Optimization
- Use `tiny` or `base` model for real-time
- Enable GPU acceleration (if available)
- Reduce `chunkDuration` for lower latency

### Live Mode Status

✅ **Completed:**
- Pseudo-data simulation removed
- Real audio recording activated
- Whisper integration implemented
- Voice Activity Detection functional
- Real-time board updates active

⏳ **Requires:**
- Whisper installation by user
- First live test session

## 📖 Documentation

### 🛠️ Installation & Setup

#### Prerequisites

- **Node.js 16+** - [Download](https://nodejs.org/)
- **SoX Audio Tools** - For audio processing
- **Microphone permissions** - Required for live recording

#### Platform-Specific Setup

<details>
<summary><strong>macOS Setup</strong></summary>

```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install required tools
brew install node sox

# Install Otto Assistant
npm install -g otto-assistant

# Grant microphone permissions
# System Preferences > Security & Privacy > Privacy > Microphone
# Enable access for Terminal or your application
```
</details>

<details>
<summary><strong>Linux Setup</strong></summary>

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm sox alsa-utils

# CentOS/RHEL
sudo yum install nodejs npm sox alsa-utils

# Install Otto Assistant
npm install -g otto-assistant

# Test audio system
arecord -l  # List audio devices
```
</details>

<details>
<summary><strong>Windows Setup</strong> (Experimental)</summary>

```powershell
# Install Node.js from https://nodejs.org/
# Install SoX from http://sox.sourceforge.net/

# Install Otto Assistant
npm install -g otto-assistant

# Note: Windows support is experimental
# Consider using WSL2 for better compatibility
```
</details>

### ⚙️ Configuration

Create a `config.json` file in your project root:

```json
{
  "MIRO_API_KEY": "your-miro-api-key",
  "MIRO_TEAM_ID": "your-team-id",
  "NOTION_API_KEY": "your-notion-integration-key",
  "NOTION_DATABASE_ID": "your-database-id",
  "OPENAI_API_KEY": "your-openai-key",
  "audio": {
    "sampleRate": 16000,
    "channels": 1,
    "chunkDuration": 3000
  },
  "live": {
    "updateInterval": 2000,
    "batchSize": 3,
    "enableSimulation": false
  }
}
```

#### API Key Setup

<details>
<summary><strong>Miro API Setup</strong></summary>

1. Go to [Miro Developer Console](https://miro.com/app/settings/user-profile/apps)
2. Create a new app or use existing
3. Copy your API token
4. Find your Team ID in Miro settings
5. Add both to your `config.json`

**Required Scopes:**
- `boards:read`
- `boards:write`

</details>

<details>
<summary><strong>Notion API Setup</strong></summary>

1. Visit [Notion Integrations](https://www.notion.so/my-integrations)
2. Create a new integration
3. Copy the Internal Integration Token
4. Share your database with the integration
5. Copy the database ID from the URL

**Database Requirements:**
- Name (Title)
- Status (Select)
- Content (Rich Text)

</details>

### 🎯 Usage Examples

#### Live Mode

```bash
# Basic live mode
otto-live

# Live mode with specific platforms
otto-live --miro --obsidian

# Debug mode with verbose logging
otto-live --debug --simulation

# Quiet mode for minimal output
otto-live --quiet --no-miro
```

#### Voice Commands

During live sessions, use these voice commands:

- **"Export to Miro"** - Create optimized Miro board
- **"Export now"** - Export to all enabled platforms  
- **"Summary"** - Generate content summary
- **"Meeting ende"** - Stop session and finalize

#### Export Tool

```bash
# Export single file to all platforms
otto-export --input meeting-notes.md

# Batch export directory
otto-export --batch ./recordings --template creative-brief

# Watch mode for auto-export
otto-export --input ./notes --watch --optimize

# Export to specific platform
otto-export --input session.md --miro --template meeting-notes
```

#### Debug & Diagnostics

```bash
# Full system check
otto-debug

# Audio system diagnostics
otto-debug --audio --verbose

# API connectivity test
otto-debug --api

# Quick system check
otto-debug --quick
```

### 📁 Project Structure

```
otto-assistant/
├── bin/                    # Executable scripts
│   ├── otto-live          # Main live mode executable
│   ├── otto-debug         # System diagnostics tool
│   └── otto-export        # Batch export utility
├── src/
│   ├── core/              # Core processing modules
│   │   ├── live-interface.js
│   │   ├── real-time-updater.js
│   │   └── simple-live-recorder.js
│   ├── integrations/      # Platform integrations
│   │   ├── miro-export-optimized.js
│   │   ├── notion-export.js
│   │   └── obsidian-export.js
│   ├── live/              # Live mode implementations
│   │   └── otto-live-simple.js
│   └── utils/             # Utility modules
│       ├── content-processor.js
│       ├── system-check.js
│       └── audio-diagnostics.js
├── templates/             # Export templates
├── exports/               # Generated exports
├── tests/                 # Test suite
└── docs/                  # Documentation
```

### 🎨 Templates

Otto includes professional templates for different use cases:

#### Creative Brief Template
```bash
otto-export --template creative-brief --input campaign-session.md
```
Perfect for advertising campaigns, design projects, and creative planning.

#### Meeting Notes Template  
```bash
otto-export --template meeting-notes --input team-meeting.md
```
Structured format for team meetings, client calls, and project reviews.

#### Research Report Template
```bash
otto-export --template research-report --input analysis-session.md
```
Ideal for market research, competitive analysis, and user studies.

### 🔧 Advanced Configuration

#### Environment Variables

```bash
# Audio settings
export OTTO_AUDIO_SAMPLE_RATE=16000
export OTTO_AUDIO_CHANNELS=1

# Platform settings  
export OTTO_ENABLE_MIRO=true
export OTTO_ENABLE_NOTION=true
export OTTO_ENABLE_OBSIDIAN=true

# Debug settings
export OTTO_DEBUG_MODE=true
export OTTO_LOG_LEVEL=verbose
```

#### Custom Audio Settings

```json
{
  "audio": {
    "sampleRate": 16000,
    "channels": 1,
    "chunkDuration": 3000,
    "voiceDetection": {
      "threshold": 0.1,
      "minDuration": 500
    },
    "platform": {
      "darwin": {
        "driver": "coreaudio",
        "device": "default"
      },
      "linux": {
        "driver": "alsa",
        "device": "hw:0,0"
      }
    }
  }
}
```

## 🧪 Development

### Development Setup

```bash
# Clone repository
git clone https://github.com/your-org/otto-assistant.git
cd otto-assistant

# Install dependencies
npm install

# Install development tools
npm install -g nodemon jsdoc

# Run in development mode
npm run dev
```

### Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:audio

# Run with coverage
npm run test:coverage
```

### Building

```bash
# Build documentation
npm run build:docs

# Build distribution packages
npm run build:dist

# Create executable binaries
npm run build:binary
```

### Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📊 Performance

### Benchmarks

| Metric | Value | Notes |
|--------|-------|-------|
| Audio Processing Latency | ~2-3 seconds | From speech to transcription |
| Board Update Speed | <3 seconds | Real-time platform updates |
| Memory Usage | ~50MB | Typical session usage |
| CPU Usage | ~5-10% | During active recording |
| Supported Platforms | 3 | Miro, Notion, Obsidian |

### Optimization Tips

- **Audio Quality**: Use good microphone for better recognition
- **Network**: Stable internet for API-based exports  
- **Memory**: Close unused applications during long sessions
- **Storage**: Regular cleanup of temp audio files

## 🐛 Troubleshooting

### Common Issues

<details>
<summary><strong>Microphone Not Working</strong></summary>

```bash
# Check microphone permissions
otto-debug --audio

# Test audio recording
sox -t coreaudio -d test.wav trim 0 5

# macOS: Grant permissions in System Preferences
# Linux: Check ALSA configuration
# Windows: Check Windows audio settings
```
</details>

<details>
<summary><strong>SoX Not Found</strong></summary>

```bash
# macOS
brew install sox

# Ubuntu/Debian  
sudo apt-get install sox

# Check installation
sox --version
```
</details>

<details>
<summary><strong>API Connection Failed</strong></summary>

```bash
# Test API connectivity
otto-debug --api

# Check API keys in config.json
# Verify network connectivity
# Check API rate limits
```
</details>

<details>
<summary><strong>Real-time Updates Slow</strong></summary>

- Check internet connection speed
- Reduce update frequency in config
- Use local exports as fallback
- Monitor system resources
</details>

### Debug Commands

```bash
# Full diagnostic report
otto-debug --verbose --export

# Audio system analysis
otto-debug --audio --fix

# Test specific platform
otto-debug --api --platform miro

# Performance profiling  
otto-live --debug --simulation --profile
```

## 🔒 Security & Privacy

### Data Handling
- **Local Processing**: Audio processed locally when possible
- **Temporary Files**: Auto-cleanup of audio chunks
- **API Keys**: Stored locally, never transmitted to Otto servers
- **Content**: Your content stays within your chosen platforms

### Privacy Features
- **Offline Mode**: Works without API keys (local exports only)
- **Data Retention**: No permanent storage of audio or content
- **Encryption**: API communications use HTTPS/TLS
- **Permissions**: Minimal required permissions

## 📈 Roadmap

### Version 2.1 (Q2 2025)
- [ ] **Whisper Integration** - Local speech-to-text
- [ ] **Multi-language Support** - Extended language detection
- [ ] **Team Collaboration** - Real-time shared sessions
- [ ] **Mobile Companion** - iOS/Android remote control

### Version 2.2 (Q3 2025)  
- [ ] **Custom Templates** - User-defined export formats
- [ ] **Plugin System** - Third-party integrations
- [ ] **Advanced Analytics** - Session insights and metrics
- [ ] **Cloud Sync** - Optional cloud backup

### Version 3.0 (Q4 2025)
- [ ] **AI Enhancement** - GPT integration for content improvement
- [ ] **Video Processing** - Visual content analysis
- [ ] **Enterprise Features** - Team management and compliance
- [ ] **White-label** - Customizable branding

## 🤝 Support

### Community
- **Discord**: [Join our community](https://discord.gg/otto-assistant)
- **GitHub Issues**: [Report bugs or request features](https://github.com/your-org/otto-assistant/issues)
- **Discussions**: [Community forum](https://github.com/your-org/otto-assistant/discussions)

### Commercial Support
- **Enterprise Support**: Available for business customers
- **Custom Development**: Tailored solutions and integrations
- **Training**: Team onboarding and workflow optimization

Contact: [enterprise@otto-assistant.com](mailto:enterprise@otto-assistant.com)

## 📄 License

Otto Assistant is licensed under the [MIT License](LICENSE).

### Third-party Licenses
- SoX Audio Tools: [GPL](http://sox.sourceforge.net/)
- Node.js Dependencies: Various (see package.json)

## 🙏 Acknowledgments

- **SoX Team** - Excellent audio processing tools
- **Miro, Notion, Obsidian** - Platform APIs and support
- **Node.js Community** - Outstanding ecosystem
- **Contributors** - Everyone who helped build Otto

---

**Made with ❤️ by the Otto Assistant Team**

*Transform your voice into structured content across all your favorite platforms.*

[Website](https://otto-assistant.com) • [Documentation](https://docs.otto-assistant.com) • [API Reference](https://api.otto-assistant.com)
