import { Text, View, StyleSheet, ScrollView } from 'react-native';
import Title from '../common/Title';

// function SplashScreen () {

//   const translatey = new Animated.Value(0);
//   const duration = 5000;
//    useEffect(() => {
//     Animated.timing(translatey, {
//       toValue: 20,
//       duration: duration,
//       useNativeDriver: true,
//     }).start();
//    }, []);
//   return (
//     <SafeAreaView style={styles.container}>
//       {/* The inner View now has flex: 1 and the background color, ensuring it fills the safe area */}
//       <View style={styles.contentArea}>
//         <Title text ="Know Me, Grow Us" />
//         <ScrollView style={styles.ScrollView}
//           <Text style={styles.smalltextStyle}>
//           Know Me, Grow Us is an intimacy-expansion game
// designed for couples and partners of all dynamics. The game

// blends playful discovery with meaningful connection by
// inviting players to guess each other’s truths across multiple
// dimensions: spiritual, mental, physical, romantic, honest, and
// erotic.

// The purpose of this game is to strengthen awareness, deepen
// communication, create new shared memories, and increase

// emotional and sensual closeness. It is designed for long-
// distance couples, in-person partners, online relationships,

// new relationships, established relationships, and couples
// looking to re-explore one another.

// This game balances depth and fun, proving that intimacy can
// be lighthearted, exploratory, energizing, sensual, and playful
// all at once. It encourages couples to learn each other with
// intention while enjoying the excitement of guessing,
// revealing, challenging, and discovering.
//           </Text>
//         </ScrollView>
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     // This makes the SafeAreaView fill the initial space provided by React Native Navigation/App wrapper
//     flex: 1,
//     // Optional: You can put the background here too if you want the safe area edges colored
//     backgroundColor: 'black', 
//   },
//   contentArea: {
//     // This View now expands to fill the entire container (SafeAreaView), 
//     // ensuring the background color covers all available space within the safe area.
//     flex: 1,
//     justifyContent: 'center', // Centers content vertically
//     alignItems: 'center',     // Centers content horizontally
//     backgroundColor: 'black', // The background color for the main screen area
//   },
//   textStyle: {
//     fontSize: 48,
//     textAlign: 'center',
//     fontFamily: 'montserrat-regular',
//     color: 'white',
//     // Removed flex: 1 from Text style as it's no longer needed and caused layout issues.
//   },
//   smalltextStyle: {
//     fontSize: 20,
//     textAlign: 'center',
//     fontFamily: 'montserrat-regular',
//     color: 'white',
//     // Removed flex: 1 from Text style as it's no longer needed and caused layout issues.
//   },
// });

// export default SplashScreen;
const SplashScreen = () => {
      return (
        <View style={styles.container}>
          <ScrollView style={styles.scrollView}>
            <Title text ="Know Me, Grow Us" />
            <Text style={styles.text}>
              Know Me, Grow Us is an intimacy-expansion game
              designed for couples and partners of all dynamics. The game
                blends playful discovery with meaningful connection by
                inviting players to guess each other’s truths across multiple
                dimensions: spiritual, mental, physical, romantic, honest, and
                erotic.
            </Text>
            <Text style={styles.text}>
                The purpose of this game is to strengthen awareness, deepen
                communication, create new shared memories, and increase
                emotional and sensual closeness. It is designed for long-
                distance couples, in-person partners, online relationships,
                new relationships, established relationships, and couples
                looking to re-explore one another.
            </Text>
            <Text style={styles.text}>
                This game balances depth and fun, proving that intimacy can
                be lighthearted, exploratory, energizing, sensual, and playful
                all at once. It encourages couples to learn each other with
                intention while enjoying the excitement of guessing,
                revealing, challenging, and discovering.
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
});

export default SplashScreen;