# WebSocket Implementation

The multiplayer game now supports **real-time WebSocket updates** for instant game state synchronization across all players.

## What Changed

1. **Backend**: Django Channels WebSocket consumer is now enabled via Daphne ASGI server
2. **Frontend**: WebSocket connections are automatically established and receive game updates in real-time
3. **Updates**: All game events (answers submitted, rounds completed, etc.) are broadcast instantly to all players

## Running the Server with WebSocket Support

### Option 1: Using the PowerShell Script (Recommended)

```powershell
cd C:\Users\unico\thegame
.\run_websocket_server.ps1
```

This will:
- Install Daphne if not already installed
- Start the server on `http://127.0.0.1:8000/`
- Enable WebSocket on `ws://127.0.0.1:8000/ws/game/{game_id}/`

### Option 2: Manual Command

```powershell
cd C:\Users\unico\thegame\api
# Activate virtualenv
.\..\..\thegame\Scripts\Activate.ps1

# Install Daphne (first time only)
pip install daphne

# Run Daphne server
python -m daphne -b 127.0.0.1 -p 8000 api.asgi:application
```

### Option 3: Use Django Runserver (Polling Only - Slower)

If you don't have Daphne, the app still works with polling every 3 seconds:

```powershell
cd C:\Users\unico\thegame\api
python manage.py runserver
```

## Game Flow with WebSocket

1. Players join a game via code
2. Creator picks a category → **instant broadcast to all players**
3. Question displays → **instant on all screens**
4. Players submit answers → **instant confirmation**
5. When all players answer → **"Advance" button enables instantly**
6. Creator advances round → **instant new question**

## Testing

**Always use two separate browsers/browser profiles:**
- Browser 1: alice
- Browser 2: bob (different profile or different browser)

Same browser = shared authentication = both players show as same user.

## Troubleshooting

If WebSocket shows "disconnected":
- Check backend console for `ws/game/` connection logs
- Make sure you're running Daphne (`python -m daphne`), not Django's `runserver`
- App will fall back to 3-second polling automatically
- Refresh the page to reconnect

## Performance

- **With WebSocket**: <100ms update latency, instant answer detection
- **With Polling**: ~3 second latency between updates
- Both work fully, WebSocket just gives a better UX
