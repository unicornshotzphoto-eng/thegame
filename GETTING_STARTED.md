# Quiz Game - Getting Started Guide

## ⚡ Quick Start

### Step 1: Run Migrations
```bash
cd api
python3 manage.py migrate
```

### Step 2: Seed Questions
```bash
python3 manage.py seed_questions
```

Expected output:
```
Successfully created 210 questions across 7 categories
```

### Step 3: Start Backend
```bash
python3 manage.py runserver
```

### Step 4: Start Frontend
```bash
cd my-app
npx expo start
```

---

## 📊 Category Codes

- `spiritual_knowing`
- `mental_knowing`
- `physical_knowing`
- `disagreeables_truth`
- `romantic_knowing`
- `erotic_knowing`
- `creative_fun`

---

## ✅ API Checks (Curl)

```bash
# Categories
curl http://localhost:8000/quiz/questions/categories/

# Questions by category (path)
curl http://localhost:8000/quiz/questions/spiritual_knowing/

# Questions by category (query)
curl "http://localhost:8000/quiz/questions/?category=spiritual_knowing"

# Random question
curl http://localhost:8000/quiz/questions/random/
```

---

## 🛠️ Troubleshooting

**Failed to load categories**
- Ensure backend is running
- Ensure questions are seeded

**No questions showing**
- Re-run: `python3 manage.py seed_questions`

**Frontend API URL**
- Check `my-app/app/src/core/apiConfig.js` for base URL.
