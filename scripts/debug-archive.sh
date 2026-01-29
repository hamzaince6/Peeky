#!/bin/bash
# Debug script to check Archive build issues

echo "🔍 Archive Build Debug Script"
echo "=============================="
echo ""

# Check NODE_BINARY
echo "1️⃣ Checking NODE_BINARY..."
if command -v node &> /dev/null; then
    NODE_PATH=$(command -v node)
    echo "✅ Node found at: $NODE_PATH"
    echo "   Version: $(node --version)"
else
    echo "❌ Node not found in PATH!"
    echo "   This will cause the bundle script to fail."
    exit 1
fi

# Check .xcode.env
echo ""
echo "2️⃣ Checking .xcode.env..."
if [ -f ".xcode.env" ]; then
    echo "✅ .xcode.env exists"
    echo "   Content:"
    cat .xcode.env | sed 's/^/   /'
else
    echo "❌ .xcode.env not found!"
fi

# Check if expo is installed
echo ""
echo "3️⃣ Checking Expo CLI..."
if [ -d "node_modules/@expo/cli" ]; then
    echo "✅ @expo/cli is installed"
else
    echo "❌ @expo/cli not found in node_modules"
    echo "   Run: npm install"
fi

# Check react-native-xcode.sh
echo ""
echo "4️⃣ Checking react-native-xcode.sh..."
RN_XCODE_SCRIPT=$(node --print "require('path').dirname(require.resolve('react-native/package.json')) + '/scripts/react-native-xcode.sh'")
if [ -f "$RN_XCODE_SCRIPT" ]; then
    echo "✅ Found at: $RN_XCODE_SCRIPT"
else
    echo "❌ react-native-xcode.sh not found!"
    echo "   Expected at: $RN_XCODE_SCRIPT"
fi

# Instructions
echo ""
echo "📋 Next Steps:"
echo "   1. Archive build yapın (Product > Archive)"
echo "   2. Build log'larında 'Bundle React Native code and images' script'ini kontrol edin"
echo "   3. Archive tamamlandıktan sonra şunu çalıştırın:"
echo "      ./scripts/find-latest-archive.sh"
echo ""
echo "💡 Eğer bundle embed edilmemişse:"
echo "   - Build log'larında script hatası var mı kontrol edin"
echo "   - NODE_BINARY doğru ayarlı mı kontrol edin"
echo "   - Clean build folder yapıp tekrar deneyin (Cmd+Shift+K)"
