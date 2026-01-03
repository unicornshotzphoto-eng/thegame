import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import api from '../core/api';
import { showAlert } from '../utils/alert';
import BackgroundWrapper from '../components/BackgroundWrapper';

function DirectMessages({ navigation }) {
    const router = useRouter();
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [addFriendModalVisible, setAddFriendModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    const loadFriends = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/quiz/direct-messages/friends/');
            console.log('[DirectMessages] Full response:', response.data);
            console.log('[DirectMessages] Friends loaded:', response.data.friends);
            const friendsData = response.data.friends || response.data || [];
            setFriends(Array.isArray(friendsData) ? friendsData : []);
        } catch (error) {
            console.error('[DirectMessages] Load friends error:', error.response?.data || error.message);
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

    const searchUsers = useCallback(async (query) => {
        setSearchQuery(query);
        if (query.length < 1) {
            setSearchResults([]);
            return;
        }
        
        try {
            setSearching(true);
            const response = await api.get(`/quiz/search/users/?q=${query}`);
            console.log('[DirectMessages] Search results:', response.data);
            
            // Filter out users that are already friends
            const friendIds = friends.map(f => f.id);
            const results = response.data.users.filter(user => !friendIds.includes(user.id));
            setSearchResults(results);
        } catch (error) {
            console.error('[DirectMessages] Search error:', error);
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    }, [friends]);

    const addFriend = useCallback(async (userId) => {
        try {
            console.log('[DirectMessages] Adding friend:', userId);
            await api.post('/quiz/direct-messages/add-friend/', { friend_id: userId });
            showAlert('Success', 'Friend added!');
            await loadFriends();
            setSearchQuery('');
            setSearchResults([]);
        } catch (error) {
            console.error('[DirectMessages] Add friend error:', error);
            showAlert('Error', error.response?.data?.error || 'Failed to add friend');
        }
    }, [loadFriends]);

    const removeFriend = useCallback((friendId) => {
        Alert.alert('Remove Friend', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: async () => {
                    try {
                        console.log('[DirectMessages] Removing friend:', friendId);
                        await api.post('/quiz/direct-messages/remove-friend/', { friend_id: friendId });
                        showAlert('Success', 'Friend removed');
                        await loadFriends();
                    } catch (error) {
                        console.error('[DirectMessages] Remove friend error:', error);
                        showAlert('Error', 'Failed to remove friend');
                    }
                }
            }
        ]);
    }, [loadFriends]);

    const openChat = (friend) => {
        console.log('[DirectMessages] Opening chat with:', friend.username, friend.id);
        router.push({
            pathname: '/DirectChat',
            params: {
                friendId: friend.id.toString(),
                friendName: friend.username,
                friendThumbnail: friend.thumbnail || ''
            }
        });
    };

    const renderFriendItem = ({ item }) => (
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
                    <Text style={styles.onlineStatus}>👤 Friend</Text>
                </View>
                <View style={styles.arrow}>
                    <Text style={styles.arrowText}>›</Text>
                </View>
            </TouchableOpacity>
            <View style={styles.buttonRow}>
                <TouchableOpacity 
                    style={[styles.actionButton, styles.messageButton]} 
                    onPress={() => openChat(item)}
                >
                    <Text style={styles.buttonText}>💬 Message</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.actionButton, styles.removeButton]} 
                    onPress={() => removeFriend(item.id)}
                >
                    <Text style={styles.removeButtonText}>✕ Remove</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderSearchResult = ({ item }) => (
        <TouchableOpacity style={styles.searchResultItem} onPress={() => addFriend(item.id)}>
            {item.thumbnail ? (
                <Image source={{ uri: item.thumbnail }} style={styles.smallAvatar} />
            ) : (
                <View style={[styles.smallAvatar, styles.avatarPlaceholder]}>
                    <Text style={styles.avatarText}>{item.username.charAt(0).toUpperCase()}</Text>
                </View>
            )}
            <View style={styles.resultDetails}>
                <Text style={styles.resultUsername}>{item.username}</Text>
                <Text style={styles.resultEmail}>{item.email}</Text>
            </View>
            <TouchableOpacity 
                style={styles.addButton}
                onPress={() => addFriend(item.id)}
            >
                <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <BackgroundWrapper overlayOpacity={0.5}>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Messages</Text>
                    <TouchableOpacity 
                    style={styles.addFriendButton} 
                    onPress={() => setAddFriendModalVisible(true)}
                >
                    <Text style={styles.addFriendText}>+ Friends</Text>
                </TouchableOpacity>
            </View>

            {/* Add Friend Modal */}
            <Modal
                visible={addFriendModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setAddFriendModalVisible(false)}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Add Friends</Text>
                        <TouchableOpacity onPress={() => setAddFriendModalVisible(false)}>
                            <Text style={styles.closeButton}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchBox}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search users..."
                            placeholderTextColor="#999"
                            value={searchQuery}
                            onChangeText={searchUsers}
                        />
                    </View>

                    {searching ? (
                        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
                    ) : (
                        <FlatList
                            data={searchResults}
                            keyExtractor={item => item.id.toString()}
                            renderItem={renderSearchResult}
                            ListEmptyComponent={
                                searchQuery.length > 0 ? (
                                    <Text style={styles.emptyText}>No users found</Text>
                                ) : (
                                    <Text style={styles.emptyText}>Search to add friends</Text>
                                )
                            }
                            style={styles.searchResultsList}
                        />
                    )}
                </SafeAreaView>
            </Modal>

            {/* Friends List */}
            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            ) : (
                <FlatList
                    data={friends}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderFriendItem}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyTitle}>No friends yet</Text>
                            <Text style={styles.emptySubtitle}>Tap "+ Friends" to add someone to chat with</Text>
                        </View>
                    }
                    style={styles.list}
                />
            )}
        </SafeAreaView>
        </BackgroundWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(139, 69, 19, 0.4)',
        borderBottomWidth: 2,
        borderBottomColor: '#D4A574',
    },
    title: {
        color: '#E8C9A0',
        fontSize: 24,
        fontWeight: 'bold',
    },
    addFriendButton: {
        backgroundColor: '#D4A574',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addFriendText: {
        color: '#2B1810',
        fontSize: 14,
        fontWeight: '600',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        flex: 1,
    },
    friendCard: {
        backgroundColor: 'rgba(139, 69, 19, 0.4)',
        borderBottomWidth: 2,
        borderBottomColor: '#D4A574',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    friendInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
        backgroundColor: '#D4A574',
    },
    avatarPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#D4A574',
    },
    avatarText: {
        color: '#2B1810',
        fontSize: 20,
        fontWeight: 'bold',
    },
    friendDetails: {
        flex: 1,
    },
    username: {
        color: '#E8C9A0',
        fontSize: 16,
        fontWeight: '600',
    },
    email: {
        color: '#C8A882',
        fontSize: 12,
        marginTop: 4,
    },
    onlineStatus: {
        color: '#D4A574',
        fontSize: 12,
        marginTop: 4,
    },
    arrow: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 24,
    },
    arrowText: {
        color: '#D4A574',
        fontSize: 24,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 6,
        alignItems: 'center',
    },
    messageButton: {
        backgroundColor: '#D4A574',
    },
    removeButton: {
        backgroundColor: 'rgba(139, 69, 19, 0.4)',
        borderWidth: 1,
        borderColor: '#D4A574',
    },
    buttonText: {
        color: '#2B1810',
        fontSize: 12,
        fontWeight: '600',
    },
    removeButtonText: {
        color: '#D4A574',
        fontSize: 12,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyTitle: {
        color: '#E8C9A0',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        color: '#C8A882',
        fontSize: 14,
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(139, 69, 19, 0.4)',
        borderBottomWidth: 2,
        borderBottomColor: '#D4A574',
    },
    modalTitle: {
        color: '#E8C9A0',
        fontSize: 20,
        fontWeight: '600',
    },
    closeButton: {
        color: '#D4A574',
        fontSize: 24,
        fontWeight: '600',
    },
    searchBox: {
        padding: 12,
        backgroundColor: 'rgba(139, 69, 19, 0.4)',
        borderBottomWidth: 1,
        borderBottomColor: '#D4A574',
    },
    searchInput: {
        backgroundColor: 'rgba(43, 24, 16, 0.6)',
        color: '#E8C9A0',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        fontSize: 14,
        borderWidth: 1,
        borderColor: '#D4A574',
    },
    searchResultsList: {
        flex: 1,
    },
    searchResultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#D4A574',
    },
    smallAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        backgroundColor: '#D4A574',
    },
    resultDetails: {
        flex: 1,
    },
    resultUsername: {
        color: '#E8C9A0',
        fontSize: 14,
        fontWeight: '600',
    },
    resultEmail: {
        color: '#C8A882',
        fontSize: 12,
        marginTop: 4,
    },
    addButton: {
        backgroundColor: '#D4A574',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    addButtonText: {
        color: '#2B1810',
        fontSize: 12,
        fontWeight: '600',
    },
    emptyText: {
        color: '#C8A882',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 20,
    },
});

export default DirectMessages;
