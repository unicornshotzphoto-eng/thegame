# Shared Journal Collaboration Feature

## Overview
Added full collaborative journal support allowing friends to contribute entries under their own names to shared journals.

## Backend Implementation

### Models (api/quiz/models.py)
✅ **SharedJournal Model**
- `name`: Journal title
- `description`: Optional description
- `created_by`: ForeignKey to User (creator)
- `members`: ManyToManyField to User (collaborators)
- `created_at`, `updated_at`: Timestamps
- Method: `members_count()` - Returns number of members

✅ **JournalEntry Model**
- `journal`: ForeignKey to SharedJournal
- `author`: ForeignKey to User (who wrote this entry)
- `title`: Optional entry title
- `content`: Entry text
- `created_at`, `updated_at`: Timestamps

### API Serializers (api/quiz/serializers.py)
✅ Added:
- `SharedJournalSerializer` - Full journal with entries and members
- `SharedJournalListSerializer` - Lightweight for list views
- `JournalEntrySerializer` - Individual entry with author info

### API Views (api/quiz/views.py)
✅ Created:
- `SharedJournalListCreateView` - GET (list user's journals), POST (create new)
- `SharedJournalDetailView` - GET (journal details), PUT (update), DELETE
- `SharedJournalMembersView` - POST (add member), DELETE (remove member)
- `JournalEntryListCreateView` - GET (all entries), POST (add entry)

All views include proper permission checks:
- Unauthenticated users cannot access journals
- Only creator can modify journal settings or remove members
- Members can view and add entries

### API Endpoints (api/quiz/urls.py)
```
POST   /quiz/journals/                    - Create new journal
GET    /quiz/journals/                    - List user's journals
GET    /quiz/journals/<id>/               - Get journal details
PUT    /quiz/journals/<id>/               - Update journal (creator only)
DELETE /quiz/journals/<id>/               - Delete journal (creator only)
POST   /quiz/journals/<id>/members/       - Add member (creator only)
DELETE /quiz/journals/<id>/members/       - Remove member (creator only)
GET    /quiz/journals/<id>/entries/       - Get all entries
POST   /quiz/journals/<id>/entries/       - Add new entry
```

## Frontend Implementation

### Components

✅ **SharedJournals.jsx** (`my-app/app/src/screens/SharedJournals.jsx`)
- **List View**: Shows all shared journals user is member of
- **Create Journal**: Form to create new shared journal with name/description
- **Journal Detail**: When journal selected:
  - Displays journal info (name, description, member count)
  - Form to add entries (title optional, content required)
  - List of all entries with author names and dates
  - Button to invite friends to the journal
- **Invite Friends Modal**: Shows list of current friends, click to invite
- **Full Authentication**: Uses JWT token from AsyncStorage

✅ **Journal.jsx** (Updated)
- **Tab Navigation**: Switch between "Shared" and "Prompts"
- Routes to SharedJournals or JournalPrompts based on active tab
- Clean, minimal tab UI with color indicators

### Features
✅ Create shared journals
✅ Invite friends to journals (creator only)
✅ Add entries under your name
✅ View all entries with author attribution
✅ See member count
✅ Support for optional entry titles
✅ Real-time entry listing
✅ Responsive design with theme colors

## User Workflow

1. **Create Journal**
   - Go to Journals > Shared tab
   - Click "+" button
   - Enter name and description
   - Journal created and you're added as member

2. **Invite Friends**
   - Open a journal
   - Click the person-add icon
   - Select friends from list
   - They can now view and add entries

3. **Add Entry**
   - Open journal
   - Write title (optional) and content
   - Click "Add Entry"
   - Your name is automatically associated

4. **View Journal**
   - All entries visible with author, date, and content
   - Entries sorted by newest first
   - Easy to see who contributed what

## Technical Highlights

✅ **Database**: SQLite with proper relationships
✅ **Authentication**: JWT-based with IsAuthenticated permission
✅ **API Design**: RESTful with proper HTTP methods
✅ **Error Handling**: Proper 403/404 responses
✅ **Authorization**: Creator-only operations enforced
✅ **Serialization**: Nested author and member info
✅ **State Management**: React state with AsyncStorage tokens
✅ **UI/UX**: Intuitive modal-based flows, theme-consistent styling

## Testing Checklist
- [ ] Create a shared journal
- [ ] Invite a friend to the journal
- [ ] Friend can view and add entries
- [ ] Entries show correct author names
- [ ] Creator can remove members
- [ ] Creator can update journal details
- [ ] Non-members cannot access journal
- [ ] UI theme colors consistent
