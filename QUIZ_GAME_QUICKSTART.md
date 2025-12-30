# Quiz Game - Quick Start Guide

## 🎮 What Was Built

A comprehensive couple's intimacy quiz game with:
- **200 questions** across **7 categories**
- **Point system** (1-3 points per question)
- **Consequence system** for refused questions
- **Score tracking** and game statistics
- **Color-coded categories** for easy identification

## 📁 Files Created/Modified

### Backend
- ✅ `api/quiz/models.py` - QuestionCategory and Question models
- ✅ `api/quiz/serializers.py` - Question serializers
- ✅ `api/quiz/views.py` - API endpoints (categories, questions, random)
- ✅ `api/quiz/urls.py` - URL routes
- ✅ `api/quiz/management/commands/seed_questions.py` - Data seeding command

### Frontend
- ✅ `my-app/app/src/screens/Questions.jsx` - Full quiz game UI with mechanics

## 🚀 How to Set Up

### 1. Run Database Migrations
```bash
cd api
python manage.py migrate
```

### 2. Seed the Database with 200 Questions
```bash
python manage.py seed_questions
```

Expected output:
```
Successfully created 210 questions across 7 categories
```

### 3. Start the Backend Server
```bash
python manage.py runserver
# Backend runs on http://localhost:8000
```

### 4. Start the Frontend
```bash
cd ../my-app
npm install  # If needed
npx expo start
# Then press 'i' for iOS, 'a' for Android, or 'w' for web
```

## 🎯 Game Features

### Category Selection
- 7 color-coded categories
- Shows question count per category
- Instructions on how to play

### Question Display
- Current question with points value
- Progress bar showing completion
- Score tracker
- Three action buttons: Answer, Refuse, Skip

### Game Mechanics
- **Answer**: Earn points and move to next question
- **Refuse**: View consequence and move to next question
- **Skip**: Move to next without earning points

### Statistics
- Answered count
- Refused count
- Skipped count
- Final score calculation

## 📊 Category Breakdown

| Category | Color | Questions | Theme |
|----------|-------|-----------|-------|
| Spiritual | Purple (#9B59B6) | 30 | Inner connection, faith, presence |
| Mental | Blue (#3498DB) | 30 | Emotions, dreams, growth |
| Physical | Red (#E74C3C) | 30 | Touch, affection, sensations |
| Disagreeables | Orange (#F39C12) | 30 | Conflicts, boundaries, fears |
| Romantic | Pink (#E91E63) | 30 | Love, cherishment, future |
| Erotic | Coral (#FF6B6B) | 30 | Sexual desires, intimacy |
| Creative | Teal (#1ABC9C) | 30 | Fun, adventures, shared goals |

## 🔌 API Endpoints

All endpoints are under `/api/quiz/`:

```
GET /questions/categories/
  Returns: List of all categories with question counts

GET /questions/{category}/
  Returns: All questions for that category
  
GET /questions/random/
  Returns: Random question from any category
  
GET /questions/random/{category}/
  Returns: Random question from specific category
```

## 📱 Frontend Structure

**Questions.jsx Component**
- Category selection screen
- Question display screen with scoring
- Consequence modal
- Game statistics panel

**State Management**
- Categories: Available categories with counts
- Questions: Questions for selected category
- Score: Current earned points
- GameStats: Answered/Refused/Skipped counts

## ✨ Styling

- **Color-coded categories**: Easy visual identification
- **Progress bar**: Shows completion percentage
- **Score display**: Shows current, total, and multiplier
- **Stats panel**: Real-time game statistics
- **Consequence modal**: Bottom-sheet style display

## 🐛 Troubleshooting

**"Failed to load categories"**
- Check backend is running
- Verify API base URL is correct
- Ensure database has questions seeded

**No questions showing**
- Run: `python manage.py seed_questions`
- Check question count: 210 should be created

**API 404 errors**
- Ensure URL routes are registered in `api/quiz/urls.py`
- Verify category names match (use lowercase)

## 📝 Data Schema

### QuestionCategory Model
```python
- id: Integer (Primary Key)
- category: String (unique identifier like 'spiritual')
- name: String (display name like 'Spiritual Knowing')
- description: String (longer description)
```

### Question Model
```python
- id: Integer (Primary Key)
- category: ForeignKey(QuestionCategory)
- question_text: String (the actual question)
- points: Integer (1, 2, or 3)
- consequence: String (what to do if refused)
- order: Integer (display order within category)
```

## 🎮 Game Flow

1. User selects category from grid
2. Questions load for that category
3. First question displays with:
   - Question text
   - Points value
   - Progress indicator
   - Action buttons
4. User chooses: Answer, Refuse, or Skip
5. Game tracks statistics
6. Upon completion: Final score displayed

## 🔐 Security

- AllowAny permission for question endpoints (can be restricted)
- No authentication required to play quiz
- Can be restricted to authenticated users if needed

## 📊 Example Response

```json
[
  {
    "id": 1,
    "question_text": "What is one thing that makes you feel most at peace?",
    "points": 1,
    "consequence": "Describe your happiest moment together",
    "category": {
      "id": 1,
      "category": "spiritual",
      "name": "Spiritual Knowing",
      "description": "Spiritual & Inner Connection"
    }
  }
]
```

## 🎯 Next Steps

1. Play the quiz and enjoy!
2. Customize questions by editing the seed script
3. Add user authentication if needed
4. Track game history/high scores
5. Implement multiplayer mode

---

**Total Questions**: 210 (across 7 categories, 30 per category)
**Status**: ✅ Complete and ready to use!
