#!/bin/bash
# Find the latest archive and check for JS bundle

echo "🔍 Finding latest archive..."
LATEST_ARCHIVE=$(find ~/Library/Developer/Xcode/Archives -name "PeekyEiticiOyunlar.xcarchive" -type d -maxdepth 2 | sort -r | head -1)

if [ -z "$LATEST_ARCHIVE" ]; then
  echo "❌ No archive found. Please create an archive first (Product > Archive in Xcode)."
  exit 1
fi

echo "✅ Found archive: $LATEST_ARCHIVE"
echo ""
echo "🔍 Checking for JS bundle..."

APP_PATH="$LATEST_ARCHIVE/Products/Applications/PeekyEiticiOyunlar.app"

if [ ! -d "$APP_PATH" ]; then
  echo "❌ App bundle not found at: $APP_PATH"
  exit 1
fi

# Check for main.jsbundle
if [ -f "$APP_PATH/main.jsbundle" ]; then
  SIZE=$(du -h "$APP_PATH/main.jsbundle" | cut -f1)
  echo "✅ Found main.jsbundle (Size: $SIZE)"
  BUNDLE_FOUND=true
else
  echo "❌ main.jsbundle NOT FOUND"
fi

# Check for main.hbc
if [ -f "$APP_PATH/main.hbc" ]; then
  SIZE=$(du -h "$APP_PATH/main.hbc" | cut -f1)
  echo "✅ Found main.hbc (Size: $SIZE)"
  BUNDLE_FOUND=true
else
  echo "❌ main.hbc NOT FOUND"
fi

# List all .jsbundle and .hbc files
echo ""
echo "📦 All bundle files in app:"
BUNDLE_FILES=$(find "$APP_PATH" -name "*.jsbundle" -o -name "*.hbc" 2>/dev/null)
if [ -z "$BUNDLE_FILES" ]; then
  echo "  ❌ No bundle files found!"
  echo ""
  echo "💡 SOLUTION:"
  echo "   The JS bundle is not embedded in the archive."
  echo "   This usually means the 'Bundle React Native code and images' script"
  echo "   did not run during the archive build."
  echo ""
  echo "   Check:"
  echo "   1. Xcode Build Log → Search for 'Bundle React Native code and images'"
  echo "   2. Make sure NODE_BINARY is set correctly in .xcode.env"
  echo "   3. Try cleaning the build folder (Cmd+Shift+K) and rebuilding"
else
  while IFS= read -r file; do
    SIZE=$(du -h "$file" | cut -f1)
    echo "  ✅ $(basename "$file") (Size: $SIZE)"
  done <<< "$BUNDLE_FILES"
fi

echo ""
echo "📋 First 20 files in app bundle:"
ls -lh "$APP_PATH" | head -20
