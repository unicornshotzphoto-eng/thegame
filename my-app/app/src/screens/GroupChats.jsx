import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import api from '../core/api';
import { showAlert } from '../utils/alert';

function GroupChats({ navigation }) {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [activeGames, setActiveGames] = useState([]);

    const loadGroups = useCallback(async () => {
        try {
            setLoading(true);
            const [groupsResponse, gamesResponse] = await Promise.all([
                api.get('/quiz/groups/'),
                api.get('/quiz/game/active/')
            ]);
            setGroups(groupsResponse.data.groups || []);
            setActiveGames(gamesResponse.data.sessions || []);
        } catch (error) {
            console.error('Load groups error:', error);
            showAlert('Error', 'Failed to load groups');
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadGroups();
        }, [loadGroups])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadGroups();
        setRefreshing(false);
    };

    const openGroup = (group) => {
        navigation.navigate('GroupChat', { groupId: group.id, groupName: group.name });
    };

    const startGame = async (group) => {
        try {
            // First check if there's an active game session for this group
            const activeGamesResponse = await api.get('/quiz/game/active/');
            const existingGame = activeGamesResponse.data.sessions?.find(session => {
                // Check if this is a group game with this specific group
                return session.session_type === 'group' && 
                       session.group?.id === group.id;
            });

            if (existingGame) {
                console.log('Found existing game session:', existingGame.id);
                navigation.navigate('GamePlay', { sessionId: existingGame.id });
            } else {
                // Create new game session
                console.log('Creating new game session for group:', group.id);
                const response = await api.post('/quiz/game/create/', {
                    session_type: 'group',
                    group_id: group.id
                });
                
                navigation.navigate('GamePlay', { sessionId: response.data.id });
            }
        } catch (error) {
            console.error('Start game error:', error);
            showAlert('Error', 'Failed to start game');
        }
    };

    const createNewGroup = () => {
        navigation.navigate('CreateGroup');
    };

    const renderGroupItem = ({ item }) => {
        // Check if there's an active game for this group
        const activeGame = activeGames.find(session => 
            session.session_type === 'group' && 
            session.group?.id === item.id
        );

        return (
            <View style={styles.groupCard}>
                <TouchableOpacity style={styles.groupMainContent} onPress={() => openGroup(item)}>
                    <View style={styles.groupIcon}>
                        <Text style={styles.groupIconText}>👥</Text>
                    </View>
                    <View style={styles.groupInfo}>
                        <Text style={styles.groupName}>{item.name}</Text>
                        <Text style={styles.memberCount}>{item.member_count} members</Text>
                        {activeGame && (
                            <Text style={styles.activeGameIndicator}>🎮 Game in progress</Text>
                        )}
                        {item.last_message && (
                            <Text style={styles.lastMessage} numberOfLines={1}>
                                {item.last_message.sender}: {item.last_message.content}
                            </Text>
                        )}
                    </View>
                    <View style={styles.arrow}>
                        <Text style={styles.arrowText}>›</Text>
                    </View>
                </TouchableOpacity>
                {activeGame ? (
                    <TouchableOpacity 
                        style={[styles.startGameButton, styles.joinGameButton]} 
                        onPress={() => navigation.navigate('GamePlay', { sessionId: activeGame.id })}
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

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Group Chats</Text>
                <TouchableOpacity style={styles.createButton} onPress={createNewGroup}>
                    <Text style={styles.createButtonText}>+ New Group</Text>
                </TouchableOpacity>
            </View>

            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1a73e8" />
                </View>
            ) : groups.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No groups yet</Text>
                    <Text style={styles.emptySubtext}>Create a group to start chatting</Text>
                    <TouchableOpacity style={styles.emptyButton} onPress={createNewGroup}>
                        <Text style={styles.emptyButtonText}>Create Your First Group</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={groups}
                    renderItem={renderGroupItem}
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
    createButton: {
        backgroundColor: '#1a73e8',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    createButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
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
        marginBottom: 20,
    },
    emptyButton: {
        backgroundColor: '#1a73e8',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    emptyButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    listContainer: {
        padding: 16,
    },
    groupCard: {
        backgroundColor: '#111',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#333',
    },
    groupMainContent: {
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
    groupIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#1a73e8',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    groupIconText: {
        fontSize: 24,
    },
    groupInfo: {
        flex: 1,
    },
    groupName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    memberCount: {
        color: '#888',
        fontSize: 14,
        marginBottom: 2,
    },
    lastMessage: {
        color: '#666',
        fontSize: 13,
        marginTop: 4,
    },
    arrow: {
        marginLeft: 8,
    },
    arrowText: {
        color: '#666',
        fontSize: 24,
    },
});

export default GroupChats;
