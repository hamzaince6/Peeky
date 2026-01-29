module.exports = {
  expo: {
    name: 'Peeky - Eğitici Oyunlar',
    slug: 'peeky-educational-games',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/peekylogo.png',
    userInterfaceStyle: 'light',
    runtimeVersion: '1.0.0',
    updates: {
      enabled: true,
      checkAutomatically: 'ON_LOAD_FALLBACK',
      fallbackToCacheTimeout: 1000,
    },
    splash: {
      image: './assets/peekylogo.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.peeky.educationalgames',
      buildNumber: '5',
      icon: './assets/peekylogo.png',
      infoPlist: {
        NSLocalNetworkUsageDescription: 'This app needs access to your local network',
        NSBonjourServiceTypes: ['_app-clips._tcp'],
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: 'com.peeky.educationalgames',
      versionCode: '5',
      permissions: [
        'android.permission.INTERNET',
        'android.permission.CAMERA',
        'android.permission.WRITE_EXTERNAL_STORAGE',
      ],
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
      name: 'Peeky - Eğitici Oyunlar',
      shortName: 'Peeky',
      lang: 'tr',
      scope: '/',
      themeColor: '#7000FF',
      backgroundColor: '#FFFFFF',
      display: 'standalone',
      orientation: 'portrait',
    },
    plugins: ['expo-router'],
    extra: {
      eas: {
        projectId: 'peeky-educational-games',
      },
      // Environment variables'ı extra'ya ekle (build zamanında dahil edilir)
      EXPO_PUBLIC_GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY || '',
      EXPO_PUBLIC_GEMINI_MODEL: process.env.EXPO_PUBLIC_GEMINI_MODEL || 'gemini-2.5-flash',
    },
  },
};
