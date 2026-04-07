# Turn-Based Game API Documentation

## Base URL
```
http://localhost:8000/quiz
```

## Authentication
All endpoints (except signin/signup) require Bearer token authentication:
```
Authorization: Bearer <JWT_TOKEN>
```

## Game Endpoints

### 1. Create Game Session
Create a new turn-based session (direct or group).

**Endpoint:** `POST /game/create/`

**Request (direct):**
```json
{
  "session_type": "direct",
  "participant_ids": [2]
}
```

**Request (group):**
```json
{
  "session_type": "group",
  "group_id": 12
}
```

**Response (201):**
```json
{
  "id": 9,
  "session_type": "direct",
  "group": null,
  "participants": [
    { "id": 1, "username": "player1", "email": "p1@example.com", "thumbnail": null },
    { "id": 2, "username": "player2", "email": "p2@example.com", "thumbnail": null }
  ],
  "current_turn_user": { "id": 1, "username": "player1", "email": "p1@example.com", "thumbnail": null },
  "turn_order": [1, 2],
  "is_active": true,
  "created_at": "2026-01-26T00:00:00Z",
  "updated_at": "2026-01-26T00:00:00Z"
}
```

**Errors:**
- 400: Invalid session type or participants
- 404: Group not found / User not found

---

### 2. Get Game Session Details
Retrieve session state, rounds, and scores.

**Endpoint:** `GET /game/{session_id}/`

**Response (200):**
```json
{
  "session": { "id": 9, "session_type": "direct", "is_active": true, "turn_order": [1, 2] },
  "rounds": [
    {
      "id": 1,
      "question": { "id": 42, "category": "spiritual_knowing", "question_text": "..." },
      "picker": { "id": 1, "username": "player1", "email": "p1@example.com", "thumbnail": null },
      "answers": [ ... ],
      "is_completed": false,
      "created_at": "2026-01-26T00:02:00Z"
    }
  ],
  "current_round": { ... },
  "scores": {
    "player1": 4,
    "player2": 2
  }
}
```

**Errors:**
- 403: Not a participant
- 404: Session not found

---

### 3. Create Round (Random Question)
The current-turn player picks a category; backend creates a round and answer slots.

**Endpoint:** `POST /game/random-question/`

**Request:**
```json
{
  "session_id": 9,
  "category": "spiritual_knowing"
}
```

**Response (200):**
```json
{
  "round": {
    "id": 2,
    "question": { "id": 51, "category": "spiritual_knowing", "question_text": "...", "points": 2 },
    "picker": { "id": 1, "username": "player1", "email": "p1@example.com", "thumbnail": null },
    "answers": [
      { "id": 10, "player": { "id": 1, "username": "player1", ... }, "answer": null, "points_earned": 0 },
      { "id": 11, "player": { "id": 2, "username": "player2", ... }, "answer": null, "points_earned": 0 }
    ],
    "is_completed": false
  }
}
```

**Errors:**
- 400: Missing session_id or category
- 403: Not your turn / Not a participant
- 404: No more questions / Session not found

---

### 4. Submit Answer
Submit an answer for the current round.

**Endpoint:** `POST /game/answer/`

**Request:**
```json
{
  "round_id": 2,
  "answer": "My answer"
}
```

**Response (200):**
```json
{
  "turn": { "id": 11, "answer": "My answer", "points_earned": 2, "answered_at": "2026-01-26T00:03:00Z" },
  "round_completed": true,
  "all_answered": true,
  "answered_count": 2,
  "total_players": 2,
  "points_earned": 2
}
```

**Errors:**
- 400: Missing round_id or answer
- 404: Round not found / Turn not found

---

### 5. Active Sessions
List active sessions for the current user.

**Endpoint:** `GET /game/active/`

**Response (200):**
```json
{
  "sessions": [
    { "id": 9, "session_type": "direct", "is_active": true, ... }
  ]
}
```

---

### 6. Delete Session
Delete a session for all participants.

**Endpoint:** `DELETE /game/{session_id}/delete/`

**Response (200):**
```json
{ "message": "Game session deleted" }
```

**Errors:**
- 403: Not a participant
- 404: Session not found

---

## Data Models (Summary)

### GameSession
```
{
  "id": integer,
  "session_type": "direct" | "group",
  "group": GroupChat | null,
  "participants": User[],
  "current_turn_user": User | null,
  "turn_order": int[],
  "is_active": boolean,
  "created_at": ISO datetime,
  "updated_at": ISO datetime
}
```

### GameRound
```
{
  "id": integer,
  "session": integer,
  "question": Question,
  "picker": User,
  "picker_answer": string | null,
  "answers": GameTurn[],
  "is_completed": boolean,
  "created_at": ISO datetime
}
```

### GameTurn
```
{
  "id": integer,
  "round": integer,
  "player": User,
  "answer": string | null,
  "points_earned": integer,
  "answered_at": ISO datetime | null,
  "created_at": ISO datetime
}
```

### Question
```
{
  "id": integer,
  "category": string,
  "question_number": integer,
  "question_text": string,
  "points": integer,
  "consequence": string,
  "created_at": ISO datetime
}
```

---

## Game Flow Sequence
```
1. POST /game/create/
   → Create session, assign current_turn_user

2. POST /game/random-question/
   → Current-turn player selects category, backend creates round

3. POST /game/answer/ (all players)
   → Each player submits an answer
   → When all answered, points are calculated and turn advances

4. GET /game/{session_id}/
   → Fetch updated rounds and scores

5. Repeat steps 2-4 until finished
```
