import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../core/api';
import { showAlert } from '../utils/alert';

function Search() {
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
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

    const searchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/quiz/search/users/?q=${encodeURIComponent(searchQuery)}`);
            setUsers(response.data.users || []);
            setHasSearched(true);
        } catch (error) {
            console.error('Search error:', error);
            showAlert('Error', 'Failed to search users');
        } finally {
            setLoading(false);
        }
    };

    const renderUserItem = ({ item }) => (
        <TouchableOpacity style={styles.userCard}>
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
        </TouchableOpacity>
    );

    return (
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
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    searchContainer: {
        padding: 16,
        backgroundColor: '#111',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    searchInput: {
        backgroundColor: '#222',
        color: '#fff',
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
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
        color: '#888',
        fontSize: 16,
    },
    listContainer: {
        padding: 16,
    },
    userCard: {
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
});

export default Search;