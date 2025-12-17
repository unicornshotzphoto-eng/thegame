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
    );
}

const styles = StyleSheet.create({
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
});

export default Questions;