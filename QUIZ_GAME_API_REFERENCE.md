# Quiz Game API Reference & Examples

## Overview
The Quiz Game API provides endpoints for categories, questions, and user responses.

## Base URL
```
http://localhost:8000/quiz
```

## Authentication
Endpoints marked **(auth)** require a Bearer token:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Category Codes

| Code | Name | Range |
|------|------|-------|
| `spiritual_knowing` | Spiritual Knowing (1-20) | 1-20 |
| `mental_knowing` | Mental Knowing (21-40) | 21-40 |
| `physical_knowing` | Physical Knowing (41-60) | 41-60 |
| `disagreeables_truth` | Disagreeables & Truth Checks (61-80) | 61-80 |
| `romantic_knowing` | Romantic Knowing (81-100) | 81-100 |
| `erotic_knowing` | Erotic Knowing (101-160) | 101-160 |
| `creative_fun` | Creative & Fun (161-200) | 161-200 |

---

## 📋 Endpoints

### 1. Get All Categories
**Endpoint:** `GET /questions/categories/` (public)

**Response (200 OK):**
```json
{
  "categories": [
    {
      "id": 1,
      "category": "spiritual_knowing",
      "name": "Spiritual Knowing (1-20)",
      "description": "Spiritual Knowing (1-20)",
      "question_count": 30
    },
    {
      "id": 2,
      "category": "mental_knowing",
      "name": "Mental Knowing (21-40)",
      "description": "Mental Knowing (21-40)",
      "question_count": 30
    }
  ]
}
```

---

### 2. Get Questions by Category (Path)
**Endpoint:** `GET /questions/{category}/` (public)

**Parameters:**
- `category` (path, required): Category code (see table above)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "category": "spiritual_knowing",
    "question_number": 1,
    "question_text": "What is one thing that makes you feel most at peace?",
    "points": 1,
    "consequence": "Describe your happiest moment together",
    "created_at": "2026-01-26T00:00:00Z"
  }
]
```

---

### 3. Get Questions by Category (Query)
**Endpoint:** `GET /questions/?category={category}` (public)

**Response (200 OK):**
```json
{
  "questions": [
    {
      "id": 1,
      "category": "spiritual_knowing",
      "question_number": 1,
      "question_text": "What is one thing that makes you feel most at peace?",
      "points": 1,
      "consequence": "Describe your happiest moment together",
      "created_at": "2026-01-26T00:00:00Z"
    }
  ]
}
```

---

### 4. Get Random Question (Any Category)
**Endpoint:** `GET /questions/random/` (public)

**Response (200 OK):**
```json
{
  "id": 45,
  "category": "physical_knowing",
  "question_number": 5,
  "question_text": "What physical activity makes you feel most alive?",
  "points": 1,
  "consequence": "Share your movement",
  "created_at": "2026-01-26T00:00:00Z"
}
```

---

### 5. Get Random Question (Specific Category)
**Endpoint:** `GET /questions/random/{category}/` (public)

**Response (200 OK):**
```json
{
  "id": 142,
  "category": "erotic_knowing",
  "question_number": 110,
  "question_text": "What sound do I make when losing control?",
  "points": 3,
  "consequence": "Mimic desire verbally",
  "created_at": "2026-01-26T00:00:00Z"
}
```

---

### 6. Get Question Detail
**Endpoint:** `GET /questions/{question_id}/` **(auth)**

**Response (200 OK):**
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

---

### 7. Submit Answer
**Endpoint:** `POST /questions/answer/` **(auth)**

**Request:**
```json
{
  "question_id": 12,
  "response_text": "I want more affirmations",
  "partner_id": 2
}
```

**Response (201):**
```json
{
  "id": 55,
  "question": { "id": 12, "category": "mental_knowing", "question_text": "...", "points": 1 },
  "user": { "id": 1, "username": "player1", "email": "p1@example.com", "thumbnail": null },
  "partner": { "id": 2, "username": "player2", "email": "p2@example.com", "thumbnail": null },
  "response_text": "I want more affirmations",
  "is_correct": false,
  "points_earned": 0,
  "created_at": "2026-01-26T00:05:00Z"
}
```

---

### 8. List User Responses
**Endpoint:** `GET /questions/responses/` **(auth)**

**Response (200):**
```json
{
  "responses": [
    {
      "id": 55,
      "question": { "id": 12, "category": "mental_knowing", "question_text": "...", "points": 1 },
      "user": { "id": 1, "username": "player1", "email": "p1@example.com", "thumbnail": null },
      "partner": { "id": 2, "username": "player2", "email": "p2@example.com", "thumbnail": null },
      "response_text": "I want more affirmations",
      "is_correct": false,
      "points_earned": 0,
      "created_at": "2026-01-26T00:05:00Z"
    }
  ]
}
```

---

## 📊 Question Object
```json
{
  "id": 1,
  "category": "spiritual_knowing",
  "question_number": 1,
  "question_text": "...",
  "points": 1,
  "consequence": "...",
  "created_at": "2026-01-26T00:00:00Z"
}
```

## 🛡️ Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Questions returned |
| 201 | Created | Response created |
| 400 | Bad Request | Missing required fields |
| 401 | Unauthorized | Missing/invalid token |
| 404 | Not Found | Category or question not found |
