import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native'; 
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from './utils/authContext';
import { ThemeProvider } from './utils/themeContext';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 APP CRASH ERROR:', error);
    console.error('🚨 Error Info:', errorInfo);
    console.error('🚨 Stack:', error.stack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Bir hata oluştu</Text>
          <Text style={styles.errorText}>{this.state.error?.message || 'Bilinmeyen hata'}</Text>
          <Text style={styles.errorHint}>Xcode Console'da detaylı logları görebilirsin</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

function RootInner() {
  const { isLoading } = useAuth();

  console.log('🔵 RootInner render - isLoading:', isLoading);

  if (isLoading) {
    console.log('⏳ Showing loading screen');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#7000FF" />
      </View>
    );
  }

  console.log('✅ Loading complete, showing main app');
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

  console.log('🚀 RootLayout mounting');

  return (
    <ErrorBoundary>
      <Wrapper style={{ flex: 1 }}>
        <AuthProvider>
          <ThemeProvider>
            <RootInner />
          </ThemeProvider>
        </AuthProvider>
      </Wrapper>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#EF4444',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorHint: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
});

