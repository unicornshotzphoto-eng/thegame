import React from 'react';
import { useRouter } from 'expo-router';
import JoinGame from '../src/screens/JoinGame';

export default function JoinGameScreen() {
  const router = useRouter();
  return <JoinGame navigation={router} />;
}
