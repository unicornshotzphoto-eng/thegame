import { Text, StatusBar, View, StyleSheet, Animated, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Title from '../common/Title';
import { use, useEffect} from 'react';

const rules = [
  "Always answer honestly.",
  "Guess based on knowledge, not assumptions.",
  "Do not rush; connection is intentional.",
  "Any question can be passed or replaced.",
  "Play with presence, curiosity, and enjoyment.",
  "Growth is the goal; points are the game."
];

const RuleList = () => {
  return (
    // Wrap all elements in a single root container, like a React Fragment
    <> 
      <View style={styles.container}>
        <Title text="Player Rules" />      
        {rules.map((rule, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.itemText}>{rule}</Text>
          </View>
        ))}
      </View>
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: 'black',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    marginRight: 8,
    fontSize: 16, // Adjust size as needed
    lineHeight: 24, // Ensure vertical alignment
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: 'white',
  },
});

export default RuleList;