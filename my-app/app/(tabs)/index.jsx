
import  SplashScreen  from '../src/screens/Splash';
import RulesScreen from '../src/screens/RulesScreen';
import signin from '../src/screens/Signin';
import signup from '../src/screens/Signup';
import messages from '../src/screens/Messages';
import home from '../src/screens/Home';
import questions from '../src/screens/Questions';
import search from '../src/screens/Search';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, ScrollView } from 'react-native';
// Note: Do NOT wrap this file in a NavigationContainer.
// The app already provides a NavigationContainer at the root (Expo Router or app entry).
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Stack = createNativeStackNavigator();
const AuthTab = createBottomTabNavigator();

// Optional persistent storage: try to require AsyncStorage if installed.
let AsyncStorage;
try {
  // eslint-disable-next-line global-require
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  AsyncStorage = null;
}

// Reusable bottom navigation bar used on every screen
const NavBar = ({ navigation }) => {
  const tryNavigate = (name) => {
    // Check if the current navigator has the route
    try {
      const state = navigation.getState && navigation.getState();
      if (state && Array.isArray(state.routeNames) && state.routeNames.includes(name)) {
        navigation.navigate(name);
        return;
      }

      // Walk up parents to find a navigator that contains the route
      let parent = navigation.getParent && navigation.getParent();
      while (parent) {
        const pstate = parent.getState && parent.getState();
        if (pstate && Array.isArray(pstate.routeNames) && pstate.routeNames.includes(name)) {
          parent.navigate(name);
          return;
        }
        parent = parent.getParent && parent.getParent();
      }

      // Route not found: warn so developer can see what's wrong.
      // Fallback: attempt a best-effort navigate (may no-op).
      console.warn(`NavBar: route "${name}" not registered in current navigator`);
      navigation.navigate(name);
    } catch (e) {
      // If anything fails, try the simple navigate as a last resort
      navigation.navigate(name);
    }
  };

  const items = [
    { name: 'Home', label: 'Home' },
    { name: 'Description', label: 'Description' },
    { name: 'Rules', label: 'Rules' },
    { name: 'Profile', label: 'Profile' },
    { name: 'Settings', label: 'Settings' },
    { name: 'Signin', label: 'Signin' },
    { name: 'Signup', label: 'Signup' },
  ];

  return (
    <View style={styles.navBar}>
      {items.map((item) => (
        <TouchableOpacity key={item.name} style={styles.navButton} onPress={() => tryNavigate(item.name)}>
          <Text style={styles.navButtonText}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Screen wrapper keeps consistent layout: scrollable content + persistent nav bar
const ScreenWrapper = ({ children, navigation, showGetStarted, onGetStarted }) => (
  <SafeAreaView style={styles.container}>
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {children}
      {showGetStarted ? (
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={() => onGetStarted && onGetStarted()}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
        </TouchableOpacity>
      ) : null}
    </ScrollView>
    <NavBar navigation={navigation} />
  </SafeAreaView>
);

const HomeScreen = ({ navigation, setInitiated }) => (
  <ScreenWrapper navigation={navigation} showGetStarted={!!setInitiated} onGetStarted={setInitiated}>
    <Text style={styles.title}>Know Me, Grow Us</Text>
    <Text style={styles.smallText}>
      A guided intimacy game designed to deepen connection through curiosity,
      discovery, and play
    </Text>
  </ScreenWrapper>
);

const DiscriptionScreen = ({ navigation }) => (
  <ScreenWrapper navigation={navigation}>
    <SplashScreen />
  </ScreenWrapper>
);

const SettingsScreen = ({ navigation }) => (
  <ScreenWrapper navigation={navigation}>
    <Text style={styles.title}>Settings</Text>
    <Text style={styles.smallText}>Adjust preferences and game options here.</Text>
  </ScreenWrapper>
);

const ProfileScreen = ({ navigation }) => (
  <ScreenWrapper navigation={navigation}>
    <Text style={styles.title}>Profile</Text>
    <Text style={styles.smallText}>View and edit your profile information.</Text>
  </ScreenWrapper>
);

const GameRulesScreen = ({ navigation }) => (
  <ScreenWrapper navigation={navigation}>
    <Text style={styles.title}>Game Rules</Text>
    <Text style={styles.smallText}>Read the instructions and scoring rules.</Text>
    <RulesScreen />
  </ScreenWrapper>
);

const SigninScreen = ({ navigation, onAuthSuccess }) => {
  return signin({ navigation, onAuthSuccess });
};

const SignupScreen = ({ navigation, onAuthSuccess }) => {
  return signup({ navigation, onAuthSuccess });
};

// AppContainer controls initiation/auth flow and renders the appropriate navigator.
const AppContainer = () => {
  const [initiated, setInitiated] = useState(true);
  const [authenticated, setAuthenticated] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!AsyncStorage) return;
      try {
        const i = await AsyncStorage.getItem('initiated');
        const t = await AsyncStorage.getItem('authToken');
        if (!mounted) return;
        setInitiated(i === 'true');
        setAuthenticated(!!t);
      } catch (e) {
        // ignore
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const markInitiated = async () => {
    setInitiated(true);
    if (AsyncStorage) await AsyncStorage.setItem('initiated', 'true');
  };

  const markAuthenticated = async (token) => {
    setAuthenticated(true);
    if (AsyncStorage && token) await AsyncStorage.setItem('authToken', token);
  };

  if (!initiated) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home">
            {(props) => <HomeScreen {...props} setInitiated={markInitiated} />}
          </Stack.Screen>
        </Stack.Navigator>
      </>
    );
  }

  if (!authenticated) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <Stack.Navigator
          screenOptions={{
            headerShown: true,
            headerStyle: { backgroundColor: '#111111' },
            headerTintColor: '#fff',
            headerTitleStyle: { color: '#fff', fontFamily: 'montserrat-regular' },
          }}
        >
          <Stack.Screen name="Signin">
            {(props) => <signin {...props} onAuthSuccess={markAuthenticated} />}
          </Stack.Screen>
          <Stack.Screen name="Signup">
            {(props) => <signup {...props} onAuthSuccess={markAuthenticated} />}
          </Stack.Screen>
        </Stack.Navigator>
      </>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <Stack.Navigator
        screenOptions={{
          headerShown: true,
          headerStyle: { backgroundColor: '#111111' },
          headerTintColor: '#fff',
          headerTitleStyle: { color: '#fff', fontFamily: 'montserrat-regular' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
        <Stack.Screen name="Description" component={DiscriptionScreen} options={{ title: 'Description' }} />
        <Stack.Screen name="Rules" component={GameRulesScreen} options={{ title: 'Rules' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
        <Stack.Screen name="Messages" component={messages} options={{ title: 'Messages' }} />
        <Stack.Screen name="Questions" component={questions} options={{ title: 'Questions' }} />
        <Stack.Screen name="Search" component={search} options={{ title: 'Search' }} />
        <Stack.Screen name="Signin">
          {(props) => <SigninScreen {...props} onAuthSuccess={markAuthenticated} />}
        </Stack.Screen>
        <Stack.Screen name="Signup">
          {(props) => <SignupScreen {...props} onAuthSuccess={markAuthenticated} />}
        </Stack.Screen>
      </Stack.Navigator>
    </>
  );
};

export default AppContainer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#111111',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  navButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'montserrat-regular',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'montserrat-regular',
  },
  smallText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'montserrat-regular',
  },
});

// Note: AppContainer is exported above as default.