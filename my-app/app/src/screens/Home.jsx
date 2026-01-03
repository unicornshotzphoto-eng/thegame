import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { THEME } from '../constants/appTheme';
import { getCurrentGameSession, clearCurrentGameSession } from '../core/secureStorage';
import BackgroundWrapper from '../components/BackgroundWrapper';

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
  
  return (
    <BackgroundWrapper overlayOpacity={0.5}>
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Logo & Tagline */}
            <View style={styles.logoSection}>
              <Text style={styles.logoMain}>Know Me</Text>
              <Text style={styles.logoGrow}>Grow Us</Text>
              <Text style={styles.tagline}>Explore. Share. Connect.</Text>
            </View>

            {/* Main Cards Grid */}
            <View style={styles.gridContainer}>
              {/* Start Game Card */}
              <TouchableOpacity 
                style={styles.card}
                onPress={() => router.push('/(tabs)/FriendSelection')}
              >
                <Text style={styles.cardIcon}>🎴</Text>
                <Text style={styles.cardTitle}>Start Game</Text>
                <Text style={styles.cardSubtitle}>Begin the Journey</Text>
              </TouchableOpacity>

              {/* Question Packs Card */}
              <TouchableOpacity 
                style={styles.card}
                onPress={() => router.push('/(tabs)/Search')}
              >
                <Text style={styles.cardIcon}>📚</Text>
                <Text style={styles.cardTitle}>Question Packs</Text>
                <Text style={styles.cardSubtitle}>Explore Topics</Text>
              </TouchableOpacity>

              {/* My Progress Card */}
              <TouchableOpacity 
                style={styles.card}
                onPress={() => router.push('/(tabs)/Calendar')}
              >
                <Text style={styles.cardIcon}>📈</Text>
                <Text style={styles.cardTitle}>My Progress</Text>
                <Text style={styles.cardSubtitle}>Track & Reflect</Text>
              </TouchableOpacity>

              {/* Settings Card */}
              <TouchableOpacity 
                style={styles.card}
                onPress={() => router.push('/(tabs)/Search')}
              >
                <Text style={styles.cardIcon}>⚙️</Text>
                <Text style={styles.cardTitle}>Settings</Text>
                <Text style={styles.cardSubtitle}>Customize Experience</Text>
              </TouchableOpacity>
            </View>

            {/* Tonight's Reflection Section */}
            <View style={styles.reflectionSection}>
              <Text style={styles.reflectionLabel}>Tonight's Reflection</Text>
              <View style={styles.reflectionCard}>
                <Text style={styles.reflectionTitle}>Tempting Question</Text>
                <Text style={styles.reflectionQuestion}>What's been on your mind today?</Text>
                <TouchableOpacity style={styles.revealButton}>
                  <Text style={styles.revealButtonText}>Reveal</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoMain: {
    fontSize: 42,
    fontWeight: '700',
    color: '#D4A574',
    letterSpacing: 1,
  },
  logoGrow: {
    fontSize: 48,
    fontWeight: '600',
    color: '#ff4444',
    fontStyle: 'italic',
    marginTop: -8,
    fontFamily: 'cursive',
  },
  tagline: {
    fontSize: 14,
    color: '#C8A882',
    marginTop: 8,
    letterSpacing: 2,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  card: {
    width: '48%',
    backgroundColor: 'rgba(139, 69, 19, 0.4)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#D4A574',
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E8C9A0',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#C8A882',
    textAlign: 'center',
  },
  reflectionSection: {
    marginBottom: 30,
  },
  reflectionLabel: {
    fontSize: 14,
    color: '#C8A882',
    textAlign: 'center',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  reflectionCard: {
    backgroundColor: 'rgba(139, 69, 19, 0.4)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#D4A574',
    padding: 24,
    alignItems: 'center',
  },
  reflectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4A574',
    marginBottom: 12,
  },
  reflectionQuestion: {
    fontSize: 16,
    color: '#E8C9A0',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  revealButton: {
    backgroundColor: '#D4A574',
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 20,
  },
  revealButtonText: {
    color: '#2B1810',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default Home;