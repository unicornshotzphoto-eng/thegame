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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../core/api';
import { THEME, COMMON_STYLES } from '../constants/appTheme';

const CATEGORY_COLORS = THEME.categories;

function Questions({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [showQuestion, setShowQuestion] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [gameStats, setGameStats] = useState({ answered: 0, skipped: 0 });

  useEffect(() => {
    loadCategories();
  }, []);

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
    const newScore = score + current.points;
    const newTotal = totalPoints + current.points;

    setScore(newScore);
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
    Alert.alert(
      'Game Complete!',
      `Your Score: ${score}/${totalPoints}\n\nAnswered: ${gameStats.answered}\nSkipped: ${gameStats.skipped}`,
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
    setScore(0);
    setTotalPoints(0);
    setAnsweredQuestions([]);
    setGameStats({ answered: 0, skipped: 0 });
    setUserAnswer('');
  };

  if (loading && !showQuestion) {
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
              <Text style={styles.scoreLabel}>Current Score</Text>
              <Text style={styles.scoreValue}>{score}</Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Total Points</Text>
              <Text style={styles.scoreValue}>{totalPoints}</Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Multiplier</Text>
              <Text style={styles.scoreValue}>
                {totalPoints > 0 ? (score / totalPoints).toFixed(2) : '0.00'}
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
      <ScrollView contentContainerStyle={styles.homeScrollContent}>
        <View style={styles.header2}>
          <Text style={styles.title}>Quiz Game</Text>
          <Text style={styles.subtitle}>Choose a category to start playing</Text>
        </View>

        {/* Multiplayer Button */}
        <TouchableOpacity
          style={styles.multiplayerButton}
          onPress={() => navigation.navigate('MultiplayerQuestions')}
        >
          <Text style={styles.multiplayerButtonText}>👥 Play with Friends</Text>
        </TouchableOpacity>

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
          <Text style={styles.infoTitle}>How to Play</Text>
          <Text style={styles.infoText}>
            • Select a category to start{'\n'}
            • Type your answer to each question{'\n'}
            • Earn points for answered questions{'\n'}
            • Skip questions to move forward{'\n'}
            • Track your score and stats
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.secondary,
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
    backgroundColor: '#D1435B',  // Testing with hardcoded color
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
});

export default Questions;