import React from 'react';
import { ActivityIndicator, View } from 'react-native'; 
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from './utils/authContext';
import { ThemeProvider } from './utils/themeContext';

function RootInner() {
  const { isLoading, isOnboarded } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#7000FF" />
      </View>
    );
  }

  // Onboarding bittiyse NativeTabs göster, ama Stack içinde tut ki modal route'lar çalışsın
  if (isOnboarded) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }}>
        </Stack.Screen>
        {/* Modal/Overlay screens - her zaman erişilebilir */}
        <Stack.Screen name="question-game" options={{ presentation: 'modal' }} />
        <Stack.Screen name="age-selection" options={{ presentation: 'modal' }} />
      </Stack>
    );
  }

  // Onboarding ekranları için Stack navigator
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="multi-step-onboarding" />
      <Stack.Screen name="age-selection" />
      <Stack.Screen name="question-game" />
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

