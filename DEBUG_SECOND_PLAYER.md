# Debug: Second Player Answer Not Detected

## Current Symptom
- Creator (Alice) answers: ✓ Shows in list as "1/2 answered"  
- Second Player (Bob) answers: But still shows "1/2 answered" (Bob's answer not registered)

## Root Cause Investigation

### Hypothesis: Bob's answer is NOT reaching the backend
Evidence:
- Backend logs show NO `[DEBUG SubmitAnswerView]` message when Bob submits
- Only 1 answer is in database, not 2
- If Bob was submitting, we'd see debug logs

### What Could Be Wrong:
1. **Bob is on a different game session** - SessionID mismatch
2. **Bob's authentication token expired** - Can't POST to backend
3. **API call is failing silently** - Frontend doesn't show error
4. **Network issue** - Request never reaches backend
5. **Frontend bug** - Submit button not actually calling the function

## How to Diagnose

### For Bob (Second Player):
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to submit an answer
4. Look for:
   - `=== SUBMITTING ANSWER ===` message
   - Any error messages in red
   - Network error?

### For Backend (Django):
1. Watch terminal where `python manage.py runserver` is running
2. Look for `[DEBUG SubmitAnswerView]` when Bob submits
3. If you see it:
   - Check the answer was saved
   - Check `Round metrics: X/Y` count
4. If you DON'T see it:
   - Bob's request never reached this endpoint
   - Check if there's a different error endpoint getting hit

### Check Network Traffic:
1. In browser DevTools, go to Network tab
2. Filter for: `submit-answer`
3. When Bob submits:
   - Should see POST request to `/quiz/games/56/submit-answer/`
   - Check Status code (should be 200)
   - Check Response body for errors

## Quick Fix to Try:

If this is a token/auth issue:
1. Have Bob log out and log back in
2. Then try submitting answer again

If this is a session mismatch:
1. Check that Bob joined with the same game code
2. Verify both are in `session.players` list

## What the Logs Should Show

### When Bob successfully submits:
**Frontend Console:**
```
=== SUBMITTING ANSWER ===
Answer Text: "Bob's answer"
Session ID: 56
Current User: bob ID: 2
=== ANSWER SUBMISSION RESPONSE ===
Status: 200
Response: {
  "message": "Answer submitted",
  "points_earned": 1,
  "answered_count": 2,  ← should go from 1 to 2
  "total_players": 2,
  "round_completed": false
}
✓ Answer submitted successfully
```

**Backend Console:**
```
[DEBUG SubmitAnswerView] Request received from bob
[DEBUG] Game ID: 56
[DEBUG] Request data: {'answer': "Bob's answer"}
[DEBUG] Game found: ID=56, Current question: Which challenge...
[DEBUG] SubmitAnswer: Player bob submitting answer 'Bob's answer' to Q30
[DEBUG] PlayerAnswer object: ID=<new_id>, Created=True
[DEBUG] Round metrics: 2/2 answered
[DEBUG] Round completed: True
```

## Next Steps:
1. Get console output from Bob's browser
2. Check backend terminal for debug logs
3. Check Network tab to confirm POST request was sent
4. Report back with findings

