# Turn-Based Multiplayer - Implementation Summary

## Overview
The backend implements a **turn-based quiz flow** under `/quiz/game/*`. The current-turn player selects a category, the backend creates a round, and all participants submit answers. When all players answer, points are calculated and the turn advances automatically.

---

## Backend Models

**GameSession**
- `session_type`: direct | group
- `participants`: users in the session
- `current_turn_user`: whose turn it is
- `turn_order`: list of user ids
- `is_active`: active flag

**GameRound**
- `session`: related session
- `question`: selected question
- `picker`: player who picked category
- `picker_answer`: saved for scoring
- `is_completed`: round completion flag

**GameTurn**
- `round`: round relation
- `player`: participant
- `answer`: submitted answer
- `points_earned`: scoring result
- `answered_at`: timestamp

---

## API Endpoints

```
POST /quiz/game/create/               # create session (direct/group)
GET  /quiz/game/{session_id}/         # session details + rounds + scores
POST /quiz/game/random-question/      # create round from category (current turn)
POST /quiz/game/answer/               # submit answer for round
GET  /quiz/game/active/               # active sessions
DELETE /quiz/game/{session_id}/delete/ # delete session
```

---

## Flow

1. **Create session** (`POST /quiz/game/create/`)
2. **Current-turn player picks category** (`POST /quiz/game/random-question/`)
3. **All players submit answers** (`POST /quiz/game/answer/`)
4. **Backend scores + advances turn** (automatic)
5. **Fetch updated state** (`GET /quiz/game/{session_id}/`)

---

## Frontend Notes

### Current Turn-Based Screen
`my-app/app/src/screens/GamePlay.jsx` already targets:
- `/quiz/game/{sessionId}/`
- `/quiz/game/random-question/`
- `/quiz/game/answer/`
- `/quiz/game/{sessionId}/delete/`

### Legacy Multiplayer Screen
`my-app/app/src/screens/MultiplayerQuestions.jsx` still calls `/api/games/*`.
If you intend to keep that screen, it should be updated to `/quiz/game/*`.

---

## Status

Backend endpoints are aligned with the turn-based flow and are documented in:
- `MULTIPLAYER_API.md`
