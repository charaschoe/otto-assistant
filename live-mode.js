#!/usr/bin/env node

/**
 * Otto Assistant Live Mode
 * Continuous speech recognition with real-time processing
 */

const LiveModeManager = require('./src/core/live-mode-manager');

async function main() {
  console.log("🤖 Otto Assistant Live Mode");
  console.log("══════════════════════════════════════════════════════════════════");
  
  // Check system requirements
  if (!await checkSystemRequirements()) {
    console.error("❌ System requirements not met. Please install required dependencies.");
    process.exit(1);
  }
  
  // Create live mode manager with configuration
  const liveManager = new LiveModeManager({
    autoExport: true,
    exportInterval: 300000,     // 5 minutes
    minSegmentLength: 50,
    maxContextAge: 1800000,     // 30 minutes
    chunkDuration: 2000,        // 2 seconds
    silenceThreshold: 0.01,
    maxSilenceDuration: 3000    // 3 seconds
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log("\n🛑 Received interrupt signal...");
    await liveManager.stopLiveMode();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    console.log("\n🛑 Received termination signal...");
    await liveManager.stopLiveMode();
    process.exit(0);
  });
  
  // Handle uncaught errors
  process.on('uncaughtException', async (error) => {
    console.error("\n💥 Uncaught exception:", error);
    await liveManager.stopLiveMode();
    process.exit(1);
  });
  
  process.on('unhandledRejection', async (reason, promise) => {
    console.error("\n💥 Unhandled rejection at:", promise, 'reason:', reason);
    await liveManager.stopLiveMode();
    process.exit(1);
  });
  
  try {
    // Start live mode
    await liveManager.startLiveMode();
    
    // Keep process alive
    console.log("🎤 Live mode is active. Press Ctrl+C to stop.");
    
    // The process will continue running until stopped
    process.stdin.setRawMode(true);
    process.stdin.resume();
    
  } catch (error) {
    console.error("❌ Failed to start live mode:", error);
    process.exit(1);
  }
}

/**
 * Check system requirements
 */
async function checkSystemRequirements() {
  const { spawn } = require('child_process');
  
  console.log("🔍 Checking system requirements...");
  
  // Check for SoX (audio recording)
  const soxCheck = await checkCommand('sox', ['--version']);
  if (!soxCheck) {
    console.error("❌ SoX not found. Install with: brew install sox (macOS) or apt-get install sox (Linux)");
    return false;
  }
  console.log("✅ SoX audio tools available");
  
  // Check for Whisper (speech recognition)
  const whisperCheck = await checkCommand('whisper', ['--help']);
  if (!whisperCheck) {
    console.error("❌ Whisper not found. Install with: pip install openai-whisper");
    return false;
  }
  console.log("✅ OpenAI Whisper available");
  
  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (majorVersion < 14) {
    console.error(`❌ Node.js ${majorVersion} is too old. Please upgrade to Node.js 14+`);
    return false;
  }
  console.log(`✅ Node.js ${nodeVersion} is compatible`);
  
  // Check configuration
  try {
    const config = require('./config.json');
    if (!config.KITEGG_API_KEY) {
      console.warn("⚠️ KITEGG_API_KEY not configured. Summary generation may fail.");
    }
    
    console.log("✅ Configuration loaded");
  } catch (e) {
    console.warn("⚠️ config.json not found. Using environment variables.");
  }
  
  console.log("✅ All requirements satisfied");
  return true;
}

/**
 * Check if a command is available
 */
function checkCommand(command, args = []) {
  return new Promise((resolve) => {
    const { spawn } = require('child_process');
    
    const process = spawn(command, args, { stdio: 'ignore' });
    
    process.on('close', (code) => {
      resolve(code !== 127); // 127 = command not found
    });
    
    process.on('error', () => {
      resolve(false);
    });
    
    // Timeout after 5 seconds
    setTimeout(() => {
      process.kill();
      resolve(false);
    }, 5000);
  });
}

/**
 * Show usage instructions
 */
function showUsage() {
  console.log(`
🎤 Otto Assistant Live Mode

USAGE:
  node live-mode.js

VOICE COMMANDS:
  "Stop listening"     - Pause audio processing
  "Export now"         - Trigger immediate export to all platforms
  "Export to Miro"     - Export only to Miro with optimized layout
  "Export to Obsidian" - Export only to Obsidian vault
  "Export to Notion"   - Export only to Notion
  "Neue session"       - Clear context and start fresh
  "Status"             - Get current session status
  "Zusammenfassung"    - Generate live summary
  "Meeting ende"       - Complete session and perform final export

KEYBOARD COMMANDS:
  q + Enter           - Quit live mode
  s + Enter           - Show detailed status
  e + Enter           - Export current session
  c + Enter           - Clear session context
  h + Enter           - Show help

FEATURES:
  • Continuous speech recognition (no 25-second limit)
  • Real-time transcription with low latency
  • Voice Activity Detection for natural pauses
  • Context management across conversation
  • Auto-export every 5 minutes
  • Optimized Miro layouts for large whiteboards
  • Visual indicators for system state
  • Graceful interruption handling

REQUIREMENTS:
  • SoX audio tools (brew install sox)
  • OpenAI Whisper (pip install openai-whisper)
  • Node.js 14+
  • Configured API keys in config.json
`);
}

// Show usage if --help flag is passed
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showUsage();
  process.exit(0);
}

// Run main function
if (require.main === module) {
  main().catch(error => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
}

module.exports = { main, checkSystemRequirements };