<<<<<<< HEAD
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
=======
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import api from "../core/api";

function Questions() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answer, setAnswer] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [userResponses, setUserResponses] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('spiritual_knowing');

    const categories = [
        { id: 'spiritual_knowing', label: 'Spiritual', range: '1-20' },
        { id: 'mental_knowing', label: 'Mental', range: '21-40' },
        { id: 'physical_knowing', label: 'Physical', range: '41-60' },
        { id: 'disagreeables_truth', label: 'Truth Checks', range: '61-80' },
        { id: 'romantic_knowing', label: 'Romantic', range: '81-100' },
        { id: 'erotic_knowing', label: 'Erotic', range: '101-160' },
        { id: 'creative_fun', label: 'Creative', range: '161-200' },
    ];

    useFocusEffect(
        React.useCallback(() => {
            fetchQuestions();
            fetchUserResponses();
        }, [selectedCategory])
    );

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/quiz/questions/?category=${selectedCategory}`);
            setQuestions(response.data.questions);
            setCurrentQuestionIndex(0); // Reset to first question
            setAnswer(""); // Clear answer
        } catch (error) {
            console.error('Error fetching questions:', error);
            Alert.alert('Error', 'Failed to load questions');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserResponses = async () => {
        try {
            const response = await api.get('/quiz/questions/responses/');
            setUserResponses(response.data.responses);
        } catch (error) {
            console.error('Error fetching responses:', error);
        }
    };

    const submitAnswer = async () => {
        if (!answer.trim()) {
            Alert.alert('Error', 'Please enter an answer');
            return;
        }

        const currentQuestion = questions[currentQuestionIndex];
        setSubmitting(true);

        try {
            await api.post('/quiz/questions/answer/', {
                question_id: currentQuestion.id,
                response_text: answer.trim()
            });

            Alert.alert('Success', `Answer submitted! You earned ${currentQuestion.points} points!`);
            
            // Move to next question
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                setAnswer("");
            } else {
                Alert.alert('Complete!', 'You have answered all questions!', [
                    { text: 'OK', onPress: () => setCurrentQuestionIndex(0) }
                ]);
            }
            
            fetchUserResponses();
        } catch (error) {
            console.error('Error submitting answer:', error);
            Alert.alert('Error', error.response?.data?.error || 'Failed to submit answer');
        } finally {
            setSubmitting(false);
        }
    };

    const skipQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setAnswer("");
        } else {
            Alert.alert('End', 'You have reached the last question');
        }
    };

    const goToPreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
            setAnswer("");
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#007AFF" />
            </SafeAreaView>
        );
    }

    if (questions.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.emptyText}>No questions available</Text>
            </SafeAreaView>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const hasAnswered = userResponses.some(r => r.question?.id === currentQuestion.id);
    const currentCategoryLabel = categories.find(c => c.id === selectedCategory)?.label || 'Questions';

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Category Selector */}
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryScrollView}
                    contentContainerStyle={styles.categoryContainer}
                >
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            style={[
                                styles.categoryButton,
                                selectedCategory === category.id && styles.categoryButtonActive
                            ]}
                            onPress={() => setSelectedCategory(category.id)}
                        >
                            <Text style={[
                                styles.categoryButtonText,
                                selectedCategory === category.id && styles.categoryButtonTextActive
                            ]}>
                                {category.label}
                            </Text>
                            <Text style={[
                                styles.categoryRange,
                                selectedCategory === category.id && styles.categoryRangeActive
                            ]}>
                                Q{category.range}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={styles.header}>
                    <Text style={styles.title}>{currentCategoryLabel}</Text>
                    <Text style={styles.progress}>
                        Question {currentQuestionIndex + 1} of {questions.length}
                    </Text>
                </View>

                <View style={styles.questionCard}>
                    <View style={styles.questionHeader}>
                        <Text style={styles.questionNumber}>Q{currentQuestion.question_number}</Text>
                        <View style={styles.pointsBadge}>
                            <Text style={styles.pointsText}>{currentQuestion.points} pts</Text>
                        </View>
                    </View>

                    <Text style={styles.questionText}>{currentQuestion.question_text}</Text>

                    {currentQuestion.consequence && (
                        <View style={styles.consequenceBox}>
                            <Text style={styles.consequenceLabel}>If answered wrong:</Text>
                            <Text style={styles.consequenceText}>{currentQuestion.consequence}</Text>
                        </View>
                    )}

                    {hasAnswered && (
                        <View style={styles.answeredBadge}>
                            <Text style={styles.answeredText}>✓ Already Answered</Text>
                        </View>
                    )}

                    <TextInput
                        style={styles.input}
                        placeholder="Type your answer here..."
                        placeholderTextColor="#999"
                        value={answer}
                        onChangeText={setAnswer}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />

                    <TouchableOpacity
                        style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                        onPress={submitAnswer}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>Submit Answer</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.navigationButtons}>
                        <TouchableOpacity
                            style={[styles.navButton, currentQuestionIndex === 0 && styles.navButtonDisabled]}
                            onPress={goToPreviousQuestion}
                            disabled={currentQuestionIndex === 0}
                        >
                            <Text style={styles.navButtonText}>← Previous</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.navButton, currentQuestionIndex === questions.length - 1 && styles.navButtonDisabled]}
                            onPress={skipQuestion}
                            disabled={currentQuestionIndex === questions.length - 1}
                        >
                            <Text style={styles.navButtonText}>Skip →</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.statsCard}>
                    <Text style={styles.statsTitle}>Your Progress</Text>
                    <Text style={styles.statsText}>
                        Category Answered: {userResponses.filter(r => questions.some(q => q.id === r.question?.id)).length} / {questions.length}
                    </Text>
                    <Text style={styles.statsText}>
                        Total Points (All): {userResponses.reduce((sum, r) => sum + (r.points_earned || 0), 0)}
                    </Text>
                    <Text style={styles.statsText}>
                        Total Answered: {userResponses.length}
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
>>>>>>> main
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
<<<<<<< HEAD
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
=======
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollView: {
        flex: 1,
        padding: 16,
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
        borderBottomColor: '#e0e0e0',
    },
    categoryButton: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        alignItems: 'center',
        minWidth: 90,
    },
    categoryButtonActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    categoryButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        textAlign: 'center',
        marginBottom: 4,
    },
    categoryButtonTextActive: {
        color: '#fff',
    },
    categoryRange: {
        fontSize: 10,
        color: '#999',
    },
    categoryRangeActive: {
        color: '#cce5ff',
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#007AFF',
        marginBottom: 8,
    },
    progress: {
        fontSize: 16,
        color: '#666',
    },
    questionCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
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
        color: '#007AFF',
    },
    pointsBadge: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    pointsText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    questionText: {
        fontSize: 18,
        color: '#333',
        marginBottom: 16,
        lineHeight: 26,
    },
    consequenceBox: {
        backgroundColor: '#fff3cd',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#ffc107',
    },
    consequenceLabel: {
        fontSize: 12,
        color: '#856404',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    consequenceText: {
        fontSize: 14,
        color: '#856404',
    },
    answeredBadge: {
        backgroundColor: '#d4edda',
        padding: 10,
        borderRadius: 8,
        marginBottom: 16,
    },
    answeredText: {
        color: '#155724',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#333',
        minHeight: 100,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#dee2e6',
    },
    submitButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
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
        backgroundColor: '#e9ecef',
        alignItems: 'center',
        marginHorizontal: 4,
    },
    navButtonDisabled: {
        backgroundColor: '#f8f9fa',
        opacity: 0.5,
    },
    navButtonText: {
        color: '#495057',
        fontSize: 14,
        fontWeight: '600',
    },
    statsCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007AFF',
        marginBottom: 12,
    },
    statsText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        marginTop: 50,
    },
>>>>>>> main
});

export default Questions;