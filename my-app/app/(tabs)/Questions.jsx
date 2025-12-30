import { useNavigation } from '@react-navigation/native';
import React from 'react';
import Questions from '../src/screens/Questions';

export default function QuestionsScreen() {
  const navigation = useNavigation();
  
  return <Questions navigation={navigation} />;
}
