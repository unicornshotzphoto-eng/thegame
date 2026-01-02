import React from 'react';
import { View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DirectChat from '@/app/src/screens/DirectChat';
import MiniNav from '@/app/components/MiniNav';

export default function DirectChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  console.log('[DirectChatScreen] Received params:', params);

  return (
    <View style={{ flex: 1 }}>
      <MiniNav router={router} />
      <DirectChat 
        navigation={{ 
          navigate: (screen) => router.push(screen),
          goBack: () => router.back(),
          push: (config) => router.push(config.pathname)
        }}
        route={{ params }}
      />
    </View>
  );
}
