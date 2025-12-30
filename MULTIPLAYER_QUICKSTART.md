# Multiplayer Quiz Game - Quick Start Guide

## Prerequisites

1. Django backend running on `http://localhost:8000`
2. At least 2 user accounts (for testing multiplayer)
3. Friend connections established between accounts
4. React Native/Expo app running

## Starting the Backend

```powershell
# Windows PowerShell
cd c:\Users\unico\thegame
.\thegame\Scripts\Activate.ps1
cd api
python manage.py runserver
```

Server runs on `http://localhost:8000`

## Starting the Frontend

```bash
cd c:\Users\unico\thegame\my-app
expo start
# Press 'i' for iOS or 'a' for Android
```

## Testing Multiplayer Game

### Step 1: Create Test Users (if needed)

Sign up two or more users in the app:
1. First user: `player1` / `test@test.com` / `password123`
2. Second user: `player2` / `test2@test.com` / `password123`
3. Third user (optional): `player3` / `test3@test.com` / `password123`

### Step 2: Establish Friendships

As Player 1:
1. Go to Profile/Friends
2. Search for Player 2
3. Send friend request

As Player 2:
1. Accept friend request from Player 1

Repeat with Player 3 if testing 3+ player games

### Step 3: Start Multiplayer Game

As Player 1:
1. Go to Explore tab → Quiz Game
2. Tap "👥 Play with Friends" button
3. Select Player 2 and Player 3 (if available)
4. Tap "Create Game"
5. Player 1 should now see the Lobby screen

### Step 4: Player 1 Picks a Category

In the Lobby screen:
1. See game players and scores (all at 0)
2. Player 1 is marked as "Picking"
3. Tap a category (e.g., "Spiritual")
4. Question loads

### Step 5: All Players Answer

Each player:
1. Types their answer to the question
2. Taps "Submit Answer"
3. Sees the answer confirmation

### Step 6: View Answer Comparison

After all players submit:
1. Screen shows "All Answers"
2. See each player's answer
3. Player 1 (category picker) is marked with "Category Picker" label
4. Taps "Next Round" to continue

### Step 7: Turn Rotation

Next round:
- Player 2 is now marked as "Picking"
- Player 2 selects category
- All players answer again
- And so on...

### Step 8: Game Completion

After 3 rounds per player (9 rounds total for 3 players):
1. Game automatically ends
2. Final leaderboard shows
3. Rankings based on total points earned
4. Tap "Play Again" to start new game

## Keyboard Commands (API Testing)

### Test Create Game (curl)

```bash
curl -X POST http://localhost:8000/api/games/create/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"friend_ids": [2, 3]}'
```

### Test Get Games

```bash
curl -X GET http://localhost:8000/api/games/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Start Round

```bash
curl -X POST http://localhost:8000/api/games/1/start-round/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"category": "spiritual"}'
```

### Test Submit Answer

```bash
curl -X POST http://localhost:8000/api/games/1/submit-answer/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"answer": "This is my answer"}'
```

## Common Issues & Troubleshooting

### Issue: "No friends found" error
**Solution**: Make sure friends are added and friendship is accepted on both sides

### Issue: Game won't start
**Solution**: 
- Check backend is running: `curl http://localhost:8000/api/games/`
- Verify user authentication token is valid
- Check console for API errors

### Issue: Can't submit answer
**Solution**:
- Make sure question is loaded (current_question not null)
- Answer text must not be empty
- Check network connection

### Issue: Turn doesn't rotate
**Solution**:
- Only game creator can call next-round endpoint
- Wait for all players to submit answers first
- Check game status is 'in_progress'

### Issue: Scores not calculating
**Solution**:
- Points are awarded automatically for answered questions
- Each question in a category has fixed points (1-3)
- Final score = sum of all points earned

## Debug Mode

### View API Logs

Monitor backend requests:
```bash
# In Django terminal, you'll see:
[timestamp] "POST /api/games/create/ HTTP/1.1" 201 Created
[timestamp] "POST /api/games/1/start-round/ HTTP/1.1" 200 OK
```

### View Frontend Logs

In Expo terminal:
- Errors in red
- Warnings in yellow
- API responses logged with `console.log`

### Database Query

Check games in SQLite:

```bash
# Terminal in api directory
python manage.py shell
>>> from quiz.models import GameSession, PlayerAnswer
>>> GameSession.objects.all()
>>> PlayerAnswer.objects.filter(game_session=1)
```

## Performance Testing

### Simulate Multiple Players (Single Device)

1. Open Expo Go app
2. Create new terminal instances
3. Run additional Expo clients
4. Switch between tabs using iOS switcher
5. Simulate different players joining same game

### Load Testing

Test with many players:
1. Modify `max_rounds = 10` in `NextRoundView`
2. Have many players join
3. Monitor Django console for timing
4. Check database response time

## Success Checklist

- [ ] Two users can create a multiplayer game
- [ ] Friend selection works properly
- [ ] Category picker can select category
- [ ] Question displays with correct points
- [ ] All players can submit text answers
- [ ] Answer comparison shows all responses
- [ ] Category picker is highlighted
- [ ] Turn rotates to next player
- [ ] Scores increment correctly
- [ ] Game ends after max rounds
- [ ] Final leaderboard displays
- [ ] Can play again without errors

## Next Steps

After successful testing:

1. **Implement Real-time Updates** (WebSocket)
   - Live answer arrival notifications
   - Automatic screen refresh

2. **Add Scoring Options**
   - Time-based scoring
   - Community voting on answers
   - Bonus points for creativity

3. **Mobile Optimization**
   - Offline game state caching
   - Push notifications for turn changes
   - Network error recovery

4. **Production Deployment**
   - Use production database
   - Set up CORS for mobile domain
   - Configure environment variables
   - SSL certificate for HTTPS

## Files to Reference

- Backend models: `api/quiz/models.py` (GameSession, PlayerAnswer)
- API views: `api/quiz/views.py` (8 multiplayer views)
- Frontend screen: `my-app/app/src/screens/MultiplayerQuestions.jsx`
- Main quiz screen: `my-app/app/src/screens/Questions.jsx`
