// extract_x_api_key.js
// npm install playwright
const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await ctx.newPage();

  // Target URL(s)
  const pageUrl = 'https://railradar.in/live-train-map';
  const apiUrlFragment = 'https://railradar.in/api/v1/trains/live-map';

  // Will be resolved when we capture the request
  let resolveCaptured;
  const capturedPromise = new Promise(resolve => { resolveCaptured = resolve; });

  // Listen for requests
  page.on('request', request => {
    const url = request.url();
    if (url.startsWith(apiUrlFragment)) {
      const headers = request.headers();
      const xApiKey = headers['x-api-key'] || headers['x-api-key'.toLowerCase()];
      console.log('Captured request to:', url);
      resolveCaptured({ url, headers, xApiKey, method: request.method(), postData: request.postData() });
    }
  });

  // Fallback: also listen to responses
  page.on('response', async response => {
    const url = response.url();
    if (url.startsWith(apiUrlFragment)) {
      const req = response.request();
      const headers = req.headers();
      const xApiKey = headers['x-api-key'] || headers['x-api-key'.toLowerCase()];
      console.log('Captured response from:', url);
      resolveCaptured({ url, headers, xApiKey, status: response.status() });
    }
  });

  console.log('Navigating to:', pageUrl);
  
  try {
    // Navigate with longer timeout and wait for load
    await page.goto(pageUrl, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    console.log('Page loaded, waiting for API request...');
    
    // Wait a bit for JavaScript to execute
    await page.waitForTimeout(5000);
    
    // Try to trigger any lazy-loaded content
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);

    // Wait up to 30s for the API request
    const timeoutMs = 30000;
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timed out waiting for API request')), timeoutMs)
    );

    const captured = await Promise.race([capturedPromise, timeout]);

    console.log('✓ Found API request:', captured.url);
    console.log('✓ Method:', captured.method || 'unknown');
    console.log('✓ X-api-key header value:', captured.xApiKey ?? '(not present)');
    
    // Write full headers to a file
    fs.writeFileSync('captured_headers.json', JSON.stringify(captured.headers, null, 2));
    console.log('✓ Saved headers to captured_headers.json');
    
    process.exit(0);
  } catch (err) {
    console.error('✗ Error:', err.message);
    
    // Take a screenshot for debugging
    try {
      await page.screenshot({ path: 'error_screenshot.png', fullPage: true });
      console.log('✓ Saved error screenshot to error_screenshot.png');
    } catch (screenshotErr) {
      console.error('Could not save screenshot:', screenshotErr.message);
    }
    
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
