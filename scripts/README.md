# Automated API Key Updater

This workflow automatically extracts the API key from railradar.in and updates your code daily.

## How It Works

1. **Daily Execution**: The GitHub Action runs every day at 6 AM UTC
2. **Web Scraping**: Uses Puppeteer to visit https://railradar.in/live-train-map
3. **API Key Extraction**: Captures network requests to find the X-Api-Key header
4. **Code Update**: Automatically updates the API key in `Livemap.tsx`
5. **Auto Commit**: Commits and pushes the changes to your repository

## Files Created

- `.github/workflows/update-api-key.yml` - GitHub Actions workflow
- `scripts/update-api-key.js` - Main extraction and update script
- `scripts/package.json` - Dependencies for the script

## Manual Execution

You can also run the script manually:

```bash
cd scripts
npm install
node update-api-key.js
```

## How the Script Works

The script uses multiple methods to extract the API key:

1. **Request Interception**: Captures network requests made by the page
2. **Page Interaction**: Tries to trigger API calls by clicking buttons
3. **Source Analysis**: Searches page source and localStorage for API keys
4. **Network Simulation**: Simulates browser network tab functionality

## Configuration

The script is configured to:
- Target: `https://railradar.in/live-train-map`
- API Endpoint: `/api/v1/trains/live-map`
- Update File: `components/Dashboard/LiveMap/Livemap.tsx`
- Retry Attempts: 3
- Timeout: 30 seconds

## Troubleshooting

If the workflow fails:

1. Check the GitHub Actions logs
2. Verify the website is accessible
3. Ensure the API key pattern hasn't changed
4. Run the script manually to debug

## Security Notes

- The script runs in a secure GitHub Actions environment
- No sensitive data is logged or stored
- The API key is only used for legitimate API calls

## Customization

You can modify:
- Schedule time in the workflow file
- Target URL and API endpoint
- File path to update
- Retry attempts and timeout values
