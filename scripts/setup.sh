#!/bin/bash

echo "🚀 Setting up Automated API Key Updater..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
cd scripts
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Test the script
echo "🧪 Testing the extraction script..."
node test-extraction.js

if [ $? -eq 0 ]; then
    echo "✅ Test completed successfully"
else
    echo "⚠️ Test failed, but setup is complete. Check the logs for details."
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "The workflow will run automatically every day at 6 AM UTC."
echo "You can also run it manually:"
echo "  cd scripts && node update-api-key.js"
echo ""
echo "To test the extraction:"
echo "  cd scripts && node test-extraction.js"
