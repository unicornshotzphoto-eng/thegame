# Quiz Game Implementation - Summary

## ✅ Scope Covered

### Backend
- Question model with category enum, question_number, points, and consequence
- Question responses tied to user and optional partner
- Public endpoints for categories/questions/random
- Auth endpoints for responses and question detail

### Frontend
- Category selection UI
- Question flow with scoring and stats
- Consequence modal for refused questions

---

## 📁 Key Backend Files

**1) `api/quiz/models.py`**
- `Question` (category enum, question_number, question_text, points, consequence)
- `QuestionResponse` (user response with optional partner)

**2) `api/quiz/serializers.py`**
- `QuestionSerializer`
- `QuestionResponseSerializer`

**3) `api/quiz/views.py`**
Endpoints:
```
GET  /quiz/questions/categories/
GET  /quiz/questions/{category}/
GET  /quiz/questions/?category={category}
GET  /quiz/questions/random/
GET  /quiz/questions/random/{category}/
GET  /quiz/questions/{question_id}/        (auth)
POST /quiz/questions/answer/               (auth)
GET  /quiz/questions/responses/            (auth)
```

**4) `api/quiz/management/commands/seed_questions.py`**
- Seeds 210 questions (30 per category)

---

## 📊 Category Codes

| Code | Name |
|------|------|
| `spiritual_knowing` | Spiritual Knowing (1-20) |
| `mental_knowing` | Mental Knowing (21-40) |
| `physical_knowing` | Physical Knowing (41-60) |
| `disagreeables_truth` | Disagreeables & Truth Checks (61-80) |
| `romantic_knowing` | Romantic Knowing (81-100) |
| `erotic_knowing` | Erotic Knowing (101-160) |
| `creative_fun` | Creative & Fun (161-200) |

---

## 🔌 Example Responses

**Categories**
```json
{
  "categories": [
    {
      "id": 1,
      "category": "spiritual_knowing",
      "name": "Spiritual Knowing (1-20)",
      "description": "Spiritual Knowing (1-20)",
      "question_count": 30
    }
  ]
}
```

**Question**
```json
{
  "id": 12,
  "category": "mental_knowing",
  "question_number": 12,
  "question_text": "How do you want to be supported emotionally?",
  "points": 1,
  "consequence": "Express your needs",
  "created_at": "2026-01-26T00:00:00Z"
}
```

**Question Response (auth)**
```json
{
  "id": 55,
  "question": { "id": 12, "category": "mental_knowing", "question_text": "..." },
  "user": { "id": 1, "username": "player1", "email": "p1@example.com", "thumbnail": null },
  "partner": { "id": 2, "username": "player2", "email": "p2@example.com", "thumbnail": null },
  "response_text": "I want more affirmations",
  "is_correct": false,
  "points_earned": 0,
  "created_at": "2026-01-26T00:05:00Z"
}
```

---

## 🚀 Setup

```bash
cd api
python3 manage.py migrate
python3 manage.py seed_questions
python3 manage.py runserver
```

```bash
cd my-app
npm install
npx expo start
```

---

## Notes
- The question endpoints are public by default.
- Use Bearer auth for `/questions/answer/` and `/questions/responses/`.
