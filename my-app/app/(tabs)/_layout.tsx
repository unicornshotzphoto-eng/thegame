import React from 'react';
import { DrawerContext } from '@/app/src/components/DrawerNavigator';
import { Stack } from 'expo-router';

export default function TabLayout() {
  const drawerContext = React.useContext(DrawerContext);

  if (!drawerContext) {
    return (
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="explore" options={{ headerShown: false }} />
      </Stack>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="GameHub" />
      <Stack.Screen name="FriendSelection" />
      <Stack.Screen name="CategorySelection" />
      <Stack.Screen name="GamePlay" />
      <Stack.Screen name="explore" />
      <Stack.Screen name="Questions" />
      <Stack.Screen name="MultiplayerQuestions" />
      <Stack.Screen name="Messages" />
      <Stack.Screen name="Friends" />
      <Stack.Screen name="Search" />
      <Stack.Screen name="Calendar" />
      <Stack.Screen name="Journal" />
    </Stack>
  );
}
