import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import api from '../src/core/api';

const { width } = Dimensions.get('window');

export default function GardenDetail() {
  const route = useRoute();
  const { gardenId } = route.params || {};
  
  const [garden, setGarden] = useState(null);
  const [loading, setLoading] = useState(true);
  const [watering, setWatering] = useState(false);
  const [plant, setPlant] = useState(null);
  const [careHistory, setCareHistory] = useState([]);
  const [showBloomAnimation, setShowBloomAnimation] = useState(false);
  const scaleAnim = new Animated.Value(1);

  useEffect(() => {
    loadGardenDetails();
  }, [gardenId]);

  const loadGardenDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`gardens/${gardenId}/`);
      setGarden(response.data);
      
      // Plant data is already in the response
      if (response.data.plant) {
        setPlant(response.data.plant);
      }
      
      // Load care history
      const historyResponse = await api.get(`gardens/${gardenId}/history/`);
      setCareHistory(historyResponse.data);
    } catch (error) {
      console.error('Error loading garden details:', error);
      Alert.alert('Error', 'Failed to load garden details');
    } finally {
      setLoading(false);
    }
  };

  const waterPlant = async () => {
    try {
      setWatering(true);
      const response = await api.post(`gardens/${gardenId}/water/`, {});
      
      console.log('🔍 DEBUG: Water response:', response.data);
      
      // Update garden with new data from response
      if (response.data.garden) {
        setGarden(response.data.garden);
        console.log('🔍 DEBUG: Garden updated with:', response.data.garden.growth_state);
      }
      
      // Show animation
      triggerWaterAnimation();
      
      // Check for bloom
      if (response.data.care_result?.is_bloomed) {
        setShowBloomAnimation(true);
        setTimeout(() => setShowBloomAnimation(false), 3000);
      }
    } catch (error) {
      console.error('Error watering plant:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Failed to water plant');
    } finally {
      setWatering(false);
    }
  };

  const triggerWaterAnimation = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!garden || !plant) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Garden not found</Text>
      </View>
    );
  }

  const growth = garden.growth_state;
  const stageDescriptions = [
    'Just planted!',
    'Sprouting',
    'Growing',
    'Nearly there',
    'Ready to bloom!',
    'Bloomed!',
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.gardenTitle}>
          {plant.emoji} {plant.name}
        </Text>
        <Text style={styles.partners}>
          {garden.user_a_username} + {garden.user_b_username}
        </Text>
      </View>

      {/* Plant Display */}
      <View style={styles.plantDisplayContainer}>
        <Animated.View
          style={[
            styles.plantDisplay,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.plantEmoji}>{plant.emoji}</Text>
        </Animated.View>
        
        {showBloomAnimation && (
          <View style={styles.bloomParticles}>
            <Text style={styles.particle}>🌟</Text>
            <Text style={styles.particle}>🌟</Text>
            <Text style={styles.particle}>🌟</Text>
          </View>
        )}
      </View>

      {/* Growth Progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Growth Progress</Text>
          <Text style={styles.stageText}>
            Stage {growth.current_stage}/5 • {stageDescriptions[growth.current_stage]}
          </Text>
        </View>

        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${growth.growth_percentage}%`,
              },
            ]}
          />
        </View>

        <View style={styles.progressStats}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Growth</Text>
            <Text style={styles.statValue}>{growth.growth_percentage.toFixed(1)}%</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Streak</Text>
            <Text style={styles.statValue}>🔥 {growth.current_streak_days}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Health</Text>
            <Text style={[styles.statValue, { color: getHealthColor(growth.health_status) }]}>
              {growth.health_status}
            </Text>
          </View>
        </View>
      </View>

      {/* Water Button */}
      {garden.status === 'active' && !growth.is_bloomed && (
        <TouchableOpacity
          style={[styles.waterButton, watering && styles.waterButtonDisabled]}
          onPress={waterPlant}
          disabled={watering}
        >
          {watering ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Text style={styles.waterButtonEmoji}>💧</Text>
              <Text style={styles.waterButtonText}>Water Plant</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {growth.is_bloomed && (
        <View style={styles.bloomedContainer}>
          <Text style={styles.bloomedTitle}>🎉 Plant Bloomed! 🎉</Text>
          <Text style={styles.bloomedType}>
            Bloom Type: {growth.bloom_type.toUpperCase()}
          </Text>
          <Text style={styles.bloomedMessage}>
            Congratulations! You've successfully grown your plant together!
          </Text>
        </View>
      )}

      {/* Care History */}
      <View style={styles.historySection}>
        <Text style={styles.historyTitle}>Care History</Text>
        {careHistory.length > 0 ? (
          careHistory.map(action => (
            <View key={action.id} style={styles.historyItem}>
              <View style={styles.historyLeft}>
                <Text style={styles.historyAction}>
                  {getActionEmoji(action.action_type)} {getActionLabel(action.action_type)}
                </Text>
                <Text style={styles.historyUser}>{action.user_username}</Text>
              </View>
              <View style={styles.historyRight}>
                <Text style={styles.historyPoints}>+{action.points_earned} pts</Text>
                <Text style={styles.historyTime}>{formatTime(action.timestamp)}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noHistory}>No care actions yet</Text>
        )}
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Plant Info</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Duration:</Text>
          <Text style={styles.infoValue}>{plant.duration_days} days</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Difficulty:</Text>
          <Text style={styles.infoValue}>{plant.difficulty}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Growth Rate:</Text>
          <Text style={styles.infoValue}>{(plant.base_growth_rate * 100).toFixed(1)}% per day</Text>
        </View>
      </View>
    </ScrollView>
  );
}

// Helper functions
function getHealthColor(status) {
  const colors = {
    thriving: '#4CAF50',
    healthy: '#8BC34A',
    declining: '#FFC107',
    wilting: '#FF9800',
    dead: '#F44336',
  };
  return colors[status] || '#999';
}

function getActionEmoji(actionType) {
  const emojis = {
    water: '💧',
    meditation: '🧘',
    message: '💬',
  };
  return emojis[actionType] || '✨';
}

function getActionLabel(actionType) {
  const labels = {
    water: 'Watered',
    meditation: 'Meditated',
    message: 'Left Message',
  };
  return labels[actionType] || 'Action';
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
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
  },
  gardenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  partners: {
    fontSize: 14,
    color: '#666',
  },
  plantDisplayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    position: 'relative',
  },
  plantDisplay: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plantEmoji: {
    fontSize: 80,
  },
  bloomParticles: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  particle: {
    fontSize: 24,
    position: 'absolute',
  },
  progressSection: {
    backgroundColor: '#FFF',
    padding: 20,
    marginTop: 10,
    borderRadius: 12,
    marginHorizontal: 15,
  },
  progressHeader: {
    marginBottom: 15,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  stageText: {
    fontSize: 13,
    color: '#666',
  },
  progressContainer: {
    height: 16,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 15,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  waterButton: {
    backgroundColor: '#2196F3',
    marginHorizontal: 15,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  waterButtonDisabled: {
    opacity: 0.6,
  },
  waterButtonEmoji: {
    fontSize: 24,
  },
  waterButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bloomedContainer: {
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF1493',
    alignItems: 'center',
  },
  bloomedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bloomedType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  bloomedMessage: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
  },
  historySection: {
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  historyLeft: {
    flex: 1,
  },
  historyAction: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  historyUser: {
    fontSize: 12,
    color: '#999',
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyPoints: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 4,
  },
  historyTime: {
    fontSize: 11,
    color: '#999',
  },
  noHistory: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  infoSection: {
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    marginBottom: 30,
    padding: 20,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginTop: 20,
  },
});
