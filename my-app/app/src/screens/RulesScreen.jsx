import { Text, StatusBar, View, StyleSheet, Animated, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Title from '../common/Title';
import { use, useEffect} from 'react';

const RulesScreen = () => {
      return (
        <View style={styles.container}>
          <ScrollView style={styles.scrollView}>
            <Title text ="Instructions & Rules" />
            <Text style={styles.text}>
             1. One partner reads a question aloud.
            </Text>
            <Text style={styles.text}>
2. The other partner must guess the correct answer.
            </Text>
            <Text style={styles.text}>
3. The reader confirms correct or incorrect.
            </Text>
            <Text style={styles.text}>
4. Points are awarded for correct answers. 
            </Text>
            <Text style={styles.text}>
5. Consequences are activated for incorrect answers.
            </Text>
            <Text style={styles.text}>
6. Players may switch roles each question or after each   
round.
            </Text>
            <Text style={styles.text}>

7. The game ends when:
</Text>
            <Text style={styles.indenttext}>
            
          ◦ A player reaches the chosen point goal, or
          </Text>
           <Text style={styles.indenttext}>
          ◦ Both partners decide to conclude the experience.
            
            </Text>
           

            <Text style={styles.meduimtext}>

Scoring
</Text>
            <Text style={styles.text}>
• Each question is worth 1 to 3 points.
            </Text>
            <Text style={styles.text}>

◦ 1 point: light, playful questions
            </Text>
            <Text style={styles.text}>
◦ 2 points: moderate or emotional questions
            </Text>
            <Text style={styles.text}>
◦ 3 points: intimate, revealing, or layered questions
            </Text>
          </ScrollView>
        </View>
      );
    };
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'black',
  },
  scrollView: {
    flex: 1, // Allow ScrollView to take available vertical space
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    padding: 10,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
    fontFamily: 'montserrat-regular',
    color: 'white',
  },
  meduimtext: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 24,
    marginBottom: 10,
    fontFamily: 'montserrat-regular',
    color: 'white',
  },
   indenttext: {
    paddingLeft: 20,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
    fontFamily: 'montserrat-regular',
    color: 'white',
  },
});

export default RulesScreen;