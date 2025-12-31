import React, { useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { THEME } from '../constants/appTheme';

const { width, height } = Dimensions.get('window');

function Home({ navigation }) {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Know Me Grow Us</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => router.push('/signin')}
            >
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.signUpButton}
              onPress={() => router.push('/Signup')}
            >
              <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.contentContainer}>
          {/* Main Headline */}
          <View style={styles.headlineContainer}>
            <Text style={styles.mainHeadline}>
              An intimate game for
            </Text>
            <Text style={[styles.mainHeadline, styles.highlightText]}>
              couples
            </Text>
          </View>

          {/* Subheadline */}
          <Text style={styles.subheadline}>
            Challenge yourself with fun and engaging quizzes designed to deepen your connection.
          </Text>

          {/* CTA Button */}
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push('/(tabs)/Questions')}
          >
            <Text style={styles.ctaButtonText}>Start a Game</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.xl,
    paddingVertical: THEME.spacing.lg,
  },
  logo: {
    fontSize: 24,
    fontWeight: '600',
    color: THEME.text.primary,
    letterSpacing: 0.5,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: THEME.spacing.lg,
    alignItems: 'center',
  },
  signInButton: {
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.lg,
  },
  signInText: {
    color: THEME.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  signUpButton: {
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.xl,
    borderWidth: 2,
    borderColor: THEME.primary,
    borderRadius: THEME.borderRadius.lg,
    backgroundColor: 'transparent',
  },
  signUpText: {
    color: THEME.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.xl,
  },
  headlineContainer: {
    marginBottom: THEME.spacing.xl,
    alignItems: 'center',
  },
  mainHeadline: {
    fontSize: 48,
    fontWeight: '700',
    color: THEME.text.primary,
    lineHeight: 56,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  highlightText: {
    color: THEME.primary,
  },
  subheadline: {
    fontSize: 16,
    color: THEME.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: THEME.spacing.xxl,
    maxWidth: width - THEME.spacing.xl * 2,
  },
  ctaButton: {
    paddingVertical: THEME.spacing.lg,
    paddingHorizontal: THEME.spacing.xxl,
    backgroundColor: THEME.primary,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: THEME.primary,
    elevation: 5,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.text.primary,
    letterSpacing: 0.3,
  },
});

export default Home;