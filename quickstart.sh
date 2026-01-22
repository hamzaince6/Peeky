#!/bin/bash

# Peeky Quick Start Script
# This script helps you get Peeky up and running quickly

echo "🚀 Welcome to Peeky Setup!"
echo ""
echo "This script will guide you through the setup process."
echo ""

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Step 1: Dependencies
echo "📦 Step 1: Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Step 2: Environment setup
echo "⚙️ Step 2: Setting up environment variables..."
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found. Creating from .env.example..."
    cp .env.example .env.local
    echo "✅ Created .env.local - Please edit it with your credentials:"
    echo "   - SUPABASE_URL"
    echo "   - SUPABASE_ANON_KEY"
    echo "   - GEMINI_API_KEY"
    echo ""
    echo "⚠️  STOP: Edit .env.local before continuing!"
    exit 0
else
    echo "✅ .env.local found"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. If you edited .env.local, run: npm start"
echo "2. To run on iOS: npm run ios"
echo "3. To run on Android: npm run android"
echo "4. To run on web: npm run web"
echo ""
echo "📖 For detailed instructions, see SETUP_GUIDE.md"
