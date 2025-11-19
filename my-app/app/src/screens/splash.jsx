import { Text, StatusBar, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function SplashScreen() {
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black'

    }}>
      {/* This component only controls the style of system elements in the status bar area */}
      <StatusBar barStyle="light-content" />
      <View>
        {/* This is your custom app text */}
        <Text style={{ flex: 1, fontSize: 48, fontWeight: 'bold', textAlign: 'center', color: 'white' }}>
          Know Me, Grow Us
        </Text>
      </View>
    </SafeAreaView>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#922626ff',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   textStyle: {
//     textAlign: 'center',
//     color: '#181819ff',
//     fontSize: 48,
//     fontWeight: '600',
//   },
// });

export default SplashScreen;