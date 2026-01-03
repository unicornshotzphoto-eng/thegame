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
import BackgroundWrapper from '../components/BackgroundWrapper';

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
    <BackgroundWrapper overlayOpacity={0.5}>
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
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(139, 69, 19, 0.4)',
    borderBottomWidth: 2,
    borderBottomColor: '#D4A574',
  },
  backButton: {
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: '#D4A574',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#E8C9A0',
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
    padding: 16,
  },
  subtitle: {
    color: '#C8A882',
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: 'rgba(139, 69, 19, 0.4)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#D4A574',
  },
  infoTitle: {
    color: '#E8C9A0',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  infoText: {
    color: '#C8A882',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: 'rgba(139, 69, 19, 0.4)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#D4A574',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCardSelected: {
    borderColor: '#E8C9A0',
    backgroundColor: 'rgba(212, 165, 116, 0.2)',
  },
  categoryEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  categoryLabel: {
    color: '#E8C9A0',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  categoryRange: {
    color: '#C8A882',
    fontSize: 12,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D4A574',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#2B1810',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedCount: {
    color: '#C8A882',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 24,
  },
  footer: {
    padding: 16,
    backgroundColor: 'rgba(139, 69, 19, 0.4)',
    borderTopWidth: 1,
    borderTopColor: '#D4A574',
    gap: 12,
  },
  addFriendsButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#D4A574',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  addFriendsButtonText: {
    color: '#D4A574',
    fontSize: 16,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#D4A574',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#C8A882',
    opacity: 0.6,
  },
  createButtonText: {
    color: '#2B1810',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CategorySelection;
