import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import Home from '../src/screens/Home';
import MiniNav from '@/app/components/MiniNav';

export default function HomeScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  
  return (
    <View style={{ flex: 1 }}>
      <MiniNav router={router} />
      <Home navigation={navigation} />
    </View>
  );
}
