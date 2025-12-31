import React from 'react';
import { useRouter } from 'expo-router';
import FriendSelection from '@/app/src/screens/FriendSelection';

export default function FriendSelectionScreen() {
  const router = useRouter();

  return <FriendSelection navigation={router} />;
}
