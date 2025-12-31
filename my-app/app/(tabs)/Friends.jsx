import React from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Friends from '@/app/src/screens/Friends';
import { THEME } from '@/app/src/constants/appTheme';
import MiniNav from '@/app/components/MiniNav';

const styles = StyleSheet.create({
  placeholder: {},
});

export default function FriendsWithDrawer() {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <MiniNav router={router} />
      <Friends />
    </View>
  );
}
