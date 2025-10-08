#!/usr/bin/env node

const { ApiKeyExtractor, CodeUpdater } = require('./update-api-key.js');
const path = require('path');

async function testExtraction() {
    console.log('🧪 Testing API key extraction...');
    
    const extractor = new ApiKeyExtractor();
    
    try {
        await extractor.init();
        const apiKey = await extractor.extractApiKey();
        
        if (apiKey) {
            console.log('✅ Test successful!');
            console.log('API Key (first 20 chars):', apiKey.substring(0, 20) + '...');
            console.log('Full length:', apiKey.length);
            
            // Test the updater
            const updater = new CodeUpdater(path.join(__dirname, '..', 'components', 'Dashboard', 'LiveMap', 'Livemap.tsx'));
            await updater.updateApiKey(apiKey);
            console.log('✅ Code update test successful!');
            
        } else {
            console.log('❌ No API key found');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await extractor.cleanup();
    }
}

// Run test
testExtraction();
