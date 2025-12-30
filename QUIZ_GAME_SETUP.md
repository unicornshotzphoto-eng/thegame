# Quiz Game System - Setup & Implementation Guide

## Overview
The quiz game is a comprehensive couple's intimacy game with 200 questions across 7 categories. Players earn points for answering questions and perform consequences for refusing. The system is built with Django REST Framework backend and React Native/Expo frontend.

## Backend Setup

### 1. Database Models

The quiz system includes three main models in `api/quiz/models.py`:

**QuestionCategory**
- `name` (CharField): Unique category identifier (e.g., 'spiritual', 'mental')
- `description` (TextField): Human-readable category description
- `created_at` (DateTimeField): Auto-timestamp

**Question**
- `category` (ForeignKey): Link to QuestionCategory
- `question_text` (TextField): The actual question
- `points` (IntegerField): Points awarded if answered (1, 2, or 3)
- `consequence` (TextField): What to do if question is refused
- `order` (IntegerField): Display order within category
- `created_at` (DateTimeField): Auto-timestamp

Categories:
1. **Spiritual** - Inner connection, faith, presence, unconditional love
2. **Mental** - Dreams, worries, emotional growth, self-discovery
3. **Physical** - Touch, affection, sensations, intimacy
4. **Disagreeables** - Conflicts, boundaries, fears, difficult topics
5. **Romantic** - Love, cherishment, dreams, future together
6. **Erotic** - Sexual desires, fantasies, intimacy exploration
7. **Creative** - Fun, adventures, talents, shared experiences

### 2. Seeding the Database

Two ways to populate questions:

**Option A: Django Management Command (Recommended)**
```bash
cd api
python manage.py migrate  # Run migrations first
python manage.py seed_questions  # Populates all 200 questions
```

The management command is located at: `api/quiz/management/commands/seed_questions.py`

**Option B: Manual via Django Admin**
```bash
python manage.py createsuperuser  # Create admin account
python manage.py runserver
# Visit http://localhost:8000/admin
# Add categories and questions manually
```

### 3. API Endpoints

All endpoints are prefixed with `/quiz/`:

**Get All Categories**
```
GET /quiz/questions/categories/
Response: [
  {"name": "spiritual", "question_count": 30},
  {"name": "mental", "question_count": 30},
  ...
]
```

**Get Questions by Category**
```
GET /quiz/questions/{category_name}/
Response: [
  {
    "id": 1,
    "question_text": "What makes you feel most at peace?",
    "points": 1,
    "consequence": "Describe your happiest moment together",
    "category": "spiritual"
  },
  ...
]
```

**Get Random Question**
```
GET /quiz/questions/random/
GET /quiz/questions/random/{category_name}/
Response: Single question object
```

### 4. URL Configuration

Routes are configured in `api/quiz/urls.py`:

```python
path('questions/categories/', QuestionCategoriesView.as_view(), name='question-categories'),
path('questions/<str:category>/', QuestionsListView.as_view(), name='questions-by-category'),
path('questions/random/', RandomQuestionView.as_view(), name='random-question'),
path('questions/random/<str:category>/', RandomQuestionView.as_view(), name='random-question-by-category'),
path('questions/', QuestionsListView.as_view(), name='questions-list'),
```

## Frontend Implementation

### Questions.jsx Screen

Located at: `my-app/app/src/screens/Questions.jsx`

**Key Features:**
- Category selection with color-coded cards
- Real-time question display
- Point tracking and scoring
- Game statistics (answered, refused, skipped)
- Consequence modal on refusal
- Progress bar showing completion

**Component State:**
```javascript
- categories: Array of available categories with question counts
- selectedCategory: Current active category
- questions: Array of questions for selected category
- currentQuestionIndex: Current question position
- score: Total earned points
- totalPoints: Total available points
- gameStats: {answered, refused, skipped} counts
- showConsequenceModal: Modal visibility for consequences
```

**User Actions:**
1. **Answer**: +points earned, continues to next question
2. **Refuse**: Shows consequence modal, then moves to next
3. **Skip**: Moves to next without earning/losing points
4. **Back to Categories**: Returns to category selection

### Color Scheme

```javascript
const CATEGORY_COLORS = {
  spiritual: '#9B59B6',      // Purple
  mental: '#3498DB',         // Blue
  physical: '#E74C3C',       // Red
  disagreeables: '#F39C12',  // Orange
  romantic: '#E91E63',       // Pink
  erotic: '#FF6B6B',         // Coral Red
  creative: '#1ABC9C',       // Teal
};
```

### UI Components

**Category Selection Screen**
- Grid of category cards
- Shows question count per category
- Color-coded for easy identification
- Info section with game rules

**Question Display Screen**
- Header with category name and progress
- Progress bar (visual fill)
- Score tracker (current, total, multiplier)
- Question card with points badge
- Three action buttons (Answer, Refuse, Skip)
- Game statistics panel
- Back button

**Consequence Modal**
- Dark overlay background
- White content area (bottom-sheet style)
- Consequence text display
- "Next Question" button

## Integration Points

### API Integration

The frontend uses `api.get()` from `my-app/app/src/utils/api.js`:

```javascript
// Load categories
const response = await api.get('/quiz/questions/categories/');

// Load questions for category
const response = await api.get(`/quiz/questions/${category}/`);

// Get random question
const response = await api.get('/quiz/questions/random/');
```

### Error Handling

- Network errors: Alert user with "Failed to load categories/questions"
- Category not found: Alert user
- No questions available: Graceful handling

## Customization

### Adding New Questions

Edit `api/quiz/management/commands/seed_questions.py`:

```python
questions_data = {
    'spiritual': [
        ('Your question here?', 'Your consequence here', 2),  # points: 1-3
        ...
    ],
    ...
}
```

### Modifying Scoring

Change points in Question model or seed script:
- 1 point: Easy, conversation-starter questions
- 2 points: Moderate vulnerability required
- 3 points: Deep intimacy/honesty required

### Adding New Categories

1. Create new entry in `CATEGORY_COLORS` dict (Questions.jsx)
2. Add category in seed script with questions
3. Backend automatically handles serialization

## Testing

### Test Category Loading
```bash
curl http://localhost:8000/api/quiz/questions/categories/
```

### Test Question Loading
```bash
curl http://localhost:8000/api/quiz/questions/spiritual/
```

### Test Seeding
```bash
cd api
python manage.py seed_questions
# Check output for success message
```

## Troubleshooting

**"Failed to load categories"**
- Ensure backend is running: `python manage.py runserver`
- Check API base URL in `my-app/app/src/utils/api.js`
- Verify questions are seeded

**No questions displaying**
- Run: `python manage.py seed_questions`
- Check database: `python manage.py shell` → `from quiz.models import Question; print(Question.objects.count())`

**Category colors not showing**
- Verify category name matches CATEGORY_COLORS keys (lowercase)
- Check backend returns correct category names

## Next Steps

1. **Multiplayer Mode**: Add game sessions to track couple's total score
2. **History**: Save answered questions for review later
3. **Achievements**: Unlock badges/achievements for milestones
4. **Customization**: Allow couples to add custom questions
5. **Share Results**: Export/share game results with partner

## File Structure

```
api/
├── quiz/
│   ├── models.py                # Question models
│   ├── serializers.py           # API serializers
│   ├── views.py                 # API views
│   ├── urls.py                  # URL routing
│   ├── management/
│   │   ├── __init__.py
│   │   └── commands/
│   │       ├── __init__.py
│   │       └── seed_questions.py  # Data seeding script
│
my-app/
└── app/
    └── src/
        └── screens/
            └── Questions.jsx    # Quiz game UI
```

## Backend Requirements Met

✅ 200 questions across 7 categories
✅ Point system (1-3 points per question)
✅ Consequence system
✅ RESTful API endpoints
✅ Category filtering
✅ Database persistence (SQLite)
✅ Management command for seeding

## Frontend Requirements Met

✅ Category selection UI
✅ Question display with points
✅ Consequence modal on refusal
✅ Score tracking
✅ Game statistics
✅ Progress indication
✅ Error handling
✅ Color-coded categories
