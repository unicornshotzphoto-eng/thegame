import { useNavigation } from '@react-navigation/native';
import React from 'react';
import Home from '../src/screens/Home';

export default function HomeScreen() {
  const navigation = useNavigation();
  
  return <Home navigation={navigation} />;
}
