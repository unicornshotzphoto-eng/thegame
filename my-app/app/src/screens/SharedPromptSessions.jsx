import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME } from '../constants/appTheme';
import Ionicons from '@expo/vector-icons/Ionicons';

const SharedPromptSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prompts, setPrompts] = useState([]);
  const [selectedPromptForInvite, setSelectedPromptForInvite] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [responses, setResponses] = useState([]);
  const [newResponse, setNewResponse] = useState('');
  const [friends, setFriends] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedFriendsToInvite, setSelectedFriendsToInvite] = useState([]);

  useEffect(() => {
    loadSessions();
    loadPrompts();
    loadFriends();
  }, []);

  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('secure_auth_token');
      return token;
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  };

  const loadSessions = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      if (!token) {
        Alert.alert('Error', 'Not authenticated');
        return;
      }

      const response = await fetch('http://localhost:8000/quiz/prompt-sessions/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      } else {
        Alert.alert('Error', 'Failed to load prompt sessions');
      }
    } catch (error) {
      console.error('Load sessions error:', error);
      Alert.alert('Error', 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  const loadPrompts = async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const response = await fetch('http://localhost:8000/quiz/prompts/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const promptsList = Array.isArray(data) ? data : data.prompts || data.results || [];
        setPrompts(promptsList);
      }
    } catch (error) {
      console.error('Load prompts error:', error);
    }
  };

  const loadFriends = async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const response = await fetch('http://localhost:8000/quiz/friends/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Friends loaded:', data);
        const friendsList = Array.isArray(data) ? data : data.friends || [];
        setFriends(friendsList);
      } else {
        console.error('Failed to load friends, status:', response.status);
      }
    } catch (error) {
      console.error('Load friends error:', error);
    }
  };

  const startPromptSession = async (prompt) => {
    try {
      setLoading(true);
      const token = await getAuthToken();

      // Create the session with the selected prompt
      const response = await fetch('http://localhost:8000/quiz/prompt-sessions/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt_id: prompt.id,
          title: prompt.prompt_text.substring(0, 50),
        }),
      });

      if (response.ok) {
        const sessionData = await response.json();
        setSelectedPromptForInvite(prompt);
        
        // Invite selected friends
        for (const friendId of selectedFriendsToInvite) {
          await fetch(`http://localhost:8000/quiz/prompt-sessions/${sessionData.id}/members/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              member_id: friendId,
            }),
          });
        }

        Alert.alert('Success', 'Prompt session created with friends');
        setShowInviteModal(false);
        setSelectedFriendsToInvite([]);
        loadSessions();
      } else {
        Alert.alert('Error', 'Failed to create session');
      }
    } catch (error) {
      console.error('Start session error:', error);
      Alert.alert('Error', 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  const loadSessionDetails = async (sessionId) => {
    try {
      const token = await getAuthToken();

      const response = await fetch(`http://localhost:8000/quiz/prompt-sessions/${sessionId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedSession(data);
        setResponses(data.responses || []);
      } else {
        Alert.alert('Error', 'Failed to load session details');
      }
    } catch (error) {
      console.error('Load session details error:', error);
      Alert.alert('Error', 'Connection error');
    }
  };

  const submitResponse = async () => {
    if (!newResponse.trim()) {
      Alert.alert('Error', 'Response cannot be empty');
      return;
    }

    try {
      setLoading(true);
      const token = await getAuthToken();

      const response = await fetch(`http://localhost:8000/quiz/prompt-sessions/${selectedSession.id}/responses/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          response: newResponse,
        }),
      });

      if (response.ok) {
        setNewResponse('');
        Alert.alert('Success', 'Response submitted');
        loadSessionDetails(selectedSession.id);
      } else {
        Alert.alert('Error', 'Failed to submit response');
      }
    } catch (error) {
      console.error('Submit response error:', error);
      Alert.alert('Error', 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  const inviteFriendToSession = async (friendId) => {
    try {
      setLoading(true);
      const token = await getAuthToken();

      const response = await fetch(`http://localhost:8000/quiz/prompt-sessions/${selectedSession.id}/members/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          member_id: friendId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedSession(data);
        Alert.alert('Success', 'Friend invited to session');
        setShowInviteModal(false);
        loadSessions();
      } else {
        Alert.alert('Error', 'Failed to invite friend');
      }
    } catch (error) {
      console.error('Invite friend error:', error);
      Alert.alert('Error', 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (sessionId) => {
    Alert.alert('Confirm', 'Delete this prompt session?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            const token = await getAuthToken();
            const response = await fetch(`http://localhost:8000/quiz/prompt-sessions/${sessionId}/`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            if (response.ok) {
              Alert.alert('Success', 'Session deleted');
              setSelectedSession(null);
              loadSessions();
            } else {
              Alert.alert('Error', 'Failed to delete session');
            }
          } catch (error) {
            console.error('Delete session error:', error);
            Alert.alert('Error', 'Connection error');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Collaborative Prompts</Text>
      </View>

      {loading && sessions.length === 0 ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={THEME.primary} />
        </View>
      ) : prompts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles" size={48} color="#999" />
          <Text style={styles.emptyStateText}>No prompts available</Text>
          <Text style={styles.emptyStateSubtext}>Create some prompts first</Text>
        </View>
      ) : (
        <FlatList
          data={prompts}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.promptCard}>
              <View style={styles.promptContent}>
                <Text style={styles.promptText} numberOfLines={3}>
                  {item.prompt_text}
                </Text>
                <View style={styles.promptMeta}>
                  <Text style={styles.metaText}>
                    {item.difficulty && `📊 ${item.difficulty}`}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.inviteButton}
                onPress={() => {
                  setSelectedPromptForInvite(item);
                  setSelectedFriendsToInvite([]);
                  setShowInviteModal(true);
                }}
              >
                <Ionicons name="add-circle" size={24} color="white" />
                <Text style={styles.inviteButtonText}>Share</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      {showInviteModal && selectedPromptForInvite && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            onPress={() => setShowInviteModal(false)}
            activeOpacity={1}
          />
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Invite Friends</Text>
              <TouchableOpacity onPress={() => setShowInviteModal(false)}>
                <Ionicons name="close" size={28} color={THEME.primary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Who would you like to respond to this prompt?
            </Text>

            {friends && friends.length > 0 ? (
              <FlatList
                data={friends}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.friendCheckbox}
                    onPress={() => {
                      if (selectedFriendsToInvite.includes(item.id)) {
                        setSelectedFriendsToInvite(selectedFriendsToInvite.filter(id => id !== item.id));
                      } else {
                        setSelectedFriendsToInvite([...selectedFriendsToInvite, item.id]);
                      }
                    }}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        selectedFriendsToInvite.includes(item.id) && styles.checkboxSelected,
                      ]}
                    >
                      {selectedFriendsToInvite.includes(item.id) && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </View>
                    <Text style={styles.friendName}>{item.username}</Text>
                  </TouchableOpacity>
                )}
                style={styles.friendsList}
                scrollEnabled={true}
              />
            ) : (
              <View style={styles.noFriendsContainer}>
                <Ionicons name="people" size={40} color="#ccc" />
                <Text style={styles.noFriendsText}>No friends to invite</Text>
              </View>
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.submitButton, selectedFriendsToInvite.length === 0 && styles.submitButtonDisabled]}
                onPress={() => startPromptSession(selectedPromptForInvite)}
                disabled={selectedFriendsToInvite.length === 0 || loading}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Creating...' : `Create with ${selectedFriendsToInvite.length} friend${selectedFriendsToInvite.length !== 1 ? 's' : ''}`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.primary,
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  promptCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: THEME.primary,
  },
  promptContent: {
    flex: 1,
    marginRight: 12,
  },
  promptText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  promptMeta: {
    marginTop: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#999',
  },
  inviteButton: {
    backgroundColor: THEME.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  inviteButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 10,
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
    minHeight: '50%',
    paddingBottom: 20,
    flexDirection: 'column',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    fontWeight: '500',
  },
  friendsList: {
    flex: 1,
    minHeight: 200,
  },
  noFriendsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  noFriendsText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
    textAlign: 'center',
  },
  modalFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'white',
  },
  friendCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxSelected: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  friendName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: THEME.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default SharedPromptSessions;
