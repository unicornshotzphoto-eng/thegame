# Quick Reference - Shared Journals Feature

## 🚀 Quick Start

### Backend
```bash
cd C:\Users\unico\thegame
.\thegame\Scripts\Activate.ps1
cd api
python manage.py runserver
# Server runs on http://localhost:8000
```

### Frontend
```bash
cd C:\Users\unico\thegame\my-app
npm start
# or flutter run (if using Flutter instead)
```

## 📱 Features at a Glance

| Feature | Implementation | Status |
|---------|---|---|
| Create journals | Backend POST, Frontend modal | ✅ |
| Invite friends | Backend members endpoint, Modal UI | ✅ |
| Add entries | Backend POST, Form UI | ✅ |
| View entries | Backend GET, List with authors | ✅ |
| Permission system | Creator/member checks | ✅ |
| Theme integration | THEME object, dark mode | ✅ |
| Error handling | Try/catch, user alerts | ✅ |

## 🔌 Core Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/quiz/journals/` | Create new journal |
| GET | `/quiz/journals/` | List user's journals |
| POST | `/quiz/journals/<id>/entries/` | Add entry |
| GET | `/quiz/journals/<id>/entries/` | Get entries |
| POST | `/quiz/journals/<id>/members/` | Add member |

## 🗂️ File Structure

```
Backend:
  api/quiz/
    ├── models.py          (SharedJournal, JournalEntry)
    ├── serializers.py     (Serializers for API)
    ├── views.py           (API endpoints)
    └── urls.py            (Route definitions)

Frontend:
  my-app/app/src/
    ├── screens/
    │   ├── SharedJournals.jsx    (Journal UI)
    │   └── Journal.jsx            (Tab container)
    └── constants/
        └── appTheme.js            (Theme colors)
```

## 🔑 Key Variables & Functions

### Backend (Django)
```python
# Models
SharedJournal(name, description, created_by, members)
JournalEntry(journal, author, title, content)

# Views
SharedJournalListCreateView    # List & create journals
SharedJournalDetailView        # Get, update, delete
SharedJournalMembersView       # Add/remove members
JournalEntryListCreateView     # List & add entries
```

### Frontend (React Native)
```javascript
// State
journals              // List of user's journals
selectedJournal      // Currently viewed journal
journalEntries       // Entries in selected journal
friends              // List of user's friends
newEntryContent      // Form input
showInviteModal      // Modal visibility

// Functions
loadJournals()       // Fetch journals from API
createJournal()      // POST new journal
addEntryToJournal()  // POST new entry
inviteFriendToJournal()  // Add member
loadJournalEntries() // GET entries
```

## 📊 Data Model

```
User
 ├─ created_by──→ SharedJournal (one-to-many)
 ├─ members ────→ SharedJournal (many-to-many)
 └─ author─────→ JournalEntry (one-to-many)

SharedJournal
 ├─ entries ────→ JournalEntry (one-to-many)
 └─ created_by─→ User
```

## 🧪 Quick Test

```bash
# 1. Get token (via existing signin endpoint)
curl -X POST http://localhost:8000/quiz/signin/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}'

# 2. Create journal
curl -X POST http://localhost:8000/quiz/journals/ \
  -H "Authorization: Bearer TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Journal","description":"For testing"}'

# 3. Add entry
curl -X POST http://localhost:8000/quiz/journals/1/entries/ \
  -H "Authorization: Bearer TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"title":"First Entry","content":"Test content"}'

# 4. Get entries
curl -X GET http://localhost:8000/quiz/journals/1/entries/ \
  -H "Authorization: Bearer TOKEN_HERE"
```

## 🎨 Theme Colors

```javascript
THEME = {
  primary: '#D1435B',      // Burgundy Red (buttons, highlights)
  secondary: '#8B2E3B',    // Deep Maroon (secondary buttons)
  background: '#0F1419',   // Almost Black
  surface: '#1A1D26',      // Card backgrounds
  text.primary: '#F5F5F5', // Main text
  subtext: '#B8B8B8',      // Secondary text
  border: '#4A4A52',       // Subtle gray
  backdrop: 'rgba(0,0,0,0.7)' // Modal overlays
}
```

## ✅ Verification Checklist

- [ ] Backend running: `http://localhost:8000` responds
- [ ] Endpoints accessible: GET `/quiz/journals/` returns 401 (expects auth)
- [ ] Models migrated: No database errors
- [ ] Frontend imports: No red squigglies in IDE
- [ ] THEME colors: All properties defined
- [ ] Permissions: Only creator can update/delete
- [ ] Error handling: Try/catch on all API calls

## 🐛 Troubleshooting

**Backend issues:**
- Module not found → Check virtual env activation
- Database error → Run `python manage.py migrate`
- Port 8000 in use → Kill process or use `--port 8001`

**Frontend issues:**
- Can't find component → Check import paths
- THEME errors → Check appTheme.js has all properties
- API 401 → Check token in AsyncStorage
- API 403 → Check permissions (creator vs member)

## 📚 Documentation Files

- `SHARED_JOURNAL_FEATURE.md` - Feature overview
- `SHARED_JOURNAL_API_TESTING.md` - Detailed API examples
- `SHARED_JOURNAL_IMPLEMENTATION.md` - Architecture & design
- `IMPLEMENTATION_COMPLETE.md` - Completion summary

## 🎓 Code Quality

✅ PEP 8 compliant (Python)  
✅ React hooks best practices  
✅ Proper error handling  
✅ Permission checks  
✅ Input validation  
✅ Meaningful names  
✅ No magic numbers  
✅ Consistent styling  
✅ Comprehensive comments  
✅ No hardcoded URLs  

## 🔒 Security

✅ JWT authentication required  
✅ Permission checks on all endpoints  
✅ Non-members cannot access  
✅ Only creator can modify settings  
✅ Input validation on both sides  
✅ No sensitive data in client  

## 🚀 Performance

- Efficient SQL queries (select_related, prefetch_related ready)
- Member count cached in serializer
- Entries ordered by date
- No N+1 query issues
- Async operations non-blocking
