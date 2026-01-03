import React from 'react';
import { Stack } from 'expo-router';

export default function TabLayout() {
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
      <Stack.Screen name="MultiplayerQuestions" />
      <Stack.Screen name="Messages" />
      <Stack.Screen name="DirectChat" />
      <Stack.Screen name="Friends" />
      <Stack.Screen name="Search" />
      <Stack.Screen name="Calendar" />
      <Stack.Screen name="Journal" />
      <Stack.Screen name="Rules" />
      <Stack.Screen name="JoinGame" />
      <Stack.Screen name="Gardens" />
      <Stack.Screen name="GardenDetail" />
    </Stack>
  );
}
