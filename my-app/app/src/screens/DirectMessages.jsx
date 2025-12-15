import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../core/api';
import { showAlert } from '../utils/alert';

function DirectMessages({ navigation }) {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadFriends();
    }, []);

    const loadFriends = async () => {
        try {
            setLoading(true);
            const response = await api.get('/quiz/friends/');
            setFriends(response.data.friends || []);
        } catch (error) {
            console.error('Load friends error:', error);
            showAlert('Error', 'Failed to load friends');
        } finally {
            setLoading(false);
        }
    };

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

    const renderFriendItem = ({ item }) => (
        <TouchableOpacity style={styles.friendCard} onPress={() => openChat(item)}>
            <View style={styles.friendInfo}>
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
                </View>
                <View style={styles.arrow}>
                    <Text style={styles.arrowText}>›</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Direct Messages</Text>
            </View>

            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1a73e8" />
                </View>
            ) : friends.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No friends to message</Text>
                    <Text style={styles.emptySubtext}>Add friends to start chatting</Text>
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
