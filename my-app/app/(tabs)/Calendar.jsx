import React from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Calendar from '@/app/src/screens/Calendar';
import { THEME } from '../../common/constants/appTheme';
import MiniNav from '@/app/components/MiniNav';

const styles = StyleSheet.create({
  placeholder: {},
});

export default function CalendarWithDrawer() {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <MiniNav router={router} />
      <Calendar />
    </View>
  );
}
