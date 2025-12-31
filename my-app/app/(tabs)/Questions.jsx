import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Questions from '../src/screens/Questions';
import { THEME } from '@/app/src/constants/appTheme';
import MiniNav from '@/app/components/MiniNav';

const styles = StyleSheet.create({
  placeholder: {},
});

export default function QuestionsScreen() {
  const navigation = useNavigation();
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <MiniNav router={router} />
      <Questions navigation={navigation} />
    </View>
  );
}
