import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import api from '../core/api';
import useStore from '../core/global';

function JoinGame({ navigation }) {
  const user = useStore((state) => state.user);
  const [gameCode, setGameCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeError, setCodeError] = useState('');

  const handleJoinGame = async () => {
    if (!gameCode.trim()) {
      setCodeError('Please enter a game code');
      return;
    }

    if (gameCode.length !== 6) {
      setCodeError('Game code must be 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/quiz/games/join/', {
        game_code: gameCode.toUpperCase()
      });

      console.log('Joined game successfully:', response.data);
      const sessionId = response.data.id;
      
      console.log('Session ID:', sessionId);
      console.log('Response data keys:', Object.keys(response.data));
      
      if (!sessionId) {
        Alert.alert('Error', 'Failed to get session ID from response');
        console.error('No ID in response:', response.data);
        return;
      }

      // Navigate to GamePlay screen
      console.log('Navigating to GamePlay with sessionId:', sessionId);
      if (navigation?.push) {
        navigation.push({ pathname: 'GamePlay', params: { sessionId, gameCode: gameCode.toUpperCase() } });
      } else if (navigation?.navigate) {
        navigation.navigate('GamePlay', { sessionId, gameCode: gameCode.toUpperCase() });
      }
    } catch (error) {
      console.error('Error joining game:', error);
      const errorMsg = error.response?.data?.error || 'Failed to join game. Check the code and try again.';
      setCodeError(errorMsg);
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGame = () => {
    if (navigation?.push) {
      navigation.push({ pathname: 'FriendSelection' });
    } else if (navigation?.navigate) {
      navigation.navigate('FriendSelection');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Join a Game</Text>
          <Text style={styles.subtitle}>Enter the 6-character game code to join an existing game</Text>
        </View>

        {/* Game Code Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Game Code</Text>
          <TextInput
            style={[styles.input, codeError ? styles.inputError : null]}
            placeholder="e.g., ABC123"
            placeholderTextColor="#666"
            value={gameCode}
            onChangeText={(text) => {
              setGameCode(text.toUpperCase());
              setCodeError('');
            }}
            maxLength={6}
            editable={!loading}
            autoCapitalize="characters"
          />
          {codeError ? (
            <Text style={styles.errorText}>{codeError}</Text>
          ) : null}
        </View>

        {/* Character count */}
        <Text style={styles.charCount}>{gameCode.length}/6 characters</Text>

        {/* Join Button */}
        <TouchableOpacity
          style={[styles.joinButton, loading && styles.buttonDisabled]}
          onPress={handleJoinGame}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.joinButtonText}>Join Game</Text>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Create Game Button */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateGame}
          disabled={loading}
        >
          <Text style={styles.createButtonText}>Create a New Game</Text>
        </TouchableOpacity>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How it works</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>Ask the game creator for the 6-character game code</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>Enter the code above to join the game</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>You'll be added to the game and can start playing</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  headerSection: {
    marginBottom: 32,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    lineHeight: 24,
  },
  inputSection: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 13,
    marginTop: 8,
  },
  charCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginBottom: 20,
  },
  joinButton: {
    backgroundColor: '#1a73e8',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 20,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#666',
    fontSize: 14,
  },
  createButton: {
    borderWidth: 1,
    borderColor: '#28a745',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 32,
  },
  createButtonText: {
    color: '#28a745',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#1a73e8',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a73e8',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoBullet: {
    color: '#999',
    fontSize: 14,
    marginRight: 10,
    width: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#ccc',
    lineHeight: 20,
  },
});

export default JoinGame;
