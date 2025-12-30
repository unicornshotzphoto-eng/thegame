import React from 'react';
import { useNavigation } from '@react-navigation/native';
import MultiplayerQuestions from './src/screens/MultiplayerQuestions';

export default function MultiplayerQuestionsRoute() {
  const navigation = useNavigation();
  
  return <MultiplayerQuestions navigation={navigation} />;
}
