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
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../core/api';
import { showAlert } from '../utils/alert';
import useStore from '../core/global';

function CalendarDetail({ route, navigation }) {
  const { calendarId, calendarName } = route.params;
  const [calendar, setCalendar] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().getTime() + 60 * 60 * 1000)); // 1 hour later
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#1a73e8');
  const [creating, setCreating] = useState(false);
  const user = useStore((state) => state.user);

  const COLORS = ['#1a73e8', '#ea4335', '#4285f4', '#34a853', '#fbbc04', '#ea4335', '#9c27b0', '#ff6d00'];

  // Helper function to format date for display
  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Helper function to parse date from input
  const parseDateFromInput = (dateString) => {
    return new Date(dateString);
  };

  useEffect(() => {
    loadCalendarData();
  }, []);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/quiz/calendars/${calendarId}/`);
      setCalendar(response.data.calendar);
      setEvents(response.data.calendar.events || []);
    } catch (error) {
      console.error('Load calendar error:', error);
      showAlert('Error', 'Failed to load calendar');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCalendarData();
    setRefreshing(false);
  };

  const handleStartDateChange = (text) => {
    if (text) {
      const newDate = parseDateFromInput(text);
      if (!isNaN(newDate.getTime())) {
        setStartDate(newDate);
        if (newDate > endDate) {
          setEndDate(new Date(newDate.getTime() + 60 * 60 * 1000));
        }
      }
    }
  };

  const handleEndDateChange = (text) => {
    if (text) {
      const newDate = parseDateFromInput(text);
      if (!isNaN(newDate.getTime())) {
        setEndDate(newDate);
      }
    }
  };

  const createEvent = async () => {
    if (!newEventTitle.trim()) {
      showAlert('Error', 'Please enter an event title');
      return;
    }

    if (startDate >= endDate) {
      showAlert('Error', 'End date must be after start date');
      return;
    }

    try {
      setCreating(true);
      const response = await api.post(`/quiz/calendars/${calendarId}/events/`, {
        title: newEventTitle,
        description: newEventDescription,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        color: selectedColor,
      });

      setEvents([response.data.event, ...events]);
      setNewEventTitle('');
      setNewEventDescription('');
      setStartDate(new Date());
      setEndDate(new Date(new Date().getTime() + 60 * 60 * 1000));
      setSelectedColor('#1a73e8');
      setShowEventForm(false);
      showAlert('Success', 'Event created!');
    } catch (error) {
      console.error('Create event error:', error);
      showAlert('Error', 'Failed to create event');
    } finally {
      setCreating(false);
    }
  };

  const deleteEvent = async (eventId) => {
    Alert.alert('Delete Event', 'Are you sure you want to delete this event?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/quiz/calendars/${calendarId}/events/${eventId}/`);
            setEvents(events.filter((e) => e.id !== eventId));
            showAlert('Success', 'Event deleted');
          } catch (error) {
            console.error('Delete event error:', error);
            showAlert('Error', 'Failed to delete event');
          }
        },
      },
    ]);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderEventItem = ({ item }) => (
    <View
      style={[
        styles.eventCard,
        { borderLeftColor: item.color || '#1a73e8' },
      ]}
    >
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        {item.description && (
          <Text style={styles.eventDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <View style={styles.eventTimeContainer}>
          <Text style={styles.eventTime}>{formatDateTime(item.start_date)}</Text>
          <Text style={styles.eventTimeSeparator}>→</Text>
          <Text style={styles.eventTime}>{formatDateTime(item.end_date)}</Text>
        </View>
        <Text style={styles.eventCreator}>by {item.creator.username}</Text>
      </View>
      {item.creator.id === user.id && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteEvent(item.id)}
        >
          <Text style={styles.deleteButtonText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1a73e8" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{calendarName}</Text>
          {calendar && (
            <Text style={styles.memberCount}>
              {calendar.members_count} {calendar.members_count === 1 ? 'member' : 'members'}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowEventForm(!showEventForm)}
        >
          <Text style={styles.createButtonText}>{showEventForm ? '✕' : '+'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {showEventForm && (
          <View style={styles.eventFormContainer}>
            <Text style={styles.formTitle}>Create Event</Text>

            <TextInput
              style={styles.input}
              placeholder="Event Title"
              placeholderTextColor="#666"
              value={newEventTitle}
              onChangeText={setNewEventTitle}
            />

            <TextInput
              style={[styles.input, styles.descriptionInput]}
              placeholder="Description (optional)"
              placeholderTextColor="#666"
              value={newEventDescription}
              onChangeText={setNewEventDescription}
              multiline
            />

            {/* Start Date/Time */}
            <Text style={styles.inputLabel}>Start Date & Time</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DDTHH:MM (e.g., 2025-01-15T14:30)"
              placeholderTextColor="#666"
              value={formatDateForInput(startDate)}
              onChangeText={handleStartDateChange}
            />

            {/* End Date/Time */}
            <Text style={styles.inputLabel}>End Date & Time</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DDTHH:MM (e.g., 2025-01-15T15:30)"
              placeholderTextColor="#666"
              value={formatDateForInput(endDate)}
              onChangeText={handleEndDateChange}
            />

            {/* Color Selection */}
            <View style={styles.colorContainer}>
              <Text style={styles.colorLabel}>Event Color</Text>
              <View style={styles.colorGrid}>
                {COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorOptionSelected,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  >
                    {selectedColor === color && (
                      <Text style={styles.colorCheckmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, creating && styles.submitButtonDisabled]}
              onPress={createEvent}
              disabled={creating}
            >
              <Text style={styles.submitButtonText}>
                {creating ? 'Creating...' : 'Create Event'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {events.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No events yet</Text>
            <Text style={styles.emptySubtext}>Create an event to get started</Text>
          </View>
        ) : (
          <FlatList
            data={events}
            renderItem={renderEventItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'montserrat-regular',
  },
  memberCount: {
    color: '#999',
    fontSize: 12,
    marginTop: 4,
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
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventFormContainer: {
    backgroundColor: '#111111',
    margin: 15,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#333333',
  },
  formTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    fontFamily: 'montserrat-regular',
  },
  input: {
    backgroundColor: '#222222',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
    fontFamily: 'montserrat-regular',
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputLabel: {
    color: '#999',
    fontSize: 12,
    marginBottom: 8,
    fontFamily: 'montserrat-regular',
    fontWeight: '500',
  },
  dateButton: {
    backgroundColor: '#222222',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  dateButtonLabel: {
    color: '#999',
    fontSize: 12,
    marginBottom: 6,
    fontFamily: 'montserrat-regular',
  },
  dateButtonValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'montserrat-regular',
  },
  colorContainer: {
    marginBottom: 15,
  },
  colorLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'montserrat-regular',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorOption: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#fff',
  },
  colorCheckmark: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#1a73e8',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'montserrat-regular',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
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
  eventCard: {
    backgroundColor: '#111111',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    fontFamily: 'montserrat-regular',
  },
  eventDescription: {
    color: '#999',
    fontSize: 12,
    marginBottom: 8,
    fontFamily: 'montserrat-regular',
  },
  eventTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventTime: {
    color: '#666',
    fontSize: 11,
    fontFamily: 'montserrat-regular',
  },
  eventTimeSeparator: {
    color: '#666',
    fontSize: 11,
    marginHorizontal: 6,
  },
  eventCreator: {
    color: '#666',
    fontSize: 10,
    fontStyle: 'italic',
    fontFamily: 'montserrat-regular',
  },
  deleteButton: {
    backgroundColor: '#333333',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  deleteButtonText: {
    color: '#ea4335',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CalendarDetail;
