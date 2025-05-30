/**
 * Audio Diagnostics for Otto Assistant
 * Comprehensive audio system testing and troubleshooting
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const execAsync = promisify(exec);

class AudioDiagnostics {
  constructor(options = {}) {
    this.options = {
      verbose: options.verbose || false,
      platform: process.platform,
      testDuration: options.testDuration || 3000
    };
    
    this.results = {
      allPassed: false,
      tests: [],
      issues: [],
      recommendations: []
    };
  }

  /**
   * Run comprehensive audio diagnostics
   */
  async runFullDiagnostics() {
    console.log(chalk.blue('🎤 Running audio system diagnostics...\n'));
    
    const tests = [
      this.testSoxInstallation(),
      this.testAudioDrivers(),
      this.testMicrophoneAccess(),
      this.testAudioDevices(),
      this.testRecordingCapability(),
      this.testAudioQuality(),
      this.testVoiceDetection(),
      this.testPlatformSpecificAudio()
    ];
    
    const results = await Promise.allSettled(tests);
    
    // Process results
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        this.results.tests.push(result.value);
      } else {
        this.results.issues.push({
          type: 'test_error',
          message: `Audio test ${index + 1} failed: ${result.reason.message}`,
          severity: 'medium'
        });
      }
    });
    
    // Determine overall status
    this.results.allPassed = this.results.issues.length === 0;
    
    this.printAudioResults();
    return this.results;
  }

  /**
   * Test SoX installation and capabilities
   */
  async testSoxInstallation() {
    try {
      const { stdout } = await execAsync('sox --version');
      const version = stdout.split('\n')[0];
      
      // Test supported formats
      const { stdout: formats } = await execAsync('sox --help-format all');
      const supportedFormats = this.parseSoxFormats(formats);
      
      this.logSuccess(`SoX version: ${version}`);
      this.logSuccess(`Supported formats: ${supportedFormats.length}`);
      
      // Check for platform-specific audio support
      const platformSupport = this.checkPlatformAudioSupport(formats);
      
      return {
        name: 'SoX Installation',
        status: 'passed',
        version,
        supportedFormats,
        platformSupport
      };
    } catch (error) {
      const issue = {
        type: 'missing_dependency',
        message: 'SoX not installed or not in PATH',
        solution: 'Install SoX: brew install sox (macOS) or apt-get install sox (Linux)',
        severity: 'high'
      };
      this.results.issues.push(issue);
      this.logError(issue.message);
      return { name: 'SoX Installation', status: 'failed', error: error.message };
    }
  }

  /**
   * Test audio drivers
   */
  async testAudioDrivers() {
    const platform = process.platform;
    
    try {
      switch (platform) {
        case 'darwin':
          return await this.testCoreAudioDrivers();
        case 'linux':
          return await this.testAlsaDrivers();
        case 'win32':
          return await this.testWindowsAudioDrivers();
        default:
          this.results.issues.push({
            type: 'unsupported_platform',
            message: `Audio drivers not tested for platform: ${platform}`,
            severity: 'low'
          });
          return { name: 'Audio Drivers', status: 'skipped', platform };
      }
    } catch (error) {
      this.logError(`Audio driver test failed: ${error.message}`);
      return { name: 'Audio Drivers', status: 'failed', error: error.message };
    }
  }

  /**
   * Test Core Audio drivers (macOS)
   */
  async testCoreAudioDrivers() {
    try {
      // List Core Audio devices
      const { stdout } = await execAsync('system_profiler SPAudioDataType');
      const audioDevices = this.parseMacAudioDevices(stdout);
      
      this.logSuccess(`Core Audio devices found: ${audioDevices.length}`);
      
      // Test Core Audio availability with SoX
      try {
        await execAsync('sox -t coreaudio -d -n trim 0 0.1 2>/dev/null');
        this.logSuccess('Core Audio driver accessible');
        
        return {
          name: 'Core Audio Drivers',
          status: 'passed',
          devices: audioDevices,
          driverAccess: true
        };
      } catch (error) {
        this.results.issues.push({
          type: 'driver_access',
          message: 'Core Audio driver not accessible',
          solution: 'Check audio permissions and restart audio services',
          severity: 'medium'
        });
        
        return {
          name: 'Core Audio Drivers',
          status: 'warning',
          devices: audioDevices,
          driverAccess: false
        };
      }
    } catch (error) {
      this.logError('Core Audio test failed');
      return { name: 'Core Audio Drivers', status: 'failed', error: error.message };
    }
  }

  /**
   * Test ALSA drivers (Linux)
   */
  async testAlsaDrivers() {
    try {
      // List ALSA devices
      const { stdout } = await execAsync('arecord -l 2>/dev/null || echo "No devices"');
      const devices = this.parseAlsaDevices(stdout);
      
      this.logSuccess(`ALSA recording devices: ${devices.length}`);
      
      if (devices.length === 0) {
        this.results.issues.push({
          type: 'no_audio_devices',
          message: 'No ALSA recording devices found',
          solution: 'Check audio hardware and ALSA configuration',
          severity: 'high'
        });
        return { name: 'ALSA Drivers', status: 'failed', devices: [] };
      }
      
      return {
        name: 'ALSA Drivers',
        status: 'passed',
        devices
      };
    } catch (error) {
      this.logError('ALSA test failed');
      return { name: 'ALSA Drivers', status: 'failed', error: error.message };
    }
  }

  /**
   * Test Windows audio drivers
   */
  async testWindowsAudioDrivers() {
    // Windows audio testing is limited
    this.results.recommendations.push('Windows audio support is experimental');
    return {
      name: 'Windows Audio Drivers',
      status: 'warning',
      message: 'Limited Windows support'
    };
  }

  /**
   * Test microphone access and permissions
   */
  async testMicrophoneAccess() {
    try {
      // Test basic microphone access
      const testCommand = this.getMicrophoneTestCommand();
      
      this.options.verbose && console.log(chalk.gray(`Testing: ${testCommand}`));
      
      const { stdout } = await execAsync(testCommand);
      const audioSize = parseInt(stdout.trim()) || 0;
      
      if (audioSize > 100) { // Minimum expected bytes for audio
        this.logSuccess(`Microphone access confirmed (${audioSize} bytes recorded)`);
        return {
          name: 'Microphone Access',
          status: 'passed',
          audioSize,
          hasPermission: true
        };
      } else {
        this.results.issues.push({
          type: 'microphone_access',
          message: 'Microphone access denied or no audio captured',
          solution: 'Grant microphone permissions in system settings',
          severity: 'high'
        });
        
        return {
          name: 'Microphone Access',
          status: 'failed',
          audioSize,
          hasPermission: false
        };
      }
    } catch (error) {
      this.results.issues.push({
        type: 'microphone_test_failed',
        message: 'Cannot test microphone access',
        solution: 'Check audio system configuration',
        severity: 'medium'
      });
      
      this.logError(`Microphone test failed: ${error.message}`);
      return { name: 'Microphone Access', status: 'failed', error: error.message };
    }
  }

  /**
   * Test available audio devices
   */
  async testAudioDevices() {
    try {
      const devices = await this.getAudioDevices();
      
      if (devices.length === 0) {
        this.results.issues.push({
          type: 'no_audio_devices',
          message: 'No audio input devices found',
          solution: 'Connect microphone or check audio hardware',
          severity: 'high'
        });
        return { name: 'Audio Devices', status: 'failed', devices: [] };
      }
      
      this.logSuccess(`Audio input devices found: ${devices.length}`);
      devices.forEach(device => {
        this.options.verbose && this.logSuccess(`  • ${device.name} (${device.type})`);
      });
      
      return {
        name: 'Audio Devices',
        status: 'passed',
        devices
      };
    } catch (error) {
      this.logError('Audio device enumeration failed');
      return { name: 'Audio Devices', status: 'failed', error: error.message };
    }
  }

  /**
   * Test recording capability with quality metrics
   */
  async testRecordingCapability() {
    try {
      const testFile = path.join(__dirname, '../../temp-audio-test.wav');
      const recordCommand = this.getRecordingTestCommand(testFile);
      
      this.options.verbose && console.log(chalk.gray(`Recording test: ${recordCommand}`));
      
      // Record test audio
      await execAsync(recordCommand);
      
      // Analyze recorded file
      const stats = fs.statSync(testFile);
      const fileSizeKB = Math.round(stats.size / 1024);
      
      // Get audio file info
      const { stdout } = await execAsync(`sox --info "${testFile}"`);
      const audioInfo = this.parseAudioInfo(stdout);
      
      // Cleanup
      fs.unlinkSync(testFile);
      
      this.logSuccess(`Recording test passed (${fileSizeKB}KB, ${audioInfo.duration}s)`);
      
      return {
        name: 'Recording Capability',
        status: 'passed',
        fileSize: fileSizeKB,
        audioInfo
      };
    } catch (error) {
      this.results.issues.push({
        type: 'recording_failed',
        message: 'Cannot record audio',
        solution: 'Check microphone permissions and audio system',
        severity: 'high'
      });
      
      this.logError(`Recording test failed: ${error.message}`);
      return { name: 'Recording Capability', status: 'failed', error: error.message };
    }
  }

  /**
   * Test audio quality and signal levels
   */
  async testAudioQuality() {
    try {
      const testFile = path.join(__dirname, '../../temp-quality-test.wav');
      const recordCommand = this.getRecordingTestCommand(testFile, 2000); // 2 second test
      
      // Record test audio
      await execAsync(recordCommand);
      
      // Analyze audio quality
      const { stdout } = await execAsync(`sox "${testFile}" -n stat 2>&1`);
      const qualityMetrics = this.parseAudioQualityMetrics(stdout);
      
      // Cleanup
      fs.unlinkSync(testFile);
      
      // Evaluate quality
      const qualityScore = this.evaluateAudioQuality(qualityMetrics);
      
      if (qualityScore.overall >= 0.7) {
        this.logSuccess(`Audio quality: ${qualityScore.rating} (${Math.round(qualityScore.overall * 100)}%)`);
        return {
          name: 'Audio Quality',
          status: 'passed',
          metrics: qualityMetrics,
          score: qualityScore
        };
      } else {
        this.results.recommendations.push('Consider using a better microphone for improved quality');
        return {
          name: 'Audio Quality',
          status: 'warning',
          metrics: qualityMetrics,
          score: qualityScore
        };
      }
    } catch (error) {
      this.logError(`Audio quality test failed: ${error.message}`);
      return { name: 'Audio Quality', status: 'failed', error: error.message };
    }
  }

  /**
   * Test voice detection capability
   */
  async testVoiceDetection() {
    try {
      // Simulate voice detection test
      const testFile = path.join(__dirname, '../../temp-voice-test.wav');
      const recordCommand = this.getRecordingTestCommand(testFile, 1000); // 1 second
      
      await execAsync(recordCommand);
      
      // Analyze for voice activity
      const { stdout } = await execAsync(`sox "${testFile}" -n stat 2>&1`);
      const stats = this.parseAudioQualityMetrics(stdout);
      
      // Simple voice detection based on RMS level
      const hasVoiceActivity = stats.rmsLevel > -30; // dB threshold
      
      // Cleanup
      fs.unlinkSync(testFile);
      
      if (hasVoiceActivity) {
        this.logSuccess('Voice detection capability confirmed');
        return {
          name: 'Voice Detection',
          status: 'passed',
          voiceDetected: true,
          rmsLevel: stats.rmsLevel
        };
      } else {
        this.results.recommendations.push('Speak during audio tests for better voice detection validation');
        return {
          name: 'Voice Detection',
          status: 'warning',
          voiceDetected: false,
          rmsLevel: stats.rmsLevel
        };
      }
    } catch (error) {
      this.logError(`Voice detection test failed: ${error.message}`);
      return { name: 'Voice Detection', status: 'failed', error: error.message };
    }
  }

  /**
   * Platform-specific audio tests
   */
  async testPlatformSpecificAudio() {
    const platform = process.platform;
    
    switch (platform) {
      case 'darwin':
        return await this.testMacOSSpecificAudio();
      case 'linux':
        return await this.testLinuxSpecificAudio();
      default:
        return { name: 'Platform Audio', status: 'skipped', platform };
    }
  }

  async testMacOSSpecificAudio() {
    try {
      // Test Core Audio sample rates
      const sampleRates = [16000, 44100, 48000];
      const supportedRates = [];
      
      for (const rate of sampleRates) {
        try {
          await execAsync(`sox -t coreaudio -d -r ${rate} -n trim 0 0.1 2>/dev/null`);
          supportedRates.push(rate);
        } catch (error) {
          // Rate not supported
        }
      }
      
      this.logSuccess(`Supported sample rates: ${supportedRates.join(', ')}`);
      
      return {
        name: 'macOS Audio',
        status: 'passed',
        supportedSampleRates: supportedRates
      };
    } catch (error) {
      return { name: 'macOS Audio', status: 'failed', error: error.message };
    }
  }

  async testLinuxSpecificAudio() {
    try {
      // Test PulseAudio if available
      let hasPulseAudio = false;
      try {
        await execAsync('pulseaudio --check');
        hasPulseAudio = true;
        this.logSuccess('PulseAudio detected');
      } catch (error) {
        this.logWarning('PulseAudio not running');
      }
      
      return {
        name: 'Linux Audio',
        status: 'passed',
        hasPulseAudio
      };
    } catch (error) {
      return { name: 'Linux Audio', status: 'failed', error: error.message };
    }
  }

  /**
   * Helper methods
   */
  getMicrophoneTestCommand() {
    const platform = process.platform;
    const duration = '0.5'; // 0.5 seconds
    
    switch (platform) {
      case 'darwin':
        return `sox -t coreaudio -d -t wav - trim 0 ${duration} 2>/dev/null | wc -c`;
      case 'linux':
        return `sox -t alsa -d -t wav - trim 0 ${duration} 2>/dev/null | wc -c`;
      default:
        return `sox -d -t wav - trim 0 ${duration} 2>/dev/null | wc -c`;
    }
  }

  getRecordingTestCommand(outputFile, duration = 1000) {
    const platform = process.platform;
    const durationSec = duration / 1000;
    
    switch (platform) {
      case 'darwin':
        return `sox -t coreaudio -d "${outputFile}" trim 0 ${durationSec}`;
      case 'linux':
        return `sox -t alsa -d "${outputFile}" trim 0 ${durationSec}`;
      default:
        return `sox -d "${outputFile}" trim 0 ${durationSec}`;
    }
  }

  async getAudioDevices() {
    const platform = process.platform;
    
    switch (platform) {
      case 'darwin':
        const { stdout } = await execAsync('system_profiler SPAudioDataType');
        return this.parseMacAudioDevices(stdout);
      case 'linux':
        const { stdout: alsaOut } = await execAsync('arecord -l 2>/dev/null || echo ""');
        return this.parseAlsaDevices(alsaOut);
      default:
        return [];
    }
  }

  parseMacAudioDevices(output) {
    const devices = [];
    const lines = output.split('\n');
    let currentDevice = null;
    
    for (const line of lines) {
      if (line.includes('Input') && line.includes(':')) {
        if (currentDevice) devices.push(currentDevice);
        currentDevice = {
          name: line.split(':')[0].trim(),
          type: 'input'
        };
      }
    }
    
    if (currentDevice) devices.push(currentDevice);
    return devices;
  }

  parseAlsaDevices(output) {
    const devices = [];
    const lines = output.split('\n');
    
    for (const line of lines) {
      const match = line.match(/card (\d+): (.+?),/);
      if (match) {
        devices.push({
          name: match[2],
          card: match[1],
          type: 'input'
        });
      }
    }
    
    return devices;
  }

  parseAudioInfo(output) {
    const info = {};
    const lines = output.split('\n');
    
    for (const line of lines) {
      if (line.includes('Duration')) {
        const match = line.match(/(\d+(?:\.\d+)?)/);
        if (match) info.duration = parseFloat(match[1]);
      }
      if (line.includes('Sample Rate')) {
        const match = line.match(/(\d+)/);
        if (match) info.sampleRate = parseInt(match[1]);
      }
    }
    
    return info;
  }

  parseAudioQualityMetrics(output) {
    const metrics = {};
    const lines = output.split('\n');
    
    for (const line of lines) {
      if (line.includes('RMS amplitude')) {
        const match = line.match(/([-\d.]+)/);
        if (match) metrics.rmsLevel = parseFloat(match[1]);
      }
      if (line.includes('Maximum amplitude')) {
        const match = line.match(/([-\d.]+)/);
        if (match) metrics.maxLevel = parseFloat(match[1]);
      }
    }
    
    return metrics;
  }

  evaluateAudioQuality(metrics) {
    let score = 0.5;
    let rating = 'Poor';
    
    // RMS level evaluation (should be between -20 and -40 dB for good quality)
    if (metrics.rmsLevel > -20) {
      score += 0.1; // Too loud
    } else if (metrics.rmsLevel > -40) {
      score += 0.4; // Good range
    } else {
      score += 0.1; // Too quiet
    }
    
    if (score >= 0.8) rating = 'Excellent';
    else if (score >= 0.7) rating = 'Good';
    else if (score >= 0.5) rating = 'Fair';
    
    return { overall: score, rating };
  }

  parseSoxFormats(output) {
    const formats = [];
    const lines = output.split('\n');
    
    for (const line of lines) {
      const match = line.match(/^\s*(\w+)\s+/);
      if (match && !line.includes('AUDIO FILE FORMATS')) {
        formats.push(match[1]);
      }
    }
    
    return formats;
  }

  checkPlatformAudioSupport(formats) {
    const platform = process.platform;
    
    switch (platform) {
      case 'darwin':
        return formats.includes('coreaudio');
      case 'linux':
        return formats.includes('alsa') || formats.includes('pulse');
      case 'win32':
        return formats.includes('waveaudio');
      default:
        return false;
    }
  }

  /**
   * Logging helpers
   */
  logSuccess(message) {
    if (this.options.verbose) {
      console.log(chalk.green(`  ✅ ${message}`));
    }
  }

  logError(message) {
    console.log(chalk.red(`  ❌ ${message}`));
  }

  logWarning(message) {
    if (this.options.verbose) {
      console.log(chalk.yellow(`  ⚠️  ${message}`));
    }
  }

  /**
   * Print audio diagnostic results
   */
  printAudioResults() {
    console.log(chalk.blue.bold('\n🎤 AUDIO DIAGNOSTIC RESULTS'));
    console.log('─'.repeat(50));
    
    // Test summary
    const passed = this.results.tests.filter(t => t.status === 'passed').length;
    const failed = this.results.tests.filter(t => t.status === 'failed').length;
    const warnings = this.results.tests.filter(t => t.status === 'warning').length;
    
    console.log(chalk.green(`✅ Passed: ${passed}`));
    if (failed > 0) console.log(chalk.red(`❌ Failed: ${failed}`));
    if (warnings > 0) console.log(chalk.yellow(`⚠️  Warnings: ${warnings}`));
    
    console.log('─'.repeat(50));
    
    // Overall status
    if (this.results.allPassed) {
      console.log(chalk.green.bold('🎉 Audio system fully operational!'));
    } else if (failed === 0) {
      console.log(chalk.yellow.bold('⚠️ Audio system operational with warnings.'));
    } else {
      console.log(chalk.red.bold('❌ Audio system has critical issues.'));
    }
    
    // Recommendations
    if (this.results.recommendations.length > 0) {
      console.log(chalk.blue.bold('\n💡 RECOMMENDATIONS:'));
      this.results.recommendations.forEach((rec, i) => {
        console.log(`${i + 1}. ${rec}`);
      });
    }
  }
}

module.exports = { AudioDiagnostics };