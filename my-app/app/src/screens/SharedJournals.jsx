import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, FlatList, ActivityIndicator, Image, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME } from '../constants/appTheme';
import Ionicons from '@expo/vector-icons/Ionicons';

const SharedJournals = () => {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newJournalName, setNewJournalName] = useState('');
  const [newJournalDesc, setNewJournalDesc] = useState('');
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [journalEntries, setJournalEntries] = useState([]);
  const [newEntryContent, setNewEntryContent] = useState('');
  const [newEntryTitle, setNewEntryTitle] = useState('');
  const [friends, setFriends] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    loadJournals();
    loadFriends();
  }, []);

  const getAuthToken = async () => {
    try {
      // Try the secure storage key first
      const token = await AsyncStorage.getItem('secure_auth_token');
      console.log('AsyncStorage token:', token ? 'EXISTS' : 'MISSING');
      console.log('Full token:', token);
      return token;
    } catch (error) {
      console.error('Error retrieving token from AsyncStorage:', error);
      return null;
    }
  };

  const loadJournals = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      if (!token) {
        Alert.alert('Error', 'Not authenticated');
        return;
      }

      const response = await fetch('http://localhost:8000/quiz/journals/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setJournals(data.journals || []);
      } else {
        Alert.alert('Error', 'Failed to load journals');
      }
    } catch (error) {
      console.error('Load journals error:', error);
      Alert.alert('Error', 'Connection error');
    } finally {
      setLoading(false);
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
        setFriends(data.friends || []);
      }
    } catch (error) {
      console.error('Load friends error:', error);
    }
  };

  const createJournal = async () => {
    console.log('Create journal button pressed');
    console.log('Journal name:', newJournalName.trim());
    
    if (!newJournalName.trim()) {
      Alert.alert('Error', 'Journal name is required');
      return;
    }

    try {
      console.log('About to set loading...');
      setLoading(true);
      console.log('Getting auth token...');
      
      const token = await getAuthToken();
      console.log('Token retrieved:', token ? 'YES' : 'NO');
      
      if (!token) {
        console.error('No token found');
        Alert.alert('Not Authenticated', 'Please log in first to create journals');
        setLoading(false);
        return;
      }

      console.log('Creating journal with:', { name: newJournalName, description: newJournalDesc });

      const response = await fetch('http://localhost:8000/quiz/journals/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newJournalName,
          description: newJournalDesc,
        }),
      });

      console.log('Create journal response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Journal created successfully:', data);
        Alert.alert('Success', 'Journal created!');
        setNewJournalName('');
        setNewJournalDesc('');
        setShowCreateModal(false);
        loadJournals();
      } else {
        console.error('Failed to create journal:', response.status);
        const errorData = await response.text();
        console.error('Error response:', errorData);
        Alert.alert('Error', 'Failed to create journal');
      }
    } catch (error) {
      console.error('Create journal error:', error);
      console.error('Error details:', error.message, error.stack);
      Alert.alert('Error', error.message || 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  const loadJournalEntries = async (journalId) => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      if (!token) return;

      const response = await fetch(`http://localhost:8000/quiz/journals/${journalId}/entries/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Journal entries loaded:', data);
        setJournalEntries(data.entries || []);
      } else {
        console.error('Failed to load entries, status:', response.status);
      }
    } catch (error) {
      console.error('Load entries error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEntryToJournal = async () => {
    if (!newEntryContent.trim()) {
      Alert.alert('Error', 'Entry content is required');
      return;
    }

    try {
      setLoading(true);
      const token = await getAuthToken();
      if (!token) return;

      const response = await fetch(`http://localhost:8000/quiz/journals/${selectedJournal.id}/entries/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newEntryTitle,
          content: newEntryContent,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Entry added!');
        setNewEntryTitle('');
        setNewEntryContent('');
        loadJournalEntries(selectedJournal.id);
      } else {
        Alert.alert('Error', 'Failed to add entry');
      }
    } catch (error) {
      console.error('Add entry error:', error);
      Alert.alert('Error', 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  const inviteFriendToJournal = async (friendId) => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      if (!token) return;

      console.log('Inviting friend:', friendId, 'to journal:', selectedJournal.id);

      const response = await fetch(`http://localhost:8000/quiz/journals/${selectedJournal.id}/members/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          member_id: friendId,
        }),
      });

      console.log('Invite response status:', response.status);

      if (response.ok) {
        console.log('Friend invited successfully');
        Alert.alert('Success', 'Friend invited to journal!');
        setShowInviteModal(false);
        
        // Reload journals to get updated members count
        await loadJournals();
        
        // Find and update the selectedJournal with fresh data
        const token2 = await getAuthToken();
        const journalsResponse = await fetch('http://localhost:8000/quiz/journals/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token2}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (journalsResponse.ok) {
          const data = await journalsResponse.json();
          const updatedJournal = data.journals.find(j => j.id === selectedJournal.id);
          if (updatedJournal) {
            setSelectedJournal(updatedJournal);
            console.log('Updated journal members:', updatedJournal.members_count);
          }
        }
        
        loadJournalEntries(selectedJournal.id);
      } else {
        console.error('Failed to invite friend, status:', response.status);
        Alert.alert('Error', 'Failed to invite friend');
      }
    } catch (error) {
      console.error('Invite friend error:', error);
      Alert.alert('Error', 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleJournalPress = (journal) => {
    console.log('Journal pressed:', journal);
    setSelectedJournal(journal);
    loadJournalEntries(journal.id);
  };

  const handleBackPress = () => {
    setSelectedJournal(null);
    setJournalEntries([]);
    setNewEntryTitle('');
    setNewEntryContent('');
  };

  if (selectedJournal) {
    return (
      <View style={[styles.container, { backgroundColor: THEME.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: '#FFFFFF' }]}>
          <TouchableOpacity style={[styles.backButton, { backgroundColor: THEME.primary }]} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color={THEME.white} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: THEME.primary }]}>{selectedJournal.name}</Text>
          <TouchableOpacity style={styles.inviteButton} onPress={() => setShowInviteModal(true)}>
            <Ionicons name="person-add" size={24} color={THEME.white} />
            <Text style={styles.inviteButtonText}>Invite</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.contentArea} showsVerticalScrollIndicator={false}>
          {/* Journal Info */}
          <View style={styles.journalInfo}>
            <Text style={[styles.infoLabel, { color: THEME.text.primary }]}>Description:</Text>
            <Text style={[styles.infoText, { color: THEME.subtext }]}>
              {selectedJournal.description || 'No description'}
            </Text>
            <Text style={[styles.infoLabel, { color: THEME.text.primary }]}>Members:</Text>
            <Text style={[styles.infoText, { color: THEME.subtext }]}>
              {selectedJournal.members_count} member(s)
            </Text>
          </View>

          {/* Add Entry Section */}
          <View style={[styles.entryForm, { borderColor: THEME.border }]}>
            <Text style={[styles.sectionTitle, { color: THEME.text.primary }]}>Add Your Entry</Text>
            <TextInput
              style={[styles.input, { color: THEME.text.primary, borderColor: THEME.border, backgroundColor: THEME.surface }]}
              placeholder="Entry Title (optional)"
              placeholderTextColor={THEME.subtext}
              value={newEntryTitle}
              onChangeText={setNewEntryTitle}
              editable={!loading}
            />
            <TextInput
              style={[styles.inputLarge, { color: THEME.text.primary, borderColor: THEME.border, backgroundColor: THEME.surface }]}
              placeholder="Write your journal entry here..."
              placeholderTextColor={THEME.subtext}
              value={newEntryContent}
              onChangeText={setNewEntryContent}
              multiline
              numberOfLines={4}
              editable={!loading}
            />
            <TouchableOpacity
              style={[styles.button, { backgroundColor: THEME.primary, opacity: loading ? 0.6 : 1 }]}
              onPress={addEntryToJournal}
              disabled={loading}
            >
              <Text style={{ color: THEME.white, fontWeight: '600' }}>Add Entry</Text>
            </TouchableOpacity>
          </View>

          {/* Entries List */}
          <View style={styles.entriesSection}>
            <Text style={[styles.sectionTitle, { color: THEME.text.primary }]}>Journal Entries</Text>
            {journalEntries.length === 0 ? (
              <Text style={[styles.emptyText, { color: THEME.subtext }]}>No entries yet</Text>
            ) : (
              journalEntries.map((entry) => (
                <View key={entry.id} style={[styles.entryCard, { backgroundColor: THEME.surface, borderColor: THEME.border }]}>
                  {entry.author && <Text style={[styles.entryAuthor, { color: THEME.primary }]}>{entry.author.username}</Text>}
                  {entry.title ? (
                    <Text style={[styles.entryTitle, { color: THEME.text.primary }]}>{entry.title}</Text>
                  ) : null}
                  {entry.content && <Text style={[styles.entryContent, { color: THEME.text.primary }]}>{entry.content}</Text>}
                  {entry.created_at && <Text style={[styles.entryDate, { color: THEME.subtext }]}>
                    {new Date(entry.created_at).toLocaleDateString()}
                  </Text>}
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Invite Modal */}
        {showInviteModal && (
          <View style={[styles.modal, { backgroundColor: THEME.backdrop }]}>
            <View style={[styles.modalContent, { backgroundColor: THEME.surface }]}>
              <Text style={[styles.modalTitle, { color: THEME.text.primary }]}>Invite Friends</Text>
              <FlatList
                data={friends}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.friendItem, { borderBottomColor: THEME.border }]}
                    onPress={() => inviteFriendToJournal(item.id)}
                  >
                    <Text style={[styles.friendName, { color: THEME.text.primary }]}>{item.username}</Text>
                    <Ionicons name="add-circle" size={24} color={THEME.primary} />
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                style={[styles.button, { backgroundColor: THEME.secondary }]}
                onPress={() => setShowInviteModal(false)}
              >
                <Text style={{ color: THEME.white, fontWeight: '600' }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: THEME.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: THEME.primary }]}>
        <Text style={[styles.headerTitle, { color: THEME.white }]}>Shared Journals</Text>
        <TouchableOpacity style={styles.createButton} onPress={() => {
          console.log('Header create button pressed');
          setShowCreateModal(true);
        }}>
          <Ionicons name="add-circle" size={28} color={THEME.white} />
        </TouchableOpacity>
      </View>

      {loading && journals.length === 0 ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={THEME.primary} />
        </View>
      ) : journals.length === 0 ? (
        <ScrollView contentContainerStyle={styles.centerContent} showsVerticalScrollIndicator={false}>
          <Ionicons name="book-outline" size={64} color={THEME.subtext} />
          <Text style={[styles.emptyText, { color: THEME.subtext }]}>No shared journals yet</Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: THEME.primary, marginTop: 16 }]}
            onPress={() => {
              console.log('Create first journal button pressed');
              setShowCreateModal(true);
            }}
          >
            <Text style={{ color: THEME.white, fontWeight: '600' }}>Create Your First Journal</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {journals.map((item) => (
            <TouchableOpacity
              key={item.id.toString()}
              style={[styles.journalCard, { backgroundColor: THEME.surface, borderColor: THEME.border }]}
              onPress={() => handleJournalPress(item)}
            >
              <Ionicons name="book" size={32} color={THEME.primary} style={styles.journalIcon} />
              <View style={styles.journalCardContent}>
                <Text style={[styles.journalName, { color: THEME.text.primary }]}>{item.name}</Text>
                <Text style={[styles.journalDesc, { color: THEME.subtext }]} numberOfLines={1}>
                  {item.description || 'No description'}
                </Text>
                <Text style={[styles.memberCount, { color: THEME.subtext }]}>
                  {item.members_count} member(s)
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={THEME.subtext} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <View style={[styles.modal, { backgroundColor: THEME.backdrop }]}>
          <View style={[styles.modalContent, { backgroundColor: THEME.surface }]}>
            <Text style={[styles.modalTitle, { color: THEME.text.primary }]}>Create New Journal</Text>
            <TextInput
              style={[styles.input, { color: THEME.text.primary, borderColor: THEME.border, backgroundColor: THEME.background }]}
              placeholder="Journal Name"
              placeholderTextColor={THEME.subtext}
              value={newJournalName}
              onChangeText={setNewJournalName}
              editable={!loading}
            />
            <TextInput
              style={[styles.inputLarge, { color: THEME.text.primary, borderColor: THEME.border, backgroundColor: THEME.background }]}
              placeholder="Description (optional)"
              placeholderTextColor={THEME.subtext}
              value={newJournalDesc}
              onChangeText={setNewJournalDesc}
              multiline
              numberOfLines={3}
              editable={!loading}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, { flex: 1, backgroundColor: THEME.primary }]}
                onPress={createJournal}
                disabled={loading}
              >
                <Text style={{ color: THEME.white, fontWeight: '600' }}>Create</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { flex: 1, backgroundColor: THEME.secondary, marginLeft: 8 }]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={{ color: THEME.white, fontWeight: '600' }}>Cancel</Text>
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
  },
  header: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 60,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  createButton: {
    padding: 8,
    minWidth: 40,
  },
  backButton: {
    padding: 8,
    minWidth: 40,
    borderRadius: 6,
  },
  inviteButton: {
    padding: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FF0000',
    borderRadius: 6,
    minWidth: 80,
  },
  inviteButtonText: {
    color: THEME.white,
    fontSize: 12,
    fontWeight: '600',
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 0,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 32,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  journalCard: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  journalIcon: {
    marginRight: 12,
  },
  journalCardContent: {
    flex: 1,
  },
  journalName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  journalDesc: {
    fontSize: 13,
    marginBottom: 4,
  },
  memberCount: {
    fontSize: 12,
  },
  journalInfo: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    marginBottom: 4,
  },
  entryForm: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    fontSize: 13,
  },
  inputLarge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 13,
    textAlignVertical: 'top',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
  },
  entriesSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  entryCard: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  entryAuthor: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  entryTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  entryContent: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  entryDate: {
    fontSize: 11,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  friendName: {
    fontSize: 14,
  },
});

export default SharedJournals;
