import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../core/api';
import { showAlert } from '../utils/alert';

function CreateGroup({ navigation }) {
    const [groupName, setGroupName] = useState('');
    const [friends, setFriends] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadFriends();
    }, []);

    const loadFriends = async () => {
        try {
            setLoading(true);
            const response = await api.get('/quiz/direct-messages/friends/');
            setFriends(response.data.friends || []);
        } catch (error) {
            console.error('Load friends error:', error);
            showAlert('Error', 'Failed to load friends');
        } finally {
            setLoading(false);
        }
    };

    const toggleMember = (userId) => {
        if (selectedMembers.includes(userId)) {
            setSelectedMembers(selectedMembers.filter(id => id !== userId));
        } else {
            if (selectedMembers.length >= 11) {
                showAlert('Limit Reached', 'Maximum 11 members can be selected (12 including you)');
                return;
            }
            setSelectedMembers([...selectedMembers, userId]);
        }
    };

    const createGroup = async () => {
        if (!groupName.trim()) {
            showAlert('Error', 'Please enter a group name');
            return;
        }

        if (selectedMembers.length === 0) {
            showAlert('Error', 'Please select at least one member');
            return;
        }

        try {
            setCreating(true);
            const response = await api.post('/quiz/groups/create/', {
                name: groupName,
                member_ids: selectedMembers
            });
            showAlert('Success', 'Group created successfully!');
            navigation.goBack();
        } catch (error) {
            console.error('Create group error:', error);
            const errorMsg = error.response?.data?.error || 'Failed to create group';
            showAlert('Error', errorMsg);
        } finally {
            setCreating(false);
        }
    };

    const renderFriendItem = ({ item }) => {
        const isSelected = selectedMembers.includes(item.id);
        
        return (
            <TouchableOpacity
                style={[styles.friendCard, isSelected && styles.friendCardSelected]}
                onPress={() => toggleMember(item.id)}
            >
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
                    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Create Group</Text>
                <Text style={styles.subtitle}>
                    Select up to 11 friends ({selectedMembers.length}/11)
                </Text>
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Group name"
                    placeholderTextColor="#888"
                    value={groupName}
                    onChangeText={setGroupName}
                    maxLength={100}
                />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1a73e8" />
                </View>
            ) : friends.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No friends to add</Text>
                    <Text style={styles.emptySubtext}>Add friends first to create a group</Text>
                </View>
            ) : (
                <FlatList
                    data={friends}
                    renderItem={renderFriendItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                />
            )}

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.createButton, (creating || selectedMembers.length === 0) && styles.createButtonDisabled]}
                    onPress={createGroup}
                    disabled={creating || selectedMembers.length === 0}
                >
                    {creating ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.createButtonText}>
                            Create Group ({selectedMembers.length + 1} members)
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
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
        marginBottom: 4,
    },
    subtitle: {
        color: '#888',
        fontSize: 14,
    },
    inputContainer: {
        padding: 16,
        backgroundColor: '#111',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    input: {
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
        borderWidth: 2,
        borderColor: '#333',
    },
    friendCardSelected: {
        borderColor: '#1a73e8',
        backgroundColor: '#1a2a3a',
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
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#666',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxSelected: {
        backgroundColor: '#1a73e8',
        borderColor: '#1a73e8',
    },
    checkmark: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        padding: 16,
        backgroundColor: '#111',
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    createButton: {
        backgroundColor: '#1a73e8',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    createButtonDisabled: {
        backgroundColor: '#555',
    },
    createButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CreateGroup;
