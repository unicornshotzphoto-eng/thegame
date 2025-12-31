import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, TextInput, Clipboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../core/api';
import useStore from '../core/global';
import { useLocalSearchParams } from 'expo-router';

function GamePlay({ route, navigation }) {
    const localParams = useLocalSearchParams?.() || {};
    const sessionId = (route && route.params && route.params.sessionId) || localParams.sessionId;
    if (!sessionId) {
        return (
            <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: 'red', fontWeight: '600' }}>Missing sessionId for GamePlay</Text>
                <TouchableOpacity onPress={() => navigation?.back?.()} style={{ marginTop: 12 }}>
                    <Text>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }
    const user = useStore((state) => state.user);
    const [session, setSession] = useState(null);
    const [rounds, setRounds] = useState([]);
    const [currentRound, setCurrentRound] = useState(null);
    const [scores, setScores] = useState({});
    const [loading, setLoading] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [currentRoundId, setCurrentRoundId] = useState(null);
    const [answer, setAnswer] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);

    const categories = [
        { id: 'spiritual', label: 'Spiritual', range: '1-20' },
        { id: 'mental', label: 'Mental', range: '21-40' },
        { id: 'physical', label: 'Physical', range: '41-60' },
        { id: 'disagreeables', label: 'Truth Checks', range: '61-80' },
        { id: 'romantic', label: 'Romantic', range: '81-100' },
        { id: 'erotic', label: 'Erotic', range: '101-160' },
        { id: 'creative', label: 'Creative', range: '161-200' },
    ];

    useEffect(() => {
        fetchGameSession();
        const interval = setInterval(fetchGameSession, 3000); // Poll every 3 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchGameSession = async () => {
        try {
            const response = await api.get(`/quiz/games/${sessionId}/`);
            console.log('=== FETCH GAME SESSION ===');
            console.log('Current user:', user?.username, 'ID:', user?.id);
            console.log('Session data:', response.data.session);
            console.log('Game Code:', response.data.session?.game_code || 'NOT FOUND');
            console.log('Current round:', response.data.current_round);
            console.log('Rounds count:', response.data.rounds?.length || 0);
            
            if (!response.data || !response.data.session) {
                console.error('Invalid response data');
                return;
            }
            
            setSession(response.data.session);
            setRounds(response.data.rounds || []);
            setScores(response.data.scores);
            
            // Set current round if exists
            if (response.data.current_round) {
                console.log('Setting current round:', response.data.current_round.id);
                console.log('Question:', response.data.current_round.question?.question_text);
                console.log('Answers:', response.data.current_round.answers);
                
                setCurrentRound(response.data.current_round);
                setCurrentQuestion(response.data.current_round.question);
                setCurrentRoundId(response.data.current_round.id);
                
                // Check if current user has already answered
                const userAnswer = response.data.current_round.answers?.find(
                    ans => ans.player.id === user?.id || ans.player.username === user?.username
                );
                console.log('User answer found:', userAnswer ? 'Yes' : 'No');
                if (userAnswer) {
                    console.log('User answer details:', {
                        player: userAnswer.player.username,
                        answer: userAnswer.answer,
                        answered_at: userAnswer.answered_at,
                        hasAnsweredAt: !!userAnswer.answered_at,
                        hasAnswer: !!userAnswer.answer
                    });
                }
                // Consider answered if they have an answer OR answered_at is set
                const hasUserAnswered = !!userAnswer && (!!userAnswer.answered_at || !!userAnswer.answer);
                console.log('Setting hasAnswered to:', hasUserAnswered);
                setHasAnswered(hasUserAnswered);
            } else {
                console.log('No current round found');
                setCurrentRound(null);
                setCurrentQuestion(null);
                setCurrentRoundId(null);
                setHasAnswered(false);
            }
        } catch (error) {
            console.error('Error fetching game session:', error);
            console.error('Error details:', error.response?.data);
            console.error('Error status:', error.response?.status);
            console.error('Error message:', error.message);
            // Don't set loading to false on error to prevent UI flickering
            // Only set to false on successful load
        } finally {
            if (loading) {
                setLoading(false);
            }
        }
    };

    const selectCategory = async (categoryId) => {
        setSelectedCategory(categoryId);
        console.log('Selecting category:', categoryId, 'for session:', sessionId);
        try {
            const response = await api.post(`/quiz/games/${sessionId}/start-round/`, {
                category: categoryId
            });
            console.log('Start round response:', response.data);
            // Response shape: { session, current_round, rounds, scores }
            setSession(response.data.session);
            setCurrentQuestion(response.data.current_round?.question || null);
            setCurrentRoundId(response.data.current_round?.id || null);
            setHasAnswered(false);
            fetchGameSession(); // Refresh to show the question to all players
        } catch (error) {
            console.error('Error starting round:', error);
            console.error('Error response:', error.response?.data);
            if (error.response?.status === 403) {
                Alert.alert('Error', `Not your turn! ${error.response?.data?.error || ''}`);
            } else if (error.response?.status === 404) {
                Alert.alert('Error', 'No more questions in this category');
            } else {
                Alert.alert('Error', error.response?.data?.error || 'Failed to get question');
            }
        }
    };

    const copyGameCode = async () => {
        if (session?.game_code) {
            Clipboard.setString(session.game_code);
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 2000);
        }
    };

    const submitAnswer = async () => {
        if (!answer.trim()) {
            Alert.alert('Error', 'Please enter an answer');
            return;
        }

        setSubmitting(true);
        const answerText = answer.trim();
        
        try {
            console.log('Submitting answer:', answerText, 'for round:', currentRoundId);
            const response = await api.post('/quiz/games/submit-answer/', {
                round_id: currentRoundId,
                answer: answerText
            });

            console.log('Answer submission response:', JSON.stringify(response.data, null, 2));
            
            // Only clear and mark as answered if successful
            if (response.status === 200) {
                setAnswer('');
                setHasAnswered(true);
                
                if (response.data.round_completed) {
                    // Show results
                    const pointsEarned = response.data.points_earned || 0;
                    Alert.alert('Round Complete!', `You earned ${pointsEarned} points!`);
                    setCurrentQuestion(null);
                    setCurrentRoundId(null);
                    setSelectedCategory(null);
                    setCurrentRound(null);
                } else {
                    Alert.alert('Answer Submitted', `Waiting for other players... (${response.data.answered_count}/${response.data.total_players} answered)`);
                }
                
                // Refresh game state without blocking
                fetchGameSession().catch(err => {
                    console.error('Error refreshing after answer:', err);
                });
            }
        } catch (error) {
            console.error('Error submitting answer:', error);
            console.error('Error response:', error.response?.data);
            Alert.alert('Error', error.response?.data?.error || 'Failed to submit answer');
        } finally {
            setSubmitting(false);
        }
    };

    const endGame = async () => {
        Alert.alert(
            'End Game',
            'Are you sure you want to end this game? This will delete the game session for all players.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'End Game',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/quiz/games/${sessionId}/delete/`);
                            Alert.alert('Success', 'Game ended', [
                                { text: 'OK', onPress: () => navigation.goBack() }
                            ]);
                        } catch (error) {
                            console.error('Error ending game:', error);
                            Alert.alert('Error', 'Failed to end game');
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#007AFF" />
            </SafeAreaView>
        );
    }

    if (!session) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorText}>Session not found</Text>
            </SafeAreaView>
        );
    }

    const currentTurnId = session?.current_turn_user?.id;
    const myUserId = user?.id;
    const isMyTurn = (
        (currentTurnId != null && myUserId != null && String(currentTurnId) === String(myUserId)) ||
        (session?.current_turn_user?.username && user?.username && session.current_turn_user.username === user.username)
    );
    
    console.log('GamePlay Debug:', {
        currentTurnUserId: session.current_turn_user?.id,
        currentUserId: user?.id,
        isMyTurn,
        currentQuestion: currentQuestion ? 'Present' : 'None',
        shouldShowCategories: isMyTurn && !currentQuestion,
        categoriesCount: categories.length
    });

    return (
        <SafeAreaView style={styles.container}>
            {/* VISIBLE INDICATOR - GamePlay IS RENDERING */}
            <View style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                backgroundColor: '#ff0000',
                padding: 8,
                zIndex: 1000
            }}>
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold', textAlign: 'center' }}>
                    ✓ GamePlay Component Loaded
                </Text>
            </View>

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Game</Text>
                <TouchableOpacity onPress={endGame} style={styles.endGameButton}>
                    <Text style={styles.endGameText}>End Game</Text>
                </TouchableOpacity>
            </View>
            <ScrollView style={styles.scrollView}>
                {/* Scoreboard */}
                <View style={styles.scoreboardCard}>
                    <Text style={styles.scoreboardTitle}>Scoreboard</Text>
                    {Object.entries(scores).map(([username, score]) => (
                        <View key={username} style={styles.scoreRow}>
                            <Text style={[
                                styles.playerName,
                                session.current_turn_user?.username === username && styles.currentPlayer
                            ]}>
                                {username} {session.current_turn_user?.username === username && '(Current Turn)'}
                            </Text>
                            <Text style={styles.playerScore}>{score} pts</Text>
                        </View>
                    ))}
                </View>

                {/* Game Code Display */}
                <View style={styles.gameCodeCard}>
                    <Text style={styles.gameCodeLabel}>Game Code</Text>
                    <View style={styles.gameCodeContainer}>
                        <Text style={styles.gameCodeText}>{session.game_code}</Text>
                        <TouchableOpacity 
                            style={styles.copyButton}
                            onPress={copyGameCode}
                        >
                            <Text style={styles.copyButtonText}>
                                {copiedCode ? '✓ Copied!' : 'Copy'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Current Turn Indicator */}
                <View style={styles.turnIndicator}>
                    {currentQuestion ? (
                        <Text style={styles.turnText}>
                            {isMyTurn ? "Your turn! You picked this question for everyone." : 
                             `${currentRound?.picker?.username || 'Player'} picked this question`}
                        </Text>
                    ) : (
                        <Text style={styles.turnText}>
                            {isMyTurn ? "It's your turn! Pick a category:" : `Waiting for ${session.current_turn_user?.username} to pick a category...`}
                        </Text>
                    )}
                </View>

                {/* Always-visible debug info */}
                <View style={{ 
                    backgroundColor: '#444', 
                    padding: 12, 
                    borderRadius: 8, 
                    marginBottom: 16 
                }}>
                    <Text style={{ color: '#fff', fontSize: 12, marginBottom: 4 }}>
                        DEBUG: isMyTurn={String(isMyTurn)}
                    </Text>
                    <Text style={{ color: '#fff', fontSize: 12, marginBottom: 4 }}>
                        currentTurnUserId={String(session?.current_turn_user?.id || 'NULL')}
                    </Text>
                    <Text style={{ color: '#fff', fontSize: 12, marginBottom: 4 }}>
                        myUserId={String(user?.id || 'NULL')}
                    </Text>
                    <Text style={{ color: '#fff', fontSize: 12, marginBottom: 4 }}>
                        currentQuestion={currentQuestion === null ? 'NULL' : (typeof currentQuestion)}
                    </Text>
                    <Text style={{ color: '#fff', fontSize: 12, marginBottom: 4 }}>
                        !currentQuestion={String(!currentQuestion)}
                    </Text>
                    <Text style={{ color: '#fff', fontSize: 12 }}>
                        condition={String(isMyTurn && !currentQuestion)}
                    </Text>
                </View>

                {/* Category Selection - visible to all when no question; only current player can pick */}
                {!currentQuestion ? (
                    <View style={{ backgroundColor: isMyTurn ? '#2a2' : '#444', padding: 16, borderRadius: 8, marginBottom: 16 }}>
                        <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold', marginBottom: 12 }}>
                            {isMyTurn ? `It's your turn! Pick a category:` : `Categories (only ${session.current_turn_user?.username} can pick)`}
                        </Text>
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
                                        !isMyTurn && { opacity: 0.5 }
                                    ]}
                                    onPress={() => selectCategory(category.id)}
                                >
                                    <Text style={styles.categoryButtonText}>{category.label}</Text>
                                    <Text style={styles.categoryRange}>Q{category.range}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                ) : null}

                {/* Current Question */}
                {currentQuestion && (
                    <View style={styles.questionCard}>
                        <View style={styles.questionHeader}>
                            <Text style={styles.questionNumber}>
                                Question {currentQuestion.question_number}
                            </Text>
                            <View style={styles.pointsBadge}>
                                <Text style={styles.pointsText}>{currentQuestion.points} pts</Text>
                            </View>
                        </View>

                        <Text style={styles.questionText}>{currentQuestion.question_text}</Text>

                        <View style={styles.consequenceBox}>
                            <Text style={styles.consequenceLabel}>If answered wrong:</Text>
                            <Text style={styles.consequenceText}>{currentQuestion.consequence}</Text>
                        </View>

                        {hasAnswered ? (
                            <View style={styles.waitingBox}>
                                <ActivityIndicator size="large" color="#007AFF" />
                                <Text style={styles.waitingText}>Waiting for other players to answer...</Text>
                                {currentRound?.answers && (
                                    <Text style={styles.answersCount}>
                                        {currentRound.answers.filter(a => a.answered_at || a.answer).length} / {currentRound.answers.length} answered
                                    </Text>
                                )}
                            </View>
                        ) : (
                            <>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Type your answer here..."
                                    placeholderTextColor="#999"
                                    value={answer}
                                    onChangeText={setAnswer}
                                    multiline
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
                            </>
                        )}
                    </View>
                )}

                {/* Completed Rounds */}
                {rounds.filter(r => r.is_completed).length > 0 && (
                    <View style={styles.recentTurnsCard}>
                        <Text style={styles.recentTurnsTitle}>Completed Rounds</Text>
                        {rounds.filter(r => r.is_completed).slice(-3).reverse().map((round) => (
                            <View key={round.id} style={styles.roundCard}>
                                <View style={styles.roundHeader}>
                                    <Text style={styles.roundQuestion}>Q{round.question.question_number}: {round.question.question_text.substring(0, 50)}...</Text>
                                    <Text style={styles.roundPicker}>Picked by {round.picker.username}</Text>
                                </View>
                                <View style={styles.answersContainer}>
                                    <Text style={styles.pickerAnswerLabel}>Picker's Answer:</Text>
                                    <Text style={styles.pickerAnswer}>{round.picker_answer}</Text>
                                    <Text style={styles.answersLabel}>All Answers:</Text>
                                    {round.answers.map((answer) => (
                                        <View key={answer.id} style={styles.answerRow}>
                                            <Text style={styles.answerPlayer}>{answer.player.username}:</Text>
                                            <Text style={styles.answerText}>{answer.answer}</Text>
                                            {answer.points_earned > 0 && (
                                                <Text style={styles.answerPoints}>+{answer.points_earned} pts</Text>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#111',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        color: '#1a73e8',
        fontSize: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    endGameButton: {
        padding: 8,
    },
    endGameText: {
        color: '#ff3b30',
        fontSize: 14,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
        padding: 16,
    },
    scoreboardCard: {
        backgroundColor: '#111',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#333',
    },
    scoreboardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a73e8',
        marginBottom: 16,
    },
    scoreRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    playerName: {
        fontSize: 16,
        color: '#fff',
    },
    currentPlayer: {
        fontWeight: 'bold',
        color: '#1a73e8',
    },
    playerScore: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a73e8',
    },
    gameCodeCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#28a745',
    },
    gameCodeLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#999',
        marginBottom: 12,
    },
    gameCodeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111',
        borderRadius: 8,
        padding: 12,
    },
    gameCodeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#28a745',
        letterSpacing: 2,
        flex: 1,
        fontFamily: 'Courier New',
    },
    copyButton: {
        backgroundColor: '#28a745',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        marginLeft: 12,
    },
    copyButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 12,
    },
    turnIndicator: {
        backgroundColor: '#1a73e8',
        padding: 16,
        borderRadius: 8,
        marginBottom: 20,
    },
    turnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    categoryScrollView: {
        maxHeight: 80,
        marginBottom: 16,
    },
    categoryContainer: {
        flexDirection: 'row',
        gap: 8,
        paddingBottom: 12,
    },
    categoryButton: {
        backgroundColor: '#1a73e8',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        minWidth: 90,
    },
    categoryButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 4,
    },
    categoryRange: {
        fontSize: 10,
        color: '#cce5ff',
    },
    questionCard: {
        backgroundColor: '#111',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#333',
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
        color: '#1a73e8',
    },
    pointsBadge: {
        backgroundColor: '#1a73e8',
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
        color: '#fff',
        marginBottom: 16,
        lineHeight: 26,
    },
    consequenceBox: {
        backgroundColor: '#221a00',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#ffc107',
    },
    consequenceLabel: {
        fontSize: 12,
        color: '#ffc107',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    consequenceText: {
        fontSize: 14,
        color: '#f0ad4e',
    },
    input: {
        backgroundColor: '#222',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#fff',
        minHeight: 100,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#333',
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#1a73e8',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: '#ccc',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    recentTurnsCard: {
        backgroundColor: '#111',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#333',
    },
    recentTurnsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a73e8',
        marginBottom: 12,
    },
    turnRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    turnPlayer: {
        fontSize: 14,
        color: '#fff',
        flex: 1,
    },
    turnQuestion: {
        fontSize: 14,
        color: '#999',
        marginRight: 12,
    },
    turnPoints: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#28a745',
    },
    errorText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 50,
    },
    waitingBox: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#222',
        borderRadius: 8,
        marginTop: 12,
    },
    waitingText: {
        fontSize: 16,
        color: '#999',
        marginTop: 12,
        textAlign: 'center',
    },
    answersCount: {
        fontSize: 14,
        color: '#1a73e8',
        marginTop: 8,
        fontWeight: '600',
    },
    roundCard: {
        backgroundColor: '#222',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    roundHeader: {
        marginBottom: 8,
    },
    roundQuestion: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
        marginBottom: 4,
    },
    roundPicker: {
        fontSize: 12,
        color: '#999',
        fontStyle: 'italic',
    },
    answersContainer: {
        marginTop: 8,
    },
    pickerAnswerLabel: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#1a73e8',
        marginBottom: 4,
    },
    pickerAnswer: {
        fontSize: 13,
        color: '#fff',
        backgroundColor: '#1a3a5c',
        padding: 8,
        borderRadius: 4,
        marginBottom: 8,
    },
    answersLabel: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#999',
        marginBottom: 4,
    },
    answerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        flexWrap: 'wrap',
    },
    answerPlayer: {
        fontSize: 12,
        color: '#999',
        fontWeight: '600',
        marginRight: 6,
    },
    answerText: {
        fontSize: 12,
        color: '#fff',
        flex: 1,
    },
    answerPoints: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#28a745',
        marginLeft: 6,
    },
});

export default GamePlay;
