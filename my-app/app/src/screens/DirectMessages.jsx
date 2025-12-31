import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import api from '../core/api';
import { showAlert } from '../utils/alert';

function DirectMessages({ navigation }) {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [activeGames, setActiveGames] = useState([]);

    const loadFriends = useCallback(async () => {
        try {
            setLoading(true);
            const [friendsResponse, gamesResponse] = await Promise.all([
                api.get('/quiz/friends/'),
                api.get('/quiz/games/')
            ]);
            setFriends(friendsResponse.data.friends || []);
            setActiveGames(gamesResponse.data.sessions || []);
        } catch (error) {
            console.error('Load friends error:', error);
            showAlert('Error', 'Failed to load friends');
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadFriends();
        }, [loadFriends])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadFriends();
        setRefreshing(false);
    };

    const openChat = (friend) => {
        // Navigate to direct message chat with this friend
        navigation.navigate('DirectChat', { 
            friendId: friend.id, 
            friendName: friend.username,
            friendThumbnail: friend.thumbnail 
        });
    };

    const startGame = async (friend) => {
        try {
            // First check if there's an active game session with this friend
            const activeGamesResponse = await api.get('/quiz/games/');
            const existingGame = activeGamesResponse.data.sessions?.find(session => {
                // Check if this is a direct game with this specific friend
                return session.session_type === 'direct' && 
                       session.participants.some(p => p.id === friend.id);
            });

            if (existingGame) {
                console.log('Found existing game session:', existingGame.id);
                if (navigation?.push) {
                    navigation.push({ pathname: 'GamePlay', params: { sessionId: existingGame.id } });
                } else if (navigation?.navigate) {
                    navigation.navigate('GamePlay', { sessionId: existingGame.id });
                }
            } else {
                // Create new game session
                console.log('Creating new game session with friend:', friend.id);
                const response = await api.post('/quiz/games/create/', {
                    session_type: 'direct',
                    participant_ids: [friend.id]
                });
                
                if (navigation?.push) {
                    navigation.push({ pathname: 'GamePlay', params: { sessionId: response.data.id } });
                } else if (navigation?.navigate) {
                    navigation.navigate('GamePlay', { sessionId: response.data.id });
                }
            }
        } catch (error) {
            console.error('Start game error:', error);
            showAlert('Error', 'Failed to start game');
        }
    };

    const renderFriendItem = ({ item }) => {
        // Check if there's an active game with this friend
        const activeGame = activeGames.find(session => 
            session.session_type === 'direct' && 
            session.participants.some(p => p.id === item.id)
        );

        return (
            <View style={styles.friendCard}>
                <TouchableOpacity style={styles.friendInfo} onPress={() => openChat(item)}>
                    {item.thumbnail ? (
                        <Image source={{ uri: item.thumbnail }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Text style={styles.avatarText}>{item.username.charAt(0).toUpperCase()}</Text>
                        </View>
                    )}
                    <View style={styles.friendDetails}>
                        <Text style={styles.username}>{item.username}</Text>
                        <Text style={styles.email}>{item.email}</Text>
                        {activeGame && (
                            <Text style={styles.activeGameIndicator}>🎮 Game in progress</Text>
                        )}
                    </View>
                    <View style={styles.arrow}>
                        <Text style={styles.arrowText}>›</Text>
                    </View>
                </TouchableOpacity>
                {activeGame ? (
                    <TouchableOpacity 
                        style={[styles.startGameButton, styles.joinGameButton]} 
                        onPress={() => {
                            if (navigation?.push) {
                                navigation.push({ pathname: 'GamePlay', params: { sessionId: activeGame.id } });
                            } else if (navigation?.navigate) {
                                navigation.navigate('GamePlay', { sessionId: activeGame.id });
                            }
                        }}
                    >
                        <Text style={styles.startGameText}>🎮 Join Game</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.startGameButton} onPress={() => startGame(item)}>
                        <Text style={styles.startGameText}>🎮 Start Game</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const navigateToSearch = () => {
        navigation.navigate('Search');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Direct Messages</Text>
                <TouchableOpacity style={styles.addButton} onPress={navigateToSearch}>
                    <Text style={styles.addButtonText}>+ Add Friends</Text>
                </TouchableOpacity>
            </View>

            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1a73e8" />
                </View>
            ) : friends.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No friends to message</Text>
                    <Text style={styles.emptySubtext}>Add friends to start chatting</Text>
                    <TouchableOpacity style={styles.emptyButton} onPress={navigateToSearch}>
                        <Text style={styles.emptyButtonText}>Search Users</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={friends}
                    renderItem={renderFriendItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1a73e8" />
                    }
                />
            )}
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
        padding: 16,
        backgroundColor: '#111',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    title: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    addButton: {
        backgroundColor: '#1a73e8',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        color: '#888',
        fontSize: 18,
        marginBottom: 8,
    },
    emptySubtext: {
        color: '#666',
        fontSize: 14,
        marginBottom: 16,
    },
    emptyButton: {
        backgroundColor: '#1a73e8',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    emptyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    listContainer: {
        padding: 16,
    },
    friendCard: {
        backgroundColor: '#111',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#333',
    },
    friendInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    startGameButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        alignItems: 'center',
    },
    joinGameButton: {
        backgroundColor: '#28a745',
    },
    startGameText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    activeGameIndicator: {
        color: '#28a745',
        fontSize: 12,
        marginTop: 2,
        fontWeight: '600',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    avatarPlaceholder: {
        backgroundColor: '#1a73e8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    friendDetails: {
        flex: 1,
    },
    username: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    email: {
        color: '#888',
        fontSize: 14,
    },
    arrow: {
        marginLeft: 8,
    },
    arrowText: {
        color: '#666',
        fontSize: 24,
    },
});

export default DirectMessages;
