@echo off
echo 🚀 Setting up Automated API Key Updater...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Install dependencies
echo 📦 Installing dependencies...
cd scripts
npm install

if %errorlevel% equ 0 (
    echo ✅ Dependencies installed successfully
) else (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

REM Test the script
echo 🧪 Testing the extraction script...
node test-extraction.js

if %errorlevel% equ 0 (
    echo ✅ Test completed successfully
) else (
    echo ⚠️ Test failed, but setup is complete. Check the logs for details.
)

echo.
echo 🎉 Setup complete!
echo.
echo The workflow will run automatically every day at 6 AM UTC.
echo You can also run it manually:
echo   cd scripts ^&^& node update-api-key.js
echo.
echo To test the extraction:
echo   cd scripts ^&^& node test-extraction.js
pause
