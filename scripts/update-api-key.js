const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const CONFIG = require('./config');

// Add file path to config
CONFIG.filePath = path.join(__dirname, CONFIG.file.path);

class ApiKeyExtractor {
    constructor() {
        this.browser = null;
        this.page = null;
    }

    async init() {
        console.log('Initializing browser...');
        this.browser = await puppeteer.launch({
            headless: CONFIG.browser.headless,
            args: CONFIG.browser.args
        });

        this.page = await this.browser.newPage();
        
        // Set realistic browser settings
        await this.page.setUserAgent(CONFIG.browser.userAgent);
        await this.page.setViewport({ width: 1920, height: 1080 });
        
        // Set extra headers
        await this.page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none'
        });
    }

    async extractApiKey() {
        console.log('Starting API key extraction...');
        
        const requests = [];
        let apiKey = null;

        try {
            // Enable request interception
            await this.page.setRequestInterception(true);
            
            this.page.on('request', (request) => {
                requests.push({
                    url: request.url(),
                    headers: request.headers(),
                    method: request.method()
                });
                request.continue();
            });

            console.log('Navigating to target website...');
            await this.page.goto(CONFIG.target.url, {
                waitUntil: 'networkidle2',
                timeout: CONFIG.target.timeout
            });

            console.log('Page loaded, waiting for API calls...');
            
            // Wait for the page to fully load and make API calls
            await this.page.waitForTimeout(5000);

            // Method 1: Check intercepted requests
            apiKey = this.findApiKeyInRequests(requests);
            
            if (apiKey) {
                console.log('✅ API key found in intercepted requests');
                return apiKey;
            }

            // Method 2: Try to trigger API calls by interacting with the page
            console.log('Trying to trigger API calls...');
            apiKey = await this.triggerApiCalls();
            
            if (apiKey) {
                console.log('✅ API key found after triggering API calls');
                return apiKey;
            }

            // Method 3: Extract from page source/localStorage
            console.log('Trying to extract from page source...');
            apiKey = await this.extractFromPageSource();
            
            if (apiKey) {
                console.log('✅ API key found in page source');
                return apiKey;
            }

            // Method 4: Try to find in network tab simulation
            console.log('Trying network tab simulation...');
            apiKey = await this.simulateNetworkTab();
            
            if (apiKey) {
                console.log('✅ API key found via network simulation');
                return apiKey;
            }

            throw new Error('Could not extract API key using any method');

        } catch (error) {
            console.error('Error during API key extraction:', error);
            throw error;
        }
    }

    findApiKeyInRequests(requests) {
        for (const request of requests) {
            if (request.url.includes(CONFIG.target.apiEndpoint)) {
                const apiKey = request.headers['x-api-key'] || request.headers['X-Api-Key'];
                if (apiKey && this.isValidApiKey(apiKey)) {
                    return apiKey;
                }
            }
        }
        return null;
    }

    async triggerApiCalls() {
        try {
            // Try different ways to trigger the API call
            const triggers = [
                () => this.page.click('button'),
                () => this.page.click('[class*="refresh"]'),
                () => this.page.click('[class*="reload"]'),
                () => this.page.click('[class*="search"]'),
                () => this.page.evaluate(() => window.location.reload()),
                () => this.page.evaluate(() => {
                    // Try to trigger any event that might make an API call
                    const event = new Event('load');
                    window.dispatchEvent(event);
                })
            ];

            for (const trigger of triggers) {
                try {
                    await trigger();
                    await this.page.waitForTimeout(3000);
                    
                    // Check if any new requests were made
                    const requests = await this.page.evaluate((endpoint) => {
                        return performance.getEntriesByType('resource')
                            .filter(entry => entry.name.includes(endpoint))
                            .map(entry => entry.name);
                    }, CONFIG.target.apiEndpoint);
                    
                    if (requests.length > 0) {
                        console.log('API call triggered successfully');
                        // The API key should now be in the requests
                        return null; // Will be caught by the main extraction logic
                    }
                } catch (e) {
                    // Continue to next trigger
                }
            }
        } catch (error) {
            console.log('Error triggering API calls:', error.message);
        }
        return null;
    }

    async extractFromPageSource() {
        try {
            // Check localStorage
            const localStorage = await this.page.evaluate(() => {
                const storage = {};
                for (let i = 0; i < window.localStorage.length; i++) {
                    const key = window.localStorage.key(i);
                    storage[key] = window.localStorage.getItem(key);
                }
                return storage;
            });

            // Look for API key patterns in localStorage
            for (const [key, value] of Object.entries(localStorage)) {
                if (this.isValidApiKey(value)) {
                    return value;
                }
            }

            // Check sessionStorage
            const sessionStorage = await this.page.evaluate(() => {
                const storage = {};
                for (let i = 0; i < window.sessionStorage.length; i++) {
                    const key = window.sessionStorage.key(i);
                    storage[key] = window.sessionStorage.getItem(key);
                }
                return storage;
            });

            for (const [key, value] of Object.entries(sessionStorage)) {
                if (this.isValidApiKey(value)) {
                    return value;
                }
            }

            // Check page content for API key patterns
            const pageContent = await this.page.content();
            const apiKeyPatterns = [
                /["']([A-Za-z0-9_-]{50,})["']/g,
                /api[_-]?key["']?\s*[:=]\s*["']([^"']+)["']/gi,
                /x[_-]?api[_-]?key["']?\s*[:=]\s*["']([^"']+)["']/gi
            ];

            for (const pattern of apiKeyPatterns) {
                const matches = pageContent.match(pattern);
                if (matches) {
                    for (const match of matches) {
                        const key = match.replace(/["']/g, '').replace(/.*[:=]\s*/, '');
                        if (this.isValidApiKey(key)) {
                            return key;
                        }
                    }
                }
            }

        } catch (error) {
            console.log('Error extracting from page source:', error.message);
        }
        return null;
    }

    async simulateNetworkTab() {
        try {
            // Try to access the browser's network logs
            const networkLogs = await this.page.evaluate(() => {
                return new Promise((resolve) => {
                    const logs = [];
                    const originalFetch = window.fetch;
                    
                    window.fetch = function(...args) {
                        logs.push({
                            url: args[0],
                            options: args[1] || {}
                        });
                        return originalFetch.apply(this, args);
                    };
                    
                    setTimeout(() => resolve(logs), 5000);
                });
            });

            for (const log of networkLogs) {
                if (log.url.includes(CONFIG.target.apiEndpoint)) {
                    const apiKey = log.options.headers?.['X-Api-Key'] || log.options.headers?.['x-api-key'];
                    if (this.isValidApiKey(apiKey)) {
                        return apiKey;
                    }
                }
            }
        } catch (error) {
            console.log('Error simulating network tab:', error.message);
        }
        return null;
    }

    isValidApiKey(key) {
        if (!key || typeof key !== 'string') return false;
        
        // API key should be reasonably long and contain typical characters
        return key.length >= CONFIG.validation.minLength && CONFIG.validation.pattern.test(key);
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

class CodeUpdater {
    constructor(filePath) {
        this.filePath = filePath;
    }

    async updateApiKey(apiKey) {
        console.log('Updating API key in Livemap.tsx...');
        
        try {
            let content = fs.readFileSync(this.filePath, 'utf8');
            
            // Multiple patterns to match the API key
            const patterns = CONFIG.file.patterns;

            let updated = false;
            for (const pattern of patterns) {
                if (pattern.test(content)) {
                    content = content.replace(pattern, `'X-Api-Key': "${apiKey}"`);
                    updated = true;
                    console.log('✅ API key updated using pattern:', pattern.toString());
                    break;
                }
            }

            if (!updated) {
                console.log('⚠️ API key pattern not found, trying to add manually...');
                // Try to find the headers object and add the key
                const headersRegex = /headers:\s*\{[^}]*\}/;
                const match = content.match(headersRegex);
                if (match) {
                    const newHeaders = match[0].replace(/\}$/, `,\n                    'X-Api-Key': "${apiKey}"\n                }`);
                    content = content.replace(headersRegex, newHeaders);
                    updated = true;
                    console.log('✅ API key added to headers object');
                } else {
                    throw new Error('Could not find headers object in the file');
                }
            }
            
            fs.writeFileSync(this.filePath, content, 'utf8');
            console.log('✅ File updated successfully');
            
            return true;
            
        } catch (error) {
            console.error('❌ Error updating file:', error);
            throw error;
        }
    }
}

async function main() {
    const extractor = new ApiKeyExtractor();
    const updater = new CodeUpdater(CONFIG.filePath);
    
    try {
        console.log('🚀 Starting API key update process...');
        
        await extractor.init();
        
        let apiKey = null;
        let attempts = 0;
        
        while (!apiKey && attempts < CONFIG.target.retryAttempts) {
            attempts++;
            console.log(`\n📡 Attempt ${attempts}/${CONFIG.target.retryAttempts}`);
            
            try {
                apiKey = await extractor.extractApiKey();
                if (apiKey) {
                    console.log('🎉 Successfully extracted API key:', apiKey.substring(0, 20) + '...');
                    break;
                }
            } catch (error) {
                console.log(`❌ Attempt ${attempts} failed:`, error.message);
                if (attempts < CONFIG.retryAttempts) {
                    console.log('⏳ Waiting before retry...');
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            }
        }
        
        if (!apiKey) {
            throw new Error(`Failed to extract API key after ${CONFIG.target.retryAttempts} attempts`);
        }
        
        await updater.updateApiKey(apiKey);
        console.log('🎉 API key update completed successfully!');
        
    } catch (error) {
        console.error('💥 Failed to update API key:', error);
        process.exit(1);
    } finally {
        await extractor.cleanup();
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { ApiKeyExtractor, CodeUpdater };