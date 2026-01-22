import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useAuth } from '../utils/authContext';
import { AgeGroup } from '../utils/ageGroups';

// Import screens
import OnboardingScreen from '../screens/OnboardingScreen';
import MultiStepOnboardingScreen from '../screens/MultiStepOnboardingScreen';
import GameHubScreen from '../screens/GameHubScreen';
import QuestionGameScreen from '../screens/QuestionGameScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AgeSelectionScreen from '../screens/AgeSelectionScreen';
import { ActivityIndicator } from 'react-native';

export type RootStackParamList = {
  Onboarding: undefined;
  MultiStepOnboarding: undefined;
  MainTabs: undefined;
  QuestionGame: { ageGroup: AgeGroup };
  AgeSelection: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  History: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#7000FF',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color, size }) => {
          let icon = '';
          if (route.name === 'Home') icon = focused ? '🏠' : '🏘️';
          else if (route.name === 'History') icon = focused ? '📜' : '📖';
          else if (route.name === 'Settings') icon = focused ? '⚙️' : '🛠️';

          return (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <Text style={{ fontSize: 24 }}>{icon}</Text>
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={GameHubScreen}
        options={{ tabBarLabel: 'Ana Sayfa' }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ tabBarLabel: 'Geçmiş' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarLabel: 'Ayarlar' }}
      />
    </Tab.Navigator>
  );
};

export const RootNavigator = () => {
  const { isLoading, isOnboarded } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#7000FF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isOnboarded ? (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="MultiStepOnboarding" component={MultiStepOnboardingScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen name="QuestionGame" component={QuestionGameScreen} />
            <Stack.Screen name="AgeSelection" component={AgeSelectionScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 20,
    height: 75,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 10,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 5,
  },
  iconContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  activeIconContainer: {
    backgroundColor: '#F3E8FF',
  },
});
