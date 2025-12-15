import axios from 'axios';
import { Platform } from 'react-native';
import { API_BASE_URL, API_TIMEOUT, API_HEADERS, DEBUG_API } from './apiConfig';

// Auto-detect best API URL based on platform if not explicitly set in config
const getBaseURL = () => {
  // If a specific URL is set in config, use it
  if (API_BASE_URL && API_BASE_URL !== 'auto') {
    return API_BASE_URL;
  }
  
  // Otherwise, auto-detect based on platform
  if (Platform.OS === 'web') {
    return 'http://localhost:8000/';
  }
  
  if (Platform.OS === 'android') {
    // Android emulator uses 10.0.2.2 to access host machine's localhost
    return 'http://10.0.2.2:8000/';
  }
  
  if (Platform.OS === 'ios') {
    // iOS simulator can use localhost
    return 'http://localhost:8000/';
  }
  
  // Default fallback
  return 'http://localhost:8000/';
};

const baseURL = getBaseURL();
console.log(`🌐 API Base URL: ${baseURL} (Platform: ${Platform.OS})`);

const api = axios.create({
    baseURL: baseURL,
    headers: API_HEADERS,
    timeout: API_TIMEOUT,
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    if (DEBUG_API) {
      console.log('📤 API Request:', config.method?.toUpperCase(), config.baseURL + config.url);
      if (config.data) {
        console.log('📦 Request Data:', config.data);
      }
    }
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    if (DEBUG_API) {
      console.log('✅ API Response:', response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️ API Timeout:', error.config.url);
      console.error('The server took too long to respond. Please check if the backend is running.');
    } else if (error.response) {
      console.error('❌ API Error Response:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('🔌 API No Response - Cannot connect to server');
      console.error('Attempted URL:', error.config?.baseURL + error.config?.url);
      console.error('Please ensure:');
      console.error('1. Django server is running (python manage.py runserver)');
      console.error('2. The API URL is correct for your platform');
      console.error('3. Your device/emulator can reach the server');
      console.error('4. CORS is properly configured on the backend');
    }
    return Promise.reject(error);
  }
);

export default api;