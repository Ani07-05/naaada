// Tab group with the custom ASCII nav bar. Mini player is injected above it (Phase 3).
import React from 'react';
import { Tabs } from 'expo-router';
import { TuiNav } from '@/components/TuiNav';
import { MiniPlayer } from '@/components/MiniPlayer';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => (
        <>
          <MiniPlayer />
          <TuiNav {...props} />
        </>
      )}
      screenOptions={{ headerShown: false, animation: 'none' }}
    >
      <Tabs.Screen name="library" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="now" />
      <Tabs.Screen name="queue" />
      <Tabs.Screen name="config" />
    </Tabs>
  );
}
