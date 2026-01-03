import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  FlatList,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../src/core/api';

const { width } = Dimensions.get('window');

export default function Gardens() {
  const navigation = useNavigation();
  const [gardens, setGardens] = useState([]);
  const [plants, setPlants] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [availablePlants, setAvailablePlants] = useState([]);
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [loadingFriends, setLoadingFriends] = useState(false);

  // Load gardens and plants on mount
  useEffect(() => {
    loadGardens();
    loadPlants();
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      setLoadingFriends(true);
      console.log('🔍 DEBUG: Starting loadFriends...');
      console.log('🔍 DEBUG: Making API call to quiz/direct-messages/friends/');
      
      const response = await api.get('quiz/direct-messages/friends/');
      console.log('🔍 DEBUG: API Response received:', response);
      console.log('🔍 DEBUG: Response status:', response.status);
      console.log('🔍 DEBUG: Response data:', response.data);
      console.log('🔍 DEBUG: Friends array:', response.data.friends);
      console.log('🔍 DEBUG: Friends count:', response.data.friends?.length);
      
      const friendsData = response.data.friends || [];
      console.log('🔍 DEBUG: Setting friends state to:', friendsData);
      setFriends(friendsData);
    } catch (error) {
      console.error('❌ ERROR loading friends:');
      console.error('  - Error message:', error.message);
      console.error('  - Error response:', error.response);
      console.error('  - Response status:', error.response?.status);
      console.error('  - Response data:', error.response?.data);
      console.error('  - Full error:', error);
      
      // Fallback to empty list, but still show the empty state
      setFriends([]);
    } finally {
      setLoadingFriends(false);
    }
  };

  const loadPlants = async () => {
    try {
      const response = await api.get('gardens/plants/');
      const plantMap = {};
      response.data.forEach(plant => {
        plantMap[plant.id] = plant;
      });
      setPlants(plantMap);
      setAvailablePlants(response.data);
    } catch (error) {
      console.error('Error loading plants:', error);
      Alert.alert('Error', 'Failed to load available plants');
    }
  };

  const loadGardens = async () => {
    try {
      setLoading(true);
      const response = await api.get('gardens/');
      setGardens(response.data);
    } catch (error) {
      console.error('Error loading gardens:', error);
      Alert.alert('Error', 'Failed to load gardens');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGardens();
    setRefreshing(false);
  };

  const createGarden = async () => {
    console.log('🔍 DEBUG: createGarden called');
    console.log('🔍 DEBUG: selectedPlant:', selectedPlant);
    console.log('🔍 DEBUG: selectedFriend:', selectedFriend);
    console.log('🔍 DEBUG: friends state:', friends);
    
    if (!selectedPlant || !selectedFriend) {
      console.log('❌ DEBUG: Missing plant or friend');
      Alert.alert('Missing Info', 'Please select a plant and friend');
      return;
    }

    try {
      await api.post('gardens/', {
        user_b_id: selectedFriend.id,
        plant_id: selectedPlant,
        invitation_message: 'Join me in growing a beautiful plant!',
      });
      Alert.alert('Success', 'Garden invitation sent!');
      setShowCreateForm(false);
      setSelectedPlant(null);
      setSelectedFriend(null);
      loadGardens();
    } catch (error) {
      console.error('Error creating garden:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Failed to create garden');
    }
  };

  const acceptGarden = async (gardenId) => {
    try {
      await api.patch(`gardens/${gardenId}/accept/`, {});
      Alert.alert('Success', 'Invitation accepted!');
      loadGardens();
    } catch (error) {
      console.error('Error accepting garden:', error);
      Alert.alert('Error', 'Failed to accept invitation');
    }
  };

  const renderGardenCard = ({ item }) => {
    const plant = plants[item.plant_id];
    const statusColors = {
      pending: '#FFA500',
      active: '#00AA00',
      bloomed: '#FF1493',
      abandoned: '#808080',
    };

    return (
      <View style={[styles.gardenCard, { borderColor: statusColors[item.status] }]}>
        <View style={styles.gardenHeader}>
          <Text style={styles.plantName}>
            {plant ? `${plant.emoji} ${plant.name}` : 'Loading...'}
          </Text>
          <Text style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>

        <Text style={styles.gardenUsers}>
          {item.user_a_username} + {item.user_b_username}
        </Text>

        {item.growth_state && (
          <View style={styles.growthSection}>
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${item.growth_state.growth_percentage}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.growthText}>
              {item.growth_state.growth_percentage.toFixed(1)}% • Stage {item.growth_state.current_stage}/5
            </Text>
            <Text style={styles.streakText}>
              🔥 {item.growth_state.current_streak_days} day streak
            </Text>
          </View>
        )}

        <View style={styles.actionButtons}>
          {item.status === 'pending' && item.is_user_b && (
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => acceptGarden(item.id)}
            >
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
          )}
          {(item.status === 'active' || item.status === 'pending') && (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => navigation.navigate('GardenDetail', { gardenId: item.id })}
            >
              <Text style={styles.buttonText}>View</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading && !gardens.length) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Virtual Gardens</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateForm(!showCreateForm)}
        >
          <Text style={styles.createButtonText}>+ New Garden</Text>
        </TouchableOpacity>
      </View>

      {showCreateForm && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Create New Garden</Text>

          <Text style={styles.label}>Select Plant</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.plantSelector}
          >
            {availablePlants.map(plant => (
              <TouchableOpacity
                key={plant.id}
                style={[
                  styles.plantOption,
                  selectedPlant === plant.id && styles.plantOptionSelected,
                ]}
                onPress={() => setSelectedPlant(plant.id)}
              >
                <Text style={styles.plantEmoji}>{plant.emoji}</Text>
                <Text style={styles.plantLabel}>{plant.name}</Text>
                <Text style={styles.difficultyLabel}>{plant.difficulty}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>Select Friend to Invite</Text>
          {loadingFriends ? (
            <View style={styles.loadingFriendsContainer}>
              <ActivityIndicator size="small" color="#4CAF50" />
              <Text style={styles.loadingText}>Loading friends...</Text>
            </View>
          ) : friends.length > 0 ? (
            <View style={styles.friendsListContainer}>
              <Text style={{fontSize: 12, color: '#666', marginBottom: 8}}>DEBUG: {friends.length} friends loaded</Text>
              <FlatList
                data={friends}
                keyExtractor={item => item.id.toString()}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.friendItem,
                      selectedFriend?.id === item.id && styles.friendItemSelected,
                    ]}
                    onPress={() => {
                      console.log('🔍 DEBUG: Friend selected:', item);
                      setSelectedFriend(item);
                    }}
                  >
                    <View style={styles.friendInfo}>
                      <Text style={styles.friendName}>{item.username}</Text>
                    </View>
                    {selectedFriend?.id === item.id && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                )}
                nestedScrollEnabled={true}
              />
            </View>
          ) : (
            <View style={styles.noFriendsContainer}>
              <Text style={styles.noFriendsText}>No friends yet</Text>
              <Text style={styles.noFriendsSubtext}>Add friends to create gardens together</Text>
              <Text style={{fontSize: 11, color: '#999', marginTop: 12}}>DEBUG: friends.length = {friends.length}, loadingFriends = {loadingFriends.toString()}</Text>
            </View>
          )}

          {selectedFriend && (
            <View style={styles.selectedSummary}>
              <Text style={styles.summaryText}>
                Inviting <Text style={styles.summaryBold}>{selectedFriend.username}</Text> to grow <Text style={styles.summaryBold}>{availablePlants.find(p => p.id === selectedPlant)?.name || 'a plant'}</Text>
              </Text>
            </View>
          )}

          <View style={styles.formButtons}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={createGarden}
            >
              <Text style={styles.buttonText}>Create Garden</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                setShowCreateForm(false);
                setSelectedPlant(null);
                setSelectedFriend(null);
              }}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={gardens}
        renderItem={renderGardenCard}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No gardens yet.</Text>
            <Text style={styles.emptySubtext}>Create one with a friend!</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFF',
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  createButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 12,
  },
  formContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    color: '#555',
  },
  plantSelector: {
    marginBottom: 20,
  },
  plantOption: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginRight: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 90,
  },
  plantOptionSelected: {
    backgroundColor: '#4CAF50',
  },
  plantEmoji: {
    fontSize: 32,
    marginBottom: 5,
  },
  plantLabel: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  difficultyLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  loadingFriendsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    marginBottom: 20,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  friendsListContainer: {
    maxHeight: 250,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  friendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  friendItemSelected: {
    backgroundColor: '#E8F5E9',
    borderBottomColor: '#4CAF50',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  checkmark: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  noFriendsContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    marginBottom: 20,
  },
  noFriendsText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  noFriendsSubtext: {
    fontSize: 13,
    color: '#BBB',
  },
  selectedSummary: {
    backgroundColor: '#E8F5E9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  summaryText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  summaryBold: {
    fontWeight: '700',
    color: '#4CAF50',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  secondaryButton: {
    backgroundColor: '#007AFF',
  },
  cancelButton: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  listContent: {
    padding: 15,
  },
  gardenCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  gardenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  plantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
    overflow: 'hidden',
  },
  gardenUsers: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  growthSection: {
    marginBottom: 12,
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  growthText: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
  },
  streakText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#BBB',
  },
});
