import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { THEME } from '../constants/appTheme';
import { getCurrentGameSession, clearCurrentGameSession } from '../core/secureStorage';

const { width, height } = Dimensions.get('window');

function Home({ navigation }) {
  const router = useRouter();
  const [savedSession, setSavedSession] = useState(null);
  
  // Check for saved game session when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const checkSavedSession = async () => {
        try {
          const session = await getCurrentGameSession();
          if (session?.sessionId) {
            console.log('[Home] Found saved game session:', session.sessionId);
            setSavedSession(session);
          } else {
            setSavedSession(null);
          }
        } catch (error) {
          console.error('[Home] Error loading saved session:', error);
          setSavedSession(null);
        }
      };
      
      checkSavedSession();
    }, [])
  );
  
  const handleResumeGame = async () => {
    if (savedSession?.sessionId) {
      console.log('[Home] Resuming game:', savedSession.sessionId);
      router.push({
        pathname: '/(tabs)/GamePlay',
        params: { sessionId: savedSession.sessionId, gameCode: savedSession.gameCode }
      });
    }
  };
  
  const handleClearSavedGame = async () => {
    try {
      await clearCurrentGameSession();
      setSavedSession(null);
      console.log('[Home] Saved game session cleared');
    } catch (error) {
      console.error('[Home] Error clearing saved session:', error);
    }
  };
  
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

          {/* Resume Game Button - Show if saved session exists */}
          {savedSession && (
            <View style={styles.resumeContainer}>
              <TouchableOpacity
                style={[styles.ctaButton, styles.resumeButton]}
                onPress={handleResumeGame}
              >
                <Text style={styles.ctaButtonText}>Resume Game</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearSavedGame}
              >
                <Text style={styles.clearButtonText}>Clear Saved Game</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* CTA Button */}
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push('/(tabs)/JoinGame')}
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
  resumeContainer: {
    gap: THEME.spacing.md,
    marginBottom: THEME.spacing.lg,
  },
  resumeButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
    shadowColor: '#4CAF50',
  },
  clearButton: {
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.lg,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#999',
    backgroundColor: 'transparent',
  },
  clearButtonText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default Home;