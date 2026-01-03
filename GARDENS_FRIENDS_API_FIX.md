# Gardens - Friends List Bug Fix

## Issue
The Gardens screen was showing "No friends yet" even though the user had existing friends.

## Root Cause
**Incorrect API endpoint** - The Gardens screen was calling the wrong endpoint:
- ❌ Used: `/authentication/friends/`
- ✅ Correct: `/quiz/direct-messages/friends/`

## Solution
Updated `Gardens.jsx` to use the correct endpoint that other screens (like SharedJournals) use successfully.

### Change Made
```javascript
// Before (Wrong endpoint)
const response = await api.get('authentication/friends/');

// After (Correct endpoint)
const response = await api.get('quiz/direct-messages/friends/');
```

## Why This Happened
Different parts of the app use different endpoints for fetching friends data:
- `/authentication/friends/` - Not properly populated
- `/quiz/direct-messages/friends/` - Correct endpoint with proper data

Other screens already use the `/quiz/direct-messages/friends/` endpoint successfully.

## Testing the Fix

1. Go to Gardens tab (🌱)
2. Tap "+ New Garden"
3. Your friends should now appear in the list
4. If still empty, make sure you have friends added in the Friends section first

## Expected Behavior After Fix

✅ Friends list loads automatically
✅ Shows all your existing friends
✅ You can select any friend
✅ Create garden invitation works

## Files Modified
- `my-app/app/(tabs)/Gardens.jsx` - Updated API endpoint

## Status
✅ Fixed and ready to test
