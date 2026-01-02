import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import Questions from '../src/screens/Questions';
import MiniNav from '@/app/components/MiniNav';

export default function TabTwoScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  
  return (
    <View style={{ flex: 1 }}>
      <MiniNav router={router} />
      <Questions navigation={navigation} />
    </View>
  );
}
