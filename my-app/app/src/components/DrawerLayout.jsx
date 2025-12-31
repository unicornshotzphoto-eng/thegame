import React from 'react';
import {
  View,
  Animated,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrawerContext, DrawerMenu, DrawerOverlay } from './DrawerNavigator';
import { THEME } from '../constants/appTheme';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.125;

export function DrawerLayout({ children, tabs }) {
  const { slideAnim, isOpen, toggleDrawer, closeDrawer } = React.useContext(DrawerContext);

  const drawerTranslate = slideAnim.interpolate({
    inputRange: [0, DRAWER_WIDTH],
    outputRange: [-DRAWER_WIDTH, 0],
  });

  const overlayOpacity = slideAnim.interpolate({
    inputRange: [0, DRAWER_WIDTH],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.container}>
      {/* Drawer Menu */}
      <Animated.View
        style={[
          styles.drawerWrapper,
          {
            transform: [{ translateX: drawerTranslate }],
          },
        ]}
      >
        <DrawerMenu tabs={tabs} />
      </Animated.View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Header with Menu Icon */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={toggleDrawer}
          >
            <Ionicons
              name={isOpen ? 'close' : 'menu'}
              size={28}
              color={THEME.text.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Screen Content */}
        {children}
      </View>

      {/* Overlay - Only render when drawer is open */}
      {isOpen && (
        <Animated.View
          style={[
            styles.overlayWrapper,
            { opacity: overlayOpacity },
          ]}
        >
          <TouchableOpacity
            style={styles.overlayTouchable}
            activeOpacity={1}
            onPress={closeDrawer}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  drawerWrapper: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    zIndex: 999,
  },
  mainContent: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  header: {
    backgroundColor: THEME.surfaceDark,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    padding: THEME.spacing.md,
    marginLeft: -THEME.spacing.md,
  },
  overlayWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 98,
  },
  overlayTouchable: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
