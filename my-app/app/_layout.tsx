import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import React, { useEffect } from 'react';
import useStore from '@/app/src/core/global';
import { getUserData, getAuthToken } from '@/app/src/core/secureStorage';


export const unstable_settings = {
  anchor: 'index',
};

export default function RootLayout() {
  const login = useStore((state) => state.login);

  // Load user from storage on app startup
  useEffect(() => {
    console.log('[RootLayout] Initializing - loading user from storage');
    
    const loadUserFromStorage = async () => {
      try {
        console.log('[RootLayout] Attempting to load token and user data from storage');
        const token = await getAuthToken();
        const userData = await getUserData();
        
        console.log('[RootLayout] Token retrieved:', token ? 'EXISTS' : 'EMPTY');
        console.log('[RootLayout] User data retrieved:', userData ? 'EXISTS' : 'EMPTY');
        
        if (token && userData) {
          console.log('[RootLayout] Restoring user from storage:', userData.username);
          login(userData);
        } else {
          console.log('[RootLayout] No stored user data found - user not authenticated');
        }
      } catch (error) {
        console.error('[RootLayout] Error loading user from storage:', error);
      }
    };
    
    loadUserFromStorage();
  }, [login]);

  return (
    <>
      <Stack
        screenOptions={{
          cardStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="signin" options={{ headerShown: false }} />
        <Stack.Screen name="Signup" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="MultiplayerQuestions" 
          options={{ 
            title: 'Multiplayer Quiz',
            headerShown: false,
            presentation: 'card'
          }} 
        />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
