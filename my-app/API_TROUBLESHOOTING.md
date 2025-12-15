# API Connection Troubleshooting Guide

## Quick Setup

### 1. Start the Backend Server

```powershell
cd api
& C:/Users/unico/thegame/thegame/Scripts/Activate.ps1
python manage.py runserver
```

The server should show: `Starting development server at http://127.0.0.1:8000/`

### 2. Configure the Frontend API URL

Edit `app/src/core/apiConfig.js` and uncomment the appropriate `API_BASE_URL` for your scenario:

**Testing on Web Browser:**
```javascript
export const API_BASE_URL = 'http://localhost:8000/';
```

**Testing on Android Emulator:**
```javascript
export const API_BASE_URL = 'http://10.0.2.2:8000/';
```

**Testing on iOS Simulator:**
```javascript
export const API_BASE_URL = 'http://localhost:8000/';
```

**Testing on Physical Device (same WiFi):**
```javascript
export const API_BASE_URL = 'http://192.168.1.210:8000/';
```

### 3. Start the Frontend

```powershell
cd my-app
npm start
```

Then press:
- `w` for web browser
- `a` for Android emulator
- `i` for iOS simulator

## Common Issues & Solutions

### ❌ "Cannot connect to server" Error

**Possible causes:**

1. **Backend not running**
   - Solution: Start Django server (see step 1 above)
   - Verify it's running by visiting http://localhost:8000 in your browser

2. **Wrong API URL for your platform**
   - Solution: Check `apiConfig.js` and use the correct URL
   - Web/iOS Simulator: `http://localhost:8000/`
   - Android Emulator: `http://10.0.2.2:8000/`
   - Physical Device: `http://YOUR_COMPUTER_IP:8000/`

3. **Firewall blocking connection**
   - Solution: Add exception for port 8000 in Windows Firewall
   - Or temporarily disable firewall for testing

4. **CORS not configured**
   - Solution: Already configured in `api/api/settings.py`
   - `CORS_ALLOW_ALL_ORIGINS = True` is set for development

### ❌ Network Request Failed on Physical Device

1. **Not on same WiFi network**
   - Solution: Connect phone and computer to the same WiFi

2. **Wrong IP address**
   - Solution: Find your computer's IP:
     ```powershell
     ipconfig
     ```
     Look for "IPv4 Address" under your WiFi adapter
   - Update `apiConfig.js` with this IP

3. **Server not accessible from network**
   - Solution: Start server with:
     ```powershell
     python manage.py runserver 0.0.0.0:8000
     ```

### ❌ Timeout Errors

- The timeout is set to 10 seconds
- If server is slow, increase `API_TIMEOUT` in `apiConfig.js`
- Check backend console for errors

## Debugging

### Check API Configuration
The app logs the API URL on startup:
```
🌐 API Base URL: http://10.0.2.2:8000/ (Platform: android)
```

### Monitor API Requests
All requests are logged with emojis:
```
📤 API Request: POST http://localhost:8000/quiz/signin/
📦 Request Data: {username: "test", password: "test"}
✅ API Response: 200 /quiz/signin/
```

Or errors:
```
❌ API Error Response: 400 {username: ["This field is required"]}
🔌 API No Response - Cannot connect to server
⏱️ API Timeout: /quiz/signin/
```

### Test Backend Directly

From PowerShell:
```powershell
# Test if server is reachable
Invoke-WebRequest -Uri "http://localhost:8000/quiz/signin/" -Method POST -Body '{"username":"test","password":"test123"}' -ContentType "application/json" -UseBasicParsing
```

## Platform-Specific Notes

### Android Emulator
- `localhost` or `127.0.0.1` refers to the emulator itself, NOT your computer
- Use `10.0.2.2` to access your computer's localhost
- Make sure emulator has internet access

### iOS Simulator
- Can use `localhost` directly
- Make sure Xcode command line tools are installed

### Physical Device (Expo Go)
- Must be on same WiFi as development computer
- Some corporate/public WiFi networks block device-to-device communication
- Try mobile hotspot if WiFi doesn't work

### Web Browser
- Uses regular `localhost`
- Check browser console for detailed errors
- CORS must be configured correctly

## Current Configuration

✅ Backend CORS: Allows all origins (development mode)
✅ Backend ALLOWED_HOSTS: Includes localhost, 127.0.0.1, 10.0.2.2, 192.168.1.210
✅ Frontend timeout: 10 seconds
✅ Debug logging: Enabled
