# Turn-Based Multiplayer - Quick Start

## Prerequisites
1. Backend running on `http://localhost:8000`
2. At least 2 user accounts
3. Users are connected as friends (or share a group)

---

## Start the Backend
```bash
cd api
python3 manage.py runserver
```

## Start the Frontend
```bash
cd my-app
npx expo start
```

---

## Turn-Based Flow (High Level)

1. **Create session** (`POST /quiz/game/create/`)
2. **Current-turn player picks category** (`POST /quiz/game/random-question/`)
3. **All players submit answers** (`POST /quiz/game/answer/`)
4. **Backend scores + advances turn** (automatic)
5. **Fetch updated session** (`GET /quiz/game/{session_id}/`)

There is **no manual "next round" endpoint**. Turn rotation happens when all players submit answers.

---

## Curl Examples

### Create Session (direct)
```bash
curl -X POST http://localhost:8000/quiz/game/create/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"session_type": "direct", "participant_ids": [2]}'
```

### Create Session (group)
```bash
curl -X POST http://localhost:8000/quiz/game/create/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"session_type": "group", "group_id": 12}'
```

### Pick Category (current turn)
```bash
curl -X POST http://localhost:8000/quiz/game/random-question/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"session_id": 9, "category": "spiritual_knowing"}'
```

### Submit Answer
```bash
curl -X POST http://localhost:8000/quiz/game/answer/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"round_id": 2, "answer": "My answer"}'
```

### Session Detail
```bash
curl -X GET http://localhost:8000/quiz/game/9/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Common Issues

**"Not your turn"**
- Only the current turn user can call `/quiz/game/random-question/`.

**"No more questions in this category"**
- Choose a different category for the session.

**"Not a participant"**
- Ensure the user is included in the session's participants list.
