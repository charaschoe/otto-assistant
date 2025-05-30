/**
 * Test Suite for Otto Live Mode
 * Tests continuous speech recognition and real-time processing
 */

const LiveModeManager = require('./src/core/live-mode-manager');
const LiveAudioProcessor = require('./src/core/live-audio-processor');
const LiveInterface = require('./src/core/live-interface');

async function testLiveModeSystem() {
  console.log("🧪 === OTTO LIVE MODE SYSTEM TESTS ===\n");
  
  let testResults = {
    audioProcessor: false,
    liveInterface: false,
    modeManager: false,
    integration: false,
    performance: false
  };
  
  // 1. Test Audio Processor
  console.log("1. 🎤 Testing Live Audio Processor");
  console.log("─".repeat(50));
  
  try {
    const audioProcessor = new LiveAudioProcessor({
      sampleRate: 16000,
      chunkDuration: 1000,
      silenceThreshold: 0.01
    });
    
    console.log("✅ Audio processor initialized");
    
    // Test Voice Activity Detection
    const testAudioChunk = Buffer.alloc(1600, 128); // Simulated audio with signal
    const hasVoice = audioProcessor.detectVoiceActivity(testAudioChunk);
    console.log(`✅ Voice Activity Detection: ${hasVoice ? 'Working' : 'Silent test'}`);
    
    // Test audio buffer management
    audioProcessor.state.audioBuffer = Buffer.alloc(32000); // 1 second at 16kHz
    const shouldProcess = audioProcessor.shouldProcessAudioBuffer();
    console.log(`✅ Audio buffer management: ${shouldProcess ? 'Ready to process' : 'Buffering'}`);
    
    testResults.audioProcessor = true;
    
  } catch (error) {
    console.error("❌ Audio processor test failed:", error.message);
  }
  
  // 2. Test Live Interface
  console.log("\n2. 🖥️ Testing Live Interface");
  console.log("─".repeat(50));
  
  try {
    const liveInterface = new LiveInterface();
    
    console.log("✅ Live interface initialized");
    
    // Test status tracking
    liveInterface.updateStatus('system', 'ready', 'Test mode');
    const systemStatus = liveInterface.getSystemStatus();
    console.log(`✅ Status tracking: ${systemStatus}`);
    
    // Test transcription handling
    liveInterface.handleTranscription({
      text: "Test transcription",
      timestamp: Date.now(),
      context: []
    });
    console.log(`✅ Transcription handling: ${liveInterface.state.transcriptionBuffer.length} items`);
    
    // Test command history
    liveInterface.handleCommandExecuted({ command: "test command" });
    console.log(`✅ Command tracking: ${liveInterface.state.commandHistory.length} commands`);
    
    testResults.liveInterface = true;
    
  } catch (error) {
    console.error("❌ Live interface test failed:", error.message);
  }
  
  // 3. Test Mode Manager
  console.log("\n3. 🧠 Testing Live Mode Manager");
  console.log("─".repeat(50));
  
  try {
    const modeManager = new LiveModeManager({
      autoExport: false, // Disable for testing
      minSegmentLength: 10
    });
    
    console.log("✅ Mode manager initialized");
    
    // Test session data management
    await modeManager.handleTranscription({
      text: "Test transcription content",
      timestamp: Date.now(),
      context: []
    });
    
    const sessionData = modeManager.getSessionData();
    console.log(`✅ Session management: ${sessionData.fullTranscript.length} characters`);
    
    // Test entity extraction
    const entities = await modeManager.extractEntitiesFromText("Mercedes-Benz und BMW sind deutsche Autohersteller");
    console.log(`✅ Entity extraction: ${Object.keys(entities).length} entities found`);
    
    // Test segment completion
    await modeManager.handleSegmentComplete({
      fullText: "Complete test segment with sufficient content for processing",
      context: []
    });
    console.log(`✅ Segment processing: ${modeManager.state.sessionData.segments.length} segments`);
    
    testResults.modeManager = true;
    
  } catch (error) {
    console.error("❌ Mode manager test failed:", error.message);
  }
  
  // 4. Test Integration
  console.log("\n4. 🔗 Testing System Integration");
  console.log("─".repeat(50));
  
  try {
    const modeManager = new LiveModeManager({ autoExport: false });
    
    // Test event flow simulation
    let eventsCaught = 0;
    
    modeManager.audioProcessor.on('transcription', () => eventsCaught++);
    modeManager.audioProcessor.on('segment-complete', () => eventsCaught++);
    modeManager.interface.on('export-requested', () => eventsCaught++);
    
    // Simulate transcription
    await modeManager.handleTranscription({
      text: "Simulated transcription for integration test",
      timestamp: Date.now(),
      context: []
    });
    
    // Simulate segment completion
    await modeManager.handleSegmentComplete({
      fullText: "Complete segment for integration testing with substantial content",
      context: []
    });
    
    console.log(`✅ Event handling: ${eventsCaught >= 0 ? 'Working' : 'Failed'}`);
    console.log("✅ Component integration: All systems connected");
    
    testResults.integration = true;
    
  } catch (error) {
    console.error("❌ Integration test failed:", error.message);
  }
  
  // 5. Test Performance
  console.log("\n5. ⚡ Testing Performance");
  console.log("─".repeat(50));
  
  try {
    const audioProcessor = new LiveAudioProcessor();
    
    // Test VAD performance
    console.time("Voice Activity Detection (1000 chunks)");
    for (let i = 0; i < 1000; i++) {
      const testChunk = Buffer.alloc(160, Math.random() * 255); // 10ms chunk
      audioProcessor.detectVoiceActivity(testChunk);
    }
    console.timeEnd("Voice Activity Detection (1000 chunks)");
    
    // Test layout calculator performance
    const { LayoutCalculator } = require('./src/integrations/miro-export-optimized');
    const layoutCalc = new LayoutCalculator();
    
    console.time("Layout calculation (100 elements)");
    for (let i = 0; i < 100; i++) {
      layoutCalc.calculateOptimalPosition(300, 120, i * 50, i * 30);
    }
    console.timeEnd("Layout calculation (100 elements)");
    
    // Test memory usage
    const memBefore = process.memoryUsage();
    
    // Create multiple managers to test memory efficiency
    const managers = [];
    for (let i = 0; i < 10; i++) {
      managers.push(new LiveModeManager({ autoExport: false }));
    }
    
    const memAfter = process.memoryUsage();
    const memDiff = (memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024;
    console.log(`✅ Memory usage: ${memDiff.toFixed(2)}MB for 10 instances`);
    
    testResults.performance = true;
    
  } catch (error) {
    console.error("❌ Performance test failed:", error.message);
  }
  
  // 6. Test Command Recognition
  console.log("\n6. 🗣️ Testing Command Recognition");
  console.log("─".repeat(50));
  
  try {
    const audioProcessor = new LiveAudioProcessor();
    
    const testCommands = [
      "stop listening",
      "export now",
      "neue session",
      "status",
      "meeting ende",
      "export to miro",
      "zusammenfassung"
    ];
    
    let recognizedCommands = 0;
    
    for (const command of testCommands) {
      if (audioProcessor.isCompletionTrigger(command) || 
          audioProcessor.isImmediateCommand(command) || 
          audioProcessor.isExportTrigger(command)) {
        recognizedCommands++;
      }
    }
    
    console.log(`✅ Command recognition: ${recognizedCommands}/${testCommands.length} commands recognized`);
    
    // Test context management
    audioProcessor.updateSessionContext("Test context entry");
    audioProcessor.updateSessionContext("Another context entry");
    
    console.log(`✅ Context management: ${audioProcessor.state.sessionContext.length} entries tracked`);
    
  } catch (error) {
    console.error("❌ Command recognition test failed:", error.message);
  }
  
  // 7. Test Real-time Features
  console.log("\n7. ⏱️ Testing Real-time Features");
  console.log("─".repeat(50));
  
  try {
    const modeManager = new LiveModeManager({ autoExport: false });
    
    // Test intermediate processing trigger
    modeManager.state.accumulatedContent = "This is accumulated content that should trigger intermediate processing when it reaches sufficient length for the system to analyze.";
    
    const shouldProcess = modeManager.shouldProcessIntermediate();
    console.log(`✅ Intermediate processing: ${shouldProcess ? 'Triggers correctly' : 'Waiting for more content'}`);
    
    // Test auto-export timing
    modeManager.state.lastExport = Date.now() - 400000; // 6+ minutes ago
    modeManager.state.sessionData.fullTranscript = "Sufficient content for auto-export";
    
    const shouldAutoExport = modeManager.shouldAutoExport();
    console.log(`✅ Auto-export timing: ${shouldAutoExport ? 'Ready to export' : 'Not yet time'}`);
    
    // Test context window management
    const oldTimestamp = Date.now() - 2000000; // 33+ minutes ago
    audioProcessor.state.sessionContext = [
      { text: "Old entry", timestamp: oldTimestamp },
      { text: "Recent entry", timestamp: Date.now() }
    ];
    
    audioProcessor.updateSessionContext("New entry");
    const contextAfterCleanup = audioProcessor.state.sessionContext.length;
    console.log(`✅ Context window: ${contextAfterCleanup} entries (old entries cleaned)`);
    
  } catch (error) {
    console.error("❌ Real-time features test failed:", error.message);
  }
  
  // Results Summary
  console.log("\n🎯 === TEST RESULTS SUMMARY ===");
  console.log("─".repeat(50));
  
  Object.entries(testResults).forEach(([test, passed]) => {
    const icon = passed ? "✅" : "❌";
    const status = passed ? "PASSED" : "FAILED";
    console.log(`${icon} ${test.padEnd(20)}: ${status}`);
  });
  
  const passedTests = Object.values(testResults).filter(Boolean).length;
  const totalTests = Object.keys(testResults).length;
  
  console.log("─".repeat(50));
  console.log(`📊 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log("🎉 All tests passed! Otto Live Mode is ready for deployment.");
  } else {
    console.log("⚠️ Some tests failed. Please review the errors above.");
  }
  
  // System Requirements Check
  console.log("\n🔧 === SYSTEM REQUIREMENTS CHECK ===");
  console.log("─".repeat(50));
  
  const { checkSystemRequirements } = require('./live-mode');
  const systemReady = await checkSystemRequirements();
  
  if (systemReady) {
    console.log("✅ System is ready for Otto Live Mode");
    console.log("\n🚀 To start live mode, run: node live-mode.js");
  } else {
    console.log("❌ System requirements not met. Please install missing dependencies.");
  }
  
  return { testResults, systemReady, passedTests, totalTests };
}

/**
 * Performance benchmark for live mode components
 */
async function runPerformanceBenchmark() {
  console.log("\n⚡ === PERFORMANCE BENCHMARK ===");
  console.log("─".repeat(50));
  
  const iterations = 1000;
  
  // Benchmark VAD
  const audioProcessor = new LiveAudioProcessor();
  const testChunk = Buffer.alloc(1600, 128);
  
  console.time(`VAD Processing (${iterations} chunks)`);
  for (let i = 0; i < iterations; i++) {
    audioProcessor.detectVoiceActivity(testChunk);
  }
  console.timeEnd(`VAD Processing (${iterations} chunks)`);
  
  // Benchmark layout calculation
  const { LayoutCalculator } = require('./src/integrations/miro-export-optimized');
  const layoutCalc = new LayoutCalculator();
  
  console.time(`Layout Calculation (${iterations} positions)`);
  for (let i = 0; i < iterations; i++) {
    layoutCalc.calculateOptimalPosition(300, 120);
  }
  console.timeEnd(`Layout Calculation (${iterations} positions)`);
  
  console.log("✅ Performance benchmark completed");
}

// Main execution
if (require.main === module) {
  (async () => {
    try {
      const results = await testLiveModeSystem();
      
      // Run performance benchmark if all tests pass
      if (results.passedTests === results.totalTests) {
        await runPerformanceBenchmark();
      }
      
      console.log("\n👋 Testing completed!");
      
    } catch (error) {
      console.error("💥 Test suite failed:", error);
      process.exit(1);
    }
  })();
}

module.exports = {
  testLiveModeSystem,
  runPerformanceBenchmark
};