import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../core/api';
import { useLocalSearchParams } from 'expo-router';
import { showAlert } from '../utils/alert';
import { THEME } from '../constants/appTheme';

function CategorySelection({ navigation, route }) {
  const localParams = useLocalSearchParams?.() || {};
  const participantIds = useMemo(() => {
    const fromRoute = route?.params?.participantIds;
    const fromLocal = localParams?.participantIds;
    const parse = (val) => {
      if (Array.isArray(val)) return val.map((v) => Number(v));
      if (typeof val === 'string') return val.split(',').filter(Boolean).map((v) => Number(v));
      return [];
    };
    if (fromRoute && fromRoute.length) return parse(fromRoute);
    if (fromLocal) return parse(fromLocal);
    return [];
  }, [route?.params?.participantIds, localParams?.participantIds]);
  const categories = [
    { id: 'spiritual', label: 'Spiritual Knowing', range: '(1-20)', emoji: '✨' },
    { id: 'mental', label: 'Mental Knowing', range: '(21-40)', emoji: '🧠' },
    { id: 'general', label: 'General Knowing', range: '(1-40)', emoji: '📘' },
    { id: 'physical', label: 'Physical Knowing', range: '(41-60)', emoji: '💪' },
    { id: 'disagreeables', label: 'Disagreeables & Truth Checks', range: '(61-80)', emoji: '⚡' },
    { id: 'romantic', label: 'Romantic Knowing', range: '(81-100)', emoji: '💕' },
    { id: 'erotic', label: 'Desirable Knowing', range: '(101-160)', emoji: '🔥' },
    { id: 'creative', label: 'Creative & Fun', range: '(161-200)', emoji: '🎨' },
  ];

  // Categories are now chosen per-turn during gameplay; no pre-selection here
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [currentParticipants, setCurrentParticipants] = useState(participantIds);

  useEffect(() => {
    // Initialize participants from route params
    setCurrentParticipants(participantIds);
  }, [participantIds]);

  useFocusEffect(
    useCallback(() => {
      // Update participants when focused with new params (support expo-router)
      const fromRoute = route?.params?.participantIds;
      const fromLocal = localParams?.participantIds;
      const parse = (val) => {
        if (Array.isArray(val)) return val.map((v) => Number(v));
        if (typeof val === 'string') return val.split(',').filter(Boolean).map((v) => Number(v));
        return [];
      };
      const newParticipants = fromRoute?.length ? parse(fromRoute) : parse(fromLocal);
      setCurrentParticipants(newParticipants);
    }, [route?.params?.participantIds, localParams?.participantIds])
  );

  const toggleCategory = (categoryId) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId);
    } else {
      newSelected.add(categoryId);
    }
    setSelectedCategories(newSelected);
  };

  const handleAddFriends = () => {
    console.log('Add Friends clicked - Current participants:', currentParticipants);
    const params = {
      returnScreen: 'CategorySelection',
      selectedParticipants: (currentParticipants || []).join(','),
    };
    if (navigation?.push) {
      navigation.push({ pathname: 'FriendSelection', params });
    } else if (navigation?.navigate) {
      navigation.navigate('FriendSelection', params);
    }
  };

  const handleCreateGame = async () => {
    try {
      setLoading(true);
      console.log('Creating game with per-turn categories:');
      console.log('  Participants:', currentParticipants);
      
      const response = await api.post('/quiz/games/create/', {
        session_type: 'direct',
        participant_ids: currentParticipants,
        // No categories at creation; players select a category each turn
      });

      console.log('Game created successfully:', response.data);
      console.log('Game Code from create response:', response.data.game_code || 'NOT FOUND');
      const sessionId = response.data.id || response.data.session_id;
      const gameCode = response.data.game_code;
      
      if (!sessionId) {
        showAlert('Error', 'Failed to get session ID from response');
        return;
      }

      showAlert('Success', 'Game created! Players will pick categories on their turns.');
      if (navigation?.push) {
        navigation.push({ pathname: 'GamePlay', params: { sessionId, gameCode } });
      } else if (navigation?.navigate) {
        navigation.navigate('GamePlay', { sessionId, gameCode });
      }
    } catch (error) {
      console.error('Create game error:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create game';
      showAlert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const goBack = useCallback(() => {
    if (navigation?.goBack) return navigation.goBack();
    if (navigation?.back) return navigation.back();
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Game</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Turn-based Categories</Text>
          <Text style={styles.infoText}>
            Players will pick ONE category on their turn during the game. You don't need to select categories now.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addFriendsButton}
          onPress={handleAddFriends}
        >
          <Text style={styles.addFriendsButtonText}>+ Add Friends</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateGame}
          disabled={loading || currentParticipants.length === 0}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.createButtonText}>Start Game</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    backgroundColor: THEME.surfaceDark,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderLight,
  },
  backButton: {
    paddingHorizontal: THEME.spacing.md,
  },
  backButtonText: {
    color: THEME.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: THEME.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  spacer: {
    width: 50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: THEME.spacing.lg,
  },
  subtitle: {
    color: THEME.text.secondary,
    fontSize: 16,
    marginBottom: THEME.spacing.lg,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: THEME.surfaceDark,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: THEME.borderLight,
  },
  infoTitle: {
    color: THEME.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: THEME.spacing.sm,
    textAlign: 'center',
  },
  infoText: {
    color: THEME.text.secondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.xl,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: THEME.surfaceDark,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    borderWidth: 2,
    borderColor: THEME.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCardSelected: {
    borderColor: THEME.primary,
    backgroundColor: THEME.primary + '15',
  },
  categoryEmoji: {
    fontSize: 40,
    marginBottom: THEME.spacing.sm,
  },
  categoryLabel: {
    color: THEME.text.primary,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: THEME.spacing.sm,
  },
  categoryRange: {
    color: THEME.text.secondary,
    fontSize: 12,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedCount: {
    color: THEME.text.secondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: THEME.spacing.lg,
  },
  footer: {
    padding: THEME.spacing.lg,
    backgroundColor: THEME.surfaceDark,
    borderTopWidth: 1,
    borderTopColor: THEME.borderLight,
    gap: THEME.spacing.sm,
  },
  addFriendsButton: {
    backgroundColor: THEME.surfaceLight,
    borderWidth: 2,
    borderColor: THEME.primary,
    paddingVertical: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.lg,
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  addFriendsButtonText: {
    color: THEME.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: THEME.primary,
    paddingVertical: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.lg,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: THEME.text.muted,
    opacity: 0.6,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CategorySelection;
