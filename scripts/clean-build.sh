#!/bin/bash
# Clean build script to fix build issues

echo "🧹 Cleaning build artifacts..."

cd "$(dirname "$0")/.."

# Clean Xcode build folder
echo "1️⃣ Cleaning Xcode build folder..."
rm -rf ios/build
rm -rf ios/DerivedData

# Clean CocoaPods
echo "2️⃣ Cleaning CocoaPods..."
cd ios
rm -rf Pods
rm -rf Podfile.lock
rm -rf .xcode.env.local

# Clean Xcode DerivedData (user-specific)
echo "3️⃣ Cleaning Xcode DerivedData..."
rm -rf ~/Library/Developer/Xcode/DerivedData/PeekyEiticiOyunlar*

# Clean node_modules (optional, uncomment if needed)
# echo "4️⃣ Cleaning node_modules..."
# cd ..
# rm -rf node_modules

echo ""
echo "✅ Clean complete!"
echo ""
echo "📋 Next steps:"
echo "   1. cd ios && pod install"
echo "   2. Open Xcode and clean build folder (Cmd+Shift+K)"
echo "   3. Try building again"
