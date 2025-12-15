import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../core/api';
import { showAlert } from '../utils/alert';

function Friends() {
    const [activeTab, setActiveTab] = useState('friends'); // 'friends', 'requests', 'sent'
    const [friends, setFriends] = useState([]);
    const [receivedRequests, setReceivedRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [processingRequest, setProcessingRequest] = useState({});

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        try {
            setLoading(true);
            if (activeTab === 'friends') {
                await loadFriends();
            } else {
                await loadRequests();
            }
        } catch (error) {
            console.error('Load data error:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadFriends = async () => {
        try {
            const response = await api.get('/quiz/friends/');
            setFriends(response.data.friends || []);
        } catch (error) {
            console.error('Load friends error:', error);
            showAlert('Error', 'Failed to load friends');
        }
    };

    const loadRequests = async () => {
        try {
            const response = await api.get('/quiz/friends/requests/');
            setReceivedRequests(response.data.received || []);
            setSentRequests(response.data.sent || []);
        } catch (error) {
            console.error('Load requests error:', error);
            showAlert('Error', 'Failed to load friend requests');
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const respondToRequest = async (requestId, action) => {
        try {
            setProcessingRequest(prev => ({ ...prev, [requestId]: true }));
            await api.post(`/quiz/friends/request/${requestId}/respond/`, { action });
            showAlert('Success', `Friend request ${action}ed!`);
            await loadRequests();
            if (action === 'accept') {
                await loadFriends();
            }
        } catch (error) {
            console.error('Respond to request error:', error);
            showAlert('Error', `Failed to ${action} friend request`);
        } finally {
            setProcessingRequest(prev => ({ ...prev, [requestId]: false }));
        }
    };

    const renderFriendItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.userInfo}>
                {item.thumbnail ? (
                    <Image source={{ uri: item.thumbnail }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Text style={styles.avatarText}>{item.username.charAt(0).toUpperCase()}</Text>
                    </View>
                )}
                <View style={styles.userDetails}>
                    <Text style={styles.username}>{item.username}</Text>
                    <Text style={styles.email}>{item.email}</Text>
                </View>
            </View>
        </View>
    );

    const renderReceivedRequestItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.userInfo}>
                {item.from_user.thumbnail ? (
                    <Image source={{ uri: item.from_user.thumbnail }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Text style={styles.avatarText}>{item.from_user.username.charAt(0).toUpperCase()}</Text>
                    </View>
                )}
                <View style={styles.userDetails}>
                    <Text style={styles.username}>{item.from_user.username}</Text>
                    <Text style={styles.email}>{item.from_user.email}</Text>
                </View>
            </View>
            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={[styles.acceptButton, processingRequest[item.id] && styles.buttonDisabled]}
                    onPress={() => respondToRequest(item.id, 'accept')}
                    disabled={processingRequest[item.id]}
                >
                    {processingRequest[item.id] ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Accept</Text>
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.rejectButton, processingRequest[item.id] && styles.buttonDisabled]}
                    onPress={() => respondToRequest(item.id, 'reject')}
                    disabled={processingRequest[item.id]}
                >
                    <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderSentRequestItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.userInfo}>
                {item.to_user.thumbnail ? (
                    <Image source={{ uri: item.to_user.thumbnail }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Text style={styles.avatarText}>{item.to_user.username.charAt(0).toUpperCase()}</Text>
                    </View>
                )}
                <View style={styles.userDetails}>
                    <Text style={styles.username}>{item.to_user.username}</Text>
                    <Text style={styles.email}>{item.to_user.email}</Text>
                    <Text style={styles.pendingText}>Pending...</Text>
                </View>
            </View>
        </View>
    );

    const renderContent = () => {
        if (loading && !refreshing) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1a73e8" />
                </View>
            );
        }

        if (activeTab === 'friends') {
            if (friends.length === 0) {
                return (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No friends yet</Text>
                        <Text style={styles.emptySubtext}>Search for users to add as friends</Text>
                    </View>
                );
            }
            return (
                <FlatList
                    data={friends}
                    renderItem={renderFriendItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1a73e8" />
                    }
                />
            );
        }

        if (activeTab === 'requests') {
            if (receivedRequests.length === 0) {
                return (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No pending requests</Text>
                    </View>
                );
            }
            return (
                <FlatList
                    data={receivedRequests}
                    renderItem={renderReceivedRequestItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1a73e8" />
                    }
                />
            );
        }

        if (activeTab === 'sent') {
            if (sentRequests.length === 0) {
                return (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No sent requests</Text>
                    </View>
                );
            }
            return (
                <FlatList
                    data={sentRequests}
                    renderItem={renderSentRequestItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1a73e8" />
                    }
                />
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
                    onPress={() => setActiveTab('friends')}
                >
                    <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
                        Friends ({friends.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
                    onPress={() => setActiveTab('requests')}
                >
                    <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
                        Requests ({receivedRequests.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'sent' && styles.activeTab]}
                    onPress={() => setActiveTab('sent')}
                >
                    <Text style={[styles.tabText, activeTab === 'sent' && styles.activeTabText]}>
                        Sent ({sentRequests.length})
                    </Text>
                </TouchableOpacity>
            </View>
            {renderContent()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#111',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#1a73e8',
    },
    tabText: {
        color: '#888',
        fontSize: 14,
        fontWeight: '600',
    },
    activeTabText: {
        color: '#1a73e8',
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
    card: {
        backgroundColor: '#111',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#333',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
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
    userDetails: {
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
    pendingText: {
        color: '#ffa500',
        fontSize: 12,
        marginTop: 4,
        fontStyle: 'italic',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    acceptButton: {
        flex: 1,
        backgroundColor: '#28a745',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    rejectButton: {
        flex: 1,
        backgroundColor: '#dc3545',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#555',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default Friends;
