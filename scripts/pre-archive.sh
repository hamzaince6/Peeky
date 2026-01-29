#!/bin/bash
# Pre-archive script to ensure JS bundle is exported before Archive

set -e

echo "📦 Pre-archive: Exporting JS bundle..."

# Navigate to project root
cd "$(dirname "$0")/.."

# Export bundle for iOS
echo "📱 Exporting iOS bundle..."
npx expo export --platform ios --output-dir ios/build

echo "✅ Bundle exported successfully!"
