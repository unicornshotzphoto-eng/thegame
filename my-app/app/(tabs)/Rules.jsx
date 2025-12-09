import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import  RulesScreen  from '../src/screens/RulesScreen';

const Rules = () => {
  return (
    <SafeAreaView style={styles.container}>
      <RulesScreen />
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

export default Rules