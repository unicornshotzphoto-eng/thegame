import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import Journal from '@/app/src/screens/Journal';
import MiniNav from '@/app/components/MiniNav';

export default function JournalWithDrawer() {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <MiniNav router={router} />
      <Journal />
    </View>
  );
}
