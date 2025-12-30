import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import React from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { DrawerProvider } from '@/app/src/components/DrawerNavigator';
import useStore from '@/app/src/core/global';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const authenticated = useStore((state) => state.authenticated);

  return (
    <DrawerProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
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
      </ThemeProvider>
    </DrawerProvider>
  );
}
