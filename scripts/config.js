module.exports = {
    // Target website configuration
    target: {
        url: 'https://railradar.in/live-train-map',
        apiEndpoint: '/api/v1/trains/live-map',
        timeout: 30000,
        retryAttempts: 3
    },
    
    // File to update
    file: {
        path: '../components/Dashboard/LiveMap/Livemap.tsx',
        patterns: [
            /'X-Api-Key':\s*"[^"]*"/,
            /"X-Api-Key":\s*"[^"]*"/,
            /'x-api-key':\s*"[^"]*"/,
            /"x-api-key":\s*"[^"]*"/
        ]
    },
    
    // Browser configuration
    browser: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor'
        ],
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    
    // API key validation
    validation: {
        minLength: 20,
        pattern: /^[A-Za-z0-9_-]+$/
    }
};
