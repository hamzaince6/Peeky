#!/bin/bash
# Script to check if JS bundle is embedded in the Archive

ARCHIVE_PATH="$1"

if [ -z "$ARCHIVE_PATH" ]; then
  echo "Usage: $0 <path-to-archive>"
  echo "Example: $0 ~/Library/Developer/Xcode/Archives/2026-01-29/PeekyEiticiOyunlar.xcarchive"
  exit 1
fi

APP_PATH="$ARCHIVE_PATH/Products/Applications/PeekyEiticiOyunlar.app"

if [ ! -d "$APP_PATH" ]; then
  echo "❌ App bundle not found at: $APP_PATH"
  exit 1
fi

echo "🔍 Checking for JS bundle in: $APP_PATH"
echo ""

# Check for main.jsbundle
if [ -f "$APP_PATH/main.jsbundle" ]; then
  SIZE=$(du -h "$APP_PATH/main.jsbundle" | cut -f1)
  echo "✅ Found main.jsbundle (Size: $SIZE)"
else
  echo "❌ main.jsbundle NOT FOUND"
fi

# Check for main.hbc
if [ -f "$APP_PATH/main.hbc" ]; then
  SIZE=$(du -h "$APP_PATH/main.hbc" | cut -f1)
  echo "✅ Found main.hbc (Size: $SIZE)"
else
  echo "❌ main.hbc NOT FOUND"
fi

# List all .jsbundle and .hbc files
echo ""
echo "📦 All bundle files in app:"
find "$APP_PATH" -name "*.jsbundle" -o -name "*.hbc" | while read file; do
  SIZE=$(du -h "$file" | cut -f1)
  echo "  - $(basename "$file") (Size: $SIZE)"
done

echo ""
echo "📋 All files in app bundle:"
ls -lh "$APP_PATH" | head -20
