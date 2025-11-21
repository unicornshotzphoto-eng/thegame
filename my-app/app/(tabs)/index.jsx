// import { Image } from 'expo-image';
// import { Platform, StyleSheet } from 'react-native';

// import { HelloWave } from '@/components/hello-wave';
// import ParallaxScrollView from '@/components/parallax-scroll-view';
// import { ThemedText } from '@/components/themed-text';
// import { ThemedView } from '@/components/themed-view';
// import { Link } from 'expo-router';

// export default function HomeScreen() {
//   return (
//     <ParallaxScrollView
//       headerBackgroundColor={{ light: '#000000', dark: '#000000' }} // Changed to black
//       headerImage={
//         <Image
//           source={require('@/assets/images/partial-react-logo.png')}
//           style={styles.reactLogo}
//         />
//       }
//       contentBackgroundColor={{ light: '#000000', dark: '#000000' }}> 
//       {/* Changed styles.contentContainer to styles.titleContainer to use the existing style */}
//       <ThemedView style={[styles.titleContainer, { flex: 1 }]}>
//         <ThemedText type="title" style={{ color: '#FFFFFF' }}> 
//           Welcome to Know Me, Grow Us
//         </ThemedText>
//       </ThemedView>
//       <ThemedText style={{ color: '#FFFFFF' }}> 
//         A guided intimacy game designed to deepen connection through curiosity,
//         discovry, and play
//       </ThemedText>
//     </ParallaxScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   titleContainer: { // This style is now being correctly referenced
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     backgroundColor: '#000000', // Changed to black
//   },
//   stepContainer: {
//     gap: 8,
//     marginBottom: 8,
//   },
//   reactLogo: {
//     height: 178,
//     width: 290,
//     bottom: 0,
//     left: 0,
//     position: 'absolute',
//   },
// });


// // 

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

const HomeScreen = () => {
  return (
    // SafeAreaView ensures content avoids notches and status bars on modern devices
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.text}>Know Me, Grow Us</Text>
        <Text style={styles.smallText}>A guided intimacy game designed to deepen connection through curiosity,
         discovery, and play</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Black background
  },
  content: {
    flex: 1,
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
    padding: 20,
  },
  text: {
    color: '#FFFFFF', // White text color
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'montserrat-regular',
  },
  smallText: {
    color: '#FFFFFF', // White text color
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'montserrat-regular',
  },
});

export default HomeScreen;