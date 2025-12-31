import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { THEME } from '../constants/appTheme';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

export const DrawerContext = React.createContext();

export function DrawerProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const router = useRouter();

  const toggleDrawer = () => {
    const toValue = isOpen ? 0 : DRAWER_WIDTH;
    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsOpen(!isOpen);
  };

  const closeDrawer = () => {
    if (isOpen) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
      setIsOpen(false);
    }
  };



  return (
    <DrawerContext.Provider value={{ isOpen, toggleDrawer, closeDrawer, slideAnim }}>
      {children}
    </DrawerContext.Provider>
  );
}

export function DrawerMenu({ tabs }) {
  const router = useRouter();
  const { closeDrawer } = React.useContext(DrawerContext);

  const handleNavigate = (screenName) => {
    // Routes relative to app root with proper Expo Router syntax
    const routeMap = {
      'index': '/(tabs)',
      'GameHub': '/(tabs)/GameHub',
      'explore': '/(tabs)/explore',
      'Questions': '/(tabs)/Questions',
      'MultiplayerQuestions': '/(tabs)/MultiplayerQuestions',
      'Messages': '/(tabs)/Messages',
      'Friends': '/(tabs)/Friends',
      'Search': '/(tabs)/Search',
      'Calendar': '/(tabs)/Calendar',
      'Journal': '/(tabs)/Journal',
    };
    
    const route = routeMap[screenName];
    if (route) {
      router.push(route);
      closeDrawer();
    }
  };

  return (
    <SafeAreaView style={styles.drawerContainer}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle}>Menu</Text>
      </View>

      <View style={styles.drawerContent}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.name}
            style={styles.drawerItem}
            onPress={() => handleNavigate(tab.name)}
          >
            <Ionicons
              name={tab.icon}
              size={24}
              color={THEME.primary}
              style={styles.drawerItemIcon}
            />
            <Text style={styles.drawerItemText}>{tab.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.drawerFooter}>
        <TouchableOpacity style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color={THEME.button.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export function DrawerOverlay({ isOpen, onPress }) {
  if (!isOpen) return null;

  return (
    <TouchableOpacity
      style={styles.overlay}
      activeOpacity={1}
      onPress={onPress}
    />
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: THEME.surfaceDark,
    width: DRAWER_WIDTH,
  },
  drawerHeader: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderLight,
    marginBottom: THEME.spacing.md,
  },
  drawerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.primary,
    letterSpacing: 0.5,
  },
  drawerContent: {
    flex: 1,
    paddingVertical: 12,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    marginVertical: 4,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
    borderRadius: THEME.borderRadius.md,
  },
  drawerItemActive: {
    backgroundColor: 'rgba(209, 67, 91, 0.15)',
    borderLeftColor: THEME.primary,
    borderLeftWidth: 4,
  },
  drawerItemIcon: {
    marginRight: THEME.spacing.md,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerItemText: {
    fontSize: 15,
    color: THEME.text.primary,
    fontWeight: '500',
    marginLeft: THEME.spacing.md,
  },
  drawerFooter: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: THEME.borderLight,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    backgroundColor: 'rgba(196, 30, 58, 0.15)',
    borderRadius: THEME.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: THEME.button.danger,
  },
  logoutText: {
    marginLeft: THEME.spacing.md,
    fontSize: 15,
    color: THEME.button.danger,
    fontWeight: '600',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
