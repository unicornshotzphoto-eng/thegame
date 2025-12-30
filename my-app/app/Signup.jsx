import React from 'react';
import { useNavigation } from '@react-navigation/native';
import Signup from './src/screens/Signup';

export default function SignupRoute() {
  const navigation = useNavigation();
  
  return <Signup navigation={navigation} />;
}
