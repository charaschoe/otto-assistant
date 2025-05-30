#!/usr/bin/env node

/**
 * Microphone Debug Tool for Otto Assistant
 * Tests and configures microphone access on Mac
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function debugMicrophone() {
  console.log("🎤 === MIKROFON DEBUG TOOL ===\n");
  
  console.log("📋 System Information:");
  console.log(`Platform: ${process.platform}`);
  console.log(`Architecture: ${process.arch}`);
  console.log(`Node.js: ${process.version}\n`);
  
  // 1. Check SoX installation
  console.log("1. 🔧 SoX Installation Check");
  console.log("─".repeat(40));
  
  const soxAvailable = await checkCommand('sox', ['--version']);
  if (soxAvailable) {
    console.log("✅ SoX ist installiert");
    await showSoxVersion();
  } else {
    console.log("❌ SoX ist NICHT installiert");
    console.log("💡 Installation: brew install sox");
    return false;
  }
  
  // 2. Check Core Audio support
  console.log("\n2. 🍎 Core Audio Support Check");
  console.log("─".repeat(40));
  
  const coreAudioSupport = await checkCoreAudioSupport();
  if (coreAudioSupport) {
    console.log("✅ Core Audio Support verfügbar");
  } else {
    console.log("❌ Core Audio Support NICHT verfügbar");
    console.log("💡 Neuinstallation nötig: brew reinstall sox");
  }
  
  // 3. List available audio devices
  console.log("\n3. 🎧 Verfügbare Audio-Geräte");
  console.log("─".repeat(40));
  
  await listAudioDevices();
  
  // 4. Test microphone access
  console.log("\n4. 🎤 Mikrofon-Zugriff Test");
  console.log("─".repeat(40));
  
  const micAccess = await testMicrophoneAccess();
  if (!micAccess) {
    console.log("❌ Mikrofon-Zugriff fehlgeschlagen");
    await showMicrophoneTroubleshooting();
    return false;
  }
  
  // 5. Test audio recording
  console.log("\n5. 📹 Audio-Aufnahme Test");
  console.log("─".repeat(40));
  
  const recordingWorks = await testAudioRecording();
  if (!recordingWorks) {
    console.log("❌ Audio-Aufnahme fehlgeschlagen");
    return false;
  }
  
  // 6. Test Whisper integration
  console.log("\n6. 🤖 Whisper Integration Test");
  console.log("─".repeat(40));
  
  const whisperWorks = await testWhisperIntegration();
  if (!whisperWorks) {
    console.log("❌ Whisper Integration fehlgeschlagen");
    await showWhisperTroubleshooting();
    return false;
  }
  
  console.log("\n🎉 === ALLE TESTS BESTANDEN ===");
  console.log("✅ Mikrofon ist einsatzbereit für Otto Live Mode!");
  
  return true;
}

/**
 * Check if command is available
 */
function checkCommand(command, args = []) {
  return new Promise((resolve) => {
    const process = spawn(command, args, { stdio: 'pipe' });
    
    process.on('close', (code) => {
      resolve(code === 0);
    });
    
    process.on('error', () => {
      resolve(false);
    });
    
    setTimeout(() => {
      process.kill();
      resolve(false);
    }, 5000);
  });
}

/**
 * Show SoX version info
 */
async function showSoxVersion() {
  return new Promise((resolve) => {
    const process = spawn('sox', ['--version'], { stdio: 'pipe' });
    
    let output = '';
    process.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    process.on('close', () => {
      console.log(`📦 ${output.trim()}`);
      resolve();
    });
    
    setTimeout(() => {
      process.kill();
      resolve();
    }, 3000);
  });
}

/**
 * Check Core Audio support in SoX
 */
async function checkCoreAudioSupport() {
  return new Promise((resolve) => {
    const process = spawn('sox', ['--help-device'], { stdio: 'pipe' });
    
    let output = '';
    process.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    process.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    process.on('close', () => {
      const hasCoreAudio = output.toLowerCase().includes('coreaudio');
      if (hasCoreAudio) {
        console.log("🍎 Core Audio Driver gefunden");
      } else {
        console.log("⚠️ Core Audio Driver nicht gefunden");
        console.log("Verfügbare Formate:", output.split('\n').slice(0, 5).join('\n'));
      }
      resolve(hasCoreAudio);
    });
    
    setTimeout(() => {
      process.kill();
      resolve(false);
    }, 5000);
  });
}

/**
 * List available audio devices
 */
async function listAudioDevices() {
  console.log("🔍 Suche nach Audio-Geräten...");
  
  // Try system_profiler for detailed device info
  try {
    await new Promise((resolve) => {
      const process = spawn('system_profiler', ['SPAudioDataType'], { stdio: 'pipe' });
      
      let output = '';
      process.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      process.on('close', () => {
        const lines = output.split('\n');
        const devices = lines.filter(line => 
          line.includes('Built-in') || 
          line.includes('Microphone') || 
          line.includes('Input')
        );
        
        if (devices.length > 0) {
          console.log("🎤 Gefundene Audio-Eingänge:");
          devices.forEach(device => {
            console.log(`  • ${device.trim()}`);
          });
        } else {
          console.log("⚠️ Keine spezifischen Audio-Eingänge gefunden");
        }
        resolve();
      });
      
      setTimeout(() => {
        process.kill();
        resolve();
      }, 5000);
    });
  } catch (error) {
    console.log("⚠️ Konnte Audio-Geräte nicht auflisten");
  }
  
  // Test default device
  console.log("\n🎯 Test Standard-Mikrofon...");
  const defaultWorks = await testDefaultDevice();
  if (defaultWorks) {
    console.log("✅ Standard-Mikrofon funktioniert");
  } else {
    console.log("❌ Standard-Mikrofon nicht verfügbar");
  }
}

/**
 * Test default audio device
 */
async function testDefaultDevice() {
  return new Promise((resolve) => {
    console.log("🔊 Test läuft 2 Sekunden...");
    
    const process = spawn('sox', [
      '-t', 'coreaudio', '-d',  // Input: default coreaudio device
      '-n',                      // Output: null (no output file)
      'trim', '0', '2'          // Record for 2 seconds
    ], { stdio: 'pipe' });
    
    let hasOutput = false;
    
    process.stderr.on('data', (data) => {
      const message = data.toString();
      if (message.includes('Input File') || message.includes('Progress')) {
        hasOutput = true;
      }
      // Don't log normal SoX progress messages
      if (!message.includes('Progress') && !message.includes('%')) {
        console.log(`📊 ${message.trim()}`);
      }
    });
    
    process.on('close', (code) => {
      const success = code === 0 || hasOutput;
      if (success) {
        console.log("✅ 2-Sekunden-Test erfolgreich");
      } else {
        console.log(`❌ Test fehlgeschlagen (Exit Code: ${code})`);
      }
      resolve(success);
    });
    
    process.on('error', (error) => {
      console.log(`❌ Fehler: ${error.message}`);
      resolve(false);
    });
    
    setTimeout(() => {
      process.kill();
      resolve(false);
    }, 5000);
  });
}

/**
 * Test microphone access permissions
 */
async function testMicrophoneAccess() {
  console.log("🔐 Prüfe Mikrofon-Berechtigungen...");
  
  // On macOS, try to access microphone
  if (process.platform === 'darwin') {
    return new Promise((resolve) => {
      const process = spawn('sox', [
        '-t', 'coreaudio', '-d',
        '-n',
        'trim', '0', '0.1'  // Very short test
      ], { stdio: 'pipe' });
      
      let permissionDenied = false;
      
      process.stderr.on('data', (data) => {
        const message = data.toString().toLowerCase();
        if (message.includes('permission') || message.includes('denied') || message.includes('not permitted')) {
          permissionDenied = true;
          console.log("❌ Mikrofon-Berechtigung verweigert");
        }
      });
      
      process.on('close', (code) => {
        if (permissionDenied) {
          console.log("💡 Lösung:");
          console.log("  1. Systemeinstellungen > Sicherheit > Datenschutz");
          console.log("  2. Mikrofon > Terminal aktivieren");
          console.log("  3. Terminal neu starten");
          resolve(false);
        } else if (code === 0) {
          console.log("✅ Mikrofon-Berechtigung OK");
          resolve(true);
        } else {
          console.log(`⚠️ Unbekannter Fehler (Code: ${code})`);
          resolve(false);
        }
      });
      
      setTimeout(() => {
        process.kill();
        resolve(false);
      }, 3000);
    });
  }
  
  return true; // Assume OK on non-macOS
}

/**
 * Test actual audio recording
 */
async function testAudioRecording() {
  console.log("📹 Teste 5-Sekunden Audio-Aufnahme...");
  console.log("🗣️ Bitte sprechen Sie jetzt...");
  
  const testFile = path.join(__dirname, 'temp', 'mic-test.wav');
  
  // Ensure temp directory exists
  const tempDir = path.dirname(testFile);
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  return new Promise((resolve) => {
    const process = spawn('sox', [
      '-t', 'coreaudio', '-d',       // Input: default device
      '-t', 'wav',                   // Output format
      '-r', '16000',                 // Sample rate
      '-c', '1',                     // Mono
      '-b', '16',                    // 16-bit
      testFile,                      // Output file
      'trim', '0', '5'              // 5 seconds
    ], { stdio: 'pipe' });
    
    let recordingStarted = false;
    
    process.stderr.on('data', (data) => {
      const message = data.toString();
      if (message.includes('Input File')) {
        recordingStarted = true;
        console.log("🔴 Aufnahme gestartet...");
      }
      if (message.includes('Progress') && message.includes('%')) {
        // Show progress without flooding console
        const progress = message.match(/(\d+)%/);
        if (progress && parseInt(progress[1]) % 20 === 0) {
          console.log(`📊 ${progress[1]}% abgeschlossen`);
        }
      }
    });
    
    process.on('close', (code) => {
      if (code === 0 && fs.existsSync(testFile)) {
        const stats = fs.statSync(testFile);
        console.log(`✅ Aufnahme erfolgreich: ${stats.size} Bytes`);
        
        // Analyze the file
        analyzeAudioFile(testFile).then((analysis) => {
          console.log(`📊 Audio-Analyse: ${analysis}`);
          
          // Cleanup
          fs.unlinkSync(testFile);
          resolve(true);
        });
      } else {
        console.log(`❌ Aufnahme fehlgeschlagen (Code: ${code})`);
        resolve(false);
      }
    });
    
    process.on('error', (error) => {
      console.log(`❌ Aufnahme-Fehler: ${error.message}`);
      resolve(false);
    });
    
    setTimeout(() => {
      if (!recordingStarted) {
        console.log("❌ Aufnahme nicht gestartet - Timeout");
        process.kill();
        resolve(false);
      }
    }, 2000);
  });
}

/**
 * Analyze audio file
 */
async function analyzeAudioFile(filePath) {
  return new Promise((resolve) => {
    const process = spawn('sox', [filePath, '-n', 'stat'], { stdio: 'pipe' });
    
    let output = '';
    process.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    process.on('close', () => {
      // Extract key statistics
      const lines = output.split('\n');
      const duration = lines.find(line => line.includes('Length'));
      const level = lines.find(line => line.includes('Maximum amplitude'));
      
      let analysis = '';
      if (duration) analysis += duration.trim();
      if (level) analysis += `, ${level.trim()}`;
      
      resolve(analysis || 'Analyse nicht verfügbar');
    });
    
    setTimeout(() => {
      process.kill();
      resolve('Timeout bei Analyse');
    }, 3000);
  });
}

/**
 * Test Whisper integration
 */
async function testWhisperIntegration() {
  console.log("🤖 Prüfe Whisper Installation...");
  
  const whisperAvailable = await checkCommand('whisper', ['--help']);
  if (!whisperAvailable) {
    console.log("❌ Whisper ist nicht installiert");
    console.log("💡 Installation: pip install openai-whisper");
    return false;
  }
  
  console.log("✅ Whisper ist verfügbar");
  
  // Test with a short audio file
  console.log("🗣️ Teste Whisper mit 3-Sekunden Aufnahme...");
  
  const testFile = path.join(__dirname, 'temp', 'whisper-test.wav');
  
  // Record 3 seconds
  const recordingSuccess = await new Promise((resolve) => {
    const process = spawn('sox', [
      '-t', 'coreaudio', '-d',
      testFile,
      'trim', '0', '3'
    ], { stdio: 'pipe' });
    
    process.on('close', (code) => {
      resolve(code === 0 && fs.existsSync(testFile));
    });
    
    setTimeout(() => {
      process.kill();
      resolve(false);
    }, 5000);
  });
  
  if (!recordingSuccess) {
    console.log("❌ Aufnahme für Whisper-Test fehlgeschlagen");
    return false;
  }
  
  // Test Whisper transcription
  return new Promise((resolve) => {
    console.log("🔄 Whisper Transkription läuft...");
    
    const process = spawn('whisper', [
      testFile,
      '--model', 'base',
      '--language', 'German',
      '--output_format', 'txt',
      '--output_dir', path.dirname(testFile)
    ], { stdio: 'pipe' });
    
    process.on('close', (code) => {
      const txtFile = testFile.replace('.wav', '.txt');
      
      if (code === 0 && fs.existsSync(txtFile)) {
        const transcription = fs.readFileSync(txtFile, 'utf8').trim();
        console.log(`✅ Whisper Transkription: "${transcription}"`);
        
        // Cleanup
        fs.unlinkSync(testFile);
        fs.unlinkSync(txtFile);
        
        resolve(true);
      } else {
        console.log(`❌ Whisper fehlgeschlagen (Code: ${code})`);
        if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
        resolve(false);
      }
    });
    
    setTimeout(() => {
      process.kill();
      resolve(false);
    }, 30000); // Whisper can take a while
  });
}

/**
 * Show microphone troubleshooting steps
 */
async function showMicrophoneTroubleshooting() {
  console.log("\n🔧 === MIKROFON FEHLERBEHEBUNG ===");
  console.log("─".repeat(40));
  
  console.log("1. 📱 Systemeinstellungen überprüfen:");
  console.log("   • Systemeinstellungen > Sicherheit & Datenschutz");
  console.log("   • Datenschutz > Mikrofon");
  console.log("   • Terminal/iTerm aktivieren");
  
  console.log("\n2. 🔧 SoX neu installieren:");
  console.log("   brew uninstall sox");
  console.log("   brew install sox");
  
  console.log("\n3. 🎤 Audio-Gerät prüfen:");
  console.log("   • Systemeinstellungen > Ton > Eingabe");
  console.log("   • Eingangspegel testen");
  console.log("   • Anderes Mikrofon versuchen");
  
  console.log("\n4. 🔄 Terminal neu starten:");
  console.log("   • Komplett schließen und neu öffnen");
  console.log("   • sudo-Rechte neu laden");
}

/**
 * Show Whisper troubleshooting steps  
 */
async function showWhisperTroubleshooting() {
  console.log("\n🤖 === WHISPER FEHLERBEHEBUNG ===");
  console.log("─".repeat(40));
  
  console.log("1. 🐍 Python/pip überprüfen:");
  console.log("   python3 --version");
  console.log("   pip3 --version");
  
  console.log("\n2. 📦 Whisper installieren:");
  console.log("   pip3 install openai-whisper");
  console.log("   # oder mit conda:");
  console.log("   conda install openai-whisper");
  
  console.log("\n3. 🔄 PATH überprüfen:");
  console.log("   which whisper");
  console.log("   echo $PATH");
  
  console.log("\n4. 🚀 Alternative Installation:");
  console.log("   pip3 install --upgrade openai-whisper");
  console.log("   # Model vorab herunterladen:");
  console.log("   whisper --model base dummy.wav");
}

// Main execution
if (require.main === module) {
  (async () => {
    try {
      const success = await debugMicrophone();
      
      if (success) {
        console.log("\n🚀 === NÄCHSTE SCHRITTE ===");
        console.log("✅ Mikrofon ist bereit für Otto Live Mode!");
        console.log("💡 Starten Sie Otto mit: npm run live");
        console.log("🎤 Oder testen Sie direkt: node live-mode.js");
      } else {
        console.log("\n⚠️ === MIKROFON NICHT BEREIT ===");
        console.log("🔧 Folgen Sie den Fehlerbehebungsschritten oben");
        console.log("🆘 Bei weiteren Problemen: GitHub Issues erstellen");
      }
      
    } catch (error) {
      console.error("💥 Debug-Tool Fehler:", error);
      process.exit(1);
    }
  })();
}

module.exports = { debugMicrophone };