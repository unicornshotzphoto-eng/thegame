import React from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import GameHub from '@/app/src/screens/GameHub';
import { THEME } from '@/app/src/constants/appTheme';
import MiniNav from '@/app/components/MiniNav';

const styles = StyleSheet.create({
  placeholder: {},
});

export default function GameHubWithDrawer() {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <MiniNav router={router} />
      <GameHub navigation={router} />
    </View>
  );
}
