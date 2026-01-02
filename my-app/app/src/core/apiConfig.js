/**
 * API Configuration
 * 
 * This file contains API endpoint configurations for different environments.
 * Uncomment the configuration you need based on your testing scenario.
 */

// OPTION 1: Auto-detect (recommended)
// Automatically picks the best base URL for platform
// - Web/iOS simulator: http://localhost:8000/
// - Android emulator: http://10.0.2.2:8000/
// - Physical device: set your LAN IP below instead
// For web on Windows local dev, use 127.0.0.1 instead of localhost
export const API_BASE_URL = 'http://127.0.0.1:8000/';

// OPTION 2: Android Emulator
// Use this when running on Android Studio emulator
// export const API_BASE_URL = 'http://10.0.2.2:8000/';

// OPTION 3: iOS Simulator
// Use this when running on Xcode iOS simulator
// export const API_BASE_URL = 'http://localhost:8000/';

// OPTION 4: Physical Device (Android/iOS)
// Use this when running on a real phone connected to same WiFi
// Find your computer's IP with: ipconfig (Windows) or ifconfig (Mac/Linux)
// export const API_BASE_URL = 'http://192.168.1.210:8000/';

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
