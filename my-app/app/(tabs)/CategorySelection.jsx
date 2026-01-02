import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import CategorySelection from '@/app/src/screens/CategorySelection';
import MiniNav from '@/app/components/MiniNav';

export default function CategorySelectionScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <MiniNav router={router} />
      <CategorySelection navigation={router} />
    </View>
  );
}
