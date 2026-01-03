import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../core/api';
import { showAlert } from '../utils/alert';
import { THEME } from '../constants/appTheme';
import { getAuthToken } from '../core/secureStorage';
import useStore from '../core/global';
import BackgroundWrapper from '../components/BackgroundWrapper';

function Search({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [sendingRequest, setSendingRequest] = useState({});
    const authenticated = useStore((state) => state.authenticated);
    const user = useStore((state) => state.user);

    useEffect(() => {
        const checkAuth = async () => {
            const token = await getAuthToken();
            console.log('Auth check - Token exists:', !!token);
            console.log('Auth check - Zustand authenticated:', authenticated);
            console.log('Auth check - User:', user?.username);
        };
        checkAuth();
    }, []);

    useEffect(() => {
        const searchUsers = async () => {
            try {
                setLoading(true);
                console.log('Searching for:', searchQuery);
                
                // Check token before making request
                const token = await getAuthToken();
                if (!token) {
                    console.error('No auth token found - user needs to login');
                    showAlert('Error', 'Please sign in to search users');
                    setLoading(false);
                    return;
                }
                
                const response = await api.get(`/quiz/search/users/?q=${encodeURIComponent(searchQuery)}`);
                console.log('Search response:', response.data);
                setUsers(response.data.users || []);
                setHasSearched(true);
            } catch (error) {
                console.error('Search error:', error);
                console.error('Error response:', error.response?.data);
                console.error('Error status:', error.response?.status);
                
                if (error.response?.status === 401) {
                    showAlert('Session Expired', 'Please sign in again to continue');
                } else {
                    showAlert('Error', error.response?.data?.detail || 'Failed to search users');
                }
            } finally {
                setLoading(false);
            }
        };

        const delaySearch = setTimeout(() => {
            if (searchQuery.trim()) {
                searchUsers();
            } else {
                setUsers([]);
                setHasSearched(false);
            }
        }, 500); // Debounce search by 500ms

        return () => clearTimeout(delaySearch);
    }, [searchQuery]);

    const sendFriendRequest = async (userId) => {
        try {
            setSendingRequest(prev => ({ ...prev, [userId]: true }));
            await api.post('/quiz/friends/request/send/', { to_user_id: userId });
            showAlert('Success', 'Friend request sent!');
        } catch (error) {
            console.error('Send friend request error:', error);
            const errorMsg = error.response?.data?.error || 'Failed to send friend request';
            showAlert('Error', errorMsg);
        } finally {
            setSendingRequest(prev => ({ ...prev, [userId]: false }));
        }
    };

    const renderUserItem = ({ item }) => (
        <View style={styles.userCard}>
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
                <TouchableOpacity
                    style={[styles.addButton, sendingRequest[item.id] && styles.addButtonDisabled]}
                    onPress={() => sendFriendRequest(item.id)}
                    disabled={sendingRequest[item.id]}
                >
                    {sendingRequest[item.id] ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.addButtonText}>Add Friend</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <BackgroundWrapper overlayOpacity={0.5}>
            <SafeAreaView style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search users by username or email..."
                    placeholderTextColor="#888"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
            </View>

            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1a73e8" />
                </View>
            )}

            {!loading && hasSearched && users.length === 0 && (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No users found</Text>
                </View>
            )}

            {!loading && !hasSearched && (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Search for users to connect</Text>
                </View>
            )}

            {!loading && users.length > 0 && (
                <FlatList
                    data={users}
                    renderItem={renderUserItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
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
    searchContainer: {
        padding: 16,
        backgroundColor: 'rgba(139, 69, 19, 0.4)',
        borderBottomWidth: 2,
        borderBottomColor: '#D4A574',
    },
    searchInput: {
        backgroundColor: 'rgba(43, 24, 16, 0.6)',
        color: '#E8C9A0',
        padding: THEME.spacing.md,
        borderRadius: THEME.borderRadius.md,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#D4A574',
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
    },
    emptyText: {
        color: '#C8A882',
        fontSize: 16,
    },
    listContainer: {
        padding: THEME.spacing.lg,
    },
    userCard: {
        backgroundColor: 'rgba(139, 69, 19, 0.4)',
        borderRadius: THEME.borderRadius.lg,
        padding: THEME.spacing.lg,
        marginBottom: THEME.spacing.md,
        borderWidth: 2,
        borderColor: '#D4A574',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: THEME.spacing.md,
    },
    avatarPlaceholder: {
        backgroundColor: '#D4A574',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#2B1810',
        fontSize: 20,
        fontWeight: 'bold',
    },
    userDetails: {
        flex: 1,
    },
    username: {
        color: '#E8C9A0',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: THEME.spacing.sm,
    },
    email: {
        color: '#C8A882',
        fontSize: 14,
    },
    addButton: {
        backgroundColor: '#D4A574',
        paddingHorizontal: THEME.spacing.lg,
        paddingVertical: THEME.spacing.md,
        borderRadius: THEME.borderRadius.md,
        minWidth: 100,
        alignItems: 'center',
    },
    addButtonDisabled: {
        backgroundColor: '#C8A882',
    },
    addButtonText: {
        color: '#2B1810',
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default Search;