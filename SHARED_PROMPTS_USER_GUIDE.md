# 🎯 Collaborative Prompts Feature - Quick Start Guide

## What's New?

You now have a **third tab in the Journal section** called **"Shared Prompts"** that allows you and your friends to collaboratively respond to the same prompts!

---

## How to Use

### Creating a Shared Prompt Session

1. Go to the **Journal** tab → **Shared Prompts** tab
2. Tap the **blue "+" button** in the top right
3. Select a prompt from the list
4. Tap **"Create Session"**
5. You're automatically added as the first member!

### Inviting Friends

1. Open a prompt session by tapping on it
2. Tap the **red "Invite Friend" button**
3. Select a friend from the list
4. They'll be added to the session and can see the prompt
5. The member count will update automatically

### Sharing Your Response

1. In an open prompt session, scroll down to **"Your Response"**
2. Type your response to the prompt
3. Tap **"Submit Response"**
4. Your response appears in the responses list!

### Viewing Friends' Responses

1. In a prompt session, scroll up to **"Responses"**
2. See all responses from members with their names
3. Each response shows who wrote it
4. You can update your response anytime

### Managing Sessions

- **Edit Response**: Just resubmit a new response - it will replace your old one
- **Delete Session**: Tap the trash icon (only if you created it)
- **Remove Members**: Not yet available in UI, but use the API if needed
- **Leave Session**: Not yet implemented (request if needed)

---

## Features Overview

✅ **Create Sessions**: Start a collaborative prompt session  
✅ **Invite Friends**: Add friends to respond to the same prompt  
✅ **View Responses**: See all friends' responses in real-time  
✅ **Submit Responses**: Share your thoughts on the prompt  
✅ **Update Responses**: Change your response anytime  
✅ **Manage Sessions**: Create, view, and delete your sessions  

---

## Backend API Reference

All endpoints start with `/quiz/` and require authentication.

### List/Create Sessions
- **GET** `/quiz/prompt-sessions/` - Get all your sessions
- **POST** `/quiz/prompt-sessions/` - Create new session
  - Body: `{ "prompt_id": 123, "title": "optional title" }`

### Session Details
- **GET** `/quiz/prompt-sessions/{id}/` - View full session with all responses
- **DELETE** `/quiz/prompt-sessions/{id}/` - Delete session (creator only)

### Member Management
- **POST** `/quiz/prompt-sessions/{id}/members/` - Add member
  - Body: `{ "member_id": 456 }`
- **DELETE** `/quiz/prompt-sessions/{id}/members/` - Remove member
  - Body: `{ "member_id": 456 }`

### Response Submission
- **POST** `/quiz/prompt-sessions/{id}/responses/` - Submit/update response
  - Body: `{ "response": "Your response text here" }`

---

## File Structure

### Backend Files Modified/Created:
- `api/quiz/models.py` - Added SharedPromptSession and PromptResponse models
- `api/quiz/serializers.py` - Added 3 serializers for prompt sessions
- `api/quiz/views.py` - Added 4 API view classes
- `api/quiz/urls.py` - Added 4 new endpoints
- `api/quiz/migrations/0009_*.py` - Database migration (already applied)

### Frontend Files Modified/Created:
- `my-app/app/src/screens/SharedPromptSessions.jsx` - NEW component
- `my-app/app/src/screens/Journal.jsx` - Updated to add third tab
- `my-app/app/(tabs)/Journal.jsx` - No changes (still wraps Journal.jsx)

---

## Technical Details

### Database Schema
```
SharedPromptSession:
  - id, prompt_id, created_by_id, title, created_at, updated_at
  - members (M2M relationship with User)

PromptResponse:
  - id, session_id, author_id, response, created_at
  - Unique constraint: (session_id, author_id)
```

### Authentication
All API endpoints use Bearer token authentication:
```
Authorization: Bearer <your_access_token>
```

### Error Handling
- 400: Bad request (missing required fields)
- 401: Unauthorized (not authenticated)
- 403: Forbidden (don't have permission)
- 404: Resource not found

---

## Troubleshooting

**Q: I don't see the "Shared Prompts" tab**
- A: Make sure you've restarted the app after the update

**Q: Can't create a session**
- A: Make sure you have prompts available. Check if they're loading in the prompt selector

**Q: Friend doesn't appear in invite list**
- A: They might not be in your friends list. Add them first!

**Q: Response didn't save**
- A: Check your internet connection. Tap "Submit Response" again

**Q: Can't delete a session**
- A: Only the session creator can delete it

---

## Example Workflow

1. **You** create a "What makes you happy?" prompt session
2. **You** invite your friend Alex
3. **You** submit your response: "Spending time with family"
4. **Alex** opens the app and sees your response
5. **Alex** submits their response: "Achieving goals"
6. **You** see Alex's response and respond with more thoughts
7. You both can keep updating your responses anytime

Perfect for reflection with friends! 🌟

---

## Next Steps (Future Features)

Potential enhancements coming:
- ⏳ Real-time response updates (WebSocket)
- ⏳ Response voting/rating
- ⏳ Leave session functionality
- ⏳ Response comments
- ⏳ Export responses as document
- ⏳ Prompt templates
- ⏳ Response reactions (emojis)

---

## Support

If you encounter any issues or have suggestions, check the implementation document:
- [COLLABORATIVE_PROMPTS_IMPLEMENTATION.md](./COLLABORATIVE_PROMPTS_IMPLEMENTATION.md)

Or review the source code:
- Backend: `api/quiz/`
- Frontend: `my-app/app/src/screens/SharedPromptSessions.jsx`
