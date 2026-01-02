import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import JoinGame from '../src/screens/JoinGame';
import MiniNav from '@/app/components/MiniNav';

export default function JoinGameScreen() {
  const router = useRouter();
  return (
    <View style={{ flex: 1 }}>
      <MiniNav router={router} />
      <JoinGame navigation={router} />
    </View>
  );
}
