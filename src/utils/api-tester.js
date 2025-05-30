/**
 * API Tester for Otto Assistant
 * Test connectivity and functionality of all platform APIs
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class APITester {
  constructor(options = {}) {
    this.options = {
      verbose: options.verbose || false,
      timeout: options.timeout || 10000
    };
    
    this.results = {
      allPassed: false,
      tests: [],
      issues: [],
      apiStatus: {}
    };
    
    // Load configuration
    this.config = this.loadConfig();
  }

  /**
   * Load API configuration
   */
  loadConfig() {
    try {
      const configPath = path.resolve(__dirname, '../../config.json');
      if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }
    } catch (error) {
      this.options.verbose && console.log(chalk.yellow('⚠️ No config file found, using environment variables'));
    }
    
    // Fallback to environment variables
    return {
      MIRO_API_KEY: process.env.MIRO_API_KEY,
      MIRO_TEAM_ID: process.env.MIRO_TEAM_ID,
      NOTION_API_KEY: process.env.NOTION_API_KEY,
      NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY
    };
  }

  /**
   * Test all APIs
   */
  async testAllAPIs() {
    console.log(chalk.blue('🌐 Testing API integrations...\n'));
    
    const tests = [
      this.testMiroAPI(),
      this.testNotionAPI(),
      this.testOpenAIAPI(),
      this.testNetworkConnectivity()
    ];
    
    const results = await Promise.allSettled(tests);
    
    // Process results
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        this.results.tests.push(result.value);
      } else {
        this.results.issues.push({
          type: 'api_test_error',
          message: `API test ${index + 1} failed: ${result.reason.message}`,
          severity: 'medium'
        });
      }
    });
    
    // Determine overall status
    const failedTests = this.results.tests.filter(t => t.status === 'failed');
    this.results.allPassed = failedTests.length === 0;
    
    this.printAPIResults();
    return this.results;
  }

  /**
   * Test Miro API connectivity and permissions
   */
  async testMiroAPI() {
    if (!this.config.MIRO_API_KEY) {
      return {
        name: 'Miro API',
        status: 'skipped',
        reason: 'No API key configured'
      };
    }
    
    try {
      this.logTest('Testing Miro API connection...');
      
      // Test basic API access
      const userResponse = await axios.get('https://api.miro.com/v2/boards', {
        headers: {
          'Authorization': `Bearer ${this.config.MIRO_API_KEY}`
        },
        timeout: this.options.timeout
      });
      
      this.logSuccess('Miro API connection successful');
      
      // Test board creation permissions
      const testBoardData = {
        name: 'Otto API Test - ' + Date.now(),
        description: 'Test board for Otto Assistant API validation'
      };
      
      // Add team if provided
      if (this.config.MIRO_TEAM_ID && /^\d+$/.test(this.config.MIRO_TEAM_ID)) {
        testBoardData.team = { id: this.config.MIRO_TEAM_ID };
      }
      
      const createResponse = await axios.post('https://api.miro.com/v2/boards', testBoardData, {
        headers: {
          'Authorization': `Bearer ${this.config.MIRO_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: this.options.timeout
      });
      
      const testBoardId = createResponse.data.id;
      this.logSuccess('Miro board creation successful');
      
      // Test sticky note creation
      const stickyData = {
        data: { content: 'Otto API Test Note' },
        style: { fillColor: 'light_green' },
        position: { x: 0, y: 0 }
      };
      
      await axios.post(`https://api.miro.com/v2/boards/${testBoardId}/sticky_notes`, stickyData, {
        headers: {
          'Authorization': `Bearer ${this.config.MIRO_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: this.options.timeout
      });
      
      this.logSuccess('Miro content creation successful');
      
      // Cleanup: Delete test board
      await axios.delete(`https://api.miro.com/v2/boards/${testBoardId}`, {
        headers: {
          'Authorization': `Bearer ${this.config.MIRO_API_KEY}`
        },
        timeout: this.options.timeout
      });
      
      this.logSuccess('Miro API test completed successfully');
      
      return {
        name: 'Miro API',
        status: 'passed',
        capabilities: ['read', 'write', 'create_boards', 'create_content'],
        boardsCount: userResponse.data.data?.length || 0
      };
      
    } catch (error) {
      const errorMessage = this.parseAPIError(error, 'Miro');
      
      this.results.issues.push({
        type: 'miro_api_error',
        message: errorMessage,
        solution: 'Check Miro API key and permissions',
        severity: 'medium'
      });
      
      this.logError(`Miro API test failed: ${errorMessage}`);
      
      return {
        name: 'Miro API',
        status: 'failed',
        error: errorMessage,
        httpStatus: error.response?.status
      };
    }
  }

  /**
   * Test Notion API connectivity and permissions
   */
  async testNotionAPI() {
    if (!this.config.NOTION_API_KEY) {
      return {
        name: 'Notion API',
        status: 'skipped',
        reason: 'No API key configured'
      };
    }
    
    try {
      this.logTest('Testing Notion API connection...');
      
      // Test basic API access
      const userResponse = await axios.get('https://api.notion.com/v1/users/me', {
        headers: {
          'Authorization': `Bearer ${this.config.NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28'
        },
        timeout: this.options.timeout
      });
      
      this.logSuccess('Notion API connection successful');
      
      // Test database access if configured
      if (this.config.NOTION_DATABASE_ID) {
        try {
          const dbResponse = await axios.get(`https://api.notion.com/v1/databases/${this.config.NOTION_DATABASE_ID}`, {
            headers: {
              'Authorization': `Bearer ${this.config.NOTION_API_KEY}`,
              'Notion-Version': '2022-06-28'
            },
            timeout: this.options.timeout
          });
          
          this.logSuccess('Notion database access successful');
          
          // Test page creation
          const testPageData = {
            parent: { database_id: this.config.NOTION_DATABASE_ID },
            properties: {
              Name: {
                title: [{ text: { content: 'Otto API Test - ' + Date.now() } }]
              }
            }
          };
          
          const pageResponse = await axios.post('https://api.notion.com/v1/pages', testPageData, {
            headers: {
              'Authorization': `Bearer ${this.config.NOTION_API_KEY}`,
              'Content-Type': 'application/json',
              'Notion-Version': '2022-06-28'
            },
            timeout: this.options.timeout
          });
          
          this.logSuccess('Notion page creation successful');
          
          return {
            name: 'Notion API',
            status: 'passed',
            capabilities: ['read', 'write', 'create_pages'],
            user: userResponse.data.name,
            database: dbResponse.data.title[0]?.plain_text || 'Unknown'
          };
          
        } catch (dbError) {
          this.logWarning('Database access failed, but basic API works');
          
          return {
            name: 'Notion API',
            status: 'warning',
            capabilities: ['read'],
            user: userResponse.data.name,
            message: 'Database access limited'
          };
        }
      } else {
        this.logWarning('No database ID configured');
        
        return {
          name: 'Notion API',
          status: 'warning',
          capabilities: ['read'],
          user: userResponse.data.name,
          message: 'No database configured'
        };
      }
      
    } catch (error) {
      const errorMessage = this.parseAPIError(error, 'Notion');
      
      this.results.issues.push({
        type: 'notion_api_error',
        message: errorMessage,
        solution: 'Check Notion API key and integration permissions',
        severity: 'medium'
      });
      
      this.logError(`Notion API test failed: ${errorMessage}`);
      
      return {
        name: 'Notion API',
        status: 'failed',
        error: errorMessage,
        httpStatus: error.response?.status
      };
    }
  }

  /**
   * Test OpenAI API (optional)
   */
  async testOpenAIAPI() {
    if (!this.config.OPENAI_API_KEY) {
      return {
        name: 'OpenAI API',
        status: 'skipped',
        reason: 'No API key configured (optional)'
      };
    }
    
    try {
      this.logTest('Testing OpenAI API connection...');
      
      // Test basic API access
      const response = await axios.get('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.config.OPENAI_API_KEY}`
        },
        timeout: this.options.timeout
      });
      
      const models = response.data.data.filter(m => m.id.includes('gpt'));
      
      this.logSuccess(`OpenAI API connection successful (${models.length} GPT models available)`);
      
      return {
        name: 'OpenAI API',
        status: 'passed',
        capabilities: ['text_generation'],
        availableModels: models.length
      };
      
    } catch (error) {
      const errorMessage = this.parseAPIError(error, 'OpenAI');
      
      this.results.issues.push({
        type: 'openai_api_error',
        message: errorMessage,
        solution: 'Check OpenAI API key and quota',
        severity: 'low'
      });
      
      this.logError(`OpenAI API test failed: ${errorMessage}`);
      
      return {
        name: 'OpenAI API',
        status: 'failed',
        error: errorMessage,
        httpStatus: error.response?.status
      };
    }
  }

  /**
   * Test general network connectivity
   */
  async testNetworkConnectivity() {
    try {
      this.logTest('Testing network connectivity...');
      
      // Test basic internet connectivity
      const testUrls = [
        'https://api.miro.com',
        'https://api.notion.com',
        'https://api.openai.com'
      ];
      
      const connectivityResults = [];
      
      for (const url of testUrls) {
        try {
          const startTime = Date.now();
          await axios.head(url, { timeout: 5000 });
          const latency = Date.now() - startTime;
          
          connectivityResults.push({
            url,
            status: 'success',
            latency
          });
          
          this.options.verbose && this.logSuccess(`${url} - ${latency}ms`);
        } catch (error) {
          connectivityResults.push({
            url,
            status: 'failed',
            error: error.code || 'Unknown'
          });
          
          this.logWarning(`${url} - Failed`);
        }
      }
      
      const successfulConnections = connectivityResults.filter(r => r.status === 'success');
      const avgLatency = successfulConnections.length > 0 ? 
        Math.round(successfulConnections.reduce((sum, r) => sum + r.latency, 0) / successfulConnections.length) : 0;
      
      if (successfulConnections.length === testUrls.length) {
        this.logSuccess(`Network connectivity excellent (avg ${avgLatency}ms)`);
        
        return {
          name: 'Network Connectivity',
          status: 'passed',
          averageLatency: avgLatency,
          results: connectivityResults
        };
      } else if (successfulConnections.length > 0) {
        this.logWarning('Partial network connectivity');
        
        return {
          name: 'Network Connectivity',
          status: 'warning',
          averageLatency: avgLatency,
          results: connectivityResults
        };
      } else {
        this.results.issues.push({
          type: 'network_connectivity',
          message: 'No internet connectivity detected',
          solution: 'Check internet connection and firewall settings',
          severity: 'high'
        });
        
        return {
          name: 'Network Connectivity',
          status: 'failed',
          results: connectivityResults
        };
      }
      
    } catch (error) {
      this.logError(`Network test failed: ${error.message}`);
      
      return {
        name: 'Network Connectivity',
        status: 'failed',
        error: error.message
      };
    }
  }

  /**
   * Parse API error messages
   */
  parseAPIError(error, platform) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.statusText;
      
      switch (status) {
        case 401:
          return `${platform} API: Invalid or expired API key`;
        case 403:
          return `${platform} API: Access forbidden - check permissions`;
        case 404:
          return `${platform} API: Resource not found`;
        case 429:
          return `${platform} API: Rate limit exceeded`;
        case 500:
          return `${platform} API: Server error`;
        default:
          return `${platform} API: HTTP ${status} - ${message}`;
      }
    } else if (error.code === 'ENOTFOUND') {
      return `${platform} API: Network connection failed`;
    } else if (error.code === 'ETIMEDOUT') {
      return `${platform} API: Request timeout`;
    } else {
      return `${platform} API: ${error.message}`;
    }
  }

  /**
   * Logging helpers
   */
  logTest(message) {
    if (this.options.verbose) {
      console.log(chalk.blue(`  🧪 ${message}`));
    }
  }

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
   * Print API test results
   */
  printAPIResults() {
    console.log(chalk.blue.bold('\n🌐 API TEST RESULTS'));
    console.log('─'.repeat(50));
    
    // Test summary
    const passed = this.results.tests.filter(t => t.status === 'passed').length;
    const failed = this.results.tests.filter(t => t.status === 'failed').length;
    const warnings = this.results.tests.filter(t => t.status === 'warning').length;
    const skipped = this.results.tests.filter(t => t.status === 'skipped').length;
    
    console.log(chalk.green(`✅ Passed: ${passed}`));
    if (failed > 0) console.log(chalk.red(`❌ Failed: ${failed}`));
    if (warnings > 0) console.log(chalk.yellow(`⚠️  Warnings: ${warnings}`));
    if (skipped > 0) console.log(chalk.gray(`⏭️  Skipped: ${skipped}`));
    
    console.log('─'.repeat(50));
    
    // Individual API status
    this.results.tests.forEach(test => {
      const statusIcon = {
        'passed': '✅',
        'failed': '❌',
        'warning': '⚠️',
        'skipped': '⏭️'
      }[test.status] || '❓';
      
      console.log(`${statusIcon} ${test.name}: ${test.status}`);
      
      if (test.capabilities) {
        console.log(chalk.gray(`    Capabilities: ${test.capabilities.join(', ')}`));
      }
      
      if (test.reason) {
        console.log(chalk.gray(`    Reason: ${test.reason}`));
      }
    });
    
    console.log('─'.repeat(50));
    
    // Overall status
    if (this.results.allPassed) {
      console.log(chalk.green.bold('🎉 All API integrations operational!'));
    } else if (failed === 0) {
      console.log(chalk.yellow.bold('⚠️ APIs operational with some limitations.'));
    } else {
      console.log(chalk.red.bold('❌ Some API integrations have issues.'));
    }
    
    // Recommendations
    const skippedAPIs = this.results.tests.filter(t => t.status === 'skipped');
    if (skippedAPIs.length > 0) {
      console.log(chalk.blue.bold('\n💡 RECOMMENDATIONS:'));
      console.log('• Configure API keys in config.json for full functionality');
      console.log('• Local exports will be used as fallback for missing APIs');
    }
  }
}

module.exports = { APITester };