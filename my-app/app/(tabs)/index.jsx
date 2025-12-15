
import  SplashScreen  from '../src/screens/Splash';
import RulesScreen from '../src/screens/RulesScreen';
import Signin from '../src/screens/Signin';
import Signup from '../src/screens/Signup';
import Messages from '../src/screens/Messages';
import Home from '../src/screens/Home';
import Questions from '../src/screens/Questions';
import Search from '../src/screens/Search';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, ScrollView, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { showAlert } from '../src/utils/alert';
import api from '../src/core/api';
import { getUserData, clearSecureStorage, storeUserData } from '../src/core/secureStorage';
// Note: Do NOT wrap this file in a NavigationContainer.
// The app already provides a NavigationContainer at the root (Expo Router or app entry).
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import useStore from '../src/core/global';


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
  const logout = useStore((state) => state.logout);
  const authenticated = useStore((state) => state.authenticated);
  const user = useStore((state) => state.user);
  
  console.log('NavBar render - authenticated:', authenticated, 'user:', user);
  console.log('Full Zustand state:', useStore.getState());
  
  const handleLogout = async () => {
    console.log('Logging out...');
    logout();
    // Clear all encrypted storage
    await clearSecureStorage();
    // Also clear AsyncStorage if used for non-sensitive data
    if (AsyncStorage) {
      await AsyncStorage.removeItem('initiated');
    }
  };
  
  const tryNavigate = (name) => {
    console.log('NavBar: Navigating to:', name, '| authenticated:', authenticated);
    console.log('Navigation object:', navigation);
    console.log('Navigation methods:', Object.keys(navigation));
    try {
      if (!navigation || typeof navigation.navigate !== 'function') {
        console.error('Navigation object is invalid or navigate is not a function');
        return;
      }
      navigation.navigate(name);
      console.log('Navigation successful to:', name);
    } catch (e) {
      console.error('NavBar navigation error:', e);
      console.error('Error stack:', e.stack);
    }
  };

  const items = authenticated ? [
    { name: 'Home', label: 'Home' },
    { name: 'Rules', label: 'Rules' },
    { name: 'Questions', label: 'Questions' },
    { name: 'Profile', label: 'Profile' },
    { name: 'Settings', label: 'Settings' },
  ] : [
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
      {authenticated && (
        <TouchableOpacity style={styles.navButton} onPress={handleLogout}>
          <Text style={styles.navButtonText}>Logout</Text>
        </TouchableOpacity>
      )}
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

const ProfileScreen = ({ navigation }) => {
  const user = useStore((state) => state.user);
  const [image, setImage] = React.useState(user.thumbnail || null);
  
  const pickImage = async () => {
    // Request permission and pick image
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Permission denied', 'We need camera roll permissions to upload a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setImage(imageUri);
      
      try {
        // Get user data from encrypted storage to retrieve token
        const userData = await getUserData();
        if (!userData) {
          showAlert('Error', 'Please log in again');
          return;
        }
        
        const token = userData.access;
        
        // Create form data
        const formData = new FormData();
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formData.append('thumbnail', {
          uri: imageUri,
          name: filename,
          type: type,
        });
        
        // Upload to backend
        const response = await api.post('quiz/profile/picture/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        // Update Zustand store with new user data
        login(response.data.user);
        
        showAlert('Success', 'Profile picture updated!');
      } catch (error) {
        console.error('Upload error:', error);
        showAlert('Error', error.response?.data?.error || 'Failed to upload profile picture');
      }
    }
  };
  
  return (
    <ScreenWrapper navigation={navigation}>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
          {image || user?.thumbnail ? (
            <Image 
              source={{ uri: image || `http://192.168.1.210:8000${user.thumbnail}` }} 
              style={styles.profileImage} 
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>Tap to upload</Text>
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.username}>{user.username || 'Guest'}</Text>
        <Text style={styles.email}>{user.email || ''}</Text>
      </View>
    </ScreenWrapper>
  );
};

const GameRulesScreen = ({ navigation }) => (
  <ScreenWrapper navigation={navigation}>
    <Text style={styles.title}>Game Rules</Text>
    <Text style={styles.smallText}>Read the instructions and scoring rules.</Text>
    <RulesScreen />
  </ScreenWrapper>
);

const SigninScreen = ({ navigation, onAuthSuccess }) => {
  return Signin({ navigation, onAuthSuccess });
};

const SignupScreen = ({ navigation, onAuthSuccess }) => {
  return Signup({ navigation, onAuthSuccess });
};

// AppContainer controls initiation/auth flow and renders the appropriate navigator.
const AppContainer = () => {
  console.log('========================================');
  console.log('AppContainer FUNCTION CALLED');
  console.log('========================================');
  
  const [initiated, setInitiated] = useState(true); // Skip onboarding - go straight to auth
  const [isLoading, setIsLoading] = useState(true);
  const [localAuth, setLocalAuth] = useState(false);
  
  // Get entire auth state to ensure re-renders
  const authState = useStore();
  const authenticated = authState.authenticated;
  const login = authState.login;
  const logout = authState.logout;
  
  // Sync local state with Zustand
  useEffect(() => {
    console.log('useEffect: authenticated changed to:', authenticated);
    setLocalAuth(authenticated);
  }, [authenticated]);

  console.log('AppContainer STATE - authenticated:', authenticated, 'localAuth:', localAuth, 'isLoading:', isLoading, 'initiated:', initiated);
  console.log('Current Zustand authenticated value:', useStore.getState().authenticated);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        // Check initiated status from AsyncStorage (non-sensitive)
        let initiated = true;
        if (AsyncStorage) {
          const i = await AsyncStorage.getItem('initiated');
          initiated = i === 'true';
        }
        
        // Get user data from encrypted storage
        const userData = await getUserData();
        
        if (!mounted) return;
        
        // Always set initiated to true - skip onboarding
        setInitiated(true);
        
        if (userData) {
          // Restore authentication state from encrypted storage
          console.log('Restoring user data from encrypted storage');
          login(userData);
        } else {
          // Make sure we're logged out if no data
          console.log('No encrypted user data found');
          logout();
        }
      } catch (e) {
        console.error('Error loading stored data:', e);
        logout();
      } finally {
        if (mounted) setIsLoading(false);
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
    // Authentication is now handled by Zustand store and encrypted storage
    // Token is stored securely in storeAuthToken() called from Signin/Signup
    console.log('Authentication marked');
  };

  // Debug button to force logout and clear storage
  const forceLogout = async () => {
    console.log('Force logout triggered');
    logout();
    // Clear encrypted storage
    await clearSecureStorage();
    // Clear AsyncStorage
    if (AsyncStorage) {
      await AsyncStorage.clear();
    }
    setIsLoading(false);
  };

  // Wait for initial data to load before rendering
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <Text style={{ color: '#fff', marginBottom: 20 }}>Loading...</Text>
        <TouchableOpacity onPress={forceLogout} style={{ padding: 10, backgroundColor: '#333' }}>
          <Text style={{ color: '#fff' }}>Clear Data & Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }

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

  console.log('CHECKING authenticated value:', authenticated, 'localAuth:', localAuth, 'type:', typeof authenticated);
  console.log('!localAuth evaluates to:', !localAuth);
  
  // AUTHENTICATION BYPASS - Always show home screen
  // if (!localAuth) {
  //   console.log('✓ CONDITION MET - Rendering UNAUTHENTICATED navigator with Signin/Signup routes');
  //   return (
  //     <React.Fragment key="unauthenticated">
  //       <StatusBar barStyle="light-content" backgroundColor="#000000" />
  //       <Stack.Navigator
  //         initialRouteName="Signin"
  //         screenOptions={{
  //           headerShown: true,
  //           headerStyle: { backgroundColor: '#111111' },
  //           headerTintColor: '#fff',
  //           headerTitleStyle: { color: '#fff', fontFamily: 'montserrat-regular' },
  //         }}
  //       >
  //         <Stack.Screen name="Signin">
  //           {(props) => <Signin {...props} onAuthSuccess={markAuthenticated} />}
  //         </Stack.Screen>
  //         <Stack.Screen name="Signup">
  //           {(props) => <Signup {...props} onAuthSuccess={markAuthenticated} />}
  //         </Stack.Screen>
  //       </Stack.Navigator>
  //     </React.Fragment>
  //   );
  // }

  console.log('✗ BYPASSING AUTH - Rendering home screen navigator with all routes');

  return (
    <React.Fragment key="authenticated">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <Stack.Navigator
        initialRouteName="Home"
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
        <Stack.Screen name="Messages" component={Messages} options={{ title: 'Messages' }} />
        <Stack.Screen name="Questions" component={Questions} options={{ title: 'Questions' }} />
        <Stack.Screen name="Search" component={Search} options={{ title: 'Search' }} />
        <Stack.Screen name="Signin">
          {(props) => <SigninScreen {...props} onAuthSuccess={markAuthenticated} />}
        </Stack.Screen>
        <Stack.Screen name="Signup">
          {(props) => <SignupScreen {...props} onAuthSuccess={markAuthenticated} />}
        </Stack.Screen>
      </Stack.Navigator>
    </React.Fragment>
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
  profileContainer: {
    alignItems: 'center',
    padding: 20,
  },
  imageContainer: {
    marginBottom: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#fff',
  },
  placeholderImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  placeholderText: {
    color: '#999',
    fontSize: 14,
  },
  username: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    color: '#999',
    fontSize: 16,
  },
});

// Note: AppContainer is exported above as default.