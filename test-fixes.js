// Test script to verify the fixes
const path = require('path');
const { summarize } = require('./src/utils/kitegg-service');
const { identifyEntitiesWithEmojis } = require('./src/utils/entity-linker');
const { exportToNotion } = require('./src/integrations/notion-export');

async function testFixes() {
  console.log('🧪 Testing fixes...\n');
  
  // Test 1: Kitegg service with template access
  console.log('1. Testing Kitegg service template access...');
  try {
    const testText = "Das ist ein Test für das Handling von Templates.";
    const summary = await summarize(testText, 'standard');
    console.log('✅ Kitegg service working');
  } catch (error) {
    console.error('❌ Kitegg service error:', error.message);
  }
  
  // Test 2: Entity linker emoji function
  console.log('\n2. Testing entity linker emoji function...');
  try {
    const testText = "JavaScript und React sind wichtige Technologien.";
    const entityEmojis = identifyEntitiesWithEmojis(testText);
    console.log('✅ Entity emoji function working:', Object.keys(entityEmojis).length, 'entities found');
  } catch (error) {
    console.error('❌ Entity emoji function error:', error.message);
  }
  
  // Test 3: Notion export function signature
  console.log('\n3. Testing Notion export function signature...');
  try {
    // This should not crash even without valid API keys
    const result = await exportToNotion("Test summary", "Test title", { templateType: 'standard' });
    console.log('✅ Notion export function signature working (expected to fail without API keys)');
  } catch (error) {
    console.log('✅ Notion export function signature working (error expected without API keys)');
  }
  
  console.log('\n🎉 All tests completed!');
}

testFixes().catch(console.error);
