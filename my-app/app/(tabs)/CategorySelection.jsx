import React from 'react';
import { useRouter } from 'expo-router';
import CategorySelection from '@/app/src/screens/CategorySelection';

export default function CategorySelectionScreen() {
  const router = useRouter();

  return <CategorySelection navigation={router} />;
}
