/**
 * API Configuration
 * 
 * This file contains API endpoint configurations for different environments.
 * Uncomment the configuration you need based on your testing scenario.
 */

// OPTION 1: Web Browser / Expo Web
// Use this when running: npm start -> press 'w' for web
// export const API_BASE_URL = 'http://localhost:8000';

// OPTION 2: Android Emulator
// Use this when running on Android Studio emulator
// export const API_BASE_URL = 'http://10.0.2.2:8000/';

// OPTION 3: iOS Simulator
// Use this when running on Xcode iOS simulator
// export const API_BASE_URL = 'http://localhost:8000/';

// OPTION 4: Physical Device (Android/iOS)
// Use this when running on a real phone connected to same WiFi
// Find your computer's IP with: ipconfig (Windows) or ifconfig (Mac/Linux)
export const API_BASE_URL = 'http://192.168.1.210:8000/';

// OPTION 5: Expo Go App
// Use this when testing with Expo Go on physical device
// Make sure your phone and computer are on the same network
// export const API_BASE_URL = 'http://192.168.1.210:8000/';

export const API_TIMEOUT = 10000; // 10 seconds

export const API_HEADERS = {
  'Content-Type': 'application/json',
};

// Debug mode - set to false in production
export const DEBUG_API = true;
