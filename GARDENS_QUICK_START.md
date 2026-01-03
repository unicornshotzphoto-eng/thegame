# Virtual Garden Feature - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Django backend running
- React Native app ready
- Two test users created

## Backend Quick Setup

```bash
# 1. Navigate to backend
cd C:\Users\unico\thegame\api

# 2. Create test users
python manage.py shell << EOF
from quiz.models import User
User.objects.create_user('alice', password='alice123')
User.objects.create_user('bob', password='bob123')
print('✓ Users created')
EOF

# 3. Get auth tokens (via API or manually)
# POST http://localhost:8000/token/
# { "username": "alice", "password": "alice123" }
# Save the token

# 4. Start server
python manage.py runserver
# Server runs at http://127.0.0.1:8000/
```

## Testing Gardens API

### 1. Get Plants List
```bash
curl http://127.0.0.1:8000/gardens/plants/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Create Garden (Alice invites Bob)
```bash
curl -X POST http://127.0.0.1:8000/gardens/ \
  -H "Authorization: Bearer ALICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_b_id": 2,
    "plant_id": "sunflower",
    "invitation_message": "Let'\''s grow!"
  }'
# Save the garden ID from response
```

### 3. Accept Invitation (Bob)
```bash
curl -X PATCH http://127.0.0.1:8000/gardens/GARDEN_ID/accept/ \
  -H "Authorization: Bearer BOB_TOKEN"
```

### 4. Plant Together
```bash
# Alice plants
curl -X POST http://127.0.0.1:8000/gardens/GARDEN_ID/plant/ \
  -H "Authorization: Bearer ALICE_TOKEN"

# Bob plants
curl -X POST http://127.0.0.1:8000/gardens/GARDEN_ID/plant/ \
  -H "Authorization: Bearer BOB_TOKEN"
```

### 5. Water Plant
```bash
curl -X POST http://127.0.0.1:8000/gardens/GARDEN_ID/water/ \
  -H "Authorization: Bearer ALICE_TOKEN"
```

### 6. Check Progress
```bash
curl http://127.0.0.1:8000/gardens/GARDEN_ID/ \
  -H "Authorization: Bearer ALICE_TOKEN"
```

## Frontend Quick Start

### 1. Open App
```bash
cd C:\Users\unico\thegame\my-app
npm start
# or
expo start
```

### 2. Login
- Use alice/alice123

### 3. Navigate to Gardens
- Tap menu (☰)
- Select Gardens (🌱)

### 4. Create Garden
- Tap "+ New Garden"
- Select "Sunflower" plant
- Enter Bob's friend ID or username
- Send invitation

### 5. Accept (Bob's Phone/Simulator)
- Login as Bob
- Go to Gardens
- See pending invitation
- Tap "Accept"

### 6. Plant Together
- Both tap "Plant" button
- Growth starts

### 7. Water & Watch Grow
- Tap garden to see details
- Tap "Water Plant"
- Growth increases!

## 📊 Expected Behavior

### Sunflower (7 days, 14% per day)
```
Initial: 0%
After 1 water: 14%
After 2 waters: 28%
After 3 waters: 42%
After 4 waters: 56%
After 5 waters: 70%
After 6 waters: 84%
After 7 waters: 98%
After 8 waters: 100% → BLOOM! 🎉
```

### Streak Counter
- Both users water same day → +1 streak
- One or neither water → streak resets
- Max streak in 7 days: 7 days

### Health Status
- Just watered: 🟢 Thriving
- 1-2 days ago: 🟢 Healthy
- 3-4 days ago: 🟡 Declining
- 5-6 days ago: 🟠 Wilting
- 7+ days: 🔴 Dead (abandoned)

## 🔍 Debugging

### Check Garden Status
```bash
python manage.py shell
>>> from gardens.models import SharedGarden, GrowthState
>>> g = SharedGarden.objects.last()
>>> print(f"Status: {g.status}")
>>> print(f"Growth: {g.growth_state.growth_percentage}%")
>>> print(f"Stage: {g.growth_state.current_stage}/5")
>>> print(f"Streak: {g.growth_state.current_streak_days} days")
```

### View Care History
```bash
>>> from gardens.models import CareAction
>>> for a in g.care_actions.all():
...     print(f"{a.user.username} watered at {a.timestamp}")
```

### Force Bloom (Testing)
```bash
>>> g.growth_state.growth_percentage = 100
>>> g.growth_state.is_bloomed = True
>>> g.growth_state.save()
>>> g.status = 'bloomed'
>>> g.save()
```

## 🎯 Common Tasks

### Create Multiple Gardens
```bash
# Run script to create test data
python manage.py shell << EOF
from quiz.models import User
from gardens.models import SharedGarden, Plant

alice = User.objects.get(username='alice')
bob = User.objects.get(username='bob')
sunflower = Plant.objects.get(id='sunflower')

for i in range(3):
    SharedGarden.objects.create(
        user_a=alice,
        user_b=bob,
        plant=sunflower,
        status='active'
    )
print('✓ Created 3 test gardens')
EOF
```

### Reset Gardens (Testing)
```bash
python manage.py shell << EOF
from gardens.models import SharedGarden, CareAction, GrowthState

# Delete all
GrowthState.objects.all().delete()
CareAction.objects.all().delete()
SharedGarden.objects.all().delete()
print('✓ Reset all gardens')
EOF
```

### View API Docs
```bash
# Visit in browser:
http://127.0.0.1:8000/gardens/plants/
# Returns JSON list of plants
```

## 💡 Pro Tips

1. **Multiple Devices Testing**
   - Use two browsers or phone + tablet
   - Login as different users
   - See real-time updates

2. **Simulate Time Passing**
   - Manually update `growth_updated_at` in database
   - Test different growth stages
   - Test health status transitions

3. **Test Edge Cases**
   - User invites self → Should fail
   - Try water before planting → Should fail
   - Try accept twice → Should fail
   - Test with invalid IDs → Should 404

4. **Monitor API Calls**
   - Use browser DevTools Network tab
   - Check request/response payloads
   - Verify status codes (200, 201, 400, 404)

5. **Database Inspection**
   - Use Django admin at /admin/
   - Edit models directly for testing
   - View relationships between models

## 🛠️ Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Port 8000 in use | Use `python manage.py runserver 8001` |
| No plants showing | Run `python manage.py create_plants` |
| Garden not created | Check both user IDs exist |
| Water not working | Ensure garden is in 'active' status |
| Token invalid | Get fresh token from /token/ endpoint |
| Growth not updating | Restart backend, check response |

## 📱 Expected API Responses

### Water Action Success
```json
{
  "id": "uuid",
  "growth_percentage": 23.5,
  "current_stage": 2,
  "current_streak_days": 1,
  "health_status": "thriving",
  "is_bloomed": false,
  "bloom_type": "pending",
  "care_action": {
    "id": "uuid",
    "action_type": "water",
    "points_earned": 10,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Garden List
```json
[
  {
    "id": "uuid",
    "user_a_username": "alice",
    "user_b_username": "bob",
    "plant_id": "sunflower",
    "status": "active",
    "growth_state": {
      "growth_percentage": 45.2,
      "current_stage": 3,
      "current_streak_days": 5
    }
  }
]
```

## 🎓 Learning Path

1. **Understand Models** → Read `api/gardens/models.py`
2. **See Services** → Read `api/gardens/services.py`
3. **Check Views** → Read `api/gardens/views.py`
4. **Test API** → Use curl/Postman commands above
5. **Use Frontend** → Navigate in React Native app
6. **Extend** → Add features to enhance

## 📚 Documentation Files

- `GARDENS_FINAL_SUMMARY.md` - Feature overview
- `GARDENS_IMPLEMENTATION_GUIDE.md` - Detailed guide
- `GARDENS_API_TESTING.md` - API testing guide
- `GARDENS_IMPLEMENTATION_STATUS.md` - Implementation status

## ✅ Verification Checklist

After setup, verify:
- [ ] Backend running on :8000
- [ ] Tokens obtainable
- [ ] Plants list visible
- [ ] Can create garden
- [ ] Can accept garden
- [ ] Can plant
- [ ] Can water
- [ ] Growth increases
- [ ] Streak counts up
- [ ] Frontend shows updates
- [ ] Bloom works
- [ ] History logs actions

## 🎉 You're Ready!

The feature is fully implemented and ready to test. Start with the quick commands above and explore!

---

**Last Updated**: 2024
**Status**: ✅ Ready for Testing
**Support**: See documentation files

