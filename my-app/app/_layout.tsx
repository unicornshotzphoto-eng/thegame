import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import React from 'react';
import useStore from '@/app/src/core/global';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const authenticated = useStore((state) => state.authenticated);

  return (
    <>
      <Stack
        screenOptions={{
          cardStyle: { backgroundColor: 'transparent' },
        }}
      >
        {authenticated ? (
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen 
              name="MultiplayerQuestions" 
              options={{ 
                title: 'Multiplayer Quiz',
                headerShown: false,
                presentation: 'card'
              }} 
            />
          </>
        ) : (
          <>
            <Stack.Screen name="signin" options={{ headerShown: false }} />
            <Stack.Screen name="Signup" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </>
        )}
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
