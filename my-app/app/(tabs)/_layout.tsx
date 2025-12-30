import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { DrawerContext } from '@/app/src/components/DrawerNavigator';
import { DrawerLayout } from '@/app/src/components/DrawerLayout';
import { Stack } from 'expo-router';

export default function TabLayout() {
  const drawerContext = React.useContext(DrawerContext);

  const tabsConfig = [
    { name: 'index', title: 'Home', icon: 'home' },
    { name: 'explore', title: 'Explore', icon: 'compass' },
    { name: 'Questions', title: 'Single Player', icon: 'help-circle' },
    { name: 'MultiplayerQuestions', title: 'Multiplayer', icon: 'people' },
    { name: 'Messages', title: 'Messages', icon: 'chatbubbles' },
    { name: 'Friends', title: 'Friends', icon: 'people-circle' },
    { name: 'Search', title: 'Search', icon: 'search' },
    { name: 'Calendar', title: 'Calendar', icon: 'calendar' },
    { name: 'Journal', title: 'Journal', icon: 'book' },
  ];

  if (!drawerContext) {
    return (
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="explore" options={{ headerShown: false }} />
      </Stack>
    );
  }

  return (
    <DrawerLayout tabs={tabsConfig}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="explore" />
        <Stack.Screen name="Questions" />
        <Stack.Screen name="MultiplayerQuestions" />
        <Stack.Screen name="Messages" />
        <Stack.Screen name="Friends" />
        <Stack.Screen name="Search" />
        <Stack.Screen name="Calendar" />
        <Stack.Screen name="Journal" />
      </Stack>
    </DrawerLayout>
  );
}
