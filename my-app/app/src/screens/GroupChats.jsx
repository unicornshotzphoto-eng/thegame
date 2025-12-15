import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../core/api';
import { showAlert } from '../utils/alert';

function GroupChats({ navigation }) {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadGroups();
    }, []);

    const loadGroups = async () => {
        try {
            setLoading(true);
            const response = await api.get('/quiz/groups/');
            setGroups(response.data.groups || []);
        } catch (error) {
            console.error('Load groups error:', error);
            showAlert('Error', 'Failed to load groups');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadGroups();
        setRefreshing(false);
    };

    const openGroup = (group) => {
        navigation.navigate('GroupChat', { groupId: group.id, groupName: group.name });
    };

    const createNewGroup = () => {
        navigation.navigate('CreateGroup');
    };

    const renderGroupItem = ({ item }) => (
        <TouchableOpacity style={styles.groupCard} onPress={() => openGroup(item)}>
            <View style={styles.groupIcon}>
                <Text style={styles.groupIconText}>👥</Text>
            </View>
            <View style={styles.groupInfo}>
                <Text style={styles.groupName}>{item.name}</Text>
                <Text style={styles.memberCount}>{item.member_count} members</Text>
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
    );

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
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#333',
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
