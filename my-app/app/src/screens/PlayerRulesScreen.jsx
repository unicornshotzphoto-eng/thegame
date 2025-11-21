import { Text, StatusBar, View, StyleSheet, Animated, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Title from '../common/Title';
import { use, useEffect} from 'react';

const PlayerRulesScreen = () => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Title text="Player Instructions & Rules" />
        <Text style={styles.text}>
          Always answer honestly.
        </Text>
      </ScrollView>
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'black',
  },
  scrollView: {
    flex: 1, // Allow ScrollView to take available vertical space
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    padding: 10,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
    fontFamily: 'montserrat-regular',
    color: 'white',
  },
  meduimtext: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 24,
    marginBottom: 10,
    fontFamily: 'montserrat-regular',
    color: 'white',
  },
});

export default PlayerRulesScreen;