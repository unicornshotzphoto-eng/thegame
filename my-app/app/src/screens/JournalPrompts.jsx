import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Animated,
  FlatList,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../core/api';
import { showAlert } from '../utils/alert';
import { THEME } from '../constants/appTheme';

function JournalPrompts() {
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [allPrompts, setAllPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answerText, setAnswerText] = useState('');
  const [savedAnswers, setSavedAnswers] = useState({});
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    loadPrompts();
    loadFriends();
  }, []);

  const loadPrompts = async (difficulty = null) => {
    try {
      setLoading(true);
      const url = difficulty 
        ? `/quiz/prompts/?difficulty=${difficulty}`
        : '/quiz/prompts/';
      const response = await api.get(url);
      setAllPrompts(response.data.prompts || []);
      
      if (response.data.prompts && response.data.prompts.length > 0) {
        setCurrentPrompt(response.data.prompts[0]);
        setAnswerText(savedAnswers[response.data.prompts[0].id] || '');
      }
    } catch (error) {
      console.error('Load prompts error:', error);
      showAlert('Error', 'Failed to load prompts');
    } finally {
      setLoading(false);
    }
  };

  const getRandomPrompt = async () => {
    try {
      setLoading(true);
      const url = selectedDifficulty
        ? `/quiz/prompts/random/?difficulty=${selectedDifficulty}`
        : '/quiz/prompts/random/';
      const response = await api.get(url);
      setCurrentPrompt(response.data);
      setAnswerText(savedAnswers[response.data.id] || '');
      animatePromptChange();
    } catch (error) {
      console.error('Load random prompt error:', error);
      showAlert('Error', 'Failed to load prompt');
    } finally {
      setLoading(false);
    }
  };

  const animatePromptChange = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const loadFriends = async () => {
    try {
      const response = await api.get('/authentication/friends/');
      setFriends(response.data.friends || []);
    } catch (error) {
      console.error('Load friends error:', error);
    }
  };

  const toggleFriendSelection = (friendId) => {
    setSelectedFriends(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleInviteFriends = async () => {
    if (!currentPrompt || selectedFriends.length === 0) return;

    try {
      setInviteLoading(true);
      // Create shared prompt session
      const sessionResponse = await api.post('/quiz/prompt-sessions/', {
        prompt_id: currentPrompt.id,
      });
      const sessionId = sessionResponse.data.id;

      // Add selected friends to session
      for (const friendId of selectedFriends) {
        await api.post(`/quiz/prompt-sessions/${sessionId}/members/`, {
          user_id: friendId,
        });
      }

      showAlert(
        'Success',
        `Prompt shared with ${selectedFriends.length} friend${selectedFriends.length > 1 ? 's' : ''}!`
      );
      setShowInviteModal(false);
      setSelectedFriends([]);
    } catch (error) {
      console.error('Invite error:', error);
      showAlert('Error', 'Failed to share prompt');
    } finally {
      setInviteLoading(false);
    }
  };

  const saveAnswer = () => {
    if (!currentPrompt) return;
    
    const newAnswers = { ...savedAnswers };
    newAnswers[currentPrompt.id] = answerText;
    setSavedAnswers(newAnswers);
    setShowSaveConfirm(false);
    showAlert('Success', 'Answer saved!');
  };

  const clearAnswer = () => {
    if (!currentPrompt) return;
    const newAnswers = { ...savedAnswers };
    delete newAnswers[currentPrompt.id];
    setSavedAnswers(newAnswers);
    setAnswerText('');
  };

  const handleDifficultySelect = (difficulty) => {
    if (selectedDifficulty === difficulty) {
      setSelectedDifficulty(null);
      loadPrompts();
    } else {
      setSelectedDifficulty(difficulty);
      loadPrompts(difficulty);
    }
  };

  if (loading && !currentPrompt) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text style={styles.loadingText}>Loading prompts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
          <Text style={styles.title}>Journal Prompts</Text>
          <Text style={styles.subtitle}>Connect with yourself and others</Text>
        </View>

        {/* Difficulty Filter */}
        <View style={styles.difficultySection}>
          <Text style={styles.sectionLabel}>Difficulty Level</Text>
          <View style={styles.difficultyButtons}>
            {['easy', 'medium', 'challenging'].map((diff) => (
              <TouchableOpacity
                key={diff}
                style={[
                  styles.difficultyButton,
                  selectedDifficulty === diff && styles.difficultyButtonActive,
                ]}
                onPress={() => handleDifficultySelect(diff)}
              >
                <Text
                  style={[
                    styles.difficultyButtonText,
                    selectedDifficulty === diff && styles.difficultyButtonTextActive,
                  ]}
                >
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Current Prompt Card */}
        {currentPrompt && (
          <Animated.View style={[styles.promptCard, { opacity: fadeAnim }]}>
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyBadgeText}>
                {currentPrompt.difficulty?.toUpperCase()}
              </Text>
            </View>

            <Text style={styles.promptText}>{currentPrompt.prompt_text}</Text>

            {/* Answer Section */}
            <View style={styles.answerSection}>
              <Text style={styles.answerLabel}>Your Response</Text>
              <TextInput
                style={styles.answerInput}
                placeholder="Type your thoughtful response here..."
                placeholderTextColor={THEME.text.muted}
                multiline
                numberOfLines={6}
                value={answerText}
                onChangeText={setAnswerText}
                textAlignVertical="top"
              />

              {/* Answer Counter */}
              <View style={styles.answerFooter}>
                <Text style={styles.characterCount}>
                  {answerText.length} characters
                </Text>
                {savedAnswers[currentPrompt.id] && (
                  <Text style={styles.savedIndicator}>✓ Saved</Text>
                )}
              </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              {answerText.trim() && (
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => setShowSaveConfirm(true)}
                >
                  <Text style={styles.saveButtonText}>Save Response</Text>
                </TouchableOpacity>
              )}

              {savedAnswers[currentPrompt.id] && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={clearAnswer}
                >
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
              )}

              {/* Invite Friends Button */}
              <TouchableOpacity
                style={styles.inviteButton}
                onPress={() => setShowInviteModal(true)}
              >
                <Ionicons name="people" size={16} color="white" />
                <Text style={styles.inviteButtonText}>Invite</Text>
              </TouchableOpacity>
            </View>
            </View>

            {/* Shuffle Button */}
            <TouchableOpacity
              style={[styles.shuffleButton, loading && styles.shuffleButtonDisabled]}
              onPress={getRandomPrompt}
              disabled={loading}
            >
              <Text style={styles.shuffleButtonText}>
                {loading ? 'Loading...' : '🔄 Next Prompt'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Saved Responses Section */}
        {Object.keys(savedAnswers).length > 0 && (
          <View style={styles.savedSection}>
            <Text style={styles.sectionLabel}>Saved Responses ({Object.keys(savedAnswers).length})</Text>
            <View style={styles.savedList}>
              {Object.entries(savedAnswers).map(([promptId, answer]) => {
                const prompt = allPrompts.find(p => p.id === parseInt(promptId));
                return prompt ? (
                  <View key={promptId} style={styles.savedItem}>
                    <Text style={styles.savedPrompt} numberOfLines={2}>
                      {prompt.prompt_text}
                    </Text>
                    <Text style={styles.savedAnswer} numberOfLines={2}>
                      {answer}
                    </Text>
                  </View>
                ) : null;
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Save Confirmation Modal */}
      {showSaveConfirm && (
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Save Response?</Text>
            <Text style={styles.confirmText}>
              Your response will be saved locally on this device.
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={styles.confirmCancel}
                onPress={() => setShowSaveConfirm(false)}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmSubmit}
                onPress={saveAnswer}
              >
                <Text style={styles.confirmSubmitText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Invite Friends Modal */}
      {showInviteModal && (
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.confirmTitle}>Share Prompt</Text>
              <TouchableOpacity onPress={() => { setShowInviteModal(false); setSelectedFriends([]); }}>
                <Ionicons name="close" size={24} color={THEME.text.primary} />
              </TouchableOpacity>
            </View>

            {friends && friends.length > 0 ? (
              <>
                <View style={styles.friendsListContainer}>
                  <FlatList
                    data={friends}
                    keyExtractor={(item) => item.id.toString()}
                    scrollEnabled={true}
                    nestedScrollEnabled={true}
                    style={styles.friendsList}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.friendItem}
                        onPress={() => toggleFriendSelection(item.id)}
                      >
                        <View style={styles.friendCheckbox}>
                          {selectedFriends.includes(item.id) && (
                            <Ionicons name="checkmark" size={16} color="white" />
                          )}
                        </View>
                        <Text style={styles.friendName}>{item.username}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>

                {selectedFriends.length > 0 && (
                  <View style={styles.confirmButtons}>
                    <TouchableOpacity
                      style={styles.confirmCancel}
                      onPress={() => { setShowInviteModal(false); setSelectedFriends([]); }}
                    >
                      <Text style={styles.confirmCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.confirmSubmit, inviteLoading && styles.buttonDisabled]}
                      onPress={handleInviteFriends}
                      disabled={inviteLoading}
                    >
                      {inviteLoading ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <Text style={styles.confirmSubmitText}>
                          Share with {selectedFriends.length}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.emptyFriendsContainer}>
                <Text style={styles.emptyFriendsText}>No friends yet</Text>
                <Text style={styles.emptyFriendsSubtext}>
                  Add friends from your profile to share prompts
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  scrollContent: {
    padding: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xl * 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.xl,
  },
  loadingText: {
    color: THEME.text.secondary,
    fontSize: 16,
    marginTop: THEME.spacing.md,
    fontFamily: 'montserrat-regular',
  },
  header: {
    marginBottom: THEME.spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: THEME.text.primary,
    marginBottom: THEME.spacing.sm,
    fontFamily: 'montserrat-regular',
  },
  subtitle: {
    fontSize: 14,
    color: THEME.text.secondary,
    fontFamily: 'montserrat-regular',
  },
  difficultySection: {
    marginBottom: THEME.spacing.xl,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.text.primary,
    marginBottom: THEME.spacing.md,
    fontFamily: 'montserrat-regular',
  },
  difficultyButtons: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.surfaceDark,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  difficultyButtonActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  difficultyButtonText: {
    color: THEME.text.secondary,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'montserrat-regular',
  },
  difficultyButtonTextActive: {
    color: THEME.text.primary,
  },
  promptCard: {
    backgroundColor: THEME.surfaceDark,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: THEME.primary,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: THEME.primary,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.md,
    marginBottom: THEME.spacing.md,
  },
  difficultyBadgeText: {
    color: THEME.text.primary,
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'montserrat-regular',
  },
  promptText: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.text.primary,
    marginBottom: THEME.spacing.lg,
    lineHeight: 26,
    fontFamily: 'montserrat-regular',
  },
  answerSection: {
    marginBottom: THEME.spacing.lg,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.text.primary,
    marginBottom: THEME.spacing.md,
    fontFamily: 'montserrat-regular',
  },
  answerInput: {
    backgroundColor: THEME.background,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    color: THEME.text.primary,
    borderWidth: 1,
    borderColor: THEME.border,
    fontFamily: 'montserrat-regular',
    fontSize: 14,
    minHeight: 120,
  },
  answerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: THEME.spacing.sm,
  },
  characterCount: {
    fontSize: 12,
    color: THEME.text.muted,
    fontFamily: 'montserrat-regular',
  },
  savedIndicator: {
    fontSize: 12,
    color: '#4caf50',
    fontWeight: '600',
    fontFamily: 'montserrat-regular',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
    marginTop: THEME.spacing.md,
  },
  saveButton: {
    flex: 1,
    backgroundColor: THEME.primary,
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
  },
  saveButtonText: {
    color: THEME.text.primary,
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'montserrat-regular',
  },
  clearButton: {
    flex: 1,
    backgroundColor: THEME.surfaceDark,
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.button.secondary,
  },
  clearButtonText: {
    color: THEME.button.secondary,
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'montserrat-regular',
  },
  inviteButton: {
    backgroundColor: THEME.button.secondary,
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: THEME.spacing.sm,
  },
  inviteButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'montserrat-regular',
  },
  shuffleButton: {
    backgroundColor: THEME.primary,
    paddingVertical: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
  },
  shuffleButtonDisabled: {
    opacity: 0.6,
  },
  shuffleButtonText: {
    color: THEME.text.primary,
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'montserrat-regular',
  },
  savedSection: {
    marginTop: THEME.spacing.xl,
  },
  savedList: {
    gap: THEME.spacing.md,
  },
  savedItem: {
    backgroundColor: THEME.surfaceDark,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: '#4caf50',
  },
  savedPrompt: {
    fontSize: 12,
    color: THEME.text.muted,
    marginBottom: THEME.spacing.sm,
    fontFamily: 'montserrat-regular',
  },
  savedAnswer: {
    fontSize: 13,
    color: THEME.text.primary,
    fontWeight: '500',
    fontFamily: 'montserrat-regular',
  },
  confirmOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.lg,
  },
  confirmCard: {
    backgroundColor: THEME.surfaceDark,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
    width: '100%',
    maxWidth: 300,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.text.primary,
    marginBottom: THEME.spacing.md,
    fontFamily: 'montserrat-regular',
  },
  confirmText: {
    fontSize: 14,
    color: THEME.text.secondary,
    marginBottom: THEME.spacing.lg,
    fontFamily: 'montserrat-regular',
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
  },
  confirmCancel: {
    flex: 1,
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  confirmCancelText: {
    color: THEME.text.secondary,
    fontWeight: '600',
    fontFamily: 'montserrat-regular',
  },
  confirmSubmit: {
    flex: 1,
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.primary,
    alignItems: 'center',
  },
  confirmSubmitText: {
    color: THEME.text.primary,
    fontWeight: '600',
    fontFamily: 'montserrat-regular',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.lg,
  },
  friendsListContainer: {
    maxHeight: 300,
    marginBottom: THEME.spacing.lg,
  },
  friendsList: {
    flexGrow: 0,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  friendCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: THEME.primary,
    marginRight: THEME.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendName: {
    flex: 1,
    color: THEME.text.primary,
    fontSize: 16,
    fontFamily: 'montserrat-regular',
  },
  emptyFriendsContainer: {
    alignItems: 'center',
    paddingVertical: THEME.spacing.xl,
  },
  emptyFriendsText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.text.primary,
    marginBottom: THEME.spacing.sm,
  },
  emptyFriendsSubtext: {
    fontSize: 14,
    color: THEME.text.secondary,
    textAlign: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default JournalPrompts;
