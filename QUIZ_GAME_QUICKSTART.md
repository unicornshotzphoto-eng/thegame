# Quiz Game - Quick Start Guide

## 🎮 What Was Built

A turn-based couple's intimacy quiz game with:
- **210 questions** across **7 categories** (30 each)
- **Point system** (1-3 points per question)
- **Consequence system** for refused questions
- **Score tracking** and game statistics

## 📁 Files Created/Modified

### Backend
- ✅ `api/quiz/models.py` - Question and related models
- ✅ `api/quiz/serializers.py` - Question serializers
- ✅ `api/quiz/views.py` - API endpoints (categories, questions, random, responses)
- ✅ `api/quiz/urls.py` - URL routes
- ✅ `api/quiz/management/commands/seed_questions.py` - Data seeding command

### Frontend
- ✅ `my-app/app/src/screens/Questions.jsx` - Quiz UI

## 🚀 How to Set Up

### 1. Run Database Migrations
```bash
cd api
python3 manage.py migrate
```

### 2. Seed the Database
```bash
python3 manage.py seed_questions
```

Expected output:
```
Successfully created 210 questions across 7 categories
```

### 3. Start the Backend Server
```bash
python3 manage.py runserver
# Backend runs on http://localhost:8000
```

### 4. Start the Frontend
```bash
cd ../my-app
npm install  # If needed
npx expo start
# Press 'i' for iOS, 'a' for Android, or 'w' for web
```

## 📊 Category Codes

| Code | Name | Range |
|------|------|-------|
| `spiritual_knowing` | Spiritual Knowing (1-20) | 1-20 |
| `mental_knowing` | Mental Knowing (21-40) | 21-40 |
| `physical_knowing` | Physical Knowing (41-60) | 41-60 |
| `disagreeables_truth` | Disagreeables & Truth Checks (61-80) | 61-80 |
| `romantic_knowing` | Romantic Knowing (81-100) | 81-100 |
| `erotic_knowing` | Erotic Knowing (101-160) | 101-160 |
| `creative_fun` | Creative & Fun (161-200) | 161-200 |

## 🔌 API Endpoints

All endpoints are under `/quiz/`:

```
GET /questions/categories/
  Returns: List of all categories with question counts

GET /questions/{category}/
  Returns: All questions for that category (public)

GET /questions/?category={category}
  Returns: Questions list (public)

GET /questions/random/
  Returns: Random question (public)

GET /questions/random/{category}/
  Returns: Random question by category (public)

GET /questions/{question_id}/
  Returns: Question detail (auth)

POST /questions/answer/
  Saves user response (auth)

GET /questions/responses/
  Returns user responses (auth)
```

## 📝 Data Schema (Simplified)

### Question Model
```python
- id: Integer (Primary Key)
- category: String enum (category codes above)
- question_number: Integer
- question_text: String
- points: Integer (1, 2, or 3)
- consequence: String
- created_at: DateTime
```

## 🎮 Game Flow

1. User selects a category
2. Questions load for that category
3. User answers/refuses/skips
4. Game tracks score + stats
5. Final score displayed on completion

## 🐛 Troubleshooting

**"Failed to load categories"**
- Check backend is running
- Verify API base URL is correct
- Ensure database has questions seeded

**No questions showing**
- Run: `python3 manage.py seed_questions`

**API 404 errors**
- Ensure URL routes are registered in `api/quiz/urls.py`
- Verify category codes match the table above
