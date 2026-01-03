import React from 'react';
import { View, ImageBackground, StyleSheet } from 'react-native';
import { THEME } from '../constants/appTheme';

/**
 * BackgroundWrapper - Wraps content with a background image and overlay
 * Ensures text remains visible over the background image
 * 
 * @param {ReactNode} children - Content to display
 * @param {object} style - Additional styles for the container
 * @param {number} overlayOpacity - Opacity of the dark overlay (0-1), default 0.4
 */
export default function BackgroundWrapper({ children, style, overlayOpacity = 0.4 }) {
  return (
    <ImageBackground
      source={require('../../../assets/images/backgroundimage.png')}
      style={[styles.backgroundImage, style]}
      resizeMode="cover"
    >
      {/* Dark overlay to ensure text visibility */}
      <View style={[styles.overlay, { backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }]} />
      
      {/* Content on top of overlay */}
      <View style={styles.content}>
        {children}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  content: {
    flex: 1,
    zIndex: 2,
  },
});
