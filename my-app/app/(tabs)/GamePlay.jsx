import React from 'react';
import { useRouter } from 'expo-router';
import GamePlay from '@/app/src/screens/GamePlay';

export default function GamePlayScreen({ route }) {
  const router = useRouter();
  
  return <GamePlay route={route} navigation={router} />;
}
