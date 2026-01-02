

import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

export function Background() {
  return (
    <View style={styles.container} pointerEvents="none">
      <ImageBackground
        source={require('../assets/images/icon.png')}
        resizeMode="cover"
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
});
