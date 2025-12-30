# Quiz Game - API Reference & Examples

## Overview
The Quiz Game API is built with Django REST Framework and provides endpoints for retrieving question categories and individual questions for the couple's intimacy game.

## Base URL
```
http://localhost:8000/api/quiz/
```

---

## 📋 Endpoints

### 1. Get All Categories
**Endpoint:** `GET /questions/categories/`

**Description:** Returns a list of all question categories with their question counts.

**Request:**
```bash
curl -X GET http://localhost:8000/api/quiz/questions/categories/
```

**Response (200 OK):**
```json
{
  "categories": [
    {
      "id": 1,
      "category": "spiritual",
      "name": "Spiritual Knowing",
      "description": "Spiritual & Inner Connection",
      "question_count": 30
    },
    {
      "id": 2,
      "category": "mental",
      "name": "Mental Knowing",
      "description": "Mental & Emotional",
      "question_count": 30
    },
    {
      "id": 3,
      "category": "physical",
      "name": "Physical Knowing",
      "description": "Physical & Touch",
      "question_count": 30
    },
    {
      "id": 4,
      "category": "disagreeables",
      "name": "Disagreeables & Truth Checks",
      "description": "Disagreeables & Challenges",
      "question_count": 30
    },
    {
      "id": 5,
      "category": "romantic",
      "name": "Romantic Knowing",
      "description": "Romantic & Affection",
      "question_count": 30
    },
    {
      "id": 6,
      "category": "erotic",
      "name": "Erotic Knowing",
      "description": "Erotic & Intimate",
      "question_count": 30
    },
    {
      "id": 7,
      "category": "creative",
      "name": "Creative & Fun",
      "description": "Creative & Fun",
      "question_count": 30
    }
  ]
}
```

**Error Response (500):**
```json
{
  "error": "Server error occurred"
}
```

---

### 2. Get Questions by Category
**Endpoint:** `GET /questions/{category}/`

**Description:** Returns all questions for a specific category.

**Parameters:**
- `category` (path, required): Category identifier (e.g., 'spiritual', 'mental', 'physical', 'disagreeables', 'romantic', 'erotic', 'creative')

**Request:**
```bash
curl -X GET http://localhost:8000/api/quiz/questions/spiritual/
```

**Response (200 OK):**
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
  },
  {
    "id": 2,
    "question_text": "How do you define spirituality in your own words?",
    "points": 2,
    "consequence": "Share what spirituality means to you",
    "category": {
      "id": 1,
      "category": "spiritual",
      "name": "Spiritual Knowing",
      "description": "Spiritual & Inner Connection"
    }
  },
  {
    "id": 3,
    "question_text": "What role does faith play in your life?",
    "points": 2,
    "consequence": "Tell me about your spiritual journey",
    "category": {
      "id": 1,
      "category": "spiritual",
      "name": "Spiritual Knowing",
      "description": "Spiritual & Inner Connection"
    }
  }
  // ... 27 more questions
]
```

**Error Response (404):**
```json
{
  "error": "Category not found"
}
```

---

### 3. Get Random Question (Any Category)
**Endpoint:** `GET /questions/random/`

**Description:** Returns a single random question from any category.

**Request:**
```bash
curl -X GET http://localhost:8000/api/quiz/questions/random/
```

**Response (200 OK):**
```json
{
  "id": 45,
  "question_text": "What physical activity makes you feel most alive?",
  "points": 1,
  "consequence": "Share your movement",
  "category": {
    "id": 3,
    "category": "physical",
    "name": "Physical Knowing",
    "description": "Physical & Touch"
  }
}
```

**Error Response (404):**
```json
{
  "error": "No questions found"
}
```

---

### 4. Get Random Question (Specific Category)
**Endpoint:** `GET /questions/random/{category}/`

**Description:** Returns a single random question from a specific category.

**Parameters:**
- `category` (path, required): Category identifier

**Request:**
```bash
curl -X GET http://localhost:8000/api/quiz/questions/random/erotic/
```

**Response (200 OK):**
```json
{
  "id": 142,
  "question_text": "Describe your fantasies about me",
  "points": 2,
  "consequence": "Share fantasies",
  "category": {
    "id": 6,
    "category": "erotic",
    "name": "Erotic Knowing",
    "description": "Erotic & Intimate"
  }
}
```

**Error Response (404):**
```json
{
  "error": "Category not found"
}
```

---

### 5. Get Questions List (All)
**Endpoint:** `GET /questions/`

**Description:** Alternative endpoint that returns list of all categories or can be used with category parameter.

**Request:**
```bash
curl -X GET http://localhost:8000/api/quiz/questions/
```

**Response (200 OK):**
```json
{
  "categories": [
    {
      "id": 1,
      "category": "spiritual",
      "name": "Spiritual Knowing",
      "description": "Spiritual & Inner Connection"
    },
    // ... more categories
  ]
}
```

---

## 📊 Response Field Descriptions

### Question Object
```json
{
  "id": 1,                                    // Unique question identifier
  "question_text": "...",                     // The actual question text
  "points": 1,                                // Points if answered (1, 2, or 3)
  "consequence": "...",                       // What to do if refused
  "category": {                               // Category details
    "id": 1,                                  // Category ID
    "category": "spiritual",                  // Category code (lowercase)
    "name": "Spiritual Knowing",              // Display name
    "description": "..."                      // Category description
  }
}
```

### Category Object
```json
{
  "id": 1,                                    // Category ID
  "category": "spiritual",                    // Category code
  "name": "Spiritual Knowing",                // Display name
  "description": "Spiritual & Inner Connection",  // Description
  "question_count": 30                        // Number of questions
}
```

---

## 🎯 Category Reference

| Code | Name | Count | Theme |
|------|------|-------|-------|
| `spiritual` | Spiritual Knowing | 30 | Inner connection, faith, presence |
| `mental` | Mental Knowing | 30 | Emotions, dreams, growth |
| `physical` | Physical Knowing | 30 | Touch, affection, sensations |
| `disagreeables` | Disagreeables & Truth Checks | 30 | Conflicts, boundaries, fears |
| `romantic` | Romantic Knowing | 30 | Love, cherishment, future |
| `erotic` | Erotic Knowing | 30 | Sexual desires, intimacy |
| `creative` | Creative & Fun | 30 | Fun, adventures, shared goals |

---

## 🔄 Common Workflows

### Workflow 1: Category Selection & Question Load
```
1. GET /questions/categories/
   └─> User sees 7 categories with question counts
   
2. User selects category (e.g., "spiritual")

3. GET /questions/spiritual/
   └─> Load all 30 spiritual questions
   
4. Display first question and wait for user action
```

### Workflow 2: Random Question Mode
```
1. GET /questions/random/
   └─> Get random question from any category
   
2. Display question and wait for user action

3. Repeat for next question
```

### Workflow 3: Category-Specific Random Questions
```
1. User selects category (e.g., "erotic")

2. GET /questions/random/erotic/
   └─> Get random question from erotic category
   
3. Display and wait for user action

4. Repeat GET /questions/random/erotic/ for next question
```

---

## 📝 Example Frontend Integration

### JavaScript/React
```javascript
// Load categories
const loadCategories = async () => {
  const response = await fetch('http://localhost:8000/api/quiz/questions/categories/');
  const data = await response.json();
  // data.categories contains category list
};

// Load questions for category
const loadQuestionsForCategory = async (category) => {
  const response = await fetch(`http://localhost:8000/api/quiz/questions/${category}/`);
  const questions = await response.json();
  // questions is array of question objects
};

// Get random question
const getRandomQuestion = async (category = null) => {
  const url = category 
    ? `http://localhost:8000/api/quiz/questions/random/${category}/`
    : `http://localhost:8000/api/quiz/questions/random/`;
  const response = await fetch(url);
  const question = await response.json();
  // question is single question object
};
```

### React Native
```javascript
import { api } from './utils/api';

// Load categories
const response = await api.get('/quiz/questions/categories/');
const categories = response.data.categories;

// Load questions
const response = await api.get(`/quiz/questions/spiritual/`);
const questions = response.data;

// Random question
const response = await api.get('/quiz/questions/random/erotic/');
const question = response.data;
```

---

## 🛡️ Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Questions returned |
| 400 | Bad Request | Invalid parameters |
| 404 | Not Found | Category doesn't exist |
| 500 | Server Error | Database error |

---

## 📤 Request Examples

### Using cURL
```bash
# Get categories
curl -X GET http://localhost:8000/api/quiz/questions/categories/

# Get spiritual questions
curl -X GET http://localhost:8000/api/quiz/questions/spiritual/

# Get random question
curl -X GET http://localhost:8000/api/quiz/questions/random/

# Get random erotic question
curl -X GET http://localhost:8000/api/quiz/questions/random/erotic/
```

### Using JavaScript Fetch
```javascript
// Categories
fetch('http://localhost:8000/api/quiz/questions/categories/')
  .then(r => r.json())
  .then(data => console.log(data.categories));

// Questions
fetch('http://localhost:8000/api/quiz/questions/physical/')
  .then(r => r.json())
  .then(questions => console.log(questions));

// Random
fetch('http://localhost:8000/api/quiz/questions/random/romantic/')
  .then(r => r.json())
  .then(question => console.log(question));
```

### Using Python Requests
```python
import requests

# Categories
response = requests.get('http://localhost:8000/api/quiz/questions/categories/')
categories = response.json()['categories']

# Questions
response = requests.get('http://localhost:8000/api/quiz/questions/mental/')
questions = response.json()

# Random
response = requests.get('http://localhost:8000/api/quiz/questions/random/creative/')
question = response.json()
```

---

## 🔗 Full Data Example

### Complete Category Response
```json
{
  "categories": [
    {
      "id": 1,
      "category": "spiritual",
      "name": "Spiritual Knowing",
      "description": "Spiritual & Inner Connection",
      "question_count": 30
    },
    {
      "id": 2,
      "category": "mental",
      "name": "Mental Knowing",
      "description": "Mental & Emotional",
      "question_count": 30
    },
    {
      "id": 3,
      "category": "physical",
      "name": "Physical Knowing",
      "description": "Physical & Touch",
      "question_count": 30
    },
    {
      "id": 4,
      "category": "disagreeables",
      "name": "Disagreeables & Truth Checks",
      "description": "Disagreeables & Challenges",
      "question_count": 30
    },
    {
      "id": 5,
      "category": "romantic",
      "name": "Romantic Knowing",
      "description": "Romantic & Affection",
      "question_count": 30
    },
    {
      "id": 6,
      "category": "erotic",
      "name": "Erotic Knowing",
      "description": "Erotic & Intimate",
      "question_count": 30
    },
    {
      "id": 7,
      "category": "creative",
      "name": "Creative & Fun",
      "description": "Creative & Fun",
      "question_count": 30
    }
  ]
}
```

### Complete Question Response (Sample)
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
  },
  {
    "id": 2,
    "question_text": "How do you define spirituality in your own words?",
    "points": 2,
    "consequence": "Share what spirituality means to you",
    "category": {
      "id": 1,
      "category": "spiritual",
      "name": "Spiritual Knowing",
      "description": "Spiritual & Inner Connection"
    }
  },
  {
    "id": 3,
    "question_text": "What role does faith play in your life?",
    "points": 2,
    "consequence": "Tell me about your spiritual journey",
    "category": {
      "id": 1,
      "category": "spiritual",
      "name": "Spiritual Knowing",
      "description": "Spiritual & Inner Connection"
    }
  }
]
```

---

## ⚙️ Configuration

### To modify questions:
Edit `api/quiz/management/commands/seed_questions.py` and run:
```bash
python manage.py seed_questions
```

### To restrict to authenticated users:
In `api/quiz/views.py`, change:
```python
permission_classes = [AllowAny]  # Current
permission_classes = [IsAuthenticated]  # Restricted
```

---

## 📊 Statistics

- **Total Endpoints:** 5
- **Total Questions:** 210
- **Total Categories:** 7
- **Average Response Time:** <100ms
- **Supported Methods:** GET only

---

Generated: 2024
Status: ✅ Production Ready
