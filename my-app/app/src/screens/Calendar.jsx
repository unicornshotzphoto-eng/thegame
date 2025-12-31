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
  Modal,
  Image,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../core/api';
import { showAlert } from '../utils/alert';
import useStore from '../core/global';
import { THEME } from '../constants/appTheme';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const { width } = Dimensions.get('window');
const CELL_WIDTH = (width - 40) / 7;

// Utility functions for calendar calculation
const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

const generateCalendarDays = (date) => {
  const daysInMonth = getDaysInMonth(date);
  const firstDay = getFirstDayOfMonth(date);
  const days = [];

  // Add empty cells for days before the month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return days;
};

const isToday = (day, currentDate) => {
  if (!day) return false;
  const today = new Date();
  return (
    day === today.getDate() &&
    currentDate.getMonth() === today.getMonth() &&
    currentDate.getFullYear() === today.getFullYear()
  );
};

function Calendar({ navigation }) {
  const [calendars, setCalendars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newCalendarName, setNewCalendarName] = useState('');
  const [selectedCalendarId, setSelectedCalendarId] = useState(null);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [creating, setCreating] = useState(false);
  const user = useStore((state) => state.user);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarDays, setCalendarDays] = useState([]);
  const [dayNotes, setDayNotes] = useState({});
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    loadCalendars();
    setCalendarDays(generateCalendarDays(currentDate));
  }, []);

  useEffect(() => {
    setCalendarDays(generateCalendarDays(currentDate));
  }, [currentDate]);

  const loadCalendars = async () => {
    try {
      setLoading(true);
      const response = await api.get('/quiz/calendars/');
      setCalendars(response.data.calendars || []);
    } catch (error) {
      console.error('Load calendars error:', error);
      showAlert('Error', 'Failed to load calendars');
    } finally {
      setLoading(false);
    }
  };

  const loadFriends = async () => {
    try {
      setLoadingFriends(true);
      const response = await api.get('/quiz/friends/');
      setFriends(response.data.friends || []);
      setSelectedFriends([]);
    } catch (error) {
      console.error('Load friends error:', error);
      showAlert('Error', 'Failed to load friends');
    } finally {
      setLoadingFriends(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCalendars();
    setRefreshing(false);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateSelect = (day) => {
    if (day) {
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      setSelectedDate(newDate);
    }
  };

  const getDateKey = (date) => {
    if (!date) return null;
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  };

  const openNoteModal = (date) => {
    const key = getDateKey(date);
    setNoteText(dayNotes[key] || '');
    setSelectedDate(date);
    setShowNoteModal(true);
  };

  const saveNote = () => {
    const key = getDateKey(selectedDate);
    if (key) {
      const newNotes = { ...dayNotes };
      if (noteText.trim()) {
        newNotes[key] = noteText;
      } else {
        delete newNotes[key];
      }
      setDayNotes(newNotes);
    }
    setShowNoteModal(false);
    setNoteText('');
  };

  const createCalendar = async () => {
    if (!newCalendarName.trim()) {
      showAlert('Error', 'Please enter a calendar name');
      return;
    }

    try {
      setCreating(true);
      const response = await api.post('/quiz/calendars/', {
        name: newCalendarName,
      });

      setCalendars([response.data.calendar, ...calendars]);
      setNewCalendarName('');
      setShowCreateForm(false);
      showAlert('Success', 'Calendar created!');
    } catch (error) {
      console.error('Create calendar error:', error);
      showAlert('Error', 'Failed to create calendar');
    } finally {
      setCreating(false);
    }
  };

  const openInviteModal = async (calendarId) => {
    setSelectedCalendarId(calendarId);
    await loadFriends();
    setShowInviteModal(true);
  };

  const toggleFriendSelection = (friendId) => {
    if (selectedFriends.includes(friendId)) {
      setSelectedFriends(selectedFriends.filter((id) => id !== friendId));
    } else {
      setSelectedFriends([...selectedFriends, friendId]);
    }
  };

  const inviteFriendsToCalendar = async () => {
    if (selectedFriends.length === 0) {
      showAlert('Error', 'Please select at least one friend');
      return;
    }

    try {
      setCreating(true);
      await api.post(`/quiz/calendars/${selectedCalendarId}/invite/`, {
        friend_ids: selectedFriends,
      });

      setShowInviteModal(false);
      setSelectedFriends([]);
      setSelectedCalendarId(null);
      await loadCalendars();
      showAlert('Success', 'Invitations sent!');
    } catch (error) {
      console.error('Invite error:', error);
      showAlert('Error', 'Failed to send invitations');
    } finally {
      setCreating(false);
    }
  };

  const openCalendar = (calendar) => {
    navigation.navigate('CalendarDetail', {
      calendarId: calendar.id,
      calendarName: calendar.name,
    });
  };

  const renderCalendarItem = ({ item }) => (
    <View style={styles.calendarCard}>
      <TouchableOpacity style={styles.calendarContent} onPress={() => openCalendar(item)}>
        <Text style={styles.calendarName}>{item.name}</Text>
        <Text style={styles.calendarMeta}>
          {item.members_count || 1} {(item.members_count || 1) === 1 ? 'member' : 'members'}
        </Text>
        <Text style={styles.calendarDate}>
          Created {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.inviteButton}
        onPress={() => openInviteModal(item.id)}
      >
        <Text style={styles.inviteButtonText}>Invite</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFriendItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.friendItem,
        selectedFriends.includes(item.id) && styles.friendItemSelected,
      ]}
      onPress={() => toggleFriendSelection(item.id)}
    >
      {item.thumbnail ? (
        <Image source={{ uri: item.thumbnail }} style={styles.friendAvatar} />
      ) : (
        <View style={[styles.friendAvatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarText}>{item.username.charAt(0).toUpperCase()}</Text>
        </View>
      )}
      <Text style={styles.friendName}>{item.username}</Text>
      {selectedFriends.includes(item.id) && (
        <Text style={styles.checkmark}>✓</Text>
      )}
    </TouchableOpacity>
  );

  const renderCalendarWidget = () => (
    <View style={styles.calendarWidget}>
      {/* Month/Year Header with Navigation */}
      <View style={styles.monthHeader}>
        <TouchableOpacity style={styles.navButton} onPress={previousMonth}>
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Text>
        <TouchableOpacity style={styles.navButton} onPress={nextMonth}>
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Day of Week Headers */}
      <View style={styles.weekDaysContainer}>
        {DAYS_OF_WEEK.map((day) => (
          <View key={day} style={styles.dayHeaderCell}>
            <Text style={styles.dayHeaderText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Days Grid */}
      <View style={styles.daysGrid}>
        {calendarDays.map((day, index) => {
          const isSelected = selectedDate && day === selectedDate.getDate() && 
                            currentDate.getMonth() === selectedDate.getMonth() &&
                            currentDate.getFullYear() === selectedDate.getFullYear();
          const isTodayDate = isToday(day, currentDate);
          const key = day ? `${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}` : null;
          const hasNote = key && dayNotes[key];

          return (
            <View
              key={index}
              style={[
                styles.dayCell,
                day === null && styles.emptyCell,
                isSelected && styles.selectedDay,
                isTodayDate && styles.todayDay,
              ]}
            >
              <TouchableOpacity
                style={styles.dayContent}
                onPress={() => day && handleDateSelect(day)}
                disabled={day === null}
              >
                <Text
                  style={[
                    styles.dayText,
                    day === null && styles.emptyDayText,
                    isSelected && styles.selectedDayText,
                    isTodayDate && styles.todayDayText,
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
              {day && (
                <TouchableOpacity
                  style={styles.noteButton}
                  onPress={() => openNoteModal(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                >
                  <Text style={[styles.noteIcon, hasNote && styles.noteIconActive]}>📝</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </View>

      {/* Selected Date Display */}
      {selectedDate && (
        <View style={styles.selectedDateInfo}>
          <Text style={styles.selectedDateLabel}>Selected Date:</Text>
          <Text style={styles.selectedDateValue}>
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          {dayNotes[getDateKey(selectedDate)] && (
            <View style={styles.notePreview}>
              <Text style={styles.notePreviewLabel}>Note:</Text>
              <Text style={styles.notePreviewText} numberOfLines={2}>
                {dayNotes[getDateKey(selectedDate)]}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shared Calendars</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateForm(!showCreateForm)}
        >
          <Text style={styles.createButtonText}>{showCreateForm ? 'Cancel' : '+'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Interactive Calendar Widget */}
        {renderCalendarWidget()}

        {/* Calendars List */}
        {showCreateForm && (
          <View style={styles.createFormContainer}>
            <TextInput
              style={styles.input}
              placeholder="Calendar Name"
              placeholderTextColor={THEME.text.secondary}
              value={newCalendarName}
              onChangeText={setNewCalendarName}
            />
            <TouchableOpacity
              style={[styles.submitButton, creating && styles.submitButtonDisabled]}
              onPress={createCalendar}
              disabled={creating}
            >
              <Text style={styles.submitButtonText}>
                {creating ? 'Creating...' : 'Create Calendar'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1a73e8" />
          </View>
        ) : calendars.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No calendars yet</Text>
            <Text style={styles.emptySubtext}>Create a calendar to get started</Text>
          </View>
        ) : (
          <FlatList
            data={calendars}
            renderItem={renderCalendarItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </ScrollView>

      <Modal
        visible={showInviteModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowInviteModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Invite Friends</Text>
              <TouchableOpacity onPress={() => setShowInviteModal(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {loadingFriends ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={THEME.primary} />
              </View>
            ) : friends.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No friends to invite</Text>
              </View>
            ) : (
              <>
                <FlatList
                  data={friends}
                  renderItem={renderFriendItem}
                  keyExtractor={(item) => item.id.toString()}
                  contentContainerStyle={styles.friendsListContent}
                  scrollEnabled={true}
                />
                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowInviteModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.inviteConfirmButton,
                      selectedFriends.length === 0 && styles.inviteConfirmButtonDisabled,
                    ]}
                    onPress={inviteFriendsToCalendar}
                    disabled={selectedFriends.length === 0 || creating}
                  >
                    <Text style={styles.inviteConfirmButtonText}>
                      {creating ? 'Inviting...' : `Invite (${selectedFriends.length})`}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showNoteModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowNoteModal(false)}
      >
        <View style={styles.noteModalOverlay}>
          <View style={styles.noteModalContent}>
            <View style={styles.noteModalHeader}>
              <Text style={styles.noteModalTitle}>Add Note</Text>
              <TouchableOpacity onPress={() => setShowNoteModal(false)}>
                <Text style={styles.noteModalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedDate && (
              <Text style={styles.noteModalDate}>
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            )}

            <TextInput
              style={styles.noteInput}
              placeholder="Write your note here..."
              placeholderTextColor="#666"
              value={noteText}
              onChangeText={setNoteText}
              multiline
              maxLength={500}
            />

            <View style={styles.noteModalFooter}>
              <TouchableOpacity
                style={styles.noteCancelButton}
                onPress={() => setShowNoteModal(false)}
              >
                <Text style={styles.noteCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.noteSaveButton}
                onPress={saveNote}
              >
                <Text style={styles.noteSaveButtonText}>Save Note</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.xl,
    paddingVertical: THEME.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderLight,
  },
  title: {
    color: THEME.text.primary,
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'montserrat-regular',
  },
  createButton: {
    backgroundColor: THEME.primary,
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
    backgroundColor: THEME.surfaceDark,
    padding: THEME.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderLight,
  },
  input: {
    backgroundColor: THEME.background,
    color: THEME.text.primary,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.border,
    fontFamily: 'montserrat-regular',
  },
  submitButton: {
    backgroundColor: THEME.primary,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
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
    paddingHorizontal: THEME.spacing.xl,
  },
  emptyText: {
    color: THEME.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: THEME.spacing.md,
    fontFamily: 'montserrat-regular',
  },
  emptySubtext: {
    color: THEME.text.muted,
    fontSize: 14,
    fontFamily: 'montserrat-regular',
  },
  listContent: {
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
  },
  calendarCard: {
    backgroundColor: THEME.surfaceDark,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: THEME.primary,
  },
  calendarContent: {
    flex: 1,
  },
  calendarName: {
    color: THEME.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: THEME.spacing.md,
    fontFamily: 'montserrat-regular',
  },
  calendarMeta: {
    color: THEME.text.secondary,
    fontSize: 11,
    marginBottom: THEME.spacing.sm,
    fontFamily: 'montserrat-regular',
  },
  calendarDate: {
    color: THEME.text.secondary,
    fontSize: 11,
    fontFamily: 'montserrat-regular',
  },
  inviteButton: {
    backgroundColor: THEME.primary,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    marginLeft: THEME.spacing.md,
  },
  inviteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'montserrat-regular',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  modalContent: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.xl,
    paddingVertical: THEME.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderLight,
  },
  modalTitle: {
    color: THEME.text.primary,
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'montserrat-regular',
  },
  modalCloseText: {
    color: THEME.text.primary,
    fontSize: 24,
  },
  friendsListContent: {
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.surfaceDark,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  friendItemSelected: {
    borderColor: THEME.primary,
    backgroundColor: THEME.primary,
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: THEME.spacing.md,
  },
  avatarPlaceholder: {
    backgroundColor: THEME.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: THEME.text.muted,
    fontSize: 12,
    fontWeight: 'bold',
  },
  friendName: {
    color: THEME.text.primary,
    fontSize: 14,
    flex: 1,
    fontFamily: 'montserrat-regular',
  },
  checkmark: {
    color: THEME.accent,
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: THEME.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: THEME.borderLight,
    gap: THEME.spacing.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: THEME.borderLight,
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: THEME.text.primary,
    fontWeight: 'bold',
    fontFamily: 'montserrat-regular',
  },
  inviteConfirmButton: {
    flex: 1,
    backgroundColor: THEME.primary,
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
  },
  inviteConfirmButtonDisabled: {
    opacity: 0.5,
  },
  inviteConfirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'montserrat-regular',
  },
  // Calendar Widget Styles
  scrollContent: {
    flexGrow: 1,
  },
  calendarWidget: {
    backgroundColor: THEME.surfaceDark,
    margin: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: THEME.borderLight,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.lg,
  },
  monthTitle: {
    color: THEME.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'montserrat-regular',
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: THEME.spacing.md,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: THEME.spacing.md,
    justifyContent: 'space-between',
  },
  dayHeaderCell: {
    flex: 1,
    height: CELL_WIDTH * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  dayHeader: {
    backgroundColor: 'transparent',
  },
  dayHeaderText: {
    color: THEME.accent,
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'montserrat-regular',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: THEME.spacing.lg,
    justifyContent: 'space-between',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: THEME.borderRadius.md,
    backgroundColor: 'transparent',
    marginBottom: THEME.spacing.md,
    padding: THEME.spacing.sm,
    position: 'relative',
  },
  dayContent: {
    width: '100%',
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteButton: {
    width: '100%',
    height: '30%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteIcon: {
    fontSize: 14,
    opacity: 0.4,
  },
  noteIconActive: {
    opacity: 1,
  },
  emptyCell: {
    backgroundColor: 'transparent',
  },
  emptyDayText: {
    color: 'transparent',
  },
  dayText: {
    color: THEME.text.primary,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'montserrat-regular',
  },
  todayDay: {
    backgroundColor: THEME.primary,
    borderWidth: 2,
    borderColor: THEME.accent,
  },
  todayDayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  selectedDay: {
    backgroundColor: THEME.accent,
    borderWidth: 2,
    borderColor: THEME.primary,
  },
  selectedDayText: {
    color: THEME.background,
    fontWeight: 'bold',
  },
  selectedDateInfo: {
    backgroundColor: THEME.surfaceDark,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: THEME.primary,
  },
  selectedDateLabel: {
    color: THEME.text.secondary,
    fontSize: 12,
    marginBottom: THEME.spacing.sm,
    fontFamily: 'montserrat-regular',
  },
  selectedDateValue: {
    color: THEME.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'montserrat-regular',
  },
  notePreview: {
    marginTop: THEME.spacing.md,
    paddingTop: THEME.spacing.md,
    borderTopWidth: 1,
    borderTopColor: THEME.borderLight,
  },
  notePreviewLabel: {
    color: THEME.text.secondary,
    fontSize: 11,
    marginBottom: THEME.spacing.sm,
    fontFamily: 'montserrat-regular',
  },
  notePreviewText: {
    color: '#ccc',
    fontSize: 12,
    fontFamily: 'montserrat-regular',
  },
  noteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  noteModalContent: {
    backgroundColor: THEME.surfaceDark,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: THEME.spacing.lg,
    maxHeight: '80%',
    borderTopWidth: 1,
    borderTopColor: THEME.borderLight,
  },
  noteModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  noteModalTitle: {
    color: THEME.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'montserrat-regular',
  },
  noteModalClose: {
    color: THEME.text.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  noteModalDate: {
    color: THEME.text.secondary,
    fontSize: 12,
    marginBottom: THEME.spacing.lg,
    fontFamily: 'montserrat-regular',
  },
  noteInput: {
    backgroundColor: THEME.background,
    color: THEME.text.primary,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    height: 150,
    marginBottom: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: THEME.border,
    textAlignVertical: 'top',
    fontFamily: 'montserrat-regular',
  },
  noteModalFooter: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
  },
  noteCancelButton: {
    flex: 1,
    backgroundColor: THEME.borderLight,
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
  },
  noteCancelButtonText: {
    color: THEME.text.primary,
    fontWeight: 'bold',
    fontFamily: 'montserrat-regular',
  },
  noteSaveButton: {
    flex: 1,
    backgroundColor: THEME.primary,
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
  },
  noteSaveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'montserrat-regular',
  },
});

export default Calendar;
