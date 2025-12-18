import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import Signin from '../src/screens/Signin';
import Home from '../src/screens/Home';
import useStore from '../src/core/global';
import { getUserData, clearSecureStorage } from '../src/core/secureStorage';

let AsyncStorage;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  AsyncStorage = null;
}

const AppContainer = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [localAuth, setLocalAuth] = useState(false);
  
  const authenticated = useStore((state) => state.authenticated);
  const login = useStore((state) => state.login);
  const logout = useStore((state) => state.logout);
  
  // Sync local state with Zustand
  useEffect(() => {
    setLocalAuth(authenticated);
  }, [authenticated]);

  // Load auth state from storage
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const userData = await getUserData();
        const token = await import('../src/core/secureStorage').then(m => m.getAuthToken());
        
        if (!mounted) return;
        
        if (userData && token) {
          console.log('User data found, logging in');
          login(userData);
          setLocalAuth(true);
        } else {
          console.log('No user data or token found');
          logout();
          setLocalAuth(false);
        }
      } catch (e) {
        console.error('Error loading stored data:', e);
        logout();
        setLocalAuth(false);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [login, logout]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontSize: 18 }}>Loading...</Text>
      </View>
    );
  }

  return localAuth ? <Home /> : <Signin />;
};

export default AppContainer;
