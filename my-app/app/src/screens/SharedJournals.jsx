import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, FlatList, ActivityIndicator, Image, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../core/api';
import { THEME } from '../constants/appTheme';
import Ionicons from '@expo/vector-icons/Ionicons';

const SharedJournals = () => {
  const [journals, setJournals] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [newJournalName, setNewJournalName] = useState('');
  const [newJournalDesc, setNewJournalDesc] = useState('');
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [selectedPromptSession, setSelectedPromptSession] = useState(null);
  const [journalEntries, setJournalEntries] = useState([]);
  const [promptResponses, setPromptResponses] = useState([]);
  const [newEntryContent, setNewEntryContent] = useState('');
  const [newEntryTitle, setNewEntryTitle] = useState('');
  const [friends, setFriends] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedFriendsToInvite, setSelectedFriendsToInvite] = useState([]);
  const [currentPromptForSession, setCurrentPromptForSession] = useState(null);

  useEffect(() => {
    loadJournals();
    loadPrompts();
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

      const response = await api.get('/quiz/journals/');

      if (response.status === 200) {
        const data = response.data;
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

      const response = await api.get('/quiz/direct-messages/friends/');

      if (response.status === 200) {
        const data = response.data;
        setFriends(data.friends || []);
      }
    } catch (error) {
      console.error('Load friends error:', error);
    }
  };

  const loadPrompts = async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const response = await api.get('/quiz/prompts/');

      if (response.status === 200) {
        const data = response.data;
        const promptsList = Array.isArray(data) ? data : data.prompts || data.results || [];
        setPrompts(promptsList);
      }
    } catch (error) {
      console.error('Load prompts error:', error);
    }
  };

  const loadPromptSessionResponses = async (sessionId) => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const response = await api.get(`/quiz/prompt-sessions/${sessionId}/`);

      if (response.status === 200) {
        const data = response.data;
        console.log('Prompt session data:', data);
        console.log('Responses from API:', data.responses);
        setPromptResponses(data.responses || []);
      }
    } catch (error) {
      console.error('Load prompt responses error:', error);
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

      const response = await api.post('/quiz/journals/', {
        name: newJournalName,
        description: newJournalDesc,
      });

      console.log('Create journal response status:', response.status);

      if (response.status >= 200 && response.status < 300) {
        const data = response.data;
        console.log('Journal created successfully:', data);
        Alert.alert('Success', 'Journal created!');
        setNewJournalName('');
        setNewJournalDesc('');
        setShowCreateModal(false);
        setShowActionModal(false);
        
        // Navigate to the newly created journal so user can add entries
        const newJournal = {
          id: data.id,
          name: data.name,
          description: data.description,
          members_count: data.members_count || 1,
        };
        setSelectedJournal(newJournal);
        loadJournalEntries(data.id);
      } else {
        console.error('Failed to create journal:', response.status);
        console.error('Error response:', response.data);
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

      const response = await api.get(`/quiz/journals/${journalId}/entries/`);

      if (response.status === 200) {
        const data = response.data;
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

      // Handle both journal entries and prompt session responses
      if (selectedJournal) {
        // Adding entry to journal
        const response = await api.post(`/quiz/journals/${selectedJournal.id}/entries/`, {
          title: newEntryTitle,
          content: newEntryContent,
        });

        if (response.status >= 200 && response.status < 300) {
          Alert.alert('Success', 'Entry added!');
          setNewEntryTitle('');
          setNewEntryContent('');
          loadJournalEntries(selectedJournal.id);
        } else {
          Alert.alert('Error', 'Failed to add entry');
        }
      } else if (selectedPromptSession) {
        // Adding response to prompt session
        const response = await api.post(`/quiz/prompt-sessions/${selectedPromptSession.id}/responses/`, {
          response: newEntryContent,
        });

        if (response.status >= 200 && response.status < 300) {
          Alert.alert('Success', 'Response submitted!');
          setNewEntryContent('');
          // Reload responses to show the new response
          console.log('Response submitted, reloading...');
          await loadPromptSessionResponses(selectedPromptSession.id);
          console.log('Responses reloaded:', promptResponses);
        } else {
          Alert.alert('Error', 'Failed to submit response');
        }
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

      const response = await api.post(`/quiz/journals/${selectedJournal.id}/members/`, {
        member_id: friendId,
      });

      console.log('Invite response status:', response.status);

      if (response.status >= 200 && response.status < 300) {
        console.log('Friend invited successfully');
        Alert.alert('Success', 'Friend invited to journal!');
        setShowInviteModal(false);
        setSelectedFriendsToInvite([]);
        
        // Reload journals to get updated members count
        await loadJournals();
        
        // Find and update the selectedJournal with fresh data
        const journalsResponse = await api.get('/quiz/journals/');
        
        if (journalsResponse.status === 200) {
          const data = journalsResponse.data;
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

  const startPromptSession = async (prompt) => {
    if (!prompt) return;
    try {
      setLoading(true);
      const token = await getAuthToken();
      if (!token) return;

      // Create the session with the selected prompt
      const response = await api.post('/quiz/prompt-sessions/', {
        prompt_id: prompt.id,
        title: prompt.prompt_text?.substring(0, 50) || 'Prompt Session',
      });

      if (response.status >= 200 && response.status < 300) {
        const sessionData = response.data;
        
        // Invite selected friends
        for (const friendId of selectedFriendsToInvite) {
          await api.post(`/quiz/prompt-sessions/${sessionData.id}/members/`, {
            member_id: friendId,
          });
        }

        // Navigate to the prompt session detail view (similar to journal view)
        setSelectedPromptSession({
          id: sessionData.id,
          prompt_id: prompt.id,
          prompt_text: prompt.prompt_text,
        });
        setCurrentPromptForSession(prompt);
        setShowActionModal(false);
        setShowInviteModal(false);
        setSelectedFriendsToInvite([]);
        // Load responses for this session
        await loadPromptSessionResponses(sessionData.id);
        Alert.alert('Success', 'Prompt session created!');
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

  const handleJournalPress = (journal) => {
    console.log('Journal pressed:', journal);
    setSelectedJournal(journal);
    loadJournalEntries(journal.id);
  };

  const handleBackPress = () => {
    setSelectedJournal(null);
    setSelectedPromptSession(null);
    setCurrentPromptForSession(null);
    setJournalEntries([]);
    setPromptResponses([]);
    setNewEntryContent('');
    setNewEntryTitle('');
    setNewEntryTitle('');
    setNewEntryContent('');
  };

  // Show Prompt Session Detail View
  if (selectedPromptSession && currentPromptForSession) {
    return (
      <View style={[styles.container, { backgroundColor: THEME.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: '#FFFFFF' }]}>
          <TouchableOpacity style={[styles.backButton, { backgroundColor: THEME.primary }]} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color={THEME.white} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: THEME.primary }]}>Prompt Session</Text>
          <View style={styles.inviteButton} />
        </View>

        <ScrollView style={styles.contentArea} showsVerticalScrollIndicator={false}>
          {/* Prompt Display */}
          <View style={[styles.promptDisplaySection, { backgroundColor: THEME.surface, borderColor: THEME.border }]}>
            <Ionicons name="bulb" size={32} color={THEME.primary} style={styles.promptDisplayIcon} />
            <Text style={[styles.promptDisplayText, { color: THEME.text.primary }]}>
              {currentPromptForSession.prompt_text}
            </Text>
            {currentPromptForSession.difficulty && (
              <Text style={[styles.difficultyBadge, { color: THEME.subtext }]}>
                {currentPromptForSession.difficulty}
              </Text>
            )}
          </View>

          {/* Response Section */}
          <View style={[styles.entryForm, { borderColor: THEME.border }]}>
            <Text style={[styles.sectionTitle, { color: THEME.text.primary }]}>Your Response</Text>
            <TextInput
              style={[styles.inputLarge, { color: THEME.text.primary, borderColor: THEME.border, backgroundColor: THEME.surface }]}
              placeholder="Write your response to this prompt..."
              placeholderTextColor={THEME.subtext}
              value={newEntryContent}
              onChangeText={setNewEntryContent}
              multiline
              numberOfLines={5}
              editable={!loading}
            />
            <TouchableOpacity
              style={[styles.button, { backgroundColor: THEME.primary, opacity: loading ? 0.6 : 1 }]}
              onPress={addEntryToJournal}
              disabled={loading}
            >
              <Text style={{ color: THEME.white, fontWeight: '600' }}>Submit Response</Text>
            </TouchableOpacity>
          </View>

          {/* All Responses Section */}
          <View style={styles.entriesSection}>
            <Text style={[styles.sectionTitle, { color: THEME.text.primary }]}>Responses ({promptResponses.length})</Text>
            {promptResponses.length === 0 ? (
              <Text style={[styles.emptyText, { color: THEME.subtext }]}>No responses yet</Text>
            ) : (
              promptResponses.map((resp) => {
                console.log('Rendering response:', resp);
                return (
                  <View key={resp.id} style={[styles.entryCard, { backgroundColor: THEME.surface, borderColor: THEME.border }]}>
                    {resp.author && <Text style={[styles.entryAuthor, { color: THEME.primary }]}>{resp.author.username}</Text>}
                    {resp.response && <Text style={[styles.entryContent, { color: THEME.text.primary }]}>{resp.response}</Text>}
                    {resp.created_at && <Text style={[styles.entryDate, { color: THEME.subtext }]}>
                      {new Date(resp.created_at).toLocaleDateString()}
                    </Text>}
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

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
        <TouchableOpacity style={styles.createButton} onPress={() => setShowActionModal(true)}>
          <Ionicons name="add-circle" size={28} color={THEME.white} />
        </TouchableOpacity>
      </View>

      {loading && journals.length === 0 && prompts.length === 0 ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={THEME.primary} />
        </View>
      ) : journals.length === 0 && prompts.length === 0 ? (
        <ScrollView contentContainerStyle={styles.centerContent} showsVerticalScrollIndicator={false}>
          <Ionicons name="book-outline" size={64} color={THEME.subtext} />
          <Text style={[styles.emptyText, { color: THEME.subtext }]}>No journals or prompts yet</Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: THEME.primary, marginTop: 16 }]}
            onPress={() => setShowActionModal(true)}
          >
            <Text style={{ color: THEME.white, fontWeight: '600' }}>Create or Request</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Shared Journals Section */}
          {journals.length > 0 && (
            <View style={styles.sectionWrapper}>
              <Text style={[styles.sectionHeader, { color: THEME.text.primary }]}>Your Journals</Text>
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
            </View>
          )}

          {/* Prompts Section */}
          {prompts.length > 0 && (
            <View style={[styles.sectionWrapper, { marginTop: journals.length > 0 ? 16 : 0 }]}>
              <Text style={[styles.sectionHeader, { color: THEME.text.primary }]}>Available Prompts</Text>
              {prompts.slice(0, 5).map((prompt) => (
                <View
                  key={prompt.id.toString()}
                  style={[styles.promptCard, { backgroundColor: THEME.surface, borderColor: THEME.border }]}
                >
                  <Ionicons name="bulb" size={24} color={THEME.primary} style={styles.promptIcon} />
                  <View style={styles.promptCardContent}>
                    <Text style={[styles.promptText, { color: THEME.text.primary }]} numberOfLines={2}>
                      {prompt.prompt_text}
                    </Text>
                    {prompt.difficulty && (
                      <Text style={[styles.difficultyText, { color: THEME.subtext }]}>
                        {prompt.difficulty}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={[styles.promptActionButton, { backgroundColor: THEME.primary }]}
                    onPress={() => startPromptSession(prompt)}
                  >
                    <Ionicons name="send" size={18} color={THEME.white} />
                  </TouchableOpacity>
                </View>
              ))}
              {prompts.length > 5 && (
                <Text style={[styles.morePromptsText, { color: THEME.subtext }]}>
                  ... and {prompts.length - 5} more prompts available
                </Text>
              )}
            </View>
          )}
        </ScrollView>
      )}

      {/* Action Modal - Choose Create Journal or Request Prompt */}
      {showActionModal && (
        <View style={[styles.modal, { backgroundColor: THEME.backdrop }]}>
          <View style={[styles.modalContent, { backgroundColor: THEME.surface }]}>
            <Text style={[styles.modalTitle, { color: THEME.text.primary }]}>Create or Request</Text>
            <TouchableOpacity
              style={[styles.actionOption, { borderColor: THEME.border }]}
              onPress={() => {
                setShowActionModal(false);
                setShowCreateModal(true);
              }}
            >
              <Ionicons name="add-circle" size={28} color={THEME.primary} />
              <View style={styles.actionTextWrapper}>
                <Text style={[styles.actionTitle, { color: THEME.text.primary }]}>Create Journal</Text>
                <Text style={[styles.actionDesc, { color: THEME.subtext }]}>Start a new shared journal</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionOption, { borderColor: THEME.border, borderTopWidth: 1 }]}
              onPress={() => {
                setShowActionModal(false);
                setShowInviteModal(true);
              }}
            >
              <Ionicons name="bulb" size={28} color={THEME.primary} />
              <View style={styles.actionTextWrapper}>
                <Text style={[styles.actionTitle, { color: THEME.text.primary }]}>Request Prompt</Text>
                <Text style={[styles.actionDesc, { color: THEME.subtext }]}>Share a prompt with friends</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: THEME.secondary, marginTop: 16 }]}
              onPress={() => setShowActionModal(false)}
            >
              <Text style={{ color: THEME.white, fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Create Journal Modal */}
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
                onPress={() => {
                  setShowCreateModal(false);
                  setShowActionModal(true);
                }}
              >
                <Text style={{ color: THEME.white, fontWeight: '600' }}>Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Invite Friends to Prompt Modal */}
      {showInviteModal && (
        <View style={[styles.modal, { backgroundColor: THEME.backdrop }]}>
          <View style={[styles.modalContent, { backgroundColor: THEME.surface }]}>
            <Text style={[styles.modalTitle, { color: THEME.text.primary }]}>Invite Friends to Prompt</Text>
            <Text style={[styles.modalSubtitle, { color: THEME.subtext }]}>Select friends to share the prompt with</Text>
            <FlatList
              data={friends}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.friendItem,
                    { borderBottomColor: THEME.border },
                    selectedFriendsToInvite.includes(item.id) && { backgroundColor: THEME.background }
                  ]}
                  onPress={() => {
                    setSelectedFriendsToInvite(prev =>
                      prev.includes(item.id)
                        ? prev.filter(id => id !== item.id)
                        : [...prev, item.id]
                    );
                  }}
                >
                  <Text style={[styles.friendName, { color: THEME.text.primary }]}>{item.username}</Text>
                  <Ionicons 
                    name={selectedFriendsToInvite.includes(item.id) ? 'checkmark-circle' : 'ellipse-outline'} 
                    size={24} 
                    color={selectedFriendsToInvite.includes(item.id) ? THEME.primary : THEME.subtext}
                  />
                </TouchableOpacity>
              )}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, { flex: 1, backgroundColor: THEME.primary }]}
                disabled={selectedFriendsToInvite.length === 0 || loading}
                onPress={() => {
                  // Get first available prompt to share
                  if (prompts.length > 0) {
                    startPromptSession(prompts[0]);
                  }
                }}
              >
                <Text style={{ color: THEME.white, fontWeight: '600' }}>
                  Share ({selectedFriendsToInvite.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { flex: 1, backgroundColor: THEME.secondary, marginLeft: 8 }]}
                onPress={() => {
                  setShowInviteModal(false);
                  setShowActionModal(true);
                  setSelectedFriendsToInvite([]);
                }}
              >
                <Text style={{ color: THEME.white, fontWeight: '600' }}>Back</Text>
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
  sectionWrapper: {
    marginBottom: 8,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 8,
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
  promptCard: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  promptIcon: {
    marginRight: 12,
  },
  promptCardContent: {
    flex: 1,
    marginRight: 8,
  },
  promptText: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 4,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '500',
  },
  promptActionButton: {
    padding: 8,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  morePromptsText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  promptDisplaySection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  promptDisplayIcon: {
    marginBottom: 12,
  },
  promptDisplayText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 8,
  },
  difficultyBadge: {
    fontSize: 12,
    fontWeight: '600',
    fontStyle: 'italic',
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
  modalSubtitle: {
    fontSize: 13,
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
  actionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    minHeight: 70,
  },
  actionTextWrapper: {
    flex: 1,
    marginLeft: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 12,
  },
});

export default SharedJournals;
