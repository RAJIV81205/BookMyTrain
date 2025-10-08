# 🚀 Automated API Key Updater - Complete Setup

## What This Does

This workflow automatically:
1. **Visits** https://railradar.in/live-train-map daily
2. **Extracts** the X-Api-Key from their network requests
3. **Updates** your `Livemap.tsx` file with the new API key
4. **Commits** and pushes the changes to your repository

## Files Created

### GitHub Actions Workflow
- `.github/workflows/update-api-key.yml` - Runs daily at 6 AM UTC

### Scripts Directory
- `scripts/update-api-key.js` - Main extraction and update script
- `scripts/config.js` - Configuration file
- `scripts/package.json` - Dependencies
- `scripts/test-extraction.js` - Test script
- `scripts/setup.sh` - Linux/Mac setup script
- `scripts/setup.bat` - Windows setup script
- `scripts/README.md` - Detailed documentation

## How to Use

### Automatic (Recommended)
The workflow runs automatically every day. No action needed!

### Manual Testing
```bash
cd scripts
npm install
node test-extraction.js
```

### Manual Execution
```bash
cd scripts
node update-api-key.js
```

## How It Works

The script uses multiple sophisticated methods to extract the API key:

1. **Request Interception** - Captures network requests made by the page
2. **Page Interaction** - Tries to trigger API calls by clicking buttons
3. **Source Analysis** - Searches page source and localStorage for API keys
4. **Network Simulation** - Simulates browser network tab functionality

## Configuration

Edit `scripts/config.js` to modify:
- Target URL and API endpoint
- File path to update
- Retry attempts and timeout values
- Browser settings

## Troubleshooting

If the workflow fails:
1. Check GitHub Actions logs
2. Verify the website is accessible
3. Run the test script locally
4. Check if the API key pattern has changed

## Security

- Runs in secure GitHub Actions environment
- No sensitive data is logged or stored
- Only updates legitimate API calls

## Next Steps

1. **Commit and push** these files to your repository
2. **Enable GitHub Actions** in your repository settings
3. **Monitor** the Actions tab for successful runs
4. **Test manually** if needed using the test script

The workflow will start running automatically and keep your API key updated daily! 🎉
