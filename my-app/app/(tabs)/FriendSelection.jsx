import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import FriendSelection from '@/app/src/screens/FriendSelection';
import MiniNav from '@/app/components/MiniNav';

export default function FriendSelectionScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <MiniNav router={router} />
      <FriendSelection navigation={router} />
    </View>
  );
}
