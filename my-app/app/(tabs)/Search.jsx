import React from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Search from '@/app/src/screens/Search';
import { THEME } from '@/app/src/constants/appTheme';
import MiniNav from '@/app/components/MiniNav';

const styles = StyleSheet.create({
  placeholder: {},
});

export default function SearchWithDrawer() {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <MiniNav router={router} />
      <Search />
    </View>
  );
}
