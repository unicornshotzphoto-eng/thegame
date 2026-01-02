import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Secure storage utility using expo-secure-store for native platforms
 * Falls back to AsyncStorage for web platform
 * This provides encrypted storage for sensitive user data
 * Compatible with Expo projects
 */

const KEYS = {
  USER_DATA: 'secure_user_data',
  AUTH_TOKEN: 'secure_auth_token',
  USER_CREDENTIALS: 'secure_user_credentials',
  INITIATED: 'app_initiated', // Non-sensitive, can use regular storage
  CURRENT_GAME_SESSION: 'current_game_session', // Store active game session for rejoin
};

// Check if SecureStore is available (not available on web)
const isSecureStoreAvailable = Platform.OS !== 'web';

/**
 * Store user data securely
 * @param {Object} userData - User data object to store
 */
export const storeUserData = async (userData) => {
  try {
    const dataString = JSON.stringify(userData);
    if (isSecureStoreAvailable) {
      await SecureStore.setItemAsync(KEYS.USER_DATA, dataString);
    } else {
      await AsyncStorage.setItem(KEYS.USER_DATA, dataString);
    }
    console.log('User data stored securely');
    return true;
  } catch (error) {
    console.error('Error storing user data:', error);
    return false;
  }
};

/**
 * Retrieve user data from secure storage
 * @returns {Object|null} User data or null if not found
 */
export const getUserData = async () => {
  try {
    let userData;
    if (isSecureStoreAvailable) {
      userData = await SecureStore.getItemAsync(KEYS.USER_DATA);
    } else {
      userData = await AsyncStorage.getItem(KEYS.USER_DATA);
    }
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  } catch (error) {
    console.error('Error retrieving user data:', error);
    return null;
  }
};

/**
 * Store authentication token securely
 * @param {string} token - Authentication token
 */
export const storeAuthToken = async (token) => {
  try {
    if (isSecureStoreAvailable) {
      await SecureStore.setItemAsync(KEYS.AUTH_TOKEN, token);
    } else {
      await AsyncStorage.setItem(KEYS.AUTH_TOKEN, token);
    }
    console.log('Auth token stored securely');
    return true;
  } catch (error) {
    console.error('Error storing auth token:', error);
    return false;
  }
};

/**
 * Retrieve authentication token from secure storage
 * @returns {string|null} Auth token or null if not found
 */
export const getAuthToken = async () => {
  try {
    if (isSecureStoreAvailable) {
      return await SecureStore.getItemAsync(KEYS.AUTH_TOKEN);
    } else {
      return await AsyncStorage.getItem(KEYS.AUTH_TOKEN);
    }
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return null;
  }
};

/**
 * Store user credentials securely (optional - for remember me functionality)
 * @param {Object} credentials - Object with username and password
 */
export const storeCredentials = async (credentials) => {
  try {
    const credString = JSON.stringify(credentials);
    if (isSecureStoreAvailable) {
      await SecureStore.setItemAsync(KEYS.USER_CREDENTIALS, credString);
    } else {
      await AsyncStorage.setItem(KEYS.USER_CREDENTIALS, credString);
    }
    console.log('Credentials stored securely');
    return true;
  } catch (error) {
    console.error('Error storing credentials:', error);
    return false;
  }
};

/**
 * Retrieve stored credentials
 * @returns {Object|null} Credentials object or null
 */
export const getCredentials = async () => {
  try {
    let credentials;
    if (isSecureStoreAvailable) {
      credentials = await SecureStore.getItemAsync(KEYS.USER_CREDENTIALS);
    } else {
      credentials = await AsyncStorage.getItem(KEYS.USER_CREDENTIALS);
    }
    if (credentials) {
      return JSON.parse(credentials);
    }
    return null;
  } catch (error) {
    console.error('Error retrieving credentials:', error);
    return null;
  }
};

/**
 * Clear all secure storage (logout)
 */
export const clearSecureStorage = async () => {
  try {
    if (isSecureStoreAvailable) {
      // SecureStore doesn't have a clear() method, so we remove keys individually
      await SecureStore.deleteItemAsync(KEYS.USER_DATA);
      await SecureStore.deleteItemAsync(KEYS.AUTH_TOKEN);
      await SecureStore.deleteItemAsync(KEYS.USER_CREDENTIALS);
    } else {
      await AsyncStorage.multiRemove([KEYS.USER_DATA, KEYS.AUTH_TOKEN, KEYS.USER_CREDENTIALS]);
    }
    console.log('Secure storage cleared');
    return true;
  } catch (error) {
    console.error('Error clearing secure storage:', error);
    return false;
  }
};

/**
 * Remove specific item from secure storage
 * @param {string} key - Key to remove
 */
export const removeSecureItem = async (key) => {
  try {
    if (isSecureStoreAvailable) {
      await SecureStore.deleteItemAsync(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
    console.log(`Removed secure item: ${key}`);
    return true;
  } catch (error) {
    console.error(`Error removing secure item ${key}:`, error);
    return false;
  }
};

/**
 * Store current game session for rejoin capability
 * @param {Object} sessionData - Contains sessionId and gameCode
 */
export const storeCurrentGameSession = async (sessionData) => {
  try {
    const dataString = JSON.stringify(sessionData);
    if (isSecureStoreAvailable) {
      await SecureStore.setItemAsync(KEYS.CURRENT_GAME_SESSION, dataString);
    } else {
      await AsyncStorage.setItem(KEYS.CURRENT_GAME_SESSION, dataString);
    }
    console.log('[Storage] Current game session stored');
    return true;
  } catch (error) {
    console.error('[Storage] Error storing game session:', error);
    return false;
  }
};

/**
 * Retrieve current game session
 * @returns {Object|null} Session data or null if not found
 */
export const getCurrentGameSession = async () => {
  try {
    let sessionData;
    if (isSecureStoreAvailable) {
      sessionData = await SecureStore.getItemAsync(KEYS.CURRENT_GAME_SESSION);
    } else {
      sessionData = await AsyncStorage.getItem(KEYS.CURRENT_GAME_SESSION);
    }
    if (sessionData) {
      console.log('[Storage] Current game session retrieved');
      return JSON.parse(sessionData);
    }
    return null;
  } catch (error) {
    console.error('[Storage] Error retrieving game session:', error);
    return null;
  }
};

/**
 * Clear current game session
 */
export const clearCurrentGameSession = async () => {
  try {
    if (isSecureStoreAvailable) {
      await SecureStore.deleteItemAsync(KEYS.CURRENT_GAME_SESSION);
    } else {
      await AsyncStorage.removeItem(KEYS.CURRENT_GAME_SESSION);
    }
    console.log('[Storage] Current game session cleared');
    return true;
  } catch (error) {
    console.error('[Storage] Error clearing game session:', error);
    return false;
  }
};

export default {
  storeUserData,
  getUserData,
  storeAuthToken,
  getAuthToken,
  storeCredentials,
  getCredentials,
  clearSecureStorage,
  removeSecureItem,
  storeCurrentGameSession,
  getCurrentGameSession,
  clearCurrentGameSession,
  KEYS,
};
