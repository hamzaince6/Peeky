import React from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function TabsLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        <Icon sf="house.fill" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="history">
        <Label>History</Label>
        <Icon sf="clock.fill" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <Label>Settings</Label>
        <Icon sf="gear" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

