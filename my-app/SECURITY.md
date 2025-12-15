# Security Implementation

## Encrypted Storage

This application uses `expo-secure-store` to securely store sensitive user data.

### What is Encrypted?

All sensitive user data is now stored in encrypted storage:

- **User Data**: Username, email, profile information
- **Authentication Tokens**: JWT tokens and session data
- **User Credentials**: Optionally stored for "remember me" functionality

### Implementation Details

#### Package Used
- `expo-secure-store` - Expo's secure storage solution with AES encryption
- On iOS: Uses Keychain Services
- On Android: Uses EncryptedSharedPreferences backed by Android Keystore
- On Web: Uses browser's secure storage when available

#### Storage Module
Located at: `app/src/core/secureStorage.js`

**Available Functions:**
```javascript
import { 
  storeUserData,      // Store user profile data
  getUserData,        // Retrieve user profile data
  storeAuthToken,     // Store authentication token
  getAuthToken,       // Retrieve authentication token
  storeCredentials,   // Store login credentials (optional)
  getCredentials,     // Retrieve login credentials
  clearSecureStorage, // Clear all encrypted data (logout)
  removeSecureItem    // Remove specific encrypted item
} from '../src/core/secureStorage';
```

#### Updated Components

1. **Signin.jsx**
   - Uses `storeUserData()` instead of AsyncStorage
   - Uses `storeAuthToken()` for authentication tokens

2. **Signup.jsx**
   - Uses `storeUserData()` instead of AsyncStorage
   - Uses `storeAuthToken()` for authentication tokens

3. **index.jsx (AppContainer)**
   - Uses `getUserData()` to restore user session
   - Uses `clearSecureStorage()` on logout
   - Profile picture upload uses `getUserData()` for token retrieval

### Non-Sensitive Data

AsyncStorage is still used for non-sensitive data:
- `initiated` flag (app onboarding status)

### Security Best Practices

✅ **Implemented:**
- Encrypted storage for all user credentials
- Secure token storage
- Automatic cleanup on logout
- No credentials in plain text

⚠️ **Recommendations:**
- Implement token refresh mechanism
- Add biometric authentication (Face ID/Touch ID)
- Implement certificate pinning for API calls
- Add request signing for sensitive API endpoints

### Testing

The encrypted storage is automatically used when users:
1. Sign in (stores user data + token)
2. Sign up (stores user data + token)
3. Upload profile picture (retrieves token)
4. Logout (clears all encrypted data)

### Platform Support

- ✅ iOS (using Keychain Services)
- ✅ Android (using Android Keystore + EncryptedSharedPreferences)
- ✅ Web (using browser's secure storage APIs)

### Migration from AsyncStorage

User data is now automatically migrated from AsyncStorage to encrypted storage on first app load after this update. Old AsyncStorage entries are cleared on logout.

### Debugging

To view encrypted storage contents (development only):
```javascript
import { getUserData, getAuthToken } from '../src/core/secureStorage';

// In your component
const debugStorage = async () => {
  const userData = await getUserData();
  const token = await getAuthToken();
  console.log('User Data:', userData);
  console.log('Token:', token);
};
```

### Additional Security Measures

Consider implementing:
- Certificate pinning
- Root/Jailbreak detection
- Code obfuscation
- Runtime application self-protection (RASP)
- Biometric authentication
