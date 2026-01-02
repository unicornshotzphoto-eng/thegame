import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { THEME } from '@/app/src/constants/appTheme';
import MiniNav from '@/app/components/MiniNav';

export default function RulesScreen() {
  return (
    <View style={styles.container}>
      <MiniNav />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={true}>
        <Text style={styles.title}>Game Rules</Text>

        {/* How to Play Section */}
        <Text style={styles.sectionTitle}>How to Play</Text>
        <View style={styles.section}>
          <Text style={styles.stepNumber}>1.</Text>
          <Text style={styles.stepText}>One partner reads a question aloud.</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.stepNumber}>2.</Text>
          <Text style={styles.stepText}>The other partner must guess the correct answer.</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.stepNumber}>3.</Text>
          <Text style={styles.stepText}>The reader confirms correct or incorrect.</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.stepNumber}>4.</Text>
          <Text style={styles.stepText}>Points are awarded for correct answers.</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.stepNumber}>5.</Text>
          <Text style={styles.stepText}>Consequences are activated for incorrect answers.</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.stepNumber}>6.</Text>
          <Text style={styles.stepText}>Players may switch roles each question or after each round.</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.stepNumber}>7.</Text>
          <Text style={styles.stepText}>The game ends when:</Text>
          <View style={styles.subList}>
            <Text style={styles.bulletPoint}>• A player reaches the chosen point goal, or</Text>
            <Text style={styles.bulletPoint}>• Both partners decide to conclude the experience.</Text>
          </View>
        </View>

        {/* Scoring Section */}
        <Text style={styles.sectionTitle}>Scoring</Text>
        <Text style={styles.description}>Each question is worth 1 to 3 points:</Text>
        <View style={styles.scoringItem}>
          <Text style={styles.scoringLabel}>1 point:</Text>
          <Text style={styles.scoringValue}>light, playful questions</Text>
        </View>
        <View style={styles.scoringItem}>
          <Text style={styles.scoringLabel}>2 points:</Text>
          <Text style={styles.scoringValue}>moderate or emotional questions</Text>
        </View>
        <View style={styles.scoringItem}>
          <Text style={styles.scoringLabel}>3 points:</Text>
          <Text style={styles.scoringValue}>intimate, revealing, or layered questions</Text>
        </View>

        {/* Consequence Options Section */}
        <Text style={styles.sectionTitle}>Consequence Options</Text>
        <Text style={styles.description}>
          Players may toggle which types they want available.
        </Text>
        <View style={styles.consequenceList}>
          <Text style={styles.consequenceItem}>• Truth-sharing</Text>
          <Text style={styles.consequenceItem}>• Romantic compliments</Text>
          <Text style={styles.consequenceItem}>• Revealing a fantasy</Text>
          <Text style={styles.consequenceItem}>• Describing a memory</Text>
          <Text style={styles.consequenceItem}>• Performing a creative response</Text>
          <Text style={styles.consequenceItem}>• Offering a commitment or intention</Text>
          <Text style={styles.consequenceItem}>• Mild sensual prompt (if Erotic Mode is enabled)</Text>
          <Text style={styles.consequenceItem}>• Sip or shot (if Drinking Mode is enabled)</Text>
        </View>

        {/* Core Player Rules */}
        <Text style={styles.sectionTitle}>Core Player Rules</Text>
        <View style={styles.rulesList}>
          <Text style={styles.ruleItem}>• Always answer honestly.</Text>
          <Text style={styles.ruleItem}>• Guess based on knowledge, not assumptions.</Text>
          <Text style={styles.ruleItem}>• Do not rush; connection is intentional.</Text>
          <Text style={styles.ruleItem}>• Consent and comfort are required at every step.</Text>
          <Text style={styles.ruleItem}>• Any question can be passed or replaced.</Text>
          <Text style={styles.ruleItem}>• Play with presence, curiosity, and enjoyment.</Text>
          <Text style={styles.ruleItem}>• Growth is the goal; points are the game.</Text>
        </View>

        {/* Drinking Mode Section */}
        <Text style={styles.sectionTitle}>Optional: Drinking Mode</Text>
        <Text style={styles.description}>
          Drinking Mode is entirely optional.
        </Text>
        <Text style={styles.subHeader}>If activated:</Text>
        <View style={styles.activatedList}>
          <Text style={styles.activatedItem}>• Incorrect answers may require a sip or a shot.</Text>
          <Text style={styles.activatedItem}>• Players must agree on limits beforehand.</Text>
        </View>
        <Text style={styles.subHeader}>If turned off:</Text>
        <Text style={styles.description}>
          All consequences are verbal, creative, romantic, or sensual.
        </Text>

        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: THEME.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.accent || '#e74c3c',
    marginTop: 20,
    marginBottom: 12,
  },
  section: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.accent || '#e74c3c',
    marginRight: 10,
    minWidth: 20,
  },
  stepText: {
    fontSize: 14,
    color: THEME.text,
    flex: 1,
    lineHeight: 20,
  },
  subList: {
    marginLeft: 24,
    marginTop: 8,
  },
  bulletPoint: {
    fontSize: 13,
    color: THEME.text,
    marginVertical: 4,
  },
  description: {
    fontSize: 13,
    color: THEME.text,
    marginBottom: 10,
    lineHeight: 18,
  },
  scoringItem: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  scoringLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.accent || '#e74c3c',
    marginRight: 10,
    minWidth: 70,
  },
  scoringValue: {
    fontSize: 13,
    color: THEME.text,
    flex: 1,
  },
  consequenceList: {
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  consequenceItem: {
    fontSize: 13,
    color: THEME.text,
    marginVertical: 6,
    lineHeight: 18,
  },
  rulesList: {
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  ruleItem: {
    fontSize: 13,
    color: THEME.text,
    marginVertical: 8,
    lineHeight: 18,
  },
  subHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.text,
    marginTop: 12,
    marginBottom: 8,
  },
  activatedList: {
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  activatedItem: {
    fontSize: 13,
    color: THEME.text,
    marginVertical: 6,
  },
  spacer: {
    height: 40,
  },
});
