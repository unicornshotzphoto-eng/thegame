import React, { useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Animated, Easing, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import useStore from '@/app/src/core/global';
import { clearSecureStorage, getAuthToken, getUserData } from '@/app/src/core/secureStorage';
import { THEME } from '@/app/src/constants/appTheme';

const DEFAULT_TABS = [
  { name: 'GameHub', label: 'Games', icon: '🎮' },
  { name: 'JoinGame', label: 'Join', icon: '🔑' },
  { name: 'Friends', label: 'Friends', icon: '👥' },
  { name: 'Messages', label: 'Messages', icon: '💬' },
  { name: 'Search', label: 'Search', icon: '🔍' },
  { name: 'Calendar', label: 'Calendar', icon: '📅' },
  { name: 'Journal', label: 'Journal', icon: '📝' },
  { name: 'Rules', label: 'Rules', icon: '📖' },
];

export default function MiniNav({ router, tabs = DEFAULT_TABS, style }) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const { width: screenWidth } = Dimensions.get('window');
  const barWidth = useMemo(() => Math.floor(screenWidth / 16), [screenWidth]);
  const itemSize = useMemo(() => Math.max(24, barWidth - 8), [barWidth]);
  const translateX = useRef(new Animated.Value(barWidth)).current;
  const logout = useStore((state) => state.logout);

  const animateOpen = () => {
    setVisible(true);
    setOpen(true);
    Animated.timing(translateX, {
      toValue: 0,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const animateClose = (after) => {
    Animated.timing(translateX, {
      toValue: barWidth,
      duration: 180,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setOpen(false);
      setVisible(false);
      if (after) after();
    });
  };

  const toggle = () => {
    if (!visible) return animateOpen();
    animateClose();
  };

  const handleLogout = async () => {
    console.log('[MiniNav] Logout button pressed');
    console.log('[MiniNav] Current auth state:', useStore.getState().authenticated);
    
    // For web, use confirm dialog instead of Alert (more reliable)
    const userConfirmed = confirm('Are you sure you want to logout?');
    
    if (!userConfirmed) {
      console.log('[MiniNav] Logout cancelled by user');
      return;
    }
    
    console.log('[MiniNav] Logout confirmed');
    
    // Close menu immediately without waiting for callback
    animateClose();
    
    // Execute logout sequence - directly without setTimeout first to test
    console.log('[MiniNav] Starting logout sequence');
    
    try {
      // Clear storage
      console.log('[MiniNav] Step 1: Clearing secure storage');
      await clearSecureStorage();
      console.log('[MiniNav] Step 2: Storage cleared');
      
      // Verify storage was cleared
      try {
        const token = await getAuthToken();
        const userData = await getUserData();
        console.log('[MiniNav] Step 3: Token still exists?', !!token);
        console.log('[MiniNav] Step 4: UserData still exists?', !!userData);
      } catch (verifyErr) {
        console.log('[MiniNav] Step 3-4: Verification read (expected if cleared):', verifyErr.message);
      }
      
      // Call Zustand logout
      console.log('[MiniNav] Step 5: Calling Zustand logout()');
      logout();
      
      // Verify state
      const state = useStore.getState();
      console.log('[MiniNav] Step 6: After logout - authenticated:', state.authenticated);
      console.log('[MiniNav] ✓ Logout complete');
    } catch (error) {
      console.error('[MiniNav] ERROR during logout:', error.message);
      console.error('[MiniNav] Error:', error);
    }
  };

  return (
    <View pointerEvents="box-none" style={[styles.root, style]}>
      {/* Toggle Button (transparent) */}
      <TouchableOpacity
        accessibilityLabel="Toggle navigation"
        onPress={toggle}
        style={styles.toggle}
      >
        <Text style={styles.toggleIcon}>☰</Text>
      </TouchableOpacity>

      {visible && (
        <Animated.View style={[
          styles.sidebar,
          { width: barWidth, transform: [{ translateX }] },
        ]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentVertical}
          >
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.name}
                style={[styles.item, { width: itemSize, height: itemSize }]}
                onPress={() => {
                  animateClose(() => router.push(tab.name));
                }}
              >
                <Text style={[styles.icon, { fontSize: Math.max(16, Math.round(itemSize * 0.4)) }]}>{tab.icon}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Logout Button */}
          <TouchableOpacity
            style={[styles.item, { width: itemSize, height: itemSize, marginTop: 8, backgroundColor: THEME.button?.danger || '#ff6b6b' }]}
            onPress={handleLogout}
          >
            <Text style={[styles.icon, { fontSize: Math.max(16, Math.round(itemSize * 0.4)) }]}>🚪</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
  },
  toggle: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  toggleIcon: {
    fontSize: 18,
    color: THEME.white,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    paddingTop: 52,
    paddingRight: 8,
    paddingLeft: 8,
    paddingBottom: 8,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  contentVertical: {
    gap: 4,
    alignItems: 'center',
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: THEME.background,
  },
  icon: {
    fontSize: 20,
  },
});

