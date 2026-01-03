# Gardens API - Quick Testing Guide

## Prerequisites

Before testing, ensure:
1. Virtual environment is activated
2. Django server is running: `python manage.py runserver`
3. Two test users exist in the database

## Creating Test Users (if needed)

```bash
python manage.py shell
>>> from quiz.models import User
>>> user_a = User.objects.create_user(username='alice', password='test123')
>>> user_b = User.objects.create_user(username='bob', password='test123')
```

## Get JWT Tokens

First, authenticate to get tokens:

```bash
# Get token for alice
curl -X POST http://127.0.0.1:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"test123"}'

# Response will include "access" token - copy it
# Same for bob
```

Store tokens as environment variables:
```bash
export TOKEN_ALICE="your_token_here"
export TOKEN_BOB="your_token_here"
```

## API Endpoints

### 1. Get Available Plants

```bash
curl -X GET http://127.0.0.1:8000/gardens/plants/ \
  -H "Authorization: Bearer $TOKEN_ALICE"
```

Expected response:
```json
[
  {
    "id": "sunflower",
    "name": "Sunflower",
    "emoji": "🌻",
    "description": "A bright yellow sunflower...",
    "duration_days": 7,
    "base_growth_rate": 0.14,
    "difficulty": "easy"
  },
  ...
]
```

### 2. Create Garden Invitation

Alice invites Bob to grow a sunflower together:

```bash
curl -X POST http://127.0.0.1:8000/gardens/ \
  -H "Authorization: Bearer $TOKEN_ALICE" \
  -H "Content-Type: application/json" \
  -d '{
    "user_b_id": 2,
    "plant_id": "sunflower",
    "invitation_message": "Let'\''s grow a beautiful sunflower together!"
  }'
```

Response will include the garden ID. Copy it.

### 3. List User's Gardens

```bash
curl -X GET http://127.0.0.1:8000/gardens/ \
  -H "Authorization: Bearer $TOKEN_ALICE"
```

Expected: List of gardens (should show as 'pending')

### 4. Accept Invitation

Bob accepts the invitation:

```bash
curl -X PATCH http://127.0.0.1:8000/gardens/{garden_id}/accept/ \
  -H "Authorization: Bearer $TOKEN_BOB" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Status should change to 'active'

### 5. Plant Seeds Together

Both users confirm they're ready to plant:

```bash
# Alice plants
curl -X POST http://127.0.0.1:8000/gardens/{garden_id}/plant/ \
  -H "Authorization: Bearer $TOKEN_ALICE" \
  -H "Content-Type: application/json" \
  -d '{}'

# Bob plants
curl -X POST http://127.0.0.1:8000/gardens/{garden_id}/plant/ \
  -H "Authorization: Bearer $TOKEN_BOB" \
  -H "Content-Type: application/json" \
  -d '{}'
```

After both plant, GrowthState should be created

### 6. Water the Plant

```bash
curl -X POST http://127.0.0.1:8000/gardens/{garden_id}/water/ \
  -H "Authorization: Bearer $TOKEN_ALICE" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Response will show:
- Updated growth percentage
- Current stage
- Points earned
- Health status update

### 7. Get Garden Details

```bash
curl -X GET http://127.0.0.1:8000/gardens/{garden_id}/ \
  -H "Authorization: Bearer $TOKEN_ALICE"
```

Shows full garden state including:
- Growth progress
- Streak counter
- Care history
- Health status
- Bloom information

### 8. Get Care History

```bash
curl -X GET http://127.0.0.1:8000/gardens/{garden_id}/history/ \
  -H "Authorization: Bearer $TOKEN_ALICE"
```

Shows all care actions with timestamps and points earned

## Testing Watering Sequence

For a 7-day sunflower (14% per day):

```
Day 0: 0%
After 1 water: 5-14% (base + boost)
Day 1: Continue watering
Day 7: Should reach 100% and bloom
```

To simulate multiple days, update the `creation_date` or `growth_updated_at` in the database directly or use a management command.

## Error Responses

### 400 Bad Request
- Invalid user IDs or plant IDs
- Missing required fields
- Trying to create duplicate active gardens

### 403 Forbidden
- User attempting action on garden they don't own
- Trying to accept invitation twice
- Wrong user trying to perform action

### 404 Not Found
- Garden ID doesn't exist
- Plant ID not found

## Debugging

### View all gardens in database
```bash
python manage.py shell
>>> from gardens.models import SharedGarden
>>> for g in SharedGarden.objects.all():
...     print(f"{g.user_a.username} + {g.user_b.username}: {g.status}")
```

### View plant growth
```bash
>>> from gardens.models import GrowthState
>>> growth = GrowthState.objects.first()
>>> print(f"Stage: {growth.current_stage}, Progress: {growth.growth_percentage}%")
```

### View care actions
```bash
>>> from gardens.models import CareAction
>>> for action in CareAction.objects.all()[:5]:
...     print(f"{action.user.username} watered on {action.timestamp}")
```

## Success Criteria

✅ Create garden invitation (pending)
✅ Accept invitation (active)
✅ Both users plant (creates GrowthState)
✅ Water updates growth percentage
✅ Streak counter increments
✅ Health status reflects care
✅ Bloom triggered at 100%

## Common Issues

**Issue**: "Couldn't import Django"
- Solution: Activate virtual environment: `. ./venv/bin/activate` (Linux/Mac) or `venv\Scripts\activate.bat` (Windows)

**Issue**: "Port 8000 already in use"
- Solution: Use different port: `python manage.py runserver 8001`

**Issue**: "User not found" when creating garden
- Solution: Verify user_b_id exists: `python manage.py shell` then `User.objects.all()`

**Issue**: "Permission denied" on water action
- Solution: Make sure you're using the correct token for the user

