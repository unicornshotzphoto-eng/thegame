import React, { useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Animated, Easing } from 'react-native';
import { THEME } from '@/app/src/constants/appTheme';

const DEFAULT_TABS = [
  { name: 'GameHub', label: 'Games', icon: '🎮' },
  { name: 'JoinGame', label: 'Join', icon: '🔑' },
  { name: 'Friends', label: 'Friends', icon: '👥' },
  { name: 'Messages', label: 'Messages', icon: '💬' },
  { name: 'Search', label: 'Search', icon: '🔍' },
  { name: 'Calendar', label: 'Calendar', icon: '📅' },
  { name: 'Journal', label: 'Journal', icon: '📝' },
];

export default function MiniNav({ router, tabs = DEFAULT_TABS, style }) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const { width: screenWidth } = Dimensions.get('window');
  const barWidth = useMemo(() => Math.floor(screenWidth / 16), [screenWidth]);
  const itemSize = useMemo(() => Math.max(24, barWidth - 8), [barWidth]);
  const translateX = useRef(new Animated.Value(barWidth)).current;

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
