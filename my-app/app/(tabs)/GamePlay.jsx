import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import GamePlay from '../src/screens/GamePlay';
import MiniNav from '@/app/components/MiniNav';

export default function GamePlayScreen({ route }) {
  const router = useRouter();
  
  return (
    <View style={{ flex: 1 }}>
      <MiniNav router={router} />
      <GamePlay route={route} navigation={router} />
    </View>
  );
}

