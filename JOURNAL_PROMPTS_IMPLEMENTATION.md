# Journal Prompts Feature - Implementation Complete ✅

## Overview
Successfully implemented a **100-prompt journal system** to help users connect with others. Users can browse prompts one at a time, filter by difficulty, shuffle to new prompts, and save responses locally on their device.

---

## Backend Implementation (Django API)

### 1. Database Model - `JournalPrompt`
**Location:** [api/quiz/models.py](api/quiz/models.py#L179-L200)

```python
class JournalPrompt(models.Model):
    prompt_text = models.TextField()
    category = models.CharField(max_length=50, default='connect')
    difficulty = models.CharField(max_length=20, choices=[
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('challenging', 'Challenging'),
    ])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**Migration:** [0007_journalprompt.py](api/quiz/migrations/0007_journalprompt.py)

### 2. Management Command - Populate Prompts
**Location:** [api/quiz/management/commands/create_journal_prompts.py](api/quiz/management/commands/create_journal_prompts.py)

- Generates **90 handcrafted journal prompts** focused on "connecting with others"
- Prompts organized by difficulty:
  - **20 Easy prompts:** Building basic connections
  - **30 Medium prompts:** Deepening relationships
  - **40 Challenging prompts:** Vulnerability and intimacy

**Run Command:**
```bash
cd api
python manage.py create_journal_prompts
```

### 3. API Endpoints
**Location:** [api/quiz/urls.py](api/quiz/urls.py)

#### List All Prompts
```
GET /quiz/prompts/
Query params: ?difficulty=easy|medium|challenging
Response: { prompts: [...], count: 90 }
```

#### Get Random Prompt
```
GET /quiz/prompts/random/
Query params: ?difficulty=easy|medium|challenging
Response: { id, prompt_text, category, difficulty, created_at }
```

### 4. Serializer
**Location:** [api/quiz/serializers.py](api/quiz/serializers.py#L163-L167)

```python
class JournalPromptSerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalPrompt
        fields = ('id', 'prompt_text', 'category', 'difficulty', 'created_at')
```

### 5. API Views
**Location:** [api/quiz/views.py](api/quiz/views.py#L1116-L1148)

- `JournalPromptsListView` - Returns all prompts with optional filtering
- `RandomJournalPromptView` - Returns a random prompt with optional difficulty filter

---

## Frontend Implementation (React Native)

### 1. Journal Prompts Screen
**Location:** [my-app/app/src/screens/JournalPrompts.jsx](my-app/app/src/screens/JournalPrompts.jsx)

**Features:**
- ✅ Display one prompt at a time
- ✅ Difficulty level filter (Easy, Medium, Challenging)
- ✅ Shuffle button to get next random prompt with smooth animation
- ✅ Text input for user responses
- ✅ Save responses locally (device storage)
- ✅ Character count display
- ✅ Saved responses section showing all written answers
- ✅ Clear button to remove saved responses
- ✅ Confirmation dialog for saving

**Key Functions:**
- `loadPrompts()` - Fetch prompts from backend
- `getRandomPrompt()` - Get a random prompt
- `saveAnswer()` - Save response to local state
- `animatePromptChange()` - Smooth fade animation for new prompts

### 2. Updated Journal Screen
**Location:** [my-app/app/src/screens/Journal.jsx](my-app/app/src/screens/Journal.jsx)

**Changes:**
- Added tab navigation (📔 Shared Journals | 💭 Prompts)
- Integrated `JournalPrompts` component
- Maintains existing journal functionality
- Tab state: `activeTab` ('shared' or 'prompts')

**Tab Styles:**
- Clean underline indicator for active tab
- Smooth color transitions
- Responsive design

---

## Data Structure

### Example Prompt Response
```json
{
  "prompts": [
    {
      "id": 1,
      "prompt_text": "What's one thing about yourself you wish more people knew?",
      "category": "connect",
      "difficulty": "easy",
      "created_at": "2025-12-30T18:22:00Z"
    },
    {
      "id": 2,
      "prompt_text": "How does being misunderstood shaped who you are?",
      "category": "connect",
      "difficulty": "challenging",
      "created_at": "2025-12-30T18:22:01Z"
    }
  ],
  "count": 90
}
```

---

## Prompt Categories

### Easy (20 prompts)
Focus on surface-level connection:
- Favorite ways to spend time with others
- Qualities valued in friends
- How you celebrate with people you care about
- When you feel most understood

### Medium (30 prompts)
Focus on deeper relationships:
- Vulnerability and boundaries
- Difficult conversations
- Balancing needs in relationships
- Trust and forgiveness

### Challenging (40 prompts)
Focus on deep introspection:
- Emotional wounds and healing
- Past relationship patterns
- Fear of abandonment/rejection
- Authentic love and intimacy

---

## Local Storage

User responses are saved **locally on the device** using React state:
```javascript
savedAnswers = {
  [promptId]: "User's written response text"
}
```

This keeps responses private and doesn't require backend storage modifications.

---

## How to Use

### 1. Start Backend Server
```bash
cd api
python manage.py runserver
```

### 2. Launch Flutter Frontend
```bash
cd my-app
flutter run
```

### 3. Navigate to Journal Tab
- Tap the "Journal" icon in the navigation bar
- See two tabs: "Shared Journals" and "Prompts"

### 4. Use the Prompts Feature
1. Select a difficulty level (or view all)
2. Read the prompt
3. Type your response in the text area
4. Tap "Save Response" to save locally
5. Tap "🔄 Next Prompt" to shuffle to a new prompt
6. View all saved responses in the "Saved Responses" section

---

## API Testing

### Test with curl:
```bash
# Get all prompts
curl http://localhost:8000/quiz/prompts/

# Get easy prompts only
curl "http://localhost:8000/quiz/prompts/?difficulty=easy"

# Get random prompt
curl http://localhost:8000/quiz/prompts/random/

# Get random medium prompt
curl "http://localhost:8000/quiz/prompts/random/?difficulty=medium"
```

---

## Files Modified/Created

### Backend
- ✅ [api/quiz/models.py](api/quiz/models.py) - Added `JournalPrompt` model
- ✅ [api/quiz/serializers.py](api/quiz/serializers.py) - Added `JournalPromptSerializer`
- ✅ [api/quiz/views.py](api/quiz/views.py) - Added prompt views (2 views)
- ✅ [api/quiz/urls.py](api/quiz/urls.py) - Registered prompt endpoints
- ✅ [api/quiz/migrations/0007_journalprompt.py](api/quiz/migrations/0007_journalprompt.py) - Database migration
- ✅ [api/quiz/management/commands/create_journal_prompts.py](api/quiz/management/commands/create_journal_prompts.py) - Prompt population

### Frontend
- ✅ [my-app/app/src/screens/JournalPrompts.jsx](my-app/app/src/screens/JournalPrompts.jsx) - New prompts screen
- ✅ [my-app/app/src/screens/Journal.jsx](my-app/app/src/screens/Journal.jsx) - Updated with tabs

---

## Summary

The journal prompts feature is **fully implemented** and ready to use. Users can:

✅ Browse 90 thoughtfully-crafted prompts  
✅ Filter by difficulty level  
✅ Shuffle through prompts with smooth animations  
✅ Write responses and save them locally  
✅ View all saved responses  
✅ Clear individual responses  

The backend provides flexible API endpoints for retrieving prompts, and the frontend provides a beautiful, intuitive interface for users to engage with the prompts daily.
