import { useNavigation } from '@react-navigation/native';
import React from 'react';
import MultiplayerQuestions from '../src/screens/MultiplayerQuestions';

export default function MultiplayerQuestionsScreen() {
  const navigation = useNavigation();
  return <MultiplayerQuestions navigation={navigation} />;
}
