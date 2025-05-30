/**
 * Real-time Board Updater for Otto Assistant
 * Continuously updates Miro boards and other exports as content is spoken
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class RealTimeUpdater {
  constructor(options = {}) {
    this.config = {
      updateInterval: options.updateInterval || 3000,    // Update every 3 seconds
      batchSize: options.batchSize || 3,                 // Max items per update
      retryAttempts: options.retryAttempts || 3,
      enableMiroUpdates: options.enableMiroUpdates !== false,
      enableObsidianUpdates: options.enableObsidianUpdates !== false,
      enableNotionUpdates: options.enableNotionUpdates !== false,
      ...options
    };
    
    this.state = {
      activeBoardId: null,
      activeObsidianFile: null,
      activeNotionPageId: null,
      pendingUpdates: [],
      lastUpdateTime: null,
      isUpdating: false,
      updateQueue: []
    };
    
    this.platforms = {
      miro: null,
      obsidian: null, 
      notion: null
    };
    
    // Load API configurations
    this.loadApiConfig();
    
    // Start update loop
    this.startUpdateLoop();
  }

  /**
   * Load API configuration
   */
  loadApiConfig() {
    try {
      const configPath = path.resolve(__dirname, '../../config.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      this.platforms.miro = {
        apiKey: config.MIRO_API_KEY,
        teamId: config.MIRO_TEAM_ID,
        baseUrl: 'https://api.miro.com/v2'
      };
      
      this.platforms.notion = {
        apiKey: config.NOTION_API_KEY,
        baseUrl: 'https://api.notion.com/v1'
      };
      
      console.log("✅ Real-time updater API config loaded");
      
    } catch (error) {
      console.warn("⚠️ Could not load API config for real-time updates");
    }
  }

  /**
   * Initialize live session with new boards/documents
   */
  async initializeLiveSession(sessionTitle = "Live Otto Session") {
    console.log("🔄 Initializing live session...");
    
    const timestamp = new Date().toLocaleString('de-DE');
    const sessionName = `${sessionTitle} - ${timestamp}`;
    
    try {
      // Create live Miro board
      if (this.config.enableMiroUpdates && this.platforms.miro?.apiKey) {
        try {
          this.state.activeBoardId = await this.createLiveMiroBoard(sessionName);
          console.log(`✅ Live Miro board created: ${this.state.activeBoardId}`);
        } catch (error) {
          console.warn(`⚠️ Miro board creation failed: ${error.message}`);
          console.log("🔄 Continuing with local Miro file export instead...");
          this.config.enableMiroUpdates = false; // Disable for this session
          
          // Create local Miro export file as fallback
          this.state.activeMiroFile = await this.createLocalMiroFile(sessionName);
          console.log(`✅ Local Miro file created: ${this.state.activeMiroFile}`);
        }
      }
      
      // Create live Obsidian file
      if (this.config.enableObsidianUpdates) {
        this.state.activeObsidianFile = await this.createLiveObsidianFile(sessionName);
        console.log(`✅ Live Obsidian file created: ${this.state.activeObsidianFile}`);
      }
      
      // Create live Notion page
      if (this.config.enableNotionUpdates && this.platforms.notion?.apiKey) {
        try {
          this.state.activeNotionPageId = await this.createLiveNotionPage(sessionName);
          console.log(`✅ Live Notion page created: ${this.state.activeNotionPageId}`);
        } catch (error) {
          console.warn(`⚠️ Notion page creation failed: ${error.message}`);
          console.log("🔄 Creating local Notion file instead...");
          
          // Create local Notion export file as fallback
          this.state.activeNotionFile = await this.createLocalNotionFile(sessionName);
          console.log(`✅ Local Notion file created: ${this.state.activeNotionFile}`);
        }
      } else if (this.config.enableNotionUpdates) {
        // Create local file if no API key
        this.state.activeNotionFile = await this.createLocalNotionFile(sessionName);
        console.log(`✅ Local Notion file created (no API key): ${this.state.activeNotionFile}`);
      }
      
      return {
        miroBoard: this.state.activeBoardId,
        obsidianFile: this.state.activeObsidianFile,
        notionPage: this.state.activeNotionPageId
      };
      
    } catch (error) {
      console.error("❌ Failed to initialize live session:", error);
      throw error;
    }
  }

  /**
   * Add content update to queue for real-time processing
   */
  addContentUpdate(type, content, metadata = {}) {
    const update = {
      id: Date.now() + Math.random(),
      type,           // 'transcription', 'entity', 'action_item', 'summary'
      content,
      metadata: {
        timestamp: Date.now(),
        speaker: metadata.speaker || 'User',
        confidence: metadata.confidence || 1.0,
        ...metadata
      }
    };
    
    this.state.updateQueue.push(update);
    
    console.log(`📝 Added ${type} update to queue: "${content.substring(0, 50)}..."`);
    
    // Trigger immediate update for high-priority content
    if (type === 'action_item' || type === 'entity') {
      this.processQueueImmediately();
    }
  }

  /**
   * Process update queue immediately (for urgent updates)
   */
  async processQueueImmediately() {
    if (this.state.isUpdating || this.state.updateQueue.length === 0) return;
    
    console.log("⚡ Processing urgent updates immediately...");
    await this.processUpdateQueue();
  }

  /**
   * Start the update loop for continuous processing
   */
  startUpdateLoop() {
    setInterval(async () => {
      if (this.state.updateQueue.length > 0 && !this.state.isUpdating) {
        await this.processUpdateQueue();
      }
    }, this.config.updateInterval);
    
    console.log(`🔄 Real-time update loop started (${this.config.updateInterval}ms interval)`);
  }

  /**
   * Process queued updates and apply to platforms
   */
  async processUpdateQueue() {
    if (this.state.isUpdating || this.state.updateQueue.length === 0) return;
    
    this.state.isUpdating = true;
    
    try {
      // Take batch of updates from queue
      const batch = this.state.updateQueue.splice(0, this.config.batchSize);
      
      console.log(`🔄 Processing ${batch.length} real-time updates...`);
      
      // Process each platform concurrently
      const updatePromises = [];
      
      if (this.state.activeBoardId || this.state.activeMiroFile) {
        updatePromises.push(this.updateMiroBoard(batch));
      }
      
      if (this.state.activeObsidianFile) {
        updatePromises.push(this.updateObsidianFile(batch));
      }
      
      if (this.state.activeNotionPageId || this.state.activeNotionFile) {
        updatePromises.push(this.updateNotionPage(batch));
      }
      
      // Wait for all updates to complete
      const results = await Promise.allSettled(updatePromises);
      
      // Report results
      this.reportUpdateResults(results, batch.length);
      
      this.state.lastUpdateTime = Date.now();
      
    } catch (error) {
      console.error("❌ Update processing failed:", error);
    } finally {
      this.state.isUpdating = false;
    }
  }

  /**
   * Create live Miro board with real-time structure
   */
  async createLiveMiroBoard(sessionName) {
    // Simplified board creation to fix 400 error
    const boardData = {
      name: sessionName,
      description: "Live-updating board - content appears as you speak"
    };
    
    // Only add team if teamId is valid format (numeric string)
    if (this.platforms.miro.teamId && /^\d+$/.test(this.platforms.miro.teamId)) {
      boardData.team = { id: this.platforms.miro.teamId };
    }
    
    const response = await axios.post(
      `${this.platforms.miro.baseUrl}/boards`,
      boardData,
      {
        headers: { 
          Authorization: `Bearer ${this.platforms.miro.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const boardId = response.data.id;
    
    // Create initial structure for live updates
    await this.createLiveMiroStructure(boardId);
    
    return boardId;
  }

  /**
   * Create local Miro export file as fallback
   */
  async createLocalMiroFile(sessionName) {
    const fileName = `${sessionName.replace(/[^a-zA-Z0-9\s-]/g, '')}-miro-export.md`;
    const filePath = path.join(__dirname, '../../miro-exports', fileName);
    
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const initialContent = `# ${sessionName} - Miro Export

## Live Session Board
**Started**: ${new Date().toLocaleString('de-DE')}
**Status**: 🔴 Live Recording
**Type**: Creative Session Export

## 🎤 Live Transcription
*Spoken content appears here in real-time...*

## 🏷️ Erkannte Entitäten
*Entities are added as they're mentioned...*

## ✅ Action Items
*Tasks appear when detected...*

## 📝 Live Summary
*Continuously updated summary...*

## 🎨 Miro Board Layout
This file represents the live Miro board content that would be created.
Use this content to manually create a Miro board if API access is unavailable.

---
*Auto-generated by Otto Assistant Live Mode*
`;
    
    fs.writeFileSync(filePath, initialContent, 'utf8');
    return filePath;
  }

  /**
   * Create local Notion export file as fallback
   */
  async createLocalNotionFile(sessionName) {
    const fileName = `${sessionName.replace(/[^a-zA-Z0-9\s-]/g, '')}-notion-export.md`;
    const filePath = path.join(__dirname, '../../notion-exports', fileName);
    
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const initialContent = `# ${sessionName}

**Status**: 🔴 Live
**Started**: ${new Date().toLocaleString('de-DE')}
**Type**: Creative Session

## Live Transcription
*Content appears here as you speak...*

## Entities & Keywords
*Tagged entities with context...*

## Action Items
- [ ] *Tasks appear here when detected...*

## Meeting Notes
*Structured notes from the session...*

## Summary
*Live summary updated as discussion progresses...*

---
*Auto-generated by Otto Assistant Live Mode*
*Import this content into Notion manually if API access is unavailable*
`;
    
    fs.writeFileSync(filePath, initialContent, 'utf8');
    return filePath;
  }

  /**
   * Create initial structure on Miro board for live updates
   */
  async createLiveMiroStructure(boardId) {
    const structureItems = [
      // Live transcription area
      {
        data: { content: "🎤 LIVE TRANSCRIPTION\n\nSpoken content appears here in real-time..." },
        style: { fillColor: "light_blue" },
        position: { x: -800, y: -300 },
        width: 600, height: 400
      },
      // Entities section
      {
        data: { content: "🏷️ ERKANNTE ENTITÄTEN\n\nEntities are added as they're mentioned..." },
        style: { fillColor: "light_yellow" },
        position: { x: 0, y: -300 },
        width: 400, height: 300
      },
      // Action items
      {
        data: { content: "✅ ACTION ITEMS\n\nTasks appear when detected..." },
        style: { fillColor: "light_pink" },
        position: { x: 600, y: -300 },
        width: 400, height: 300
      },
      // Live summary
      {
        data: { content: "📝 LIVE SUMMARY\n\nContinuously updated summary..." },
        style: { fillColor: "light_green" },
        position: { x: -400, y: 200 },
        width: 800, height: 200
      }
    ];
    
    for (const item of structureItems) {
      try {
        await axios.post(
          `${this.platforms.miro.baseUrl}/boards/${boardId}/sticky_notes`,
          item,
          {
            headers: { Authorization: `Bearer ${this.platforms.miro.apiKey}` }
          }
        );
      } catch (error) {
        console.warn("⚠️ Could not create structure item:", error.message);
      }
    }
  }

  /**
   * Update Miro board with new content
   */
  async updateMiroBoard(updates) {
    // Try API board first, fallback to local file
    if (this.state.activeBoardId) {
      try {
        await this.updateMiroAPI(updates);
      } catch (error) {
        console.warn("⚠️ Miro API update failed, using local file:", error.message);
        await this.updateLocalMiroFile(updates);
      }
    } else if (this.state.activeMiroFile) {
      await this.updateLocalMiroFile(updates);
    }
  }

  /**
   * Update Miro via API
   */
  async updateMiroAPI(updates) {
    for (const update of updates) {
      const position = this.calculateMiroPosition(update.type, update.metadata.timestamp);
      
      const stickyData = {
        data: {
          content: this.formatContentForMiro(update)
        },
        style: {
          fillColor: this.getMiroColorForType(update.type)
        },
        position: position
      };
      
      await axios.post(
        `${this.platforms.miro.baseUrl}/boards/${this.state.activeBoardId}/sticky_notes`,
        stickyData,
        {
          headers: { Authorization: `Bearer ${this.platforms.miro.apiKey}` }
        }
      );
      
      console.log(`✅ Added ${update.type} to Miro board via API`);
    }
  }

  /**
   * Update local Miro file
   */
  async updateLocalMiroFile(updates) {
    if (!this.state.activeMiroFile) return;
    
    try {
      let content = fs.readFileSync(this.state.activeMiroFile, 'utf8');
      
      for (const update of updates) {
        content = this.insertContentIntoMiroFile(content, update);
      }
      
      fs.writeFileSync(this.state.activeMiroFile, content, 'utf8');
      console.log(`✅ Updated local Miro file with ${updates.length} items`);
      
    } catch (error) {
      console.error("❌ Local Miro file update failed:", error.message);
    }
  }

  /**
   * Insert content into Miro file
   */
  insertContentIntoMiroFile(content, update) {
    const time = new Date(update.metadata.timestamp).toLocaleTimeString();
    
    let insertText = '';
    let sectionMarker = '';
    
    switch (update.type) {
      case 'transcription':
        insertText = `\n- **[${time}]** ${update.content}`;
        sectionMarker = '## 🎤 Live Transcription';
        break;
      case 'entity':
        insertText = `\n- ${update.metadata.emoji || '🏷️'} ${update.content}`;
        sectionMarker = '## 🏷️ Erkannte Entitäten';
        break;
      case 'action_item':
        insertText = `\n- [ ] **[${time}]** ${update.content}`;
        sectionMarker = '## ✅ Action Items';
        break;
      case 'summary':
        insertText = `\n\n**Update [${time}]:**\n${update.content}`;
        sectionMarker = '## 📝 Live Summary';
        break;
    }
    
    // Find section and insert content
    const sectionIndex = content.indexOf(sectionMarker);
    if (sectionIndex !== -1) {
      const nextSectionIndex = content.indexOf('##', sectionIndex + sectionMarker.length);
      const insertPosition = nextSectionIndex !== -1 ? nextSectionIndex : content.length;
      
      content = content.slice(0, insertPosition) + insertText + content.slice(insertPosition);
    }
    
    return content;
  }

  /**
   * Calculate position on Miro board based on content type and time
   */
  calculateMiroPosition(type, timestamp) {
    const basePositions = {
      transcription: { x: -800, y: 0 },
      entity: { x: 0, y: 0 },
      action_item: { x: 600, y: 0 },
      summary: { x: -400, y: 400 }
    };
    
    const base = basePositions[type] || { x: 200, y: 200 };
    
    // Offset based on time to create chronological flow
    const timeOffset = Math.floor((timestamp % 300000) / 10000) * 80; // 5-minute cycle
    
    return {
      x: base.x,
      y: base.y + timeOffset
    };
  }

  /**
   * Format content for Miro display
   */
  formatContentForMiro(update) {
    const time = new Date(update.metadata.timestamp).toLocaleTimeString();
    
    switch (update.type) {
      case 'transcription':
        return `[${time}] 🗣️ ${update.content}`;
      case 'entity':
        return `🏷️ ${update.content}`;
      case 'action_item':
        return `☐ [${time}] ${update.content}`;
      case 'summary':
        return `📝 Summary (${time})\n${update.content}`;
      default:
        return `[${time}] ${update.content}`;
    }
  }

  /**
   * Get Miro color based on content type
   */
  getMiroColorForType(type) {
    const colorMap = {
      transcription: 'light_blue',
      entity: 'yellow',
      action_item: 'red',
      summary: 'green',
      default: 'light_gray'
    };
    
    return colorMap[type] || colorMap.default;
  }

  /**
   * Create live Obsidian file
   */
  async createLiveObsidianFile(sessionName) {
    const fileName = `${sessionName.replace(/[^a-zA-Z0-9\s-]/g, '')}.md`;
    const filePath = path.join(__dirname, '../../obsidian-vault/Live Sessions', fileName);
    
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Create initial file content
    const initialContent = `# ${sessionName}

## Live Session Info
- **Started**: ${new Date().toLocaleString('de-DE')}
- **Status**: 🔴 Live
- **Auto-updating**: ✅ Yes

## Live Transcription
*Content appears here as you speak...*

## Recognized Entities
*Entities are linked as they're mentioned...*

## Action Items
*Tasks are added when detected...*

## Live Summary
*Continuously updated summary...*

---
*This document updates in real-time during the session*
`;
    
    fs.writeFileSync(filePath, initialContent, 'utf8');
    
    return filePath;
  }

  /**
   * Update Obsidian file with new content
   */
  async updateObsidianFile(updates) {
    if (!this.state.activeObsidianFile) return;
    
    try {
      let currentContent = fs.readFileSync(this.state.activeObsidianFile, 'utf8');
      
      for (const update of updates) {
        currentContent = this.insertContentIntoObsidian(currentContent, update);
      }
      
      fs.writeFileSync(this.state.activeObsidianFile, currentContent, 'utf8');
      
      console.log(`✅ Updated Obsidian file with ${updates.length} items`);
      
    } catch (error) {
      console.error("❌ Obsidian update failed:", error.message);
      throw error;
    }
  }

  /**
   * Insert content into appropriate Obsidian section
   */
  insertContentIntoObsidian(content, update) {
    const time = new Date(update.metadata.timestamp).toLocaleTimeString();
    
    let insertText = '';
    let sectionMarker = '';
    
    switch (update.type) {
      case 'transcription':
        insertText = `\n- **[${time}]** ${update.content}`;
        sectionMarker = '## Live Transcription';
        break;
      case 'entity':
        insertText = `\n- [[${update.content}]]`;
        sectionMarker = '## Recognized Entities';
        break;
      case 'action_item':
        insertText = `\n- [ ] **[${time}]** ${update.content}`;
        sectionMarker = '## Action Items';
        break;
      case 'summary':
        insertText = `\n\n**Update [${time}]:**\n${update.content}`;
        sectionMarker = '## Live Summary';
        break;
    }
    
    // Find section and insert content
    const sectionIndex = content.indexOf(sectionMarker);
    if (sectionIndex !== -1) {
      const nextSectionIndex = content.indexOf('##', sectionIndex + sectionMarker.length);
      const insertPosition = nextSectionIndex !== -1 ? nextSectionIndex : content.length;
      
      content = content.slice(0, insertPosition) + insertText + content.slice(insertPosition);
    }
    
    return content;
  }

  /**
   * Create live Notion page
   */
  async createLiveNotionPage(sessionName) {
    const pageData = {
      parent: { type: "database_id", database_id: process.env.NOTION_DATABASE_ID || "default" },
      properties: {
        Name: {
          title: [{ text: { content: sessionName } }]
        },
        Status: {
          select: { name: "Live" }
        }
      },
      children: [
        {
          object: "block",
          type: "heading_1",
          heading_1: {
            rich_text: [{ text: { content: "Live Session" } }]
          }
        },
        {
          object: "block", 
          type: "paragraph",
          paragraph: {
            rich_text: [{ text: { content: "Content appears here as you speak..." } }]
          }
        }
      ]
    };
    
    const response = await axios.post(
      `${this.platforms.notion.baseUrl}/pages`,
      pageData,
      {
        headers: {
          Authorization: `Bearer ${this.platforms.notion.apiKey}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28'
        }
      }
    );
    
    return response.data.id;
  }

  /**
   * Update Notion page with new content
   */
  async updateNotionPage(updates) {
    // Try API first, fallback to local file
    if (this.state.activeNotionPageId) {
      try {
        await this.updateNotionAPI(updates);
      } catch (error) {
        console.warn("⚠️ Notion API update failed, using local file:", error.message);
        await this.updateLocalNotionFile(updates);
      }
    } else if (this.state.activeNotionFile) {
      await this.updateLocalNotionFile(updates);
    }
  }

  /**
   * Update Notion via API
   */
  async updateNotionAPI(updates) {
    for (const update of updates) {
      const blockData = this.createNotionBlock(update);
      
      await axios.patch(
        `${this.platforms.notion.baseUrl}/blocks/${this.state.activeNotionPageId}/children`,
        { children: [blockData] },
        {
          headers: {
            Authorization: `Bearer ${this.platforms.notion.apiKey}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28'
          }
        }
      );
    }
    
    console.log(`✅ Updated Notion page via API with ${updates.length} items`);
  }

  /**
   * Update local Notion file
   */
  async updateLocalNotionFile(updates) {
    if (!this.state.activeNotionFile) return;
    
    try {
      let content = fs.readFileSync(this.state.activeNotionFile, 'utf8');
      
      for (const update of updates) {
        content = this.insertContentIntoNotionFile(content, update);
      }
      
      fs.writeFileSync(this.state.activeNotionFile, content, 'utf8');
      console.log(`✅ Updated local Notion file with ${updates.length} items`);
      
    } catch (error) {
      console.error("❌ Local Notion file update failed:", error.message);
    }
  }

  /**
   * Insert content into Notion file
   */
  insertContentIntoNotionFile(content, update) {
    const time = new Date(update.metadata.timestamp).toLocaleTimeString();
    
    let insertText = '';
    let sectionMarker = '';
    
    switch (update.type) {
      case 'transcription':
        insertText = `\n\n**[${time}]** ${update.content}`;
        sectionMarker = '## Live Transcription';
        break;
      case 'entity':
        insertText = `\n- ${update.metadata.emoji || '🏷️'} **${update.content}**`;
        sectionMarker = '## Entities & Keywords';
        break;
      case 'action_item':
        insertText = `\n- [ ] **[${time}]** ${update.content}`;
        sectionMarker = '## Action Items';
        break;
      case 'summary':
        insertText = `\n\n### Summary Update [${time}]\n${update.content}`;
        sectionMarker = '## Summary';
        break;
    }
    
    // Find section and insert content
    const sectionIndex = content.indexOf(sectionMarker);
    if (sectionIndex !== -1) {
      const nextSectionIndex = content.indexOf('##', sectionIndex + sectionMarker.length);
      const insertPosition = nextSectionIndex !== -1 ? nextSectionIndex : content.length;
      
      content = content.slice(0, insertPosition) + insertText + content.slice(insertPosition);
    }
    
    return content;
  }

  /**
   * Create Notion block for update
   */
  createNotionBlock(update) {
    const time = new Date(update.metadata.timestamp).toLocaleTimeString();
    
    switch (update.type) {
      case 'transcription':
        return {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [
              { text: { content: `[${time}] ` }, annotations: { bold: true } },
              { text: { content: update.content } }
            ]
          }
        };
      case 'action_item':
        return {
          object: "block",
          type: "to_do",
          to_do: {
            rich_text: [{ text: { content: `[${time}] ${update.content}` } }],
            checked: false
          }
        };
      default:
        return {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [{ text: { content: `${update.content}` } }]
          }
        };
    }
  }

  /**
   * Report update results
   */
  reportUpdateResults(results, updateCount) {
    const platforms = ['Miro', 'Obsidian', 'Notion'];
    let successCount = 0;
    
    results.forEach((result, index) => {
      const platform = platforms[index];
      if (result.status === 'fulfilled') {
        successCount++;
        console.log(`✅ ${platform}: ${updateCount} updates applied`);
      } else {
        console.log(`❌ ${platform}: Update failed - ${result.reason.message}`);
      }
    });
    
    console.log(`📊 Real-time update: ${successCount}/${results.length} platforms updated successfully`);
  }

  /**
   * Get current session status
   */
  getSessionStatus() {
    return {
      isActive: Boolean(this.state.activeBoardId || this.state.activeObsidianFile || this.state.activeNotionPageId),
      activePlatforms: {
        miro: Boolean(this.state.activeBoardId),
        obsidian: Boolean(this.state.activeObsidianFile),
        notion: Boolean(this.state.activeNotionPageId)
      },
      queueLength: this.state.updateQueue.length,
      lastUpdate: this.state.lastUpdateTime,
      isUpdating: this.state.isUpdating
    };
  }

  /**
   * Stop real-time updates and finalize session
   */
  async finalizeSession() {
    console.log("🏁 Finalizing real-time session...");
    
    // Process any remaining updates
    if (this.state.updateQueue.length > 0) {
      await this.processUpdateQueue();
    }
    
    // Mark Obsidian file as completed
    if (this.state.activeObsidianFile) {
      let content = fs.readFileSync(this.state.activeObsidianFile, 'utf8');
      content = content.replace('**Status**: 🔴 Live', '**Status**: ✅ Completed');
      content += `\n\n---\n**Session completed**: ${new Date().toLocaleString('de-DE')}`;
      fs.writeFileSync(this.state.activeObsidianFile, content, 'utf8');
    }
    
    // Reset state
    this.state.activeBoardId = null;
    this.state.activeObsidianFile = null;
    this.state.activeNotionPageId = null;
    this.state.updateQueue = [];
    
    console.log("✅ Real-time session finalized");
  }
}

module.exports = { RealTimeUpdater };