import { Platform } from 'react-native';
import Constants from 'expo-constants';

export function buildWebInviteURL(sessionId, gameCode) {
  try {
    let origin = null;
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.origin) {
      origin = window.location.origin;
    } else if (typeof process !== 'undefined' && process?.env?.EXPO_PUBLIC_INVITE_HOST) {
      origin = String(process.env.EXPO_PUBLIC_INVITE_HOST).replace(/\/$/, '');
    } else {
      const hostUri = Constants?.expoConfig?.hostUri || Constants?.manifest?.hostUri;
      if (hostUri) {
        origin = `http://${hostUri}`
          .replace(':19000', ':19006')
          .replace(':19001', ':19006')
          .replace('exp://', 'http://')
          .replace('https://', 'http://');
        // Trim any trailing path beyond domain:port
        origin = origin.split('?')[0];
      }
    }
    if (!origin) return null;
    const qp = new URLSearchParams({ sessionId: String(sessionId) });
    if (gameCode) qp.set('gameCode', String(gameCode));
    return `${origin}/GamePlay?${qp.toString()}`;
  } catch {
    return null;
  }
}
