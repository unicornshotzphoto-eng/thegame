import React from 'react';
import { Text, View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Title from '@/app/src/common/Title';
import BackgroundWrapper from '@/app/src/components/BackgroundWrapper';

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
    <BackgroundWrapper overlayOpacity={0.5}>
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
    </BackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    padding: 20,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
    width: '100%',
    backgroundColor: 'transparent',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
    fontFamily: 'montserrat-regular',
    color: '#E8C9A0',
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
    color: '#D4A574',
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
  },
  indentText: {
    paddingLeft: 12,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
    fontFamily: 'montserrat-regular',
    color: '#E8C9A0',
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
  },
  divider: {
    height: 2,
    backgroundColor: '#D4A574',
    marginVertical: 16,
    opacity: 0.6,
  },
});

export default RulesScreen;
