import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet } from 'react-native';
import  RuleList  from '../src/screens/PlayerRulesScreen';

const Rules = () => {
  return (
    <SafeAreaView style={styles.container}>
      <RuleList />
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