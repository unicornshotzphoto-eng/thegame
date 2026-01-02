import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, TextInput, Share, Modal } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { buildWebInviteURL } from '../constants/deeplink';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../core/api';
import useStore from '../core/global';
import { getUserData, storeCurrentGameSession, clearCurrentGameSession } from '../core/secureStorage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GameWebSocket } from '../core/websocket';

function GamePlay({ route, navigation }) {
    const router = useRouter();
    console.log('[GamePlay] Router initialized:', !!router, 'Router methods:', Object.keys(router || {}));
    const localParams = useLocalSearchParams?.() || {};
    const sessionId = (route && route.params && route.params.sessionId) || localParams.sessionId;
    const initialGameCode = (route && route.params && route.params.gameCode) || localParams.gameCode;
    
    console.log('[GamePlay] Initialization:');
    console.log('[GamePlay] route.params:', route?.params);
    console.log('[GamePlay] localParams:', localParams);
    console.log('[GamePlay] sessionId:', sessionId);
    console.log('[GamePlay] initialGameCode:', initialGameCode);
    
    if (!sessionId) {
        console.error('[GamePlay] Missing sessionId! Cannot proceed');
        return (
            <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: 'red', fontWeight: '600' }}>Missing sessionId for GamePlay</Text>
                <Text style={{ color: '#666', marginTop: 8, marginHorizontal: 16, textAlign: 'center' }}>
                    route.params: {JSON.stringify(route?.params)}
                </Text>
                <Text style={{ color: '#666', marginTop: 8, marginHorizontal: 16, textAlign: 'center' }}>
                    localParams: {JSON.stringify(localParams)}
                </Text>
                <TouchableOpacity onPress={() => navigation?.back?.()} style={{ marginTop: 12 }}>
                    <Text>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }
    const user = useStore((state) => state.user);
    const login = useStore((state) => state.login);
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
    const [wsStatus, setWsStatus] = useState('disconnected');
    const wsRef = useRef(null);
    const [inviteVisible, setInviteVisible] = useState(false);
    const [endGameModalVisible, setEndGameModalVisible] = useState(false);

    const categories = [
        { id: 'spiritual', label: 'Spiritual', range: '1-20' },
        { id: 'mental', label: 'Mental', range: '21-40' },
        { id: 'general', label: 'General', range: '1-40' },
        { id: 'physical', label: 'Physical', range: '41-60' },
        { id: 'disagreeables', label: 'Truth Checks', range: '61-80' },
        { id: 'romantic', label: 'Romantic', range: '81-100' },
        { id: 'erotic', label: 'Desirable', range: '101-160' },
        { id: 'creative', label: 'Creative', range: '161-200' },
    ];

    // Restore user from storage on component mount if not in Zustand
    useEffect(() => {
        const restoreUserIfNeeded = async () => {
            if (!user?.id) {
                console.log('[GamePlay] User not in store, attempting to restore from storage');
                try {
                    const storedUser = await getUserData();
                    if (storedUser) {
                        console.log('[GamePlay] Restored user from storage:', storedUser.username);
                        login(storedUser);
                    } else {
                        console.warn('[GamePlay] No user data in storage');
                    }
                } catch (error) {
                    console.error('[GamePlay] Error restoring user:', error);
                }
            }
        };
        
        restoreUserIfNeeded();
    }, [user?.id, login]);

    useEffect(() => {
        fetchGameSession();
        
        // Save current game session for rejoin capability
        storeCurrentGameSession({ sessionId, gameCode: initialGameCode });
        console.log('[GamePlay] Session saved for rejoin:', sessionId);
        
        const interval = setInterval(fetchGameSession, 3000); // Poll every 3 seconds

        // Connect WebSocket for live updates
        wsRef.current = new GameWebSocket(sessionId).connect({
            onOpen: () => setWsStatus('connected'),
            onClose: () => setWsStatus('disconnected'),
            onError: () => setWsStatus('error'),
            onMessage: (data) => {
                // React to game update events
                const t = data?.type;
                if (t === 'round_started' || t === 'answer_submitted' || t === 'round_completed' || t === 'next_round' || t === 'game_ended') {
                    fetchGameSession();
                }
            },
        });

        return () => {
            clearInterval(interval);
            try {
                wsRef.current?.close();
            } catch {}
        };
    }, []);

    const fetchGameSession = async () => {
        try {
            const response = await api.get(`/quiz/games/${sessionId}/`);
            console.log('=== FETCH GAME SESSION RESPONSE ===');
            console.log('Current user:', user?.username, 'ID:', user?.id);
            console.log('Session:', response.data.session?.id);
            console.log('Game Code:', response.data.session?.game_code || 'NOT FOUND');
            console.log('Players in session:', response.data.session?.players?.map(p => p.username) || []);
            console.log('Current Round ID:', response.data.current_round?.id);
            console.log('Current Question:', response.data.current_round?.question?.question_text?.substring(0, 40));
            console.log('Answers in current round:', response.data.current_round?.answers?.length || 0);
            console.log('Answer details:', response.data.current_round?.answers?.map(a => ({
                player: a.player?.username,
                hasText: !!a.answer_text,
                hasAnsweredAt: !!a.answered_at,
                text: a.answer_text?.substring(0, 20)
            })) || []);
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
                console.log('Question:', response.data.current_round.question?.question_text?.substring(0, 40));
                console.log('Answers in round:', response.data.current_round.answers?.length);
                
                setCurrentRound(response.data.current_round);
                // Prefer full question details from session.current_question if present
                setCurrentQuestion(response.data.session?.current_question || response.data.current_round.question);
                setCurrentRoundId(response.data.current_round.id);
                
                // Check if current user has already answered
                const userAnswer = response.data.current_round.answers?.find(
                    ans => ans.player.id === user?.id || ans.player.username === user?.username
                );
                console.log('User answer found:', userAnswer ? 'Yes' : 'No');
                if (userAnswer) {
                    console.log('User answer details:', {
                        player: userAnswer.player.username,
                        answer_text: userAnswer.answer_text?.substring(0, 30),
                        answered_at: userAnswer.answered_at,
                        hasAnsweredAt: !!userAnswer.answered_at,
                        hasAnswerText: !!userAnswer.answer_text
                    });
                }
                // Consider answered if they have an answer_text OR answered_at is set
                const hasUserAnswered = !!userAnswer && (!!userAnswer.answered_at || !!userAnswer.answer_text);
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
            console.error('=== ERROR FETCHING GAME SESSION ===');
            console.error('SessionID used:', sessionId);
            console.error('Error:', error);
            console.error('Error response data:', error.response?.data);
            console.error('Error status:', error.response?.status);
            console.error('Error message:', error.message);
            console.error('Full error:', JSON.stringify(error, null, 2));
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
        const code = session?.game_code || initialGameCode;
        if (code) {
            Clipboard.setString(code);
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 2000);
        }
    };

    const getInviteCode = () => session?.game_code || initialGameCode;

    const getAppInviteURL = () => {
        const code = getInviteCode();
        try {
            return Linking.createURL('GamePlay', { queryParams: { sessionId, gameCode: code || undefined } });
        } catch (e) {
            return null;
        }
    };

    const getWebInviteURL = () => {
        const code = getInviteCode();
        return buildWebInviteURL(sessionId, code);
    };

    const buildInviteText = () => {
        const code = getInviteCode();
        const appUrl = getAppInviteURL();
        const webUrl = getWebInviteURL();
        const lines = [
            `Join my game!`,
            `Code: ${code || 'N/A'}`,
            appUrl ? `App: ${appUrl}` : null,
            webUrl ? `Web: ${webUrl}` : `Web: (set EXPO_PUBLIC_INVITE_HOST)`
        ].filter(Boolean);
        return lines.join('\n');
    };

    const shareInviteOS = async () => {
        try {
            const message = buildInviteText();
            await Share.share({ message });
        } catch (e) {
            Alert.alert('Error', 'Failed to share invite');
        }
    };

    const copyAppLink = async () => {
        const appUrl = getAppInviteURL();
        if (!appUrl) {
            Alert.alert('Unavailable', 'App link could not be generated');
            return;
        }
        Clipboard.setString(appUrl);
        Alert.alert('Copied', 'App invite link copied');
    };

    const copyWebLink = async () => {
        const webUrl = getWebInviteURL();
        if (!webUrl) {
            Alert.alert('Unavailable', 'Web link not configured. Set EXPO_PUBLIC_INVITE_HOST.');
            return;
        }
        Clipboard.setString(webUrl);
        Alert.alert('Copied', 'Web invite link copied');
    };

    const shareToMessages = () => {
        const text = buildInviteText();
        try {
            if (navigation?.push) {
                navigation.push({ pathname: 'Messages', params: { prefillText: text } });
            } else if (navigation?.navigate) {
                navigation.navigate('Messages', { prefillText: text });
            }
            setInviteVisible(false);
        } catch (e) {
            Alert.alert('Error', 'Failed to open Messages');
        }
    };

    const submitAnswer = async () => {
        console.warn('[SUBMIT] Button pressed!');
        if (!answer.trim()) {
            console.warn('[SUBMIT] No answer text, returning');
            Alert.alert('Error', 'Please enter an answer');
            return;
        }

        setSubmitting(true);
        const answerText = answer.trim();
        
        console.warn('[SUBMIT] ===== TOP LEVEL WRAPPER =====');
        console.warn('[SUBMIT] Starting submitAnswer function');
        console.warn('[SUBMIT] sessionId:', sessionId);
        console.warn('[SUBMIT] user:', user?.username, 'id:', user?.id);
        
        try {
            console.warn('[SUBMIT] ===== SUBMITTING ANSWER =====');
            console.warn('[SUBMIT] Answer Text:', answerText);
            console.warn('[SUBMIT] Session ID:', sessionId);
            console.warn('[SUBMIT] Current Round ID:', currentRoundId);
            console.warn('[SUBMIT] Current User:', user?.username, 'ID:', user?.id);
            
            const endpoint = `/quiz/games/${sessionId}/submit-answer/`;
            console.warn('[SUBMIT] About to call api.post with endpoint:', endpoint);
            console.warn('[SUBMIT] Payload:', { answer: answerText });
            
            console.warn('[SUBMIT] Calling api.post now...');
            const response = await api.post(endpoint, {
                answer: answerText
            });
            console.warn('[SUBMIT] api.post returned successfully');

            console.warn('[SUBMIT] ===== ANSWER SUBMISSION RESPONSE =====');
            console.warn('[SUBMIT] Status:', response.status);
            console.warn('[SUBMIT] Response Data:', JSON.stringify(response.data, null, 2));
            
            // Only clear and mark as answered if successful
            if (response.status >= 200 && response.status < 300) {
                console.warn('[SUBMIT] ✓ Answer submitted successfully - clearing input');
                setAnswer('');
                setHasAnswered(true);
                
                const pointsEarned = response.data.points_earned || 0;
                if (response.data.round_completed) {
                    console.warn('[SUBMIT] ✓ Round marked as completed');
                    // Show results
                    Alert.alert('Round Complete!', `You earned ${pointsEarned} points!`);
                    setCurrentQuestion(null);
                    setCurrentRoundId(null);
                    setSelectedCategory(null);
                    setCurrentRound(null);
                } else {
                    console.warn('[SUBMIT] Round NOT marked as completed, waiting for other players');
                    Alert.alert('Answer Submitted', `You earned ${pointsEarned} points. Waiting for other players...`);
                }
                
                console.warn('[SUBMIT] Fetching game session after answer submission...');
                // Refresh game state without blocking
                fetchGameSession().catch(err => {
                    console.error('[SUBMIT] Error refreshing after answer:', err);
                });
            }
        } catch (error) {
            console.error('[SUBMIT] ===== CAUGHT ERROR =====');
            console.error('[SUBMIT] Error object:', error);
            console.error('[SUBMIT] Error message:', error?.message);
            console.error('[SUBMIT] Error code:', error?.code);
            console.error('[SUBMIT] Error config:', error?.config?.url);
            
            if (error.response) {
                console.error('[SUBMIT] ERROR RESPONSE - Status:', error.response?.status);
                console.error('[SUBMIT] ERROR RESPONSE - Data:', error.response?.data);
                console.error('[SUBMIT] ERROR RESPONSE - Headers:', error.response?.headers);
            } else if (error.request) {
                console.error('[SUBMIT] ERROR REQUEST - No response received');
                console.error('[SUBMIT] ERROR REQUEST - Request:', error.request);
            } else {
                console.error('[SUBMIT] ERROR - Something else happened');
            }
            
            Alert.alert('Error', error.response?.data?.error || error.message || 'Failed to submit answer');
        } finally {
            setSubmitting(false);
        }
    };

    const advanceToNextRound = async () => {
        try {
            const response = await api.post(`/quiz/games/${sessionId}/next-round/`);
            console.log('Advance round response:', response.data);
            // Clear current question locally; server will rotate picker and reset question
            setCurrentQuestion(null);
            setHasAnswered(false);
            fetchGameSession();
        } catch (error) {
            console.error('Error advancing round:', error);
            Alert.alert('Error', error.response?.data?.error || 'Failed to advance to next round');
        }
    };

    const confirmEndGame = async () => {
        console.warn('🔴 CONFIRM END GAME PRESSED 🔴');
        console.log('[GamePlay] ========== CONFIRMING GAME END ==========');
        setEndGameModalVisible(false);
        
        try {
            const endpoint = `/quiz/games/${sessionId}/end/`;
            console.log('[GamePlay] Calling API endpoint:', endpoint);
            console.log('[GamePlay] Making POST request...');
            
            const response = await api.post(endpoint);
            
            console.log('[GamePlay] ✅ API response received:', response.status, response.statusText);
            console.log('[GamePlay] Response data:', response.data);
            console.log('[GamePlay] Game ended successfully, clearing session');
            
            // Clear the stored game session so rejoin isn't offered
            const clearResult = await clearCurrentGameSession();
            console.log('[GamePlay] Session cleared result:', clearResult);
            
            console.log('[GamePlay] Navigating to home...');
            setTimeout(() => {
                try {
                    console.log('[GamePlay] About to call router.replace("/")');
                    router.replace('/');
                    console.log('[GamePlay] ✅ router.replace("/") called successfully');
                } catch (error) {
                    console.error('[GamePlay] ❌ Error calling router.replace():', error);
                    console.error('[GamePlay] Error message:', error.message);
                    console.error('[GamePlay] Error stack:', error.stack);
                }
            }, 500);
        } catch (error) {
            console.error('[GamePlay] ❌ ========== ERROR ENDING GAME ==========');
            console.error('[GamePlay] Error type:', error.constructor.name);
            console.error('[GamePlay] Error message:', error.message);
            console.error('[GamePlay] Error status:', error.response?.status);
            console.error('[GamePlay] Error data:', error.response?.data);
            console.error('[GamePlay] Full error:', error);
            Alert.alert('Error', `Failed to end game: ${error.message}`);
        }
    };

    const endGame = () => {
        console.warn('🔴 🔴 🔴 ========== END GAME FUNCTION CALLED 🔴 🔴 🔴');
        console.log('[GamePlay] ========== END GAME INITIATED ==========');
        console.log('[GamePlay] sessionId:', sessionId);
        console.log('[GamePlay] Router available:', !!router);
        console.warn('🟡 Showing End Game Modal...');
        setEndGameModalVisible(true);
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
    const isCreator = (
        (session?.creator?.id != null && myUserId != null && String(session.creator.id) === String(myUserId)) ||
        (session?.creator?.username && user?.username && session.creator.username === user.username)
    );
    const isMyTurn = (
        (currentTurnId != null && myUserId != null && String(currentTurnId) === String(myUserId)) ||
        (session?.current_turn_user?.username && user?.username && session.current_turn_user.username === user.username)
    );
    const totalPlayers = Array.isArray(session?.players) ? session.players.length : 0;
    const answeredCount = Array.isArray(currentRound?.answers)
        ? currentRound.answers.filter(a => a.answered_at || a.answer_text).length
        : 0;
    
    console.log('=== GAMEPLAY DEBUG ===');
    console.log('Session Players:', session?.players?.map(p => p.username) || []);
    console.log('Total Players:', totalPlayers);
    console.log('Current Round:', {
        roundId: currentRound?.id,
        questionId: currentQuestion?.id,
        creatorId: currentRound?.question?.turnPicker?.id,
        creatorUsername: currentRound?.question?.turnPicker?.username
    });
    
    console.log('--- ANSWER DETAILS ---');
    console.log('Total answers received:', currentRound?.answers?.length || 0);
    currentRound?.answers?.forEach((a, idx) => {
        console.log(`  [${idx}] ${a.player?.username || 'UNKNOWN'}:`, {
            answeredAt: a.answered_at ? 'YES - ' + new Date(a.answered_at).toLocaleTimeString() : 'NO',
            answerText: a.answer_text ? `YES - "${a.answer_text.substring(0, 30)}"` : 'NO',
            isAnswered: !!(a.answered_at || a.answer_text)
        });
    });
    
    console.log('--- ANSWER COUNT ---');
    console.log('Answered Count:', answeredCount);
    console.log('Total Players:', totalPlayers);
    console.log('Comparison: answeredCount >= totalPlayers:', answeredCount >= totalPlayers);
    
    console.log('--- BUTTON STATE ---');
    console.log('Has Current User Answered:', hasAnswered);
    console.log('Is My Turn:', isMyTurn);
    console.log('Is Creator:', isCreator);
    console.log('Should show "Advance" button:', answeredCount >= totalPlayers && isCreator);
    console.log('Button will be:', (answeredCount >= totalPlayers && isCreator) ? 'ENABLED' : 'DISABLED');
    
    console.log('Current Round ID:', currentRoundId);
    console.log('Current Question:', currentQuestion?.question_text?.substring(0, 40));
    console.log('======================');
    
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
            <View style={styles.header}>
                <TouchableOpacity onPress={() => {
                    console.log('[GamePlay] Back button pressed');
                    console.log('[GamePlay] Router available:', !!router);
                    try {
                        router.replace('/');
                        console.log('[GamePlay] router.replace("/") called successfully');
                    } catch (error) {
                        console.error('[GamePlay] Error calling router.replace():', error);
                    }
                }} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Game</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity onPress={() => setInviteVisible(true)} style={styles.inviteButton}>
                        <Text style={styles.inviteText}>Invite</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        console.warn('🔴 🔴 🔴 END GAME BUTTON PRESSED 🔴 🔴 🔴');
                        console.warn('[GamePlay] End Game button pressed by user');
                        console.warn('[GamePlay] About to call endGame()');
                        endGame();
                        console.warn('[GamePlay] endGame() call completed');
                    }} style={styles.endGameButton}>
                        <Text style={styles.endGameText}>End Game</Text>
                    </TouchableOpacity>
                </View>
            </View>
            
            {/* End Game Modal */}
            <Modal
                visible={endGameModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setEndGameModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>End Game</Text>
                        <Text style={styles.modalMessage}>
                            Are you sure you want to end this game? This will delete the game session for all players.
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={styles.modalCancelButton}
                                onPress={() => {
                                    console.log('[GamePlay] Game end cancelled');
                                    setEndGameModalVisible(false);
                                }}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.modalConfirmButton}
                                onPress={confirmEndGame}
                            >
                                <Text style={styles.modalConfirmText}>End Game</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            
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

                {/* Invite Overlay */}
                <Modal visible={inviteVisible} transparent animationType="fade" onRequestClose={() => setInviteVisible(false)}>
                    <View style={styles.modalBackdrop}>
                        <View style={styles.inviteModal}>
                            <Text style={styles.inviteTitle}>Invite Friends</Text>
                            <Text style={styles.inviteSubtitle}>Share your room code or a link</Text>
                            <View style={styles.inviteInfoBox}>
                                <Text style={styles.inviteInfoText}>Code: {getInviteCode() || 'N/A'}</Text>
                                {getAppInviteURL() ? (
                                    <TouchableOpacity onPress={() => Linking.openURL(getAppInviteURL())}>
                                        <Text style={styles.inviteLinkText}>{getAppInviteURL()}</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <Text style={styles.inviteInfoText}>App link unavailable</Text>
                                )}
                                {getWebInviteURL() ? (
                                    <TouchableOpacity onPress={() => Linking.openURL(getWebInviteURL())}>
                                        <Text style={styles.inviteLinkText}>{getWebInviteURL()}</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <Text style={styles.inviteInfoText}>Web link not configured</Text>
                                )}
                            </View>
                            <View style={{ height: 12 }} />
                            <TouchableOpacity style={styles.inviteAction} onPress={copyGameCode}>
                                <Text style={styles.inviteActionText}>Copy Game Code</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.inviteAction} onPress={copyAppLink}>
                                <Text style={styles.inviteActionText}>Copy App Link</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.inviteAction} onPress={copyWebLink}>
                                <Text style={styles.inviteActionText}>Copy Web Link</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.inviteAction} onPress={shareInviteOS}>
                                <Text style={styles.inviteActionText}>Share via…</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.inviteAction} onPress={shareToMessages}>
                                <Text style={styles.inviteActionText}>Share to Messages</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.inviteAction, styles.inviteCancel]} onPress={() => setInviteVisible(false)}>
                                <Text style={[styles.inviteActionText, { color: '#ff3b30' }]}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* Game Code Display */}
                <View style={styles.gameCodeCard}>
                    <Text style={styles.gameCodeLabel}>Game Code</Text>
                    <View style={styles.gameCodeContainer}>
                        <Text style={styles.gameCodeText}>{session.game_code || initialGameCode || '— — — — — —'}</Text>
                        <TouchableOpacity 
                            style={styles.copyButton}
                            onPress={copyGameCode}
                        >
                            <Text style={styles.copyButtonText}>
                                {copiedCode ? '✓ Copied!' : 'Copy'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.inviteSecondaryButton}
                            onPress={() => setInviteVisible(true)}
                        >
                            <Text style={styles.inviteSecondaryText}>Invite</Text>
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
                                {isCreator && (
                                    <View style={{ marginTop: 12 }}>
                                        <TouchableOpacity
                                            style={[styles.nextRoundButton, answeredCount < totalPlayers && styles.nextRoundButtonDisabled]}
                                            onPress={advanceToNextRound}
                                            disabled={answeredCount < totalPlayers}
                                        >
                                            <Text style={styles.nextRoundButtonText}>
                                                {answeredCount >= totalPlayers ? 'Advance to Next Round' : `Waiting for players (${answeredCount}/${totalPlayers})`}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                </View>

                {/* Category Selection (only on your turn, before question appears) */}
                {isMyTurn && !currentQuestion ? (
                    <ScrollView style={styles.categoryScrollView} horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.categoryContainer}>
                            {categories.map((cat) => (
                                <TouchableOpacity key={cat.id} style={styles.categoryButton} onPress={() => selectCategory(cat.id)}>
                                    <Text style={styles.categoryButtonText}>{cat.label}</Text>
                                    <Text style={styles.categoryRange}>{cat.range}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                ) : null}


                {/* Current Question */}
                {currentQuestion && (
                    <View style={styles.questionCard}>
                        <View style={styles.questionHeader}>
                            <Text style={styles.questionNumber}>
                                Question {currentQuestion.order ?? '?'}
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
                                {currentRound?.answers && session?.players && (
                                    <Text style={styles.answersCount}>
                                        {currentRound.answers.length} / {session.players.length} answered
                                    </Text>
                                )}
                            </View>
                        ) : (
                            <>
                                {console.log('[AnswerInput] Rendering input - user can submit', { hasAnswered, userUsername: user?.username })}
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
                                    {round.picker && <Text style={styles.roundPicker}>Picked by {round.picker.username}</Text>}
                                </View>
                                <View style={styles.answersContainer}>
                                    {round.picker_answer && (
                                        <>
                                            <Text style={styles.pickerAnswerLabel}>Picker's Answer:</Text>
                                            <Text style={styles.pickerAnswer}>{round.picker_answer}</Text>
                                        </>
                                    )}
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
    inviteButton: {
        padding: 8,
    },
    inviteText: {
        color: '#28a745',
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
    inviteSecondaryButton: {
        backgroundColor: '#1a73e8',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        marginLeft: 8,
    },
    inviteSecondaryText: {
        color: '#fff',
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
    nextRoundButton: {
        backgroundColor: '#28a745',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    nextRoundButtonDisabled: {
        backgroundColor: '#555',
    },
    nextRoundButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
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
    modalBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    inviteModal: {
        width: '85%',
        backgroundColor: '#111',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    inviteTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    inviteSubtitle: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    inviteAction: {
        backgroundColor: '#1a73e8',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    inviteCancel: {
        backgroundColor: '#222',
        borderWidth: 1,
        borderColor: '#333',
    },
    inviteActionText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    inviteInfoBox: {
        backgroundColor: '#222',
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
    },
    inviteInfoText: {
        color: '#ccc',
        fontSize: 12,
        marginTop: 4,
    },
    inviteLinkText: {
        color: '#1a73e8',
        fontSize: 12,
        marginTop: 6,
        textDecorationLine: 'underline',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#2a2a2a',
        borderRadius: 12,
        padding: 24,
        width: '80%',
        maxWidth: 400,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 12,
    },
    modalMessage: {
        fontSize: 14,
        color: '#ccc',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    modalCancelButton: {
        flex: 1,
        paddingVertical: 12,
        backgroundColor: '#555',
        borderRadius: 8,
        alignItems: 'center',
    },
    modalCancelText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    modalConfirmButton: {
        flex: 1,
        paddingVertical: 12,
        backgroundColor: '#d32f2f',
        borderRadius: 8,
        alignItems: 'center',
    },
    modalConfirmText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default GamePlay;
