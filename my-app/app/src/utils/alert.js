import { Platform, Alert } from 'react-native';

/**
 * Cross-platform alert function that works on web, iOS, and Android
 */
export const showAlert = (title, message) => {
  if (Platform.OS === 'web') {
    // Use browser's native alert on web
    window.alert(`${title}\n\n${message}`);
  } else {
    // Use React Native's Alert on iOS/Android
    Alert.alert(title, message);
  }
};
