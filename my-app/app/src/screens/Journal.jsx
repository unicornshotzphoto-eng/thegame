import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { THEME } from '../constants/appTheme';
import JournalPrompts from './JournalPrompts';
import SharedJournals from './SharedJournals';
import BackgroundWrapper from '../components/BackgroundWrapper';

function Journal({ navigation }) {
  const [activeTab, setActiveTab] = useState('shared'); // 'shared' or 'prompts'

  return (
    <BackgroundWrapper overlayOpacity={0.5}>
      <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: 'rgba(139, 69, 19, 0.4)' }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.headerTitle, { color: '#E8C9A0' }]}>Journals</Text>
            <Text style={[styles.headerSubtitle, { color: '#C8A882' }]}>
              {activeTab === 'shared' ? 'Collaborative Space' : 'Self-Reflection'}
            </Text>
          </View>
          <Ionicons name="book-outline" size={20} color="#D4A574" />
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={[styles.tabBar, { backgroundColor: 'rgba(139, 69, 19, 0.4)', borderBottomColor: '#D4A574' }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'shared' && { borderBottomColor: '#D4A574', borderBottomWidth: 4 },
          ]}
          onPress={() => setActiveTab('shared')}
        >
          <Ionicons 
            name={activeTab === 'shared' ? 'people' : 'people-outline'} 
            size={20} 
            color={activeTab === 'shared' ? '#D4A574' : '#C8A882'} 
            style={styles.tabIcon}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === 'shared' ? '#D4A574' : '#C8A882' },
            ]}
          >
            Shared Journals
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'prompts' && { borderBottomColor: '#D4A574', borderBottomWidth: 4 },
          ]}
          onPress={() => setActiveTab('prompts')}
        >
          <Ionicons 
            name={activeTab === 'prompts' ? 'bulb' : 'bulb-outline'} 
            size={20} 
            color={activeTab === 'prompts' ? '#D4A574' : '#C8A882'}
            style={styles.tabIcon}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === 'prompts' ? '#D4A574' : '#C8A882' },
            ]}
          >
            Prompts
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Area - Scrollable */}
      <ScrollView 
        style={styles.contentArea}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'shared' ? <SharedJournals /> : <JournalPrompts />}
      </ScrollView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
  },
  header: {
    paddingHorizontal: 8,
    paddingVertical: 0,
    borderBottomWidth: 2,
    borderBottomColor: '#D4A574',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 0,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    display: 'none',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  tabIcon: {
    marginRight: 6,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  contentArea: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
});

export default Journal;
