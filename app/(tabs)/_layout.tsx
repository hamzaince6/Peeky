import React from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function TabsLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Ana Sayfa</Label>
        <Icon sf="house.fill" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="history">
        <Label>Geçmiş</Label>
        <Icon sf="clock.fill" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <Label>Ayarlar</Label>
        <Icon sf="gear" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

