/**
 * System Check Utility for Otto Assistant
 * Comprehensive system compatibility and dependency verification
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const chalk = require('chalk');

const execAsync = promisify(exec);

class SystemCheck {
  constructor(options = {}) {
    this.options = {
      verbose: options.verbose || false,
      skipOptional: options.skipOptional || false,
      platform: process.platform,
      arch: process.arch
    };
    
    this.results = {
      allPassed: false,
      checks: [],
      issues: [],
      warnings: []
    };
  }

  /**
   * Run complete system check
   */
  async runFullCheck() {
    console.log(chalk.blue('🔍 Running comprehensive system check...\n'));
    
    const checks = [
      this.checkNodeVersion(),
      this.checkNpmVersion(),
      this.checkRequiredDependencies(),
      this.checkSoxInstallation(),
      this.checkCoreAudioSupport(),
      this.checkMicrophonePermissions(),
      this.checkFileSystemPermissions(),
      this.checkConfigurationFiles(),
      this.checkMemoryAndPerformance(),
      this.checkPlatformSpecific()
    ];
    
    const results = await Promise.allSettled(checks);
    
    // Process results
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        this.results.checks.push(result.value);
      } else {
        this.results.issues.push({
          type: 'system_error',
          message: `Check ${index + 1} failed: ${result.reason.message}`,
          severity: 'high'
        });
      }
    });
    
    // Determine overall status
    this.results.allPassed = this.results.issues.length === 0;
    
    this.printResults();
    return this.results;
  }

  /**
   * Check Node.js version compatibility
   */
  async checkNodeVersion() {
    const currentVersion = process.version;
    const majorVersion = parseInt(currentVersion.slice(1).split('.')[0]);
    const minVersion = 16;
    
    if (majorVersion >= minVersion) {
      this.logSuccess(`Node.js ${currentVersion} (>= v${minVersion} required)`);
      return { name: 'Node.js Version', status: 'passed', version: currentVersion };
    } else {
      const issue = {
        type: 'version_mismatch',
        message: `Node.js ${currentVersion} is too old. Minimum required: v${minVersion}`,
        solution: 'Update Node.js to latest LTS version',
        severity: 'high'
      };
      this.results.issues.push(issue);
      this.logError(issue.message);
      return { name: 'Node.js Version', status: 'failed', version: currentVersion };
    }
  }

  /**
   * Check npm version
   */
  async checkNpmVersion() {
    try {
      const { stdout } = await execAsync('npm --version');
      const version = stdout.trim();
      this.logSuccess(`npm ${version}`);
      return { name: 'npm Version', status: 'passed', version };
    } catch (error) {
      const issue = {
        type: 'missing_dependency',
        message: 'npm is not available',
        solution: 'Install Node.js with npm',
        severity: 'high'
      };
      this.results.issues.push(issue);
      this.logError(issue.message);
      return { name: 'npm Version', status: 'failed' };
    }
  }

  /**
   * Check required Node.js dependencies
   */
  async checkRequiredDependencies() {
    const packageJsonPath = path.resolve(__dirname, '../../package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      const issue = {
        type: 'config_missing',
        message: 'package.json not found',
        solution: 'Run npm init or restore package.json',
        severity: 'high'
      };
      this.results.issues.push(issue);
      this.logError(issue.message);
      return { name: 'Dependencies', status: 'failed' };
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const requiredDeps = ['axios', 'chalk', 'chokidar', 'ws'];
    const missingDeps = [];
    
    for (const dep of requiredDeps) {
      try {
        require.resolve(dep);
        this.options.verbose && this.logSuccess(`${dep} is available`);
      } catch (error) {
        missingDeps.push(dep);
      }
    }
    
    if (missingDeps.length > 0) {
      const issue = {
        type: 'missing_dependency',
        message: `Missing dependencies: ${missingDeps.join(', ')}`,
        solution: 'Run: npm install',
        severity: 'high',
        packages: missingDeps
      };
      this.results.issues.push(issue);
      this.logError(issue.message);
      return { name: 'Dependencies', status: 'failed', missing: missingDeps };
    }
    
    this.logSuccess('All required dependencies available');
    return { name: 'Dependencies', status: 'passed' };
  }

  /**
   * Check SoX audio tools installation
   */
  async checkSoxInstallation() {
    try {
      const { stdout } = await execAsync('sox --version');
      const version = stdout.trim() || 'SoX detected';
      this.logSuccess(`SoX audio tools: ${version}`);
      
      // Check for Core Audio support on macOS
      if (process.platform === 'darwin') {
        try {
          const { stdout: formats } = await execAsync('sox --help-format all');
          if (formats.includes('coreaudio')) {
            this.logSuccess('SoX with Core Audio support detected');
            return { name: 'SoX Installation', status: 'passed', version, coreAudio: true };
          } else {
            this.results.warnings.push('SoX may not have Core Audio support');
          }
        } catch (formatError) {
          // Ignore format check errors
        }
      }
      
      return { name: 'SoX Installation', status: 'passed', version };
    } catch (error) {
      const issue = {
        type: 'missing_dependency',
        message: 'SoX audio tools not found',
        solution: 'Install SoX: brew install sox (macOS) or apt-get install sox (Linux)',
        severity: 'high'
      };
      this.results.issues.push(issue);
      this.logError(issue.message);
      return { name: 'SoX Installation', status: 'failed' };
    }
  }

  /**
   * Check Core Audio support (macOS specific)
   */
  async checkCoreAudioSupport() {
    if (process.platform !== 'darwin') {
      return { name: 'Core Audio', status: 'skipped', reason: 'Not macOS' };
    }
    
    try {
      // Test Core Audio device listing
      const { stdout } = await execAsync('sox -t coreaudio -d -n trim 0 0.1 2>/dev/null || echo "FAILED"');
      
      if (stdout.includes('FAILED')) {
        const issue = {
          type: 'audio_driver',
          message: 'Core Audio drivers not accessible',
          solution: 'Check macOS audio permissions and restart audio services',
          severity: 'medium'
        };
        this.results.issues.push(issue);
        this.logError(issue.message);
        return { name: 'Core Audio', status: 'failed' };
      }
      
      this.logSuccess('Core Audio drivers accessible');
      return { name: 'Core Audio', status: 'passed' };
    } catch (error) {
      this.results.warnings.push('Could not test Core Audio access');
      return { name: 'Core Audio', status: 'warning', message: error.message };
    }
  }

  /**
   * Check microphone permissions
   */
  async checkMicrophonePermissions() {
    try {
      // Test basic audio recording capability
      const testCommand = process.platform === 'darwin' 
        ? 'sox -t coreaudio -d -t wav - trim 0 0.1 2>/dev/null | wc -c'
        : 'sox -t alsa -d -t wav - trim 0 0.1 2>/dev/null | wc -c';
      
      const { stdout } = await execAsync(testCommand);
      const audioBytes = parseInt(stdout.trim());
      
      if (audioBytes > 100) { // Minimum expected for 0.1s of audio
        this.logSuccess('Microphone access confirmed');
        return { name: 'Microphone Access', status: 'passed', audioBytes };
      } else {
        const issue = {
          type: 'permissions',
          message: 'Microphone access denied or no audio captured',
          solution: 'Grant microphone permissions in System Preferences > Privacy',
          severity: 'high'
        };
        this.results.issues.push(issue);
        this.logError(issue.message);
        return { name: 'Microphone Access', status: 'failed' };
      }
    } catch (error) {
      const issue = {
        type: 'permissions',
        message: 'Cannot test microphone access',
        solution: 'Check audio system and permissions',
        severity: 'medium'
      };
      this.results.issues.push(issue);
      this.logError(issue.message);
      return { name: 'Microphone Access', status: 'failed', error: error.message };
    }
  }

  /**
   * Check file system permissions
   */
  async checkFileSystemPermissions() {
    const testPaths = [
      './bin',
      './src',
      './obsidian-vault',
      './exports'
    ];
    
    const issues = [];
    
    for (const testPath of testPaths) {
      try {
        // Check if path exists, create if needed
        if (!fs.existsSync(testPath)) {
          fs.mkdirSync(testPath, { recursive: true });
        }
        
        // Test write permissions
        const testFile = path.join(testPath, '.otto-test');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        
        this.options.verbose && this.logSuccess(`Write access: ${testPath}`);
      } catch (error) {
        issues.push(testPath);
      }
    }
    
    if (issues.length > 0) {
      const issue = {
        type: 'permissions',
        message: `No write access to: ${issues.join(', ')}`,
        solution: 'Check directory permissions and ownership',
        severity: 'medium'
      };
      this.results.issues.push(issue);
      this.logError(issue.message);
      return { name: 'File Permissions', status: 'failed', paths: issues };
    }
    
    this.logSuccess('File system permissions OK');
    return { name: 'File Permissions', status: 'passed' };
  }

  /**
   * Check configuration files
   */
  async checkConfigurationFiles() {
    const configPath = path.resolve(__dirname, '../../config.json');
    
    if (!fs.existsSync(configPath)) {
      this.results.warnings.push('config.json not found - using defaults');
      return { name: 'Configuration', status: 'warning', message: 'No config file' };
    }
    
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      const hasApiKeys = config.MIRO_API_KEY || config.NOTION_API_KEY;
      
      if (hasApiKeys) {
        this.logSuccess('Configuration file loaded with API keys');
        return { name: 'Configuration', status: 'passed', hasApiKeys: true };
      } else {
        this.results.warnings.push('No API keys in configuration - local exports only');
        return { name: 'Configuration', status: 'warning', hasApiKeys: false };
      }
    } catch (error) {
      const issue = {
        type: 'config_invalid',
        message: 'Invalid configuration file',
        solution: 'Check config.json syntax',
        severity: 'medium'
      };
      this.results.issues.push(issue);
      this.logError(issue.message);
      return { name: 'Configuration', status: 'failed', error: error.message };
    }
  }

  /**
   * Check memory and performance
   */
  async checkMemoryAndPerformance() {
    const memoryUsage = process.memoryUsage();
    const totalMemMB = Math.round(memoryUsage.rss / 1024 / 1024);
    const freeMem = Math.round(require('os').freemem() / 1024 / 1024);
    
    if (freeMem < 100) {
      this.results.warnings.push(`Low available memory: ${freeMem}MB`);
    }
    
    this.logSuccess(`Memory usage: ${totalMemMB}MB, Available: ${freeMem}MB`);
    return { 
      name: 'Memory', 
      status: 'passed', 
      usage: totalMemMB, 
      available: freeMem 
    };
  }

  /**
   * Platform-specific checks
   */
  async checkPlatformSpecific() {
    const platform = process.platform;
    
    switch (platform) {
      case 'darwin':
        return await this.checkMacOSSpecific();
      case 'linux':
        return await this.checkLinuxSpecific();
      case 'win32':
        return await this.checkWindowsSpecific();
      default:
        this.results.warnings.push(`Untested platform: ${platform}`);
        return { name: 'Platform Support', status: 'warning', platform };
    }
  }

  async checkMacOSSpecific() {
    // Check macOS version
    try {
      const { stdout } = await execAsync('sw_vers -productVersion');
      const version = stdout.trim();
      this.logSuccess(`macOS ${version}`);
      return { name: 'macOS Support', status: 'passed', version };
    } catch (error) {
      return { name: 'macOS Support', status: 'warning', error: error.message };
    }
  }

  async checkLinuxSpecific() {
    // Check ALSA/PulseAudio
    try {
      await execAsync('which arecord');
      this.logSuccess('ALSA recording tools available');
      return { name: 'Linux Audio', status: 'passed', system: 'ALSA' };
    } catch (error) {
      this.results.warnings.push('ALSA tools not found - audio may not work');
      return { name: 'Linux Audio', status: 'warning' };
    }
  }

  async checkWindowsSpecific() {
    this.results.warnings.push('Windows support is experimental');
    return { name: 'Windows Support', status: 'warning', message: 'Experimental' };
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
   * Print final results
   */
  printResults() {
    console.log(chalk.blue.bold('\n📋 SYSTEM CHECK RESULTS'));
    console.log('─'.repeat(50));
    
    // Passed checks
    const passed = this.results.checks.filter(c => c.status === 'passed');
    console.log(chalk.green(`✅ Passed: ${passed.length}`));
    
    // Failed checks
    const failed = this.results.checks.filter(c => c.status === 'failed');
    if (failed.length > 0) {
      console.log(chalk.red(`❌ Failed: ${failed.length}`));
    }
    
    // Warnings
    if (this.results.warnings.length > 0) {
      console.log(chalk.yellow(`⚠️  Warnings: ${this.results.warnings.length}`));
    }
    
    console.log('─'.repeat(50));
    
    // Overall status
    if (this.results.allPassed && this.results.warnings.length === 0) {
      console.log(chalk.green.bold('🎉 All systems operational! Otto is ready.'));
    } else if (this.results.allPassed) {
      console.log(chalk.yellow.bold('⚠️ System ready with warnings.'));
    } else {
      console.log(chalk.red.bold('❌ System check failed. Please resolve issues above.'));
    }
  }
}

module.exports = { SystemCheck };