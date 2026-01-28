import { StatusBar } from 'expo-status-bar';
import { Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './app/utils/authContext';
import { ThemeProvider } from './app/utils/themeContext';
import { RootNavigator } from './app/navigation/RootNavigator';

export default function App() {
  const Wrapper = Platform.OS === 'web' ? View : GestureHandlerRootView;

  return (
    <Wrapper style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider>
          <RootNavigator />
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
    </Wrapper>
  );
}
