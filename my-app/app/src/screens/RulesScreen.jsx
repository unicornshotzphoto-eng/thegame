import React from 'react';
import { Text, View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Title from '../common/Title';

const rules = [
  'One partner reads a question aloud.',
  'The other partner must guess the correct answer.',
  'The reader confirms correct or incorrect.',
  'Points are awarded for correct answers.',
  'Consequences are activated for incorrect answers.',
  'Players may switch roles each question or after each round.',
];

const playerRules = [
  'Always answer honestly.',
  'Guess based on knowledge, not assumptions.',
  'Do not rush; connection is intentional.',
  'Any question can be passed or replaced.',
  'Play with presence, curiosity, and enjoyment.',
  'Growth is the goal; points are the game.',
];

const endings = [
  'A player reaches the chosen point goal.',
  'Both partners decide to conclude the experience.',
];

const SectionTitle = ({ children }) => (
  <Text style={styles.sectionTitle}>{children}</Text>
);

const Bullet = ({ index, text }) => (
  <Text style={styles.text}>{index ? `${index}. ${text}` : `• ${text}`}</Text>
);

const Divider = () => <View style={styles.divider} />;

const RulesScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Title text="Instructions & Rules" />

        <SectionTitle>Player Rules</SectionTitle>
        {playerRules.map((p, i) => (
          <Text key={`player-${i}`} style={styles.text}>◦ {p}</Text>
        ))}

        <Divider />
        <SectionTitle>Rules</SectionTitle>
        {rules.map((r, i) => (
          <Bullet key={`rule-${i}`} index={i + 1} text={r} />
        ))}

        <SectionTitle>Game End</SectionTitle>
        {endings.map((e, i) => (
          <Text key={`end-${i}`} style={styles.indentText}>◦ {e}</Text>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  content: {
    padding: 20,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
    fontFamily: 'montserrat-regular',
    color: 'white',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
    color: 'white',
  },
  indentText: {
    paddingLeft: 12,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
    fontFamily: 'montserrat-regular',
    color: 'white',
  },
});

export default RulesScreen;