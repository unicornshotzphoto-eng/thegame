import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';
import  SplashScreen  from '../src/screens/splash';

function App() {
  return (
    <SafeAreaView>

      <SplashScreen />
    
    </SafeAreaView>
  );
}

export default App