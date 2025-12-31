import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../core/api';
import { THEME, COMMON_STYLES } from '../constants/appTheme';

const CATEGORY_COLORS = THEME.categories;

function Questions({ navigation }) {
  const [gameScreen, setGameScreen] = useState('modeSelect'); // modeSelect, friendSelect, teamLobby, categories, game
  const [gameMode, setGameMode] = useState(null); // 'team' or 'multiplayer'
  const [teamAction, setTeamAction] = useState(null); // 'create' or 'join'
  const [teamCode, setTeamCode] = useState('');
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [teamScore, setTeamScore] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [showQuestion, setShowQuestion] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [gameStats, setGameStats] = useState({ answered: 0, skipped: 0 });
  const [teamSession, setTeamSession] = useState(null);
  const [otherTeams, setOtherTeams] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      Alert.alert('Error', 'Failed to load friends');
    } finally {
      setLoadingFriends(false);
    }
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      console.log('Fetching categories from API...');
      const response = await api.get('/quiz/questions/categories/');
      console.log('Categories response:', response);
      console.log('Categories data:', response.data);
      
      if (response.data && response.data.categories) {
        console.log('Setting categories:', response.data.categories);
        setCategories(response.data.categories);
      } else {
        console.warn('No categories found in response');
        Alert.alert('Error', 'No categories found in API response');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);
      Alert.alert('Error', `Failed to load categories: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleFriendSelection = React.useCallback((friend) => {
    setSelectedFriends(prev =>
      prev.find(f => f.id === friend.id)
        ? prev.filter(f => f.id !== friend.id)
        : [...prev, friend]
    );
  }, []);

  const startTeamGame = () => {
    if (selectedFriends.length === 0) {
      Alert.alert('Validation', 'Please select at least one friend for your team');
      return;
    }
    setGameScreen('teamLobby');
  };

  const selectMode = (mode) => {
    setGameMode(mode);
    setSelectedFriends([]);
    setGameScreen('friendSelect');
  };

  const goToMultiplayer = () => {
    navigation.navigate('MultiplayerQuestions');
  };

  const navigateToTab = (tabName) => {
    navigation.navigate(tabName);
  };

  const renderTabNavigation = () => null;

  const proceedWithTeam = () => {
    if (selectedFriends.length === 0) {
      Alert.alert('Validation', 'Please select at least one friend for your team');
      return;
    }
    setGameScreen('teamLobby');
  };

  const createTeamSession = async () => {
    try {
      setIsSubmitting(true);
      const response = await api.post('/quiz/games/create/', {
        friend_ids: selectedFriends.map(f => f.id),
      });
      setTeamSession(response.data);
      setTeamCode(response.data.game_code || response.data.session_code);
      setOtherTeams(response.data.waiting_teams || []);
      setGameScreen('categories');
    } catch (error) {
      console.error('Error creating team session:', error);
      Alert.alert('Error', 'Failed to create team session. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const joinTeamSession = async () => {
    if (!teamCode.trim()) {
      Alert.alert('Error', 'Please enter a game code');
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await api.post('/quiz/games/join/', {
        game_code: teamCode.trim().toUpperCase(),
      });
      setTeamSession(response.data);
      setGameScreen('categories');
    } catch (error) {
      console.error('Error joining game:', error);
      Alert.alert('Error', 'Invalid game code or failed to join. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadQuestionsForCategory = async (category) => {
    try {
      setLoading(true);
      console.log('Loading questions for category:', category);
      const response = await api.get(`/quiz/questions/${category}/`);
      console.log('Questions loaded:', response.data);
      setQuestions(response.data);
      setSelectedCategory(category);
      setCurrentQuestionIndex(0);
      setScore(0);
      setTotalPoints(0);
      setAnsweredQuestions([]);
      setGameStats({ answered: 0, skipped: 0 });
      setUserAnswer('');
      setShowQuestion(true);
    } catch (error) {
      console.error('Error loading questions:', error);
      Alert.alert('Error', 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = () => {
    if (!userAnswer.trim()) {
      Alert.alert('Please enter an answer');
      return;
    }

    const current = questions[currentQuestionIndex];
    const newScore = teamScore + current.points;
    const newTotal = totalPoints + current.points;

    setTeamScore(newScore);
    setTotalPoints(newTotal);
    setAnsweredQuestions([...answeredQuestions, { ...current, userAnswer, answered: true }]);
    setGameStats({ ...gameStats, answered: gameStats.answered + 1 });
    setUserAnswer('');

    moveToNextQuestion();
  };

  const handleSkip = () => {
    const current = questions[currentQuestionIndex];
    setAnsweredQuestions([...answeredQuestions, { ...current, skipped: true }]);
    setGameStats({ ...gameStats, skipped: gameStats.skipped + 1 });
    setUserAnswer('');

    moveToNextQuestion();
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      endGame();
    }
  };

  const endGame = () => {
    setShowQuestion(false);
    const teamNames = selectedFriends.map(f => f.username).join(', ');
    Alert.alert(
      'Team Game Complete!',
      `Team: ${teamNames}\nTeam Score: ${teamScore}/${totalPoints}\n\nAnswered: ${gameStats.answered}\nSkipped: ${gameStats.skipped}`,
      [
        {
          text: 'Back to Categories',
          onPress: () => {
            setSelectedCategory(null);
            setQuestions([]);
            setShowQuestion(false);
          },
        },
      ]
    );
  };

  const resetGame = () => {
    setSelectedCategory(null);
    setQuestions([]);
    setShowQuestion(false);
    setCurrentQuestionIndex(0);
    setTeamScore(0);
    setTotalPoints(0);
    setAnsweredQuestions([]);
    setGameStats({ answered: 0, skipped: 0 });
    setUserAnswer('');
    setGameScreen('modeSelect');
    setGameMode(null);
    setSelectedFriends([]);
  };

  if (loadingFriends && gameScreen === 'friendSelect') {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#3498DB" />
      </SafeAreaView>
    );
  }

  // Mode Selection Screen
  if (gameScreen === 'modeSelect') {
    return (
      <SafeAreaView style={styles.container}>
        {renderTabNavigation()}
        <ScrollView contentContainerStyle={styles.homeScrollContent}>
          <View style={styles.header2}>
            <Text style={styles.title}>Quiz Games</Text>
            <Text style={styles.subtitle}>Choose a game mode to play</Text>
          </View>

          <View style={styles.modeContainer}>
            {/* Team Mode Card */}
            <TouchableOpacity
              style={[styles.modeCard, styles.teamModeCard]}
              onPress={() => selectMode('team')}
            >
              <Text style={styles.modeIcon}>👥</Text>
              <Text style={styles.modeTitle}>Team Mode</Text>
              <Text style={styles.modeDescription}>
                Work together with your friends as a team. Answer questions and build your team score.
              </Text>
              <View style={styles.modeFeatures}>
                <Text style={styles.featureText}>✓ Team scoring</Text>
                <Text style={styles.featureText}>✓ Choose friends</Text>
                <Text style={styles.featureText}>✓ Multiple categories</Text>
              </View>
            </TouchableOpacity>

            {/* Multiplayer Mode Card */}
            <TouchableOpacity
              style={[styles.modeCard, styles.multiplayerModeCard]}
              onPress={goToMultiplayer}
            >
              <Text style={styles.modeIcon}>🎮</Text>
              <Text style={styles.modeTitle}>Multiplayer Mode</Text>
              <Text style={styles.modeDescription}>
                Compete against your friends! Players take turns answering questions and scoring points.
              </Text>
              <View style={styles.modeFeatures}>
                <Text style={styles.featureText}>✓ Competitive play</Text>
                <Text style={styles.featureText}>✓ Take turns</Text>
                <Text style={styles.featureText}>✓ Head-to-head</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Game Modes</Text>
            <Text style={styles.infoText}>
              {'\n'}Team Mode: Collaborate with friends and build a shared team score. Perfect for couples or friendly groups.{'\n\n'}
              Multiplayer Mode: Compete individually against your friends. Each player gets their own score and takes turns answering questions.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Friend Selection Screen
  if (gameScreen === 'friendSelect') {
    return (
      <SafeAreaView style={styles.container}>
        {renderTabNavigation()}
        <ScrollView contentContainerStyle={styles.homeScrollContent}>
          <View style={styles.header2}>
            <View style={styles.headerTop}>
              <TouchableOpacity 
                style={styles.backArrow}
                onPress={() => {
                  setGameScreen('modeSelect');
                  setGameMode(null);
                  setSelectedFriends([]);
                }}
              >
                <Text style={styles.backArrowText}>←</Text>
              </TouchableOpacity>
              <View style={styles.headerContent}>
                <Text style={styles.title}>Team Game Mode</Text>
                <Text style={styles.subtitle}>Select friends to form your team</Text>
              </View>
            </View>
          </View>

          <View style={styles.friendsList}>
            {friends && friends.length > 0 ? (
              <FlatList
                data={friends}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.friendCard,
                      selectedFriends.find(f => f.id === item.id) && styles.friendCardSelected,
                    ]}
                    onPress={() => toggleFriendSelection(item)}
                  >
                    {item.thumbnail ? (
                      <Image source={{ uri: item.thumbnail }} style={styles.friendAvatar} />
                    ) : (
                      <View style={[styles.friendAvatar, styles.avatarPlaceholder]}>
                        <Text style={styles.avatarText}>{item.username.charAt(0).toUpperCase()}</Text>
                      </View>
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
                contentContainerStyle={{ paddingBottom: THEME.spacing.lg }}
                initialNumToRender={12}
                windowSize={8}
                removeClippedSubviews
                extraData={selectedFriends}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No friends added yet</Text>
                <Text style={styles.emptySubtext}>Add friends to play team games!</Text>
              </View>
            )}
          </View>

          {selectedFriends.length > 0 && (
            <View style={styles.selectedTeamInfo}>
              <Text style={styles.selectedTeamTitle}>Selected Team Members:</Text>
              {selectedFriends.map((friend) => (
                <Text key={friend.id} style={styles.selectedTeamMember}>
                  • {friend.username}
                </Text>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[styles.startButton, selectedFriends.length === 0 && styles.startButtonDisabled]}
            onPress={startTeamGame}
            disabled={selectedFriends.length === 0}
          >
            <Text style={styles.startButtonText}>Start Team Game</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Team Lobby Screen - Create or Join Teams
  if (gameScreen === 'teamLobby') {
    return (
      <SafeAreaView style={styles.container}>
        {renderTabNavigation()}
        <ScrollView contentContainerStyle={styles.homeScrollContent}>
          <View style={styles.header2}>
            <View style={styles.headerTop}>
              <TouchableOpacity 
                style={styles.backArrow}
                onPress={() => {
                  setGameScreen('friendSelect');
                  setTeamAction(null);
                  setTeamCode('');
                }}
              >
                <Text style={styles.backArrowText}>←</Text>
              </TouchableOpacity>
              <View style={styles.headerContent}>
                <Text style={styles.title}>Team Lobby</Text>
                <Text style={styles.subtitle}>Create or join a team session</Text>
              </View>
            </View>
          </View>

          {!teamAction ? (
            <View style={styles.modeContainer}>
              {/* Create Team Card */}
              <TouchableOpacity
                style={[styles.modeCard, styles.createTeamCard]}
                onPress={() => setTeamAction('create')}
              >
                <Text style={styles.modeIcon}>✨</Text>
                <Text style={styles.modeTitle}>Create Team Session</Text>
                <Text style={styles.modeDescription}>
                  Start a new team competition and invite other teams to join using your unique team code.
                </Text>
              </TouchableOpacity>

              {/* Join Team Card */}
              <TouchableOpacity
                style={[styles.modeCard, styles.joinTeamCard]}
                onPress={() => setTeamAction('join')}
              >
                <Text style={styles.modeIcon}>🔗</Text>
                <Text style={styles.modeTitle}>Join Team Session</Text>
                <Text style={styles.modeDescription}>
                  Enter a team code to join an existing team session and compete with other teams.
                </Text>
              </TouchableOpacity>
            </View>
          ) : teamAction === 'create' ? (
            <View style={styles.actionContainer}>
              <View style={styles.actionCard}>
                <Text style={styles.actionTitle}>Your Team</Text>
                <View style={styles.teamMembers}>
                  {selectedFriends.map((friend) => (
                    <View key={friend.id} style={styles.memberBadge}>
                      <Text style={styles.memberText}>{friend.username}</Text>
                    </View>
                  ))}
                </View>
                
                <Text style={styles.actionDescription}>
                  You're about to create a new team session. Other teams can join using your session code.
                </Text>
                
                <TouchableOpacity
                  style={[styles.actionButton, isSubmitting && styles.actionButtonDisabled]}
                  onPress={createTeamSession}
                  disabled={isSubmitting}
                >
                  <Text style={styles.actionButtonText}>
                    {isSubmitting ? 'Creating...' : 'Create Session'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setTeamAction(null)}
                >
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.actionContainer}>
              <View style={styles.actionCard}>
                <Text style={styles.actionTitle}>Join Team Session</Text>
                
                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>Team Code</Text>
                  <TextInput
                    style={styles.codeInput}
                    placeholder="Enter team code"
                    placeholderTextColor="#999"
                    value={teamCode}
                    onChangeText={setTeamCode}
                    autoCapitalize="CHARACTERS"
                  />
                </View>

                <View style={styles.teamMembers}>
                  {selectedFriends.map((friend) => (
                    <View key={friend.id} style={styles.memberBadge}>
                      <Text style={styles.memberText}>{friend.username}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.actionButton, isSubmitting && styles.actionButtonDisabled]}
                  onPress={joinTeamSession}
                  disabled={isSubmitting}
                >
                  <Text style={styles.actionButtonText}>
                    {isSubmitting ? 'Joining...' : 'Join Session'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => {
                    setTeamAction(null);
                    setTeamCode('');
                  }}
                >
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (loading && !showQuestion && gameScreen === 'categories') {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#3498DB" />
      </SafeAreaView>
    );
  }

  if (showQuestion && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    const categoryColor = CATEGORY_COLORS[selectedCategory] || '#3498DB';
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: categoryColor }]}>
            <Text style={styles.categoryTitle}>{selectedCategory.toUpperCase()}</Text>
            <Text style={styles.progress}>
              Question {currentQuestionIndex + 1} of {questions.length}
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>

          {/* Score */}
          <View style={styles.scoreSection}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Team Score</Text>
              <Text style={styles.scoreValue}>{teamScore}</Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Total Points</Text>
              <Text style={styles.scoreValue}>{totalPoints}</Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Multiplier</Text>
              <Text style={styles.scoreValue}>
                {totalPoints > 0 ? (teamScore / totalPoints).toFixed(2) : '0.00'}
              </Text>
            </View>
          </View>

          {/* Question */}
          <View style={styles.questionCard}>
            <View style={[styles.pointsBadge, { backgroundColor: categoryColor }]}>
              <Text style={styles.pointsText}>{currentQuestion.points} pts</Text>
            </View>
            <Text style={styles.questionText}>{currentQuestion.question_text}</Text>
          </View>

          {/* Text Input for Answer */}
          <View style={styles.answerInputSection}>
            <TextInput
              style={styles.textInput}
              placeholder="Type your answer here..."
              placeholderTextColor="#999"
              value={userAnswer}
              onChangeText={setUserAnswer}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmitAnswer}
            >
              <Text style={styles.buttonText}>Submit Answer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.skipButton]}
              onPress={handleSkip}
            >
              <Text style={styles.buttonText}>Skip</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsSection}>
            <Text style={styles.statsTitle}>Game Stats</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statCount}>{gameStats.answered}</Text>
                <Text style={styles.statLabel}>Answered</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statCount, { color: '#95A5A6' }]}>
                  {gameStats.skipped}
                </Text>
                <Text style={styles.statLabel}>Skipped</Text>
              </View>
            </View>
          </View>

          {/* Back button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={resetGame}
          >
            <Text style={styles.backButtonText}>← Back to Categories</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderTabNavigation()}
      <ScrollView contentContainerStyle={styles.homeScrollContent}>
        <View style={styles.header2}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.backArrow}
              onPress={() => {
                setGameScreen('friendSelect');
                setSelectedFriends([]);
              }}
            >
              <Text style={styles.backArrowText}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Quiz Game</Text>
              <Text style={styles.subtitle}>Choose a category to start playing</Text>
            </View>
          </View>
        </View>

        <View style={styles.teamBanner}>
          <Text style={styles.teamBannerTitle}>Your Team:</Text>
          <Text style={styles.teamBannerMembers}>
            {selectedFriends.map(f => f.username).join(', ')}
          </Text>
        </View>

        <View style={styles.categoriesGrid}>
          {categories && categories.length > 0 ? (
            categories.map((category) => (
              <TouchableOpacity
                key={category.category}
                style={[
                  styles.categoryCard,
                  { backgroundColor: CATEGORY_COLORS[category.category] || '#3498DB' },
                ]}
                onPress={() => loadQuestionsForCategory(category.category)}
              >
                <Text style={styles.categoryName}>
                  {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                </Text>
                <Text style={styles.questionCount}>{category.question_count} Questions</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>Loading categories...</Text>
          )}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Team Game Rules</Text>
          <Text style={styles.infoText}>
            • Work together as a team{'\n'}
            • Select a category to start{'\n'}
            • Type answers together{'\n'}
            • Earn points for answered questions{'\n'}
            • Track your team score
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: THEME.spacing.xl,
  },
  homeScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: THEME.spacing.lg,
  },
  header: {
    padding: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
  },
  header2: {
    padding: 16,
    backgroundColor: THEME.primary,
    paddingTop: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: THEME.text.accent,
    marginBottom: THEME.spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: THEME.spacing.md,
  },
  progress: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: THEME.spacing.md,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFF',
  },
  scoreSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: THEME.spacing.md,
    backgroundColor: THEME.surfaceDark,
    marginHorizontal: THEME.spacing.md,
    marginTop: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.lg,
    borderLeftWidth: 3,
    borderLeftColor: THEME.primary,
    shadowColor: THEME.shadow.color,
    shadowOffset: THEME.shadow.offset,
    shadowOpacity: THEME.shadow.opacity,
    shadowRadius: THEME.shadow.radius,
    elevation: 3,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    color: THEME.text.accent,
    marginBottom: THEME.spacing.sm,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.text.accent,
  },
  questionCard: {
    backgroundColor: THEME.surfaceDark,
    marginHorizontal: THEME.spacing.md,
    marginTop: THEME.spacing.lg,
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: THEME.primary,
    shadowColor: THEME.shadow.color,
    shadowOffset: THEME.shadow.offset,
    shadowOpacity: THEME.shadow.opacity,
    shadowRadius: THEME.shadow.radius,
    elevation: 3,
  },
  pointsBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.sm,
    marginBottom: THEME.spacing.lg,
  },
  pointsText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  questionText: {
    fontSize: 18,
    color: THEME.text.primary,
    lineHeight: 26,
    fontWeight: '500',
  },
  answerInputSection: {
    backgroundColor: THEME.surfaceDark,
    marginHorizontal: THEME.spacing.md,
    marginTop: THEME.spacing.lg,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.lg,
    borderLeftWidth: 3,
    borderLeftColor: THEME.primary,
    shadowColor: THEME.shadow.color,
    shadowOffset: THEME.shadow.offset,
    shadowOpacity: THEME.shadow.opacity,
    shadowRadius: THEME.shadow.radius,
    elevation: 3,
  },
  textInput: {
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    fontSize: 14,
    color: THEME.text.primary,
    backgroundColor: THEME.background,
    textAlignVertical: 'top',
    maxHeight: 120,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: THEME.spacing.md,
    marginTop: THEME.spacing.lg,
    marginBottom: THEME.spacing.lg,
    gap: THEME.spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  submitButton: {
    backgroundColor: THEME.button.primary,
  },
  skipButton: {
    backgroundColor: THEME.button.secondary,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statsSection: {
    backgroundColor: THEME.surfaceDark,
    marginHorizontal: THEME.spacing.md,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.lg,
    marginBottom: THEME.spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: THEME.primary,
    shadowColor: THEME.shadow.color,
    shadowOffset: THEME.shadow.offset,
    shadowOpacity: THEME.shadow.opacity,
    shadowRadius: THEME.shadow.radius,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.text.accent,
    marginBottom: THEME.spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statCount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: THEME.text.accent,
    marginBottom: THEME.spacing.sm,
  },
  statLabel: {
    fontSize: 12,
    color: THEME.text.secondary,
  },
  backButton: {
    marginHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.surfaceDark,
    alignItems: 'center',
    marginBottom: THEME.spacing.lg,
    borderWidth: 2,
    borderColor: THEME.primary,
  },
  backButtonText: {
    color: THEME.text.accent,
    fontWeight: 'bold',
    fontSize: 14,
  },
  multiplayerButton: {
    marginHorizontal: THEME.spacing.xl,
    marginVertical: THEME.spacing.sm,
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.lg,
    backgroundColor: THEME.primary,
    alignItems: 'center',
    shadowColor: THEME.shadow.color,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: THEME.shadow.radius,
    elevation: 5,
  },
  multiplayerButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modeContainer: {
    paddingHorizontal: THEME.spacing.xl,
    paddingVertical: THEME.spacing.md,
    gap: THEME.spacing.lg,
  },
  modeCard: {
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 5,
    marginBottom: THEME.spacing.md,
  },
  teamModeCard: {
    backgroundColor: THEME.primary,
  },
  multiplayerModeCard: {
    backgroundColor: THEME.button.secondary,
  },
  modeIcon: {
    fontSize: 48,
    marginBottom: THEME.spacing.md,
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: THEME.spacing.md,
    textAlign: 'center',
  },
  modeDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: THEME.spacing.md,
    lineHeight: 20,
  },
  modeFeatures: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
  },
  featureText: {
    fontSize: 13,
    color: '#FFF',
    marginBottom: THEME.spacing.sm,
    fontWeight: '500',
  },
  createTeamCard: {
    backgroundColor: THEME.primary,
  },
  joinTeamCard: {
    backgroundColor: THEME.button.secondary,
  },
  actionContainer: {
    paddingHorizontal: THEME.spacing.xl,
    paddingVertical: THEME.spacing.md,
  },
  actionCard: {
    backgroundColor: THEME.surfaceDark,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.text.accent,
    marginBottom: THEME.spacing.lg,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 13,
    color: THEME.text.secondary,
    marginBottom: THEME.spacing.lg,
    lineHeight: 20,
    textAlign: 'center',
  },
  teamMembers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: THEME.spacing.lg,
    gap: THEME.spacing.md,
  },
  memberBadge: {
    backgroundColor: THEME.primary,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.md,
    marginBottom: THEME.spacing.sm,
  },
  memberText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 12,
  },
  inputSection: {
    marginBottom: THEME.spacing.lg,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.text.accent,
    marginBottom: THEME.spacing.sm,
  },
  codeInput: {
    borderWidth: 2,
    borderColor: THEME.primary,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    fontSize: 16,
    color: THEME.text.primary,
    backgroundColor: THEME.background,
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: THEME.primary,
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.lg,
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tabNavigation: {
    backgroundColor: THEME.surfaceDark,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  tabNavContent: {
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 2,
    gap: 2,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 4,
    minWidth: 50,
    minHeight: 50,
    borderRadius: 6,
    backgroundColor: THEME.background,
    marginRight: 0,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 0,
  },
  tabLabel: {
    display: 'none',
  },
  friendsList: {
    paddingHorizontal: THEME.spacing.xl,
    paddingVertical: THEME.spacing.md,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.surfaceDark,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.lg,
    marginBottom: THEME.spacing.md,
    borderWidth: 2,
    borderColor: THEME.border,
  },
  friendCardSelected: {
    borderColor: THEME.primary,
    backgroundColor: 'rgba(209, 67, 91, 0.1)',
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: THEME.spacing.md,
    backgroundColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    backgroundColor: THEME.primary,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.text.primary,
    marginBottom: THEME.spacing.sm,
  },
  friendEmail: {
    fontSize: 12,
    color: THEME.text.secondary,
  },
  checkmark: {
    fontSize: 20,
    color: THEME.primary,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: THEME.spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    color: THEME.text.muted,
    marginBottom: THEME.spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: THEME.text.secondary,
  },
  selectedTeamInfo: {
    marginHorizontal: THEME.spacing.xl,
    padding: THEME.spacing.md,
    backgroundColor: THEME.surfaceDark,
    borderRadius: THEME.borderRadius.lg,
    marginBottom: THEME.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: THEME.primary,
  },
  selectedTeamTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME.text.accent,
    marginBottom: THEME.spacing.md,
  },
  selectedTeamMember: {
    fontSize: 13,
    color: THEME.text.primary,
    marginBottom: THEME.spacing.sm,
  },
  startButton: {
    marginHorizontal: THEME.spacing.xl,
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.lg,
    backgroundColor: THEME.primary,
    alignItems: 'center',
    marginBottom: THEME.spacing.xl,
    shadowColor: THEME.shadow.color,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: THEME.shadow.radius,
    elevation: 5,
  },
  startButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  startButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  teamBanner: {
    marginHorizontal: THEME.spacing.xl,
    marginVertical: THEME.spacing.md,
    padding: THEME.spacing.md,
    backgroundColor: THEME.primary,
    borderRadius: THEME.borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  teamBannerTitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: THEME.spacing.sm,
  },
  teamBannerMembers: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backArrow: {
    paddingRight: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
  },
  backArrowText: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
  },
  categoriesGrid: {
    paddingHorizontal: THEME.spacing.xl,
    paddingVertical: THEME.spacing.sm,
    gap: THEME.spacing.sm,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  categoryCard: {
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.lg,
    marginBottom: THEME.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: THEME.spacing.sm,
  },
  questionCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  emptyText: {
    fontSize: 16,
    color: THEME.text.muted,
    textAlign: 'center',
    marginVertical: THEME.spacing.lg,
  },
  infoSection: {
    marginHorizontal: THEME.spacing.xl,
    marginBottom: THEME.spacing.md,
    padding: THEME.spacing.md,
    backgroundColor: THEME.surfaceDark,
    borderRadius: THEME.borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: THEME.primary,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.text.accent,
    marginBottom: THEME.spacing.md,
  },
  infoText: {
    fontSize: 13,
    color: THEME.text.secondary,
    lineHeight: 20,
  },
  categoryScrollView: {
    maxHeight: 80,
    marginBottom: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderLight,
  },
  categoryButton: {
    backgroundColor: THEME.surfaceDark,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: THEME.borderLight,
    alignItems: 'center',
    minWidth: 90,
  },
  categoryButtonActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.text.secondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  categoryRange: {
    fontSize: 10,
    color: THEME.text.muted,
  },
  categoryRangeActive: {
    color: '#cce5ff',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.primary,
  },
  consequenceBox: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  consequenceLabel: {
    fontSize: 12,
    color: '#FFC107',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  consequenceText: {
    fontSize: 14,
    color: THEME.text.primary,
  },
  answeredBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  answeredText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    backgroundColor: THEME.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: THEME.text.primary,
    minHeight: 100,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: THEME.borderLight,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: THEME.surfaceDark,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  navButtonDisabled: {
    backgroundColor: THEME.background,
    opacity: 0.5,
  },
  navButtonText: {
    color: THEME.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: THEME.surfaceDark,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: THEME.spacing.md,
  },
  statsText: {
    fontSize: 16,
    color: THEME.text.secondary,
    marginBottom: 8,
  },
});

export default Questions;