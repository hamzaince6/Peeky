import React from 'react';
import { ActivityIndicator, View } from 'react-native'; 
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from './utils/authContext';
import { ThemeProvider } from './utils/themeContext';

function RootInner() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#7000FF" />
      </View>
    );
  }

  // Direkt ana sayfaya git (onboarding yok)
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* Modal/Overlay screens - her zaman erişilebilir */}
      <Stack.Screen name="question-game" options={{ presentation: 'modal' }} />
      <Stack.Screen name="age-selection" options={{ presentation: 'modal' }} />
      <Stack.Screen name="drawing-workshop" options={{ presentation: 'modal' }} />
      <Stack.Screen name="memory-garden" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const Wrapper = GestureHandlerRootView;

  return (
    <Wrapper style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider>
          <RootInner />
        </ThemeProvider>
      </AuthProvider>
    </Wrapper>
  );
}

