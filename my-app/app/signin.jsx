import React from 'react';
import { useNavigation } from '@react-navigation/native';
import Signin from './src/screens/Signin';

export default function SigninRoute() {
  const navigation = useNavigation();
  
  return <Signin navigation={navigation} />;
}
