import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Modal,
  Image,
} from 'react-native';
import api from '../core/api';
import { THEME } from '../constants/appTheme';

const CATEGORY_COLORS = THEME.categories;

const MultiplayerQuestions = ({ navigation }) => {
  const [screen, setScreen] = useState('friendSelect'); // friendSelect, lobby, game, answers
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [gameSession, setGameSession] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [answers, setAnswers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gameStats, setGameStats] = useState({});

  // Load friends on mount
  useEffect(() => {
    loadFriends();
    loadCategories();
  }, []);

  const loadFriends = async () => {
    try {
      setLoadingFriends(true);
      const response = await api.get('/quiz/friends/');
      setFriends(response.data.friends || []);
    } catch (error) {
      console.error('Error loading friends:', error);
      Alert.alert('Error', 'Failed to load friends. Make sure you have friends added.');
    } finally {
      setLoadingFriends(false);
    }
  };

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await api.get('/quiz/questions/categories/');
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const toggleFriendSelection = (friend) => {
    setSelectedFriends(prev =>
      prev.find(f => f.id === friend.id)
        ? prev.filter(f => f.id !== friend.id)
        : [...prev, friend]
    );
  };

  const createGame = async () => {
    if (selectedFriends.length === 0) {
      Alert.alert('Error', 'Please select at least one friend');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.post('/api/games/create/', {
        friend_ids: selectedFriends.map(f => f.id),
      });
      setGameSession(response.data);
      setCurrentPlayer(response.data.category_picker);
      setScreen('lobby');
    } catch (error) {
      console.error('Error creating game:', error);
      Alert.alert('Error', 'Failed to create game');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectCategory = async (category) => {
    try {
      setIsSubmitting(true);
      const response = await api.post(`/api/games/${gameSession.id}/start-round/`, {
        category: category.category,
      });
      setGameSession(response.data);
      setUserAnswer('');
      setScreen('game');
    } catch (error) {
      console.error('Error starting round:', error);
      Alert.alert('Error', 'Failed to start round');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) {
      Alert.alert('Error', 'Please enter an answer');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post(`/api/games/${gameSession.id}/submit-answer/`, {
        answer: userAnswer,
      });
      
      // Load answers to see all players' answers
      loadAnswers();
      setUserAnswer('');
    } catch (error) {
      console.error('Error submitting answer:', error);
      Alert.alert('Error', 'Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadAnswers = async () => {
    try {
      const response = await api.get(`/api/games/${gameSession.id}/answers/`);
      setAnswers(response.data.answers || []);
      setScreen('answers');
    } catch (error) {
      console.error('Error loading answers:', error);
    }
  };

  const nextRound = async () => {
    try {
      setIsSubmitting(true);
      const response = await api.post(`/api/games/${gameSession.id}/next-round/`);
      setGameSession(response.data);
      setCurrentPlayer(response.data.category_picker);
      setAnswers([]);
      setScreen('lobby');
    } catch (error) {
      console.error('Error moving to next round:', error);
      Alert.alert('Error', 'Failed to move to next round');
    } finally {
      setIsSubmitting(false);
    }
  };

  const endGame = async () => {
    Alert.alert('End Game?', 'Are you sure you want to end this game?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End Game',
        onPress: async () => {
          try {
            setIsSubmitting(true);
            const response = await api.post(`/api/games/${gameSession.id}/end/`);
            setGameSession(response.data);
            setScreen('summary');
          } catch (error) {
            console.error('Error ending game:', error);
            Alert.alert('Error', 'Failed to end game');
          } finally {
            setIsSubmitting(false);
          }
        },
      },
    ]);
  };

  // Friend Selection Screen
  if (screen === 'friendSelect') {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Start Multiplayer Quiz</Text>
        <Text style={styles.subtitle}>Select friends to play with</Text>

        {loadingFriends ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : friends.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No friends yet</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Profile')}
            >
              <Text style={styles.buttonText}>Add Friends</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={friends}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.friendItem,
                    selectedFriends.find(f => f.id === item.id) && styles.selectedFriend,
                  ]}
                  onPress={() => toggleFriendSelection(item)}
                >
                  {item.thumbnail && (
                    <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
                  )}
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{item.username}</Text>
                    <Text style={styles.friendEmail}>{item.email}</Text>
                  </View>
                  {selectedFriends.find(f => f.id === item.id) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
              scrollEnabled={true}
            />

            <View style={styles.selectedCount}>
              <Text style={styles.selectedText}>
                {selectedFriends.length} friend{selectedFriends.length !== 1 ? 's' : ''} selected
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.createButton, isSubmitting && styles.buttonDisabled]}
              onPress={createGame}
              disabled={isSubmitting || selectedFriends.length === 0}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Create Game</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </SafeAreaView>
    );
  }

  // Game Lobby - Wait for category picker
  if (screen === 'lobby' && gameSession) {
    const isMyTurn = currentPlayer?.id === (gameSession.category_picker?.id || gameSession.players[0].id);

    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Game Lobby</Text>
        <Text style={styles.subtitle}>Round {gameSession.current_round}</Text>

        <View style={styles.playersList}>
          <Text style={styles.sectionTitle}>Players & Scores</Text>
          {gameSession.players.map((player) => (
            <View
              key={player.id}
              style={[
                styles.playerCard,
                currentPlayer?.id === player.id && styles.playerCardActive,
              ]}
            >
              {player.thumbnail && (
                <Image source={{ uri: player.thumbnail }} style={styles.playerThumbnail} />
              )}
              <View style={styles.playerCardContent}>
                <Text style={styles.playerName}>{player.username}</Text>
                <Text style={styles.playerScore}>
                  Score: {gameSession.player_scores?.[player.username] || 0}
                </Text>
              </View>
              {currentPlayer?.id === player.id && (
                <Text style={styles.pickerBadge}>Picking</Text>
              )}
            </View>
          ))}
        </View>

        {isMyTurn ? (
          <View style={styles.categoryGrid}>
            <Text style={styles.sectionTitle}>Pick a Category</Text>
            <FlatList
              data={categories}
              numColumns={2}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    { backgroundColor: CATEGORY_COLORS[item.category] || '#999' },
                  ]}
                  onPress={() => selectCategory(item)}
                  disabled={isSubmitting}
                >
                  <Text style={styles.categoryName}>{item.name}</Text>
                  <Text style={styles.categoryCount}>{item.question_count} Q</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        ) : (
          <View style={styles.waitingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.waitingText}>
              Waiting for {currentPlayer?.username} to pick a category...
            </Text>
          </View>
        )}

        {gameSession.creator?.id === (gameSession.creator?.id) && (
          <TouchableOpacity style={styles.endGameButton} onPress={endGame}>
            <Text style={styles.buttonText}>End Game</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    );
  }

  // Game Screen - Answer the question
  if (screen === 'game' && gameSession?.current_question) {
    const question = gameSession.current_question;
    const category = question.category;

    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Answer the Question</Text>

        <View
          style={[
            styles.questionCard,
            { borderLeftColor: CATEGORY_COLORS[category.category] || '#999', borderLeftWidth: 4 },
          ]}
        >
          <Text style={styles.categoryBadge}>{category.name}</Text>
          <Text style={styles.questionText}>{question.question_text}</Text>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsText}>{question.points} pts</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Your Answer</Text>
        <TextInput
          style={styles.answerInput}
          placeholder="Type your answer here..."
          placeholderTextColor="#999"
          value={userAnswer}
          onChangeText={setUserAnswer}
          multiline
          numberOfLines={4}
          editable={!isSubmitting}
        />

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
          onPress={submitAnswer}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Submit Answer</Text>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Answers Screen - View all answers
  if (screen === 'answers') {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>All Answers</Text>

        {gameSession?.current_question && (
          <View style={styles.questionDisplay}>
            <Text style={styles.questionText}>{gameSession.current_question.question_text}</Text>
            <Text style={styles.categoryBadgeSmall}>
              {gameSession.current_question.category.name}
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Players' Answers</Text>
        <ScrollView style={styles.answersList}>
          {answers.map((answer, index) => (
            <View key={answer.id} style={styles.answerCard}>
              <View style={styles.answerHeader}>
                <Text style={styles.playerNameAnswer}>{answer.player.username}</Text>
                {answer.player.id === gameSession.category_picker?.id && (
                  <Text style={styles.pickerLabel}>Category Picker</Text>
                )}
              </View>
              <Text style={styles.answerText}>{answer.answer_text}</Text>
              {answer.points_awarded > 0 && (
                <Text style={styles.pointsAwarded}>+{answer.points_awarded} pts</Text>
              )}
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={[styles.nextButton, isSubmitting && styles.buttonDisabled]}
          onPress={nextRound}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Next Round</Text>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Summary Screen
  if (screen === 'summary' && gameSession) {
    const scores = gameSession.player_scores || {};
    const sortedPlayers = gameSession.players.sort(
      (a, b) => (scores[b.username] || 0) - (scores[a.username] || 0)
    );

    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Game Over!</Text>
        <Text style={styles.subtitle}>Final Scores</Text>

        <View style={styles.leaderboard}>
          {sortedPlayers.map((player, index) => (
            <View key={player.id} style={styles.leaderboardItem}>
              <Text style={styles.leaderboardRank}>#{index + 1}</Text>
              {player.thumbnail && (
                <Image source={{ uri: player.thumbnail }} style={styles.playerThumbnail} />
              )}
              <View style={styles.leaderboardContent}>
                <Text style={styles.leaderboardName}>{player.username}</Text>
                <Text style={styles.leaderboardScore}>{scores[player.username] || 0} pts</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => {
            setScreen('friendSelect');
            setSelectedFriends([]);
            setGameSession(null);
          }}
        >
          <Text style={styles.buttonText}>Play Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.secondary,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: THEME.spacing.md,
    textAlign: 'center',
    color: THEME.text.accent,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.text.secondary,
    marginBottom: THEME.spacing.lg,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: THEME.spacing.md,
    marginTop: THEME.spacing.md,
    color: THEME.text.primary,
  },
  button: {
    backgroundColor: THEME.button.primary,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    marginTop: THEME.spacing.lg,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: THEME.text.muted,
    marginBottom: THEME.spacing.lg,
  },
  friendItem: {
    flexDirection: 'row',
    padding: THEME.spacing.md,
    marginVertical: THEME.spacing.md,
    backgroundColor: THEME.surfaceDark,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: THEME.primary,
  },
  selectedFriend: {
    backgroundColor: THEME.primary,
    borderWidth: 2,
    borderColor: THEME.accent,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: THEME.spacing.md,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.text.primary,
  },
  friendEmail: {
    fontSize: 12,
    color: THEME.text.secondary,
  },
  checkmark: {
    fontSize: 24,
    color: THEME.accent,
    fontWeight: 'bold',
  },
  selectedCount: {
    padding: THEME.spacing.md,
    marginVertical: THEME.spacing.md,
    backgroundColor: THEME.surfaceDark,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: THEME.primary,
  },
  selectedText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.text.accent,
  },
  createButton: {
    backgroundColor: THEME.button.primary,
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    marginBottom: THEME.spacing.lg,
  },
  playersList: {
    marginVertical: THEME.spacing.lg,
  },
  playerCard: {
    flexDirection: 'row',
    padding: THEME.spacing.md,
    marginVertical: THEME.spacing.md,
    backgroundColor: THEME.surfaceDark,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
  },
  playerCardActive: {
    backgroundColor: THEME.primary,
    borderWidth: 2,
    borderColor: THEME.accent,
  },
  playerThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: THEME.spacing.md,
  },
  playerCardContent: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.text.primary,
  },
  playerScore: {
    fontSize: 12,
    color: THEME.text.secondary,
  },
  pickerBadge: {
    backgroundColor: THEME.accent,
    color: THEME.background,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.sm,
    fontSize: 12,
    fontWeight: '600',
  },
  categoryGrid: {
    flex: 1,
    marginVertical: THEME.spacing.lg,
  },
  categoryButton: {
    flex: 1,
    margin: THEME.spacing.md,
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  categoryCount: {
    color: '#fff',
    fontSize: 12,
    marginTop: THEME.spacing.sm,
  },
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitingText: {
    fontSize: 16,
    color: THEME.text.secondary,
    marginTop: THEME.spacing.md,
    textAlign: 'center',
  },
  endGameButton: {
    backgroundColor: THEME.button.danger,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    marginBottom: THEME.spacing.lg,
  },
  questionCard: {
    padding: THEME.spacing.lg,
    marginVertical: THEME.spacing.lg,
    backgroundColor: THEME.surfaceDark,
    borderRadius: THEME.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: THEME.primary,
  },
  categoryBadge: {
    backgroundColor: THEME.primary,
    color: '#fff',
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.sm,
    fontSize: 12,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginBottom: THEME.spacing.md,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: THEME.spacing.md,
    lineHeight: 24,
    color: THEME.text.primary,
  },
  pointsBadge: {
    backgroundColor: THEME.primary,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  pointsText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  answerInput: {
    borderWidth: 1,
    borderColor: THEME.primary,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 14,
    marginBottom: THEME.spacing.lg,
    backgroundColor: THEME.background,
    color: THEME.text.primary,
  },
  submitButton: {
    backgroundColor: THEME.button.primary,
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: THEME.primary,
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    marginBottom: THEME.spacing.lg,
  },
  questionDisplay: {
    padding: THEME.spacing.md,
    marginVertical: THEME.spacing.md,
    backgroundColor: THEME.surfaceDark,
    borderRadius: THEME.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: THEME.primary,
  },
  categoryBadgeSmall: {
    backgroundColor: THEME.primary,
    color: '#fff',
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.sm,
    fontSize: 11,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginTop: THEME.spacing.md,
  },
  answersList: {
    flex: 1,
    marginVertical: THEME.spacing.md,
  },
  answerCard: {
    padding: THEME.spacing.md,
    marginVertical: THEME.spacing.md,
    backgroundColor: THEME.surfaceDark,
    borderRadius: THEME.borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: THEME.primary,
  },
  answerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  playerNameAnswer: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.text.primary,
  },
  pickerLabel: {
    backgroundColor: THEME.accent,
    color: THEME.background,
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: THEME.spacing.xs,
    borderRadius: THEME.borderRadius.sm,
    fontSize: 10,
    fontWeight: '600',
  },
  answerText: {
    fontSize: 14,
    color: THEME.text.primary,
    lineHeight: 20,
    marginBottom: THEME.spacing.md,
  },
  pointsAwarded: {
    fontSize: 12,
    color: THEME.accent,
    fontWeight: '600',
  },
  leaderboard: {
    marginVertical: THEME.spacing.lg,
  },
  leaderboardItem: {
    flexDirection: 'row',
    padding: THEME.spacing.md,
    marginVertical: THEME.spacing.md,
    backgroundColor: THEME.surfaceDark,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: THEME.accent,
  },
  leaderboardRank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.accent,
    marginRight: THEME.spacing.md,
    width: 30,
  },
  leaderboardContent: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.text.primary,
  },
  leaderboardScore: {
    fontSize: 14,
    color: THEME.text.secondary,
    fontWeight: '600',
  },
  homeButton: {
    backgroundColor: THEME.button.primary,
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    marginBottom: THEME.spacing.lg,
  },
});

export default MultiplayerQuestions;
