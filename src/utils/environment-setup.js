/**
 * Environment Setup for Otto Assistant
 * Initialize and configure the Otto environment
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

/**
 * Setup Otto environment
 */
async function setupEnvironment(options = {}) {
  const config = {
    configPath: options.configPath,
    debug: options.debug || false,
    quiet: options.quiet || false,
    createDirectories: options.createDirectories !== false,
    ...options
  };
  
  if (!config.quiet) {
    console.log(chalk.blue('🔧 Setting up Otto environment...'));
  }
  
  try {
    // Create required directories
    if (config.createDirectories) {
      await createRequiredDirectories(config);
    }
    
    // Load configuration
    const appConfig = await loadConfiguration(config);
    
    // Setup logging
    if (config.debug) {
      process.env.OTTO_DEBUG = 'true';
      process.env.OTTO_LOG_LEVEL = 'verbose';
    }
    
    // Setup temporary directories
    await setupTempDirectories(config);
    
    if (!config.quiet) {
      console.log(chalk.green('✅ Environment setup completed'));
    }
    
    return {
      success: true,
      config: appConfig,
      directories: getDirectoryStructure()
    };
    
  } catch (error) {
    console.error(chalk.red('❌ Environment setup failed:'), error.message);
    throw error;
  }
}

/**
 * Create required directories
 */
async function createRequiredDirectories(config) {
  const directories = [
    'bin',
    'src/core',
    'src/integrations', 
    'src/live',
    'src/utils',
    'exports',
    'exports/miro',
    'exports/notion', 
    'exports/obsidian',
    'temp-audio',
    'obsidian-vault',
    'obsidian-vault/Live Sessions',
    'obsidian-vault/Creative Briefs',
    'templates',
    'logs',
    'tests'
  ];
  
  for (const dir of directories) {
    const dirPath = path.resolve(dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      config.debug && console.log(chalk.gray(`  Created directory: ${dir}`));
    }
  }
}

/**
 * Load configuration from file or environment
 */
async function loadConfiguration(options) {
  let config = {};
  
  // Try to load from specified config file
  if (options.configPath) {
    try {
      config = JSON.parse(fs.readFileSync(options.configPath, 'utf8'));
      !options.quiet && console.log(chalk.green(`✅ Loaded config from: ${options.configPath}`));
    } catch (error) {
      console.error(chalk.red(`❌ Failed to load config from: ${options.configPath}`));
      throw error;
    }
  } else {
    // Try default config.json
    const defaultConfigPath = path.resolve('config.json');
    if (fs.existsSync(defaultConfigPath)) {
      try {
        config = JSON.parse(fs.readFileSync(defaultConfigPath, 'utf8'));
        !options.quiet && console.log(chalk.green('✅ Loaded config from: config.json'));
      } catch (error) {
        console.warn(chalk.yellow('⚠️ config.json exists but is invalid, using environment variables'));
      }
    } else {
      !options.quiet && console.log(chalk.yellow('ℹ️ No config.json found, using environment variables'));
    }
  }
  
  // Merge with environment variables
  const envConfig = {
    MIRO_API_KEY: process.env.MIRO_API_KEY || config.MIRO_API_KEY,
    MIRO_TEAM_ID: process.env.MIRO_TEAM_ID || config.MIRO_TEAM_ID,
    NOTION_API_KEY: process.env.NOTION_API_KEY || config.NOTION_API_KEY,
    NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID || config.NOTION_DATABASE_ID,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || config.OPENAI_API_KEY,
    ...config
  };
  
  // Set global configuration
  global.OTTO_CONFIG = envConfig;
  
  return envConfig;
}

/**
 * Setup temporary directories with cleanup
 */
async function setupTempDirectories(config) {
  const tempDirs = ['temp-audio', 'temp-exports', 'temp-test'];
  
  for (const dir of tempDirs) {
    const dirPath = path.resolve(dir);
    
    // Create if doesn't exist
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // Clean old files (older than 1 hour)
    try {
      const files = fs.readdirSync(dirPath);
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime.getTime() < oneHourAgo) {
          fs.unlinkSync(filePath);
          config.debug && console.log(chalk.gray(`  Cleaned old temp file: ${file}`));
        }
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}

/**
 * Get directory structure
 */
function getDirectoryStructure() {
  return {
    root: process.cwd(),
    bin: path.resolve('bin'),
    src: path.resolve('src'),
    exports: path.resolve('exports'),
    tempAudio: path.resolve('temp-audio'),
    obsidianVault: path.resolve('obsidian-vault'),
    templates: path.resolve('templates'),
    logs: path.resolve('logs')
  };
}

/**
 * Create default configuration file
 */
async function createDefaultConfig(filePath = 'config.json') {
  const defaultConfig = {
    "MIRO_API_KEY": "",
    "MIRO_TEAM_ID": "", 
    "NOTION_API_KEY": "",
    "NOTION_DATABASE_ID": "",
    "OPENAI_API_KEY": "",
    "audio": {
      "sampleRate": 16000,
      "channels": 1,
      "chunkDuration": 3000,
      "voiceDetection": {
        "threshold": 0.1,
        "minDuration": 500
      }
    },
    "live": {
      "updateInterval": 2000,
      "batchSize": 3,
      "enableSimulation": false,
      "enableMiroUpdates": true,
      "enableNotionUpdates": true,
      "enableObsidianUpdates": true
    },
    "export": {
      "defaultTemplate": "meeting-notes",
      "autoOptimize": true,
      "includeTimestamps": true
    },
    "logging": {
      "level": "info",
      "enableFileLogging": false,
      "maxLogFiles": 5
    }
  };
  
  fs.writeFileSync(filePath, JSON.stringify(defaultConfig, null, 2));
  console.log(chalk.green(`✅ Created default config: ${filePath}`));
  
  return defaultConfig;
}

/**
 * Validate environment
 */
async function validateEnvironment() {
  const issues = [];
  const warnings = [];
  
  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 16) {
    issues.push(`Node.js ${nodeVersion} is too old. Minimum required: v16`);
  }
  
  // Check required directories
  const requiredDirs = ['src', 'bin'];
  for (const dir of requiredDirs) {
    if (!fs.existsSync(dir)) {
      issues.push(`Required directory missing: ${dir}`);
    }
  }
  
  // Check executable permissions
  const executables = ['bin/otto-live', 'bin/otto-debug', 'bin/otto-export'];
  for (const exec of executables) {
    if (fs.existsSync(exec)) {
      try {
        const stats = fs.statSync(exec);
        if (!(stats.mode & parseInt('111', 8))) {
          warnings.push(`Executable ${exec} may not have execute permissions`);
        }
      } catch (error) {
        warnings.push(`Cannot check permissions for ${exec}`);
      }
    }
  }
  
  // Check write permissions
  const writableDirs = ['exports', 'temp-audio', 'logs'];
  for (const dir of writableDirs) {
    try {
      const testFile = path.join(dir, '.otto-write-test');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
    } catch (error) {
      issues.push(`No write permission to directory: ${dir}`);
    }
  }
  
  return {
    valid: issues.length === 0,
    issues,
    warnings
  };
}

/**
 * Setup development environment
 */
async function setupDevelopmentEnvironment() {
  console.log(chalk.blue('🔧 Setting up development environment...\n'));
  
  // Create all directories
  await createRequiredDirectories({ debug: true });
  
  // Create default config if it doesn't exist
  if (!fs.existsSync('config.json')) {
    await createDefaultConfig();
  }
  
  // Create sample templates
  await createSampleTemplates();
  
  // Create .gitignore if it doesn't exist
  await createGitignore();
  
  // Create sample test files
  await createSampleTests();
  
  console.log(chalk.green('✅ Development environment setup completed\n'));
  
  // Show next steps
  console.log(chalk.blue('🚀 Next steps:'));
  console.log('1. Add your API keys to config.json');
  console.log('2. Run: npm install');
  console.log('3. Test: otto-debug');
  console.log('4. Start: otto-live --simulation');
}

/**
 * Create sample templates
 */
async function createSampleTemplates() {
  const templatesDir = path.resolve('templates');
  
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }
  
  // Meeting notes template
  const meetingTemplate = `# {{title}}

**Date**: {{date}}
**Duration**: {{duration}}
**Participants**: {{participants}}

## Agenda
{{agenda}}

## Discussion Points
{{transcription}}

## Action Items
{{actionItems}}

## Decisions Made
{{decisions}}

## Next Steps
{{nextSteps}}

---
*Generated by Otto Assistant*`;
  
  fs.writeFileSync(path.join(templatesDir, 'meeting-notes.md'), meetingTemplate);
  
  // Creative brief template
  const creativeTemplate = `# {{title}} - Creative Brief

**Project**: {{project}}
**Date**: {{date}}
**Team**: {{team}}

## Objective
{{objective}}

## Target Audience
{{targetAudience}}

## Key Messages
{{keyMessages}}

## Creative Direction
{{creativeDirection}}

## Deliverables
{{deliverables}}

## Timeline
{{timeline}}

---
*Generated by Otto Assistant*`;
  
  fs.writeFileSync(path.join(templatesDir, 'creative-brief.md'), creativeTemplate);
}

/**
 * Create .gitignore
 */
async function createGitignore() {
  if (fs.existsSync('.gitignore')) return;
  
  const gitignoreContent = `# Otto Assistant
config.json
temp-*
*.log
logs/
exports/
.env

# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# System
.DS_Store
Thumbs.db

# IDEs
.vscode/
.idea/
*.swp
*.swo

# Audio files
*.wav
*.mp3
*.m4a

# Coverage
coverage/`;
  
  fs.writeFileSync('.gitignore', gitignoreContent);
}

/**
 * Create sample tests
 */
async function createSampleTests() {
  const testsDir = path.resolve('tests');
  
  if (!fs.existsSync(testsDir)) {
    fs.mkdirSync(testsDir, { recursive: true });
  }
  
  // Sample test file
  const sampleTest = `/**
 * Sample test for Otto Assistant
 */

const { SystemCheck } = require('../src/utils/system-check');

describe('Otto Assistant', () => {
  test('should initialize system check', () => {
    const systemCheck = new SystemCheck();
    expect(systemCheck).toBeDefined();
  });
  
  test('should have required configuration', () => {
    const config = global.OTTO_CONFIG || {};
    expect(typeof config).toBe('object');
  });
});`;
  
  fs.writeFileSync(path.join(testsDir, 'sample.test.js'), sampleTest);
}

module.exports = {
  setupEnvironment,
  createRequiredDirectories,
  loadConfiguration,
  createDefaultConfig,
  validateEnvironment,
  setupDevelopmentEnvironment,
  getDirectoryStructure
};