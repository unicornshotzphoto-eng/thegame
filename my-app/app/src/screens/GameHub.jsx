import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import api from '../core/api';
import { showAlert } from '../utils/alert';
import useStore from '../core/global';
import { THEME } from '../constants/appTheme';

function GameHub({ navigation }) {
  const user = useStore((state) => state.user);
  const [activeGames, setActiveGames] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchActiveGames();
  }, []);

  const fetchActiveGames = async () => {
    try {
      setLoading(true);
      const response = await api.get('/quiz/games/');
      setActiveGames(response.data.games || []);
    } catch (error) {
      console.error('Fetch games error:', error);
      showAlert('Error', 'Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGame = async () => {
    // Navigate to friend selection instead of creating immediately
    navigation.push('FriendSelection');
  };

  const handleJoinByCode = () => {
    if (navigation?.push) {
      navigation.push({ pathname: 'JoinGame' });
    } else if (navigation?.navigate) {
      navigation.navigate('JoinGame');
    }
  };

  const handleResumeGame = async (sessionId) => {
    if (navigation?.push) {
      navigation.push({ pathname: 'GamePlay', params: { sessionId } });
    } else if (navigation?.navigate) {
      navigation.navigate('GamePlay', { sessionId });
    }
  };

  const renderGameItem = ({ item }) => (
    <View style={styles.gameRow}>
      <Text style={styles.gameName}>{item.name}</Text>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${item.progress || 0}%` }]} />
      </View>
      <Text style={styles.playerCount}>{item.players_count || 1}</Text>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => handleResumeGame(item.id)}
      >
        <Text style={styles.actionButtonText}>Resume</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Quiz Games</Text>
        </View>

        {/* Create Game Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Create a New Game</Text>
          <Text style={styles.sectionSubtitle}>Invite your friends to play together in a quiz game.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleCreateGame}>
            <Text style={styles.primaryButtonText}>🎮 Create New Game</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleJoinByCode}>
            <Text style={styles.secondaryButtonText}>🔑 Join by Code</Text>
          </TouchableOpacity>
        </View>

        {/* Active Games Section */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={THEME.primary} />
          </View>
        ) : (
          <View style={styles.activeGamesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Games</Text>
              <Text style={styles.sectionSubtitle}>Jump back into a game in progress.</Text>
            </View>

            {activeGames.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No active games</Text>
                <Text style={styles.emptySubtext}>Create a new game to get started</Text>
              </View>
            ) : (
              <>
                {/* Table Header */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.headerCell, styles.gameNameHeader]}>Game</Text>
                  <Text style={[styles.headerCell, styles.progressHeader]}>Progress</Text>
                  <Text style={[styles.headerCell, styles.playersHeader]}>Players</Text>
                  <Text style={[styles.headerCell, styles.actionHeader]}>Action</Text>
                </View>

                {/* Games List */}
                <FlatList
                  data={activeGames}
                  renderItem={renderGameItem}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                  contentContainerStyle={styles.gamesListContent}
                />
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  scrollContent: {
    paddingBottom: THEME.spacing.xl,
  },
  header: {
    paddingHorizontal: THEME.spacing.xl,
    paddingVertical: THEME.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderLight,
  },
  title: {
    color: THEME.text.primary,
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'montserrat-regular',
  },
  section: {
    backgroundColor: THEME.surfaceDark,
    marginHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
  },
  sectionTitle: {
    color: THEME.text.primary,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: THEME.spacing.md,
    fontFamily: 'montserrat-regular',
  },
  sectionSubtitle: {
    color: THEME.text.secondary,
    fontSize: 14,
    marginBottom: THEME.spacing.lg,
    fontFamily: 'montserrat-regular',
  },
  primaryButton: {
    backgroundColor: THEME.primary,
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'montserrat-regular',
  },
  cancelButton: {
    backgroundColor: THEME.borderLight,
    marginTop: THEME.spacing.md,
  },
  cancelButtonText: {
    color: THEME.text.primary,
  secondaryButton: {
    backgroundColor: '#222',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  secondaryButtonText: {
    color: THEME.text.primary,
    fontWeight: '600',
    fontSize: 15,
  },
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'montserrat-regular',
  },
  joinFormContainer: {
    marginTop: THEME.spacing.md,
  },
  gameCodeInput: {
    backgroundColor: THEME.background,
    color: THEME.text.primary,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.border,
    fontFamily: 'montserrat-regular',
  },
  activeGamesSection: {
    marginHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.xl,
  },
  sectionHeader: {
    marginBottom: THEME.spacing.lg,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: THEME.spacing.xl,
  },
  emptyText: {
    color: THEME.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: THEME.spacing.md,
    fontFamily: 'montserrat-regular',
  },
  emptySubtext: {
    color: THEME.text.secondary,
    fontSize: 14,
    fontFamily: 'montserrat-regular',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.md,
    backgroundColor: THEME.surfaceDark,
    borderRadius: THEME.borderRadius.md,
    marginBottom: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderLight,
  },
  headerCell: {
    color: THEME.accent,
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'montserrat-regular',
  },
  gameNameHeader: {
    flex: 2,
  },
  progressHeader: {
    flex: 1.5,
  },
  playersHeader: {
    flex: 0.8,
    textAlign: 'center',
  },
  actionHeader: {
    flex: 1,
    textAlign: 'right',
  },
  gamesListContent: {
    paddingBottom: THEME.spacing.lg,
  },
  gameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.md,
    backgroundColor: THEME.surfaceDark,
    borderRadius: THEME.borderRadius.md,
    marginBottom: THEME.spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: THEME.primary,
  },
  gameName: {
    color: THEME.text.primary,
    fontSize: 16,
    fontWeight: '600',
    flex: 2,
    fontFamily: 'montserrat-regular',
  },
  progressContainer: {
    flex: 1.5,
    height: 8,
    backgroundColor: THEME.background,
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: THEME.spacing.md,
  },
  progressBar: {
    height: '100%',
    backgroundColor: THEME.primary,
  },
  playerCount: {
    color: THEME.text.primary,
    fontSize: 14,
    fontWeight: '600',
    flex: 0.8,
    textAlign: 'center',
    fontFamily: 'montserrat-regular',
  },
  actionButton: {
    flex: 1,
    backgroundColor: THEME.primary,
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.md,
    borderRadius: THEME.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'montserrat-regular',
  },
});

export default GameHub;
