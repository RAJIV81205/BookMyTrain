const fs = require('fs');
const path = require('path');

// Read captured headers
const headersPath = path.join(__dirname, 'captured_headers.json');
const liveMapPath = path.join(__dirname, '..', 'app', 'api', '(dashboard)', 'livemap', 'route.ts');

if (!fs.existsSync(headersPath)) {
  console.error('✗ captured_headers.json not found');
  process.exit(1);
}

const headers = JSON.parse(fs.readFileSync(headersPath, 'utf8'));
const apiKey = headers['x-api-key'];

if (!apiKey) {
  console.error('✗ No x-api-key found in headers');
  process.exit(1);
}

console.log('✓ Found API key:', apiKey.substring(0, 20) + '...');

// Read route.ts
let content = fs.readFileSync(liveMapPath, 'utf8');

// Replace the API key
const regex = /"X-Api-Key":\s*"([^"]*)"/g;
const newContent = content.replace(regex, `"X-Api-Key": "${apiKey}"`);

if (content === newContent) {
  console.log('ℹ No changes needed - API key is already up to date');
  process.exit(0);
}

// Write back
fs.writeFileSync(liveMapPath, newContent, 'utf8');
console.log('✓ API key updated successfully in route.ts');
