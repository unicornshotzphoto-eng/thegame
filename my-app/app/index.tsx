import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import useStore from '@/app/src/core/global';
import { View } from 'react-native';

export default function IndexRoute() {
  const router = useRouter();
  const authenticated = useStore((state) => state.authenticated);

  console.log('[IndexRoute] Rendered with authenticated state:', authenticated);

  useEffect(() => {
    console.log('[IndexRoute] useEffect running, authenticated:', authenticated);
    
    // Give the router time to be fully ready
    const timer = setTimeout(() => {
      console.log('[IndexRoute] Timer fired, checking auth state');
      console.log('[IndexRoute] Current authenticated state:', useStore.getState().authenticated);
      
      if (useStore.getState().authenticated) {
        console.log('[IndexRoute] User is authenticated, navigating to home');
        try {
          router.replace('/(tabs)');
          console.log('[IndexRoute] Navigation to /(tabs) called');
        } catch (error) {
          console.error('[IndexRoute] Navigation error:', error);
        }
      } else {
        console.log('[IndexRoute] User is not authenticated, navigating to signin');
        try {
          router.replace('/signin');
          console.log('[IndexRoute] Navigation to /signin called');
        } catch (error) {
          console.error('[IndexRoute] Navigation error:', error);
        }
      }
    }, 100);

    return () => {
      console.log('[IndexRoute] useEffect cleanup, clearing timer');
      clearTimeout(timer);
    };
  }, [authenticated, router]);

  // Return empty view while redirecting
  return <View style={{ flex: 1 }} />;
}
