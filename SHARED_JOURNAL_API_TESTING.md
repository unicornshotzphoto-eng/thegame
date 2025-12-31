# Shared Journal API Testing Guide

## Prerequisites
- Backend running: `python manage.py runserver`
- Authenticated user (obtain JWT token)

## Test Workflows

### 1. Create a Shared Journal
```bash
curl -X POST http://localhost:8000/quiz/journals/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Journal with Friends",
    "description": "A collaborative space to share thoughts"
  }'
```

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "My Journal with Friends",
  "description": "A collaborative space to share thoughts",
  "created_by": {"id": 1, "username": "user1"},
  "members": [{"id": 1, "username": "user1"}],
  "members_count": 1,
  "entries": [],
  "created_at": "2025-12-30T13:00:00Z",
  "updated_at": "2025-12-30T13:00:00Z"
}
```

### 2. List User's Journals
```bash
curl -X GET http://localhost:8000/quiz/journals/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Get Journal Details
```bash
curl -X GET http://localhost:8000/quiz/journals/1/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Invite a Friend to Journal
```bash
curl -X POST http://localhost:8000/quiz/journals/1/members/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "member_id": 2
  }'
```

### 5. Add Entry to Journal
```bash
curl -X POST http://localhost:8000/quiz/journals/1/entries/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "First Entry",
    "content": "This is my first collaborative journal entry. I'm excited to share this space with friends!"
  }'
```

**Response (201 Created):**
```json
{
  "id": 1,
  "journal": 1,
  "author": {"id": 1, "username": "user1"},
  "title": "First Entry",
  "content": "This is my first collaborative journal entry...",
  "created_at": "2025-12-30T13:01:00Z",
  "updated_at": "2025-12-30T13:01:00Z"
}
```

### 6. Get All Journal Entries
```bash
curl -X GET http://localhost:8000/quiz/journals/1/entries/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "entries": [
    {
      "id": 1,
      "journal": 1,
      "author": {"id": 1, "username": "user1", "email": "user1@example.com", "thumbnail": null},
      "title": "First Entry",
      "content": "This is my first collaborative journal entry...",
      "created_at": "2025-12-30T13:01:00Z",
      "updated_at": "2025-12-30T13:01:00Z"
    },
    {
      "id": 2,
      "journal": 1,
      "author": {"id": 2, "username": "user2", "email": "user2@example.com", "thumbnail": null},
      "title": "Friend's Thoughts",
      "content": "Great idea! I added my own entry to the journal.",
      "created_at": "2025-12-30T13:02:00Z",
      "updated_at": "2025-12-30T13:02:00Z"
    }
  ],
  "count": 2
}
```

### 7. Update Journal (Creator Only)
```bash
curl -X PUT http://localhost:8000/quiz/journals/1/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Journal Name",
    "description": "Updated description"
  }'
```

### 8. Remove Member from Journal (Creator Only)
```bash
curl -X DELETE http://localhost:8000/quiz/journals/1/members/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "member_id": 2
  }'
```

### 9. Delete Journal (Creator Only)
```bash
curl -X DELETE http://localhost:8000/quiz/journals/1/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (204 No Content):**
```json
{
  "message": "Journal deleted"
}
```

## Error Cases

### Unauthorized Access
```bash
curl -X GET http://localhost:8000/quiz/journals/
```
**Response (401 Unauthorized):** Authentication credentials required

### Journal Not Found
```bash
curl -X GET http://localhost:8000/quiz/journals/999/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Response (404 Not Found):**
```json
{"error": "Journal not found"}
```

### Non-Creator Cannot Update
```bash
curl -X PUT http://localhost:8000/quiz/journals/1/ \
  -H "Authorization: Bearer OTHER_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Hacked!"}'
```
**Response (403 Forbidden):**
```json
{"error": "Only creator can update journal"}
```

### Non-Member Cannot Access
```bash
curl -X GET http://localhost:8000/quiz/journals/1/ \
  -H "Authorization: Bearer DIFFERENT_USER_TOKEN"
```
**Response (403 Forbidden):**
```json
{"error": "Access denied"}
```

## Testing Steps (Manual)

1. **Sign Up Two Users**
   - User 1 (alice@example.com)
   - User 2 (bob@example.com)
   - Get JWT tokens for both

2. **User 1 Creates Journal**
   - POST /quiz/journals/ with name="Shared Thoughts"
   - Verify journal created with User 1 as creator and member

3. **User 1 Invites User 2**
   - POST /quiz/journals/1/members/ with member_id=2 (User 2's ID)
   - Verify User 2 added to members list

4. **User 1 Adds Entry**
   - POST /quiz/journals/1/entries/ with their content
   - Verify entry appears in /quiz/journals/1/entries/

5. **User 2 Adds Entry**
   - POST /quiz/journals/1/entries/ with their content
   - Verify entry shows "user2" as author
   - Verify both entries visible when fetching

6. **User 2 Tries to Update Journal**
   - PUT /quiz/journals/1/ with new name
   - Verify 403 error (only creator can update)

7. **User 1 Removes User 2**
   - DELETE /quiz/journals/1/members/ with member_id=2
   - Verify User 2 no longer in members list

8. **User 2 Tries to Access Journal**
   - GET /quiz/journals/1/
   - Verify 403 error (access denied)

## Frontend Integration Notes

The `SharedJournals.jsx` component:
- ✅ Handles all API calls with proper error handling
- ✅ Uses AsyncStorage for JWT token persistence
- ✅ Displays loading states during API calls
- ✅ Shows user-friendly error alerts
- ✅ Refreshes data after successful operations
- ✅ Respects user permissions (hides admin buttons for non-creators)

### Token Management
```javascript
const token = await AsyncStorage.getItem('access_token');
// Token automatically included in all requests
```

### Error Handling
- Network errors: "Connection error" alert
- Missing auth: Checks for token before API calls
- Server errors: Displays error message from API
- Permission errors: Silently prevents invalid actions

## Performance Optimization

- Journal list loads only user's journals (efficient SQL with Q filters)
- Entries sorted by creation date (newest first)
- Pagination ready (can add limit/offset params)
- Member count cached in serializer (no N+1 queries)
