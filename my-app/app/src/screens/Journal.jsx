import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import api from '../core/api';
import { showAlert } from '../utils/alert';
import useStore from '../core/global';
import { THEME } from '../constants/appTheme';

function Journal({ navigation }) {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newJournalTitle, setNewJournalTitle] = useState('');
  const [newJournalDescription, setNewJournalDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const user = useStore((state) => state.user);

  useEffect(() => {
    loadJournals();
  }, []);

  const loadJournals = async () => {
    try {
      setLoading(true);
      const response = await api.get('/quiz/journals/');
      setJournals(response.data.journals || []);
    } catch (error) {
      console.error('Load journals error:', error);
      showAlert('Error', 'Failed to load journals');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadJournals();
    setRefreshing(false);
  };

  const createJournal = async () => {
    if (!newJournalTitle.trim()) {
      showAlert('Error', 'Please enter a journal title');
      return;
    }

    try {
      setCreating(true);
      const response = await api.post('/quiz/journals/', {
        title: newJournalTitle,
        description: newJournalDescription,
      });
      
      setJournals([response.data.journal, ...journals]);
      setNewJournalTitle('');
      setNewJournalDescription('');
      setShowCreateForm(false);
      showAlert('Success', 'Journal created!');
    } catch (error) {
      console.error('Create journal error:', error);
      showAlert('Error', 'Failed to create journal');
    } finally {
      setCreating(false);
    }
  };

  const openJournal = (journal) => {
    navigation.navigate('JournalDetail', {
      journalId: journal.id,
      journalTitle: journal.title,
    });
  };

  const renderJournalItem = ({ item }) => (
    <TouchableOpacity style={styles.journalCard} onPress={() => openJournal(item)}>
      <View style={styles.journalContent}>
        <Text style={styles.journalTitle}>{item.title}</Text>
        {item.description && (
          <Text style={styles.journalDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <Text style={styles.journalMeta}>
          {item.members_count || 1} {(item.members_count || 1) === 1 ? 'member' : 'members'}
        </Text>
        <Text style={styles.journalDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.arrow}>
        <Text style={styles.arrowText}>›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shared Journals</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateForm(!showCreateForm)}
        >
          <Text style={styles.createButtonText}>{showCreateForm ? 'Cancel' : '+'}</Text>
        </TouchableOpacity>
      </View>

      {showCreateForm && (
        <View style={styles.createFormContainer}>
          <TextInput
            style={styles.input}
            placeholder="Journal Title"
            placeholderTextColor="#666"
            value={newJournalTitle}
            onChangeText={setNewJournalTitle}
          />
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="Add description (optional)"
            placeholderTextColor="#666"
            value={newJournalDescription}
            onChangeText={setNewJournalDescription}
            multiline
          />
          <TouchableOpacity
            style={[styles.submitButton, creating && styles.submitButtonDisabled]}
            onPress={createJournal}
            disabled={creating}
          >
            <Text style={styles.submitButtonText}>
              {creating ? 'Creating...' : 'Create Journal'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1a73e8" />
        </View>
      ) : journals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No journals yet</Text>
          <Text style={styles.emptySubtext}>Create a journal to get started</Text>
        </View>
      ) : (
        <FlatList
          data={journals}
          renderItem={renderJournalItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'montserrat-regular',
  },
  createButton: {
    backgroundColor: '#1a73e8',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  createFormContainer: {
    backgroundColor: '#111111',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  input: {
    backgroundColor: '#222222',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333333',
    fontFamily: 'montserrat-regular',
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#1a73e8',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'montserrat-regular',
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
    paddingHorizontal: 20,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'montserrat-regular',
  },
  emptySubtext: {
    color: '#999',
    fontSize: 14,
    fontFamily: 'montserrat-regular',
  },
  listContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  journalCard: {
    backgroundColor: '#111111',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#1a73e8',
  },
  journalContent: {
    flex: 1,
  },
  journalTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    fontFamily: 'montserrat-regular',
  },
  journalDescription: {
    color: '#999',
    fontSize: 12,
    marginBottom: 8,
    fontFamily: 'montserrat-regular',
  },
  journalMeta: {
    color: '#666',
    fontSize: 11,
    marginBottom: 4,
    fontFamily: 'montserrat-regular',
  },
  journalDate: {
    color: '#666',
    fontSize: 11,
    fontFamily: 'montserrat-regular',
  },
  arrow: {
    paddingLeft: 10,
  },
  arrowText: {
    color: '#1a73e8',
    fontSize: 24,
  },
});

export default Journal;
