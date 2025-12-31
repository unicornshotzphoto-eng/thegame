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

function Journal({ navigation }) {
  const [activeTab, setActiveTab] = useState('shared'); // 'shared' or 'prompts'

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: THEME.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: THEME.surfaceDark }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.headerTitle, { color: THEME.white }]}>Journals</Text>
            <Text style={[styles.headerSubtitle, { color: THEME.subtext }]}>
              {activeTab === 'shared' ? 'Collaborative Space' : 'Self-Reflection'}
            </Text>
          </View>
          <Ionicons name="book-outline" size={20} color={THEME.primary} />
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={[styles.tabBar, { backgroundColor: THEME.surface, borderBottomColor: THEME.border }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'shared' && { borderBottomColor: THEME.primary, borderBottomWidth: 4 },
          ]}
          onPress={() => setActiveTab('shared')}
        >
          <Ionicons 
            name={activeTab === 'shared' ? 'people' : 'people-outline'} 
            size={20} 
            color={activeTab === 'shared' ? THEME.primary : THEME.subtext} 
            style={styles.tabIcon}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === 'shared' ? THEME.primary : THEME.subtext },
            ]}
          >
            Shared Journals
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'prompts' && { borderBottomColor: THEME.primary, borderBottomWidth: 4 },
          ]}
          onPress={() => setActiveTab('prompts')}
        >
          <Ionicons 
            name={activeTab === 'prompts' ? 'bulb' : 'bulb-outline'} 
            size={20} 
            color={activeTab === 'prompts' ? THEME.primary : THEME.subtext}
            style={styles.tabIcon}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === 'prompts' ? THEME.primary : THEME.subtext },
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
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
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
    borderBottomWidth: 1,
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
