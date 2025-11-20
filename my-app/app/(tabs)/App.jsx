import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet } from 'react-native';
import  SplashScreen  from '../src/screens/Splash';

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <SplashScreen />
      {/* You can add other components here */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Optional: add a background color
    // backgroundColor: '#831111ff', 
  },
});

export default App;