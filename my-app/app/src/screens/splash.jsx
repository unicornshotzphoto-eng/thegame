import { Text, StatusBar, View, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Title from '../common/Title';
import { use, useEffect} from 'react';

function SplashScreen () {

  const translatey = new Animated.Value(0);
  const duration = 5000;
   useEffect(() => {
    Animated.timing(translatey, {
      toValue: 20,
      duration: duration,
      useNativeDriver: true,
    }).start();
   }, []);
  return (
    <SafeAreaView style={styles.container}>
      {/* The inner View now has flex: 1 and the background color, ensuring it fills the safe area */}
      <View style={styles.contentArea}>
        <Title text ="Know Me, Grow Us" />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    // This makes the SafeAreaView fill the initial space provided by React Native Navigation/App wrapper
    flex: 1,
    // Optional: You can put the background here too if you want the safe area edges colored
    backgroundColor: 'black', 
  },
  contentArea: {
    // This View now expands to fill the entire container (SafeAreaView), 
    // ensuring the background color covers all available space within the safe area.
    flex: 1,
    justifyContent: 'center', // Centers content vertically
    alignItems: 'center',     // Centers content horizontally
    backgroundColor: 'black', // The background color for the main screen area
  },
  textStyle: {
    fontSize: 48,
    textAlign: 'center',
    fontFamily: 'montserrat-regular',
    color: 'white',
    // Removed flex: 1 from Text style as it's no longer needed and caused layout issues.
  },
});

export default SplashScreen;