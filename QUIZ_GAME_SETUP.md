# Quiz Game System - Setup & Implementation Guide

## Overview
The quiz game is a couple's intimacy game with 210 questions across 7 categories. It uses a Django REST backend and a React Native/Expo frontend.

## Backend Setup

### 1) Models
The quiz system uses a **single Question model** with a category enum.

**Question**
- `category` (CharField enum): one of the category codes
- `question_number` (IntegerField)
- `question_text` (TextField)
- `points` (IntegerField)
- `consequence` (TextField)
- `created_at` (DateTimeField)

**QuestionResponse**
- `question` (ForeignKey → Question)
- `user` (ForeignKey → User)
- `partner` (ForeignKey → User, optional)
- `response_text` (TextField)
- `points_earned` (IntegerField)
- `created_at` (DateTimeField)

### 2) Category Codes
```
spiritual_knowing
mental_knowing
physical_knowing
disagreeables_truth
romantic_knowing
erotic_knowing
creative_fun
```

### 3) Seed the Database
```bash
cd api
python3 manage.py migrate
python3 manage.py seed_questions
```

### 4) Start the Server
```bash
python3 manage.py runserver
```

## API Endpoints

All endpoints are prefixed with `/quiz/`.

```
GET /quiz/questions/categories/          (public)
GET /quiz/questions/{category}/          (public)
GET /quiz/questions/?category={category} (public)
GET /quiz/questions/random/              (public)
GET /quiz/questions/random/{category}/   (public)
GET /quiz/questions/{question_id}/       (auth)
POST /quiz/questions/answer/             (auth)
GET /quiz/questions/responses/           (auth)
```

## Frontend Setup

```bash
cd my-app
npm install
npx expo start
```

The quiz UI lives in:
```
my-app/app/src/screens/Questions.jsx
```

## Integration Notes

- The frontend should use the **category codes** listed above.
- Public endpoints do not require auth.
- Response endpoints require `Authorization: Bearer <token>`.
