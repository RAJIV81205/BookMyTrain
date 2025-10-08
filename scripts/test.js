// extract_x_api_key.js
// npm install playwright
const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true }); // set false if you want to see the browser
  const ctx = await browser.newContext();
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
      const headers = request.headers(); // Playwright returns header names in lower-case
      const xApiKey = headers['x-api-key'] || headers['x-api-key'.toLowerCase()];
      resolveCaptured({ url, headers, xApiKey, method: request.method(), postData: request.postData() });
    }
  });

  // Fallback: also listen to responses (in case request event already fired)
  page.on('response', async response => {
    const url = response.url();
    if (url.startsWith(apiUrlFragment)) {
      const req = response.request();
      const headers = req.headers();
      const xApiKey = headers['x-api-key'] || headers['x-api-key'.toLowerCase()];
      resolveCaptured({ url, headers, xApiKey, status: response.status() });
    }
  });

  // Navigate and wait for the capture (with timeout)
  await page.goto(pageUrl, { waitUntil: 'networkidle' }).catch(() => { /* ignore goto timeout */ });

  // Wait up to 15s for the API request to be observed
  const timeoutMs = 15000;
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timed out waiting for API request')), timeoutMs));

  try {
    const captured = await Promise.race([capturedPromise, timeout]);

    console.log('Found API request:', captured.url);
    console.log('Method:', captured.method || 'unknown');
    console.log('X-api-key header value:', captured.xApiKey ?? '(not present)');
    // Optionally write full headers to a file
    fs.writeFileSync('captured_headers.json', JSON.stringify(captured.headers, null, 2));
    console.log('Saved headers to captured_headers.json');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }
})();
