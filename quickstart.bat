@echo off
REM Peeky Quick Start Script for Windows

echo.
echo 🚀 Welcome to Peeky Setup!
echo.
echo This script will guide you through the setup process.
echo.

REM Check if Node is installed
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install it first.
    pause
    exit /b 1
)

echo ✅ Node.js found: 
node --version
echo.

REM Step 1: Dependencies
echo 📦 Step 1: Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed
echo.

REM Step 2: Environment setup
echo ⚙️ Step 2: Setting up environment variables...
if not exist .env.local (
    echo ❌ .env.local not found. Creating from .env.example...
    type .env.example > .env.local
    echo ✅ Created .env.local - Please edit it with your credentials:
    echo    - SUPABASE_URL
    echo    - SUPABASE_ANON_KEY
    echo    - GEMINI_API_KEY
    echo.
    echo ⚠️  STOP: Edit .env.local before continuing!
    echo.
    echo Opening .env.local in Notepad...
    notepad .env.local
) else (
    echo ✅ .env.local found
)

echo.
echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. If you edited .env.local, run: npm start
echo 2. To run on iOS: npm run ios
echo 3. To run on Android: npm run android
echo 4. To run on web: npm run web
echo.
echo 📖 For detailed instructions, see SETUP_GUIDE.md
echo.
pause
