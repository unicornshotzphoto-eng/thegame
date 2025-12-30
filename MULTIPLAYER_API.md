# Multiplayer Quiz API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication
All endpoints (except signin/signup) require Bearer token authentication:
```
Authorization: Bearer <JWT_TOKEN>
```

## Game Endpoints

### 1. Create Game Session
Create a new multiplayer game with selected friends

**Endpoint:** `POST /games/create/`

**Request:**
```json
{
  "friend_ids": [2, 3, 4]
}
```

**Response (201):**
```json
{
  "id": 1,
  "creator": {
    "id": 1,
    "username": "player1",
    "email": "player1@example.com",
    "thumbnail": null
  },
  "players": [
    {
      "id": 1,
      "username": "player1",
      "email": "player1@example.com",
      "thumbnail": null
    },
    {
      "id": 2,
      "username": "player2",
      "email": "player2@example.com",
      "thumbnail": null
    },
    {
      "id": 3,
      "username": "player3",
      "email": "player3@example.com",
      "thumbnail": null
    }
  ],
  "status": "waiting",
  "current_round": 1,
  "current_question": null,
  "category_picker": {
    "id": 1,
    "username": "player1",
    "email": "player1@example.com",
    "thumbnail": null
  },
  "answers": [],
  "player_scores": {
    "player1": 0,
    "player2": 0,
    "player3": 0
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Errors:**
- 400: No friends selected or friend IDs invalid
- 404: Some users not found

---

### 2. Get Game Session Details
Retrieve full game state and player information

**Endpoint:** `GET /games/{game_id}/`

**Response (200):**
```json
{
  "id": 1,
  "creator": { "id": 1, "username": "player1", ... },
  "players": [ ... ],
  "status": "in_progress",
  "current_round": 2,
  "current_question": {
    "id": 42,
    "category": {
      "id": 1,
      "category": "spiritual",
      "name": "Spiritual",
      "description": "Questions about beliefs and spirituality"
    },
    "question_text": "What is your spiritual practice?",
    "points": 2,
    "consequence": "...",
    "order": 5
  },
  "category_picker": { "id": 2, "username": "player2", ... },
  "answers": [ ... ],
  "player_scores": {
    "player1": 5,
    "player2": 3,
    "player3": 7
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:35:00Z"
}
```

**Errors:**
- 404: Game not found or user not in game

---

### 3. List All Games
Get all games the user is participating in

**Endpoint:** `GET /games/`

**Response (200):**
```json
{
  "games": [
    {
      "id": 1,
      "creator": { "id": 1, "username": "player1", ... },
      "players": [ ... ],
      "player_count": 3,
      "status": "in_progress",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:35:00Z"
    },
    {
      "id": 2,
      "creator": { "id": 3, "username": "player3", ... },
      "players": [ ... ],
      "player_count": 2,
      "status": "completed",
      "created_at": "2024-01-14T15:20:00Z",
      "updated_at": "2024-01-14T16:10:00Z"
    }
  ]
}
```

---

### 4. Start Game Round
Category picker selects a category to start a new round

**Endpoint:** `POST /games/{game_id}/start-round/`

**Request:**
```json
{
  "category": "spiritual"
}
```

**Response (200):**
```json
{
  "id": 1,
  "status": "in_progress",
  "current_round": 2,
  "current_question": {
    "id": 42,
    "category": { ... },
    "question_text": "What is your spiritual practice?",
    "points": 2,
    "consequence": "...",
    "order": 5
  },
  "category_picker": { "id": 2, "username": "player2", ... },
  "player_scores": { ... },
  ...
}
```

**Errors:**
- 400: No category provided, no current question found
- 403: Only category picker can start round
- 404: Category not found, game not found

---

### 5. Submit Answer
Player submits their answer to the current question

**Endpoint:** `POST /games/{game_id}/submit-answer/`

**Request:**
```json
{
  "answer": "I practice meditation and yoga daily"
}
```

**Response (201):**
```json
{
  "message": "Answer submitted"
}
```

**Behavior:**
- Creates new PlayerAnswer if first time answering
- Updates existing answer if player answers again
- No points are calculated at submission (can be done later)

**Errors:**
- 400: No answer text provided, no current question
- 404: Game not found

---

### 6. Get All Answers for Current Question
Retrieve all submitted answers for the current question

**Endpoint:** `GET /games/{game_id}/answers/`

**Response (200):**
```json
{
  "answers": [
    {
      "id": 1,
      "player": {
        "id": 1,
        "username": "player1",
        "email": "player1@example.com",
        "thumbnail": null
      },
      "question": {
        "id": 42,
        "category": { ... },
        "question_text": "What is your spiritual practice?",
        "points": 2,
        "consequence": "...",
        "order": 5
      },
      "answer_text": "I practice meditation and yoga daily",
      "points_awarded": 0,
      "created_at": "2024-01-15T10:32:00Z"
    },
    {
      "id": 2,
      "player": {
        "id": 2,
        "username": "player2",
        "email": "player2@example.com",
        "thumbnail": null
      },
      "question": { ... },
      "answer_text": "I'm not really spiritual but I respect others",
      "points_awarded": 0,
      "created_at": "2024-01-15T10:33:15Z"
    },
    {
      "id": 3,
      "player": {
        "id": 3,
        "username": "player3",
        "email": "player3@example.com",
        "thumbnail": null
      },
      "question": { ... },
      "answer_text": "I practice Buddhism",
      "points_awarded": 0,
      "created_at": "2024-01-15T10:34:30Z"
    }
  ]
}
```

**Errors:**
- 400: No current question in game
- 404: Game not found

---

### 7. Next Round
Move to next round - rotates category picker to next player

**Endpoint:** `POST /games/{game_id}/next-round/`

**Request:** (empty body)

**Response (200):**
```json
{
  "id": 1,
  "status": "in_progress",
  "current_round": 3,
  "current_question": null,
  "category_picker": {
    "id": 3,
    "username": "player3",
    "email": "player3@example.com",
    "thumbnail": null
  },
  "player_scores": {
    "player1": 5,
    "player2": 5,
    "player3": 7
  },
  ...
}
```

**Behavior:**
- Rotates picker to next player in players list
- Clears current question
- Increments round counter
- Checks if max rounds reached
- If max rounds reached, sets status to 'completed'

**Errors:**
- 403: Only game creator can advance to next round
- 404: Game not found

---

### 8. End Game
Manually end the game and finalize scores

**Endpoint:** `POST /games/{game_id}/end/`

**Request:** (empty body)

**Response (200):**
```json
{
  "id": 1,
  "status": "completed",
  "current_round": 3,
  "player_scores": {
    "player1": 5,
    "player2": 5,
    "player3": 7
  },
  "players": [
    {
      "id": 3,
      "username": "player3",
      "email": "player3@example.com"
    },
    {
      "id": 1,
      "username": "player1",
      "email": "player1@example.com"
    },
    {
      "id": 2,
      "username": "player2",
      "email": "player2@example.com"
    }
  ],
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:45:00Z"
}
```

**Errors:**
- 403: Only game creator can end game
- 404: Game not found

---

## Data Models

### GameSession
```
{
  "id": integer (primary key),
  "creator": User,
  "players": User[] (many-to-many),
  "status": "waiting" | "in_progress" | "completed",
  "current_round": integer,
  "current_question": Question | null,
  "category_picker": User | null,
  "created_at": ISO datetime,
  "updated_at": ISO datetime
}
```

### PlayerAnswer
```
{
  "id": integer (primary key),
  "game_session": GameSession,
  "player": User,
  "question": Question,
  "answer_text": string,
  "points_awarded": integer (default 0),
  "created_at": ISO datetime
}
```

### Question
```
{
  "id": integer (primary key),
  "category": QuestionCategory,
  "question_text": string,
  "points": integer (1-3),
  "consequence": string,
  "order": integer
}
```

### User
```
{
  "id": integer (primary key),
  "username": string,
  "email": string,
  "thumbnail": string | null (URL to profile picture)
}
```

---

## Game Flow Sequence

```
1. POST /games/create/
   → Create game session, player1 = category_picker

2. POST /games/{id}/start-round/ (category: "spiritual")
   → Select random question, status = "in_progress"

3. POST /games/{id}/submit-answer/ (all 3 players)
   → Each player submits answer

4. GET /games/{id}/answers/
   → View all answers for comparison

5. POST /games/{id}/next-round/
   → player2 becomes category_picker, round++

6. Repeat steps 2-5 for remaining rounds

7. POST /games/{id}/end/
   → Set status = "completed"

8. GET /games/{id}/
   → View final scores and rankings
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Description of what was wrong with request"
}
```

### 403 Forbidden
```json
{
  "error": "Only the category picker can start the round"
}
```

### 404 Not Found
```json
{
  "error": "Game not found or access denied"
}
```

### 401 Unauthorized
```json
{
  "detail": "Invalid token or no authentication provided"
}
```

---

## Scoring System

### Current Implementation
- Each question has fixed points (1, 2, or 3)
- Player earns points when question is answered
- Final score = sum of all points earned

### Example
```
Round 1: Player picks "spiritual" (2 pts) → Player earns 2 points
Round 2: Player picks "mental" (3 pts) → Player earns 3 points
Round 3: Player picks "physical" (1 pt) → Player earns 1 point

Total Score: 2 + 3 + 1 = 6 points
```

---

## Rate Limiting
Currently no rate limiting. In production, implement:
- 100 requests per minute per user
- Burst limit of 20 requests per second

---

## WebSocket Events (Future)

Planned for real-time updates:
```
- game.question_started (when new question loaded)
- game.answer_submitted (when player submits)
- game.round_advanced (when moving to next round)
- game.completed (when game ends)
```

---

## Testing with Postman

Import this collection for quick testing:

```json
{
  "info": {
    "name": "Multiplayer Quiz API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0"
  },
  "item": [
    {
      "name": "Create Game",
      "request": {
        "method": "POST",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"},
          {"key": "Content-Type", "value": "application/json"}
        ],
        "body": {"raw": "{\"friend_ids\": [2, 3]}"},
        "url": {"raw": "{{base_url}}/games/create/"}
      }
    },
    {
      "name": "Get Game Details",
      "request": {
        "method": "GET",
        "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
        "url": {"raw": "{{base_url}}/games/1/"}
      }
    }
  ]
}
```

Set variables:
- `base_url`: http://localhost:8000/api
- `token`: Your JWT access token

