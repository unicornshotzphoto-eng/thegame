import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Image,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../core/api';
import { showAlert } from '../utils/alert';
import { THEME } from '../constants/appTheme';

function FriendSelection({ navigation, route }) {
  const router = useRouter();
  const localParams = useLocalSearchParams?.() || {};
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const returnScreen = (route?.params?.returnScreen) || localParams?.returnScreen || 'CategorySelection';
  const initialSelected = useMemo(() => {
    const raw = route?.params?.selectedParticipants ?? localParams?.selectedParticipants;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map((v) => Number(v));
    if (typeof raw === 'string') return raw.split(',').filter(Boolean).map((v) => Number(v));
    return [];
  }, [route?.params?.selectedParticipants, localParams?.selectedParticipants]);

  useEffect(() => {
    // Initialize selected friends if coming from CategorySelection
    console.log('FriendSelection - returnScreen:', returnScreen);
    console.log('FriendSelection - initialSelected:', initialSelected);
    if (initialSelected && initialSelected.length > 0) {
      console.log('Initializing selected friends with:', initialSelected);
      setSelectedFriends(new Set(initialSelected));
    }
  }, [returnScreen, initialSelected]);

  useFocusEffect(
    useCallback(() => {
      loadFriends();
    }, [])
  );

  const loadFriends = async () => {
    try {
      setLoading(true);
      const response = await api.get('/quiz/friends/');
      setFriends(response.data.friends || []);
    } catch (error) {
      console.error('Load friends error:', error);
      showAlert('Error', 'Failed to load friends');
    } finally {
      setLoading(false);
    }
  };

  const toggleFriend = (friendId) => {
    const newSelected = new Set(selectedFriends);
    if (newSelected.has(friendId)) {
      newSelected.delete(friendId);
    } else {
      newSelected.add(friendId);
    }
    setSelectedFriends(newSelected);
  };

  const handleContinue = () => {
    const participantArray = Array.from(selectedFriends);
    console.log('FriendSelection handleContinue - returnScreen:', returnScreen);
    console.log('FriendSelection handleContinue - selectedFriends:', participantArray);
    
    // Navigate based on where we came from
    const params = { participantIds: participantArray.join(',') };
    router.push({ pathname: 'CategorySelection', params });
  };

  const filteredFriends = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter(friend =>
      friend.username.toLowerCase().includes(q) ||
      friend.email.toLowerCase().includes(q)
    );
  }, [friends, searchQuery]);
  const ITEM_HEIGHT = 76;

  const FriendRow = React.memo(function FriendRow({ item, selected, onToggle }) {
    return (
      <TouchableOpacity
        style={[styles.friendCard, selected && styles.friendCardSelected]}
        onPress={() => onToggle(item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.friendInfo}>
          {item.thumbnail ? (
            <Image source={{ uri: item.thumbnail }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>{item.username.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View style={styles.userDetails}>
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.email}>{item.email}</Text>
          </View>
        </View>
        {selected && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  });

  const renderFriendItem = useCallback(({ item }) => (
    <FriendRow
      item={item}
      selected={selectedFriends.has(item.id)}
      onToggle={toggleFriend}
    />
  ), [selectedFriends]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Players</Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search friends..."
          placeholderTextColor={THEME.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.primary} />
        </View>
      ) : friends.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No friends yet</Text>
          <Text style={styles.emptySubtext}>Add friends first before creating a game</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={filteredFriends}
            renderItem={renderFriendItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={12}
            windowSize={8}
            maxToRenderPerBatch={12}
            getItemLayout={(data, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
          />
          <Text style={styles.selectedCount}>
            {selectedFriends.size} {selectedFriends.size === 1 ? 'friend' : 'friends'} selected
          </Text>
        </>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (selectedFriends.size === 0 || friends.length === 0) && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={selectedFriends.size === 0 || friends.length === 0}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    backgroundColor: THEME.surfaceDark,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderLight,
  },
  backButton: {
    paddingHorizontal: THEME.spacing.md,
  },
  backButtonText: {
    color: THEME.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: THEME.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  spacer: {
    width: 50,
  },
  searchContainer: {
    padding: THEME.spacing.lg,
    backgroundColor: THEME.surfaceDark,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderLight,
  },
  searchInput: {
    backgroundColor: THEME.background,
    borderRadius: THEME.borderRadius.lg,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    color: THEME.text.primary,
    fontSize: 14,
    borderWidth: 1,
    borderColor: THEME.borderLight,
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
    padding: THEME.spacing.xl,
  },
  emptyText: {
    color: THEME.text.secondary,
    fontSize: 18,
    marginBottom: THEME.spacing.md,
  },
  emptySubtext: {
    color: THEME.text.muted,
    fontSize: 14,
  },
  listContainer: {
    padding: THEME.spacing.lg,
  },
  friendCard: {
    backgroundColor: THEME.surfaceDark,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    borderWidth: 2,
    borderColor: THEME.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendCardSelected: {
    borderColor: THEME.primary,
    backgroundColor: THEME.primary + '15',
  },
  friendInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: THEME.spacing.md,
  },
  avatarPlaceholder: {
    backgroundColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    color: THEME.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: THEME.spacing.sm,
  },
  email: {
    color: THEME.text.secondary,
    fontSize: 14,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedCount: {
    color: THEME.text.secondary,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: THEME.spacing.md,
  },
  footer: {
    padding: THEME.spacing.lg,
    backgroundColor: THEME.surfaceDark,
    borderTopWidth: 1,
    borderTopColor: THEME.borderLight,
  },
  continueButton: {
    backgroundColor: THEME.primary,
    paddingVertical: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.lg,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: THEME.text.muted,
    opacity: 0.6,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FriendSelection;
