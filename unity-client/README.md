# Unity Client Scaffold

This folder contains a lightweight Unity client scaffold that mirrors the
existing mobile app API usage while keeping the Django backend unchanged.
It is not a full Unity project. Copy the scripts into a Unity project and
wire up scenes and UI as needed.

## Quick start
1. Create a new Unity project (3D Core).
2. Copy `unity-client/Assets/Scripts` into your project's `Assets/Scripts`.
3. Create scenes: Loading, Login, Lobby, Gameplay.
4. In the Loading scene, add an empty GameObject and attach:
   - `AppBootstrap`
   - `SceneRouter`
5. Update the base URL in `Core/GameConfig.cs`.

## API parity (from the current mobile app)
Auth:
- quiz/signin/
- quiz/signup/

Quiz and single-player:
- quiz/questions/categories/
- quiz/questions/{category}/
- quiz/questions/?category={category}
- quiz/questions/answer/
- quiz/game/create/
- quiz/game/active/
- quiz/game/{sessionId}/
- quiz/game/random-question/
- quiz/game/answer/
- quiz/game/{sessionId}/delete/

Friends and social:
- quiz/friends/
- quiz/friends/requests/
- quiz/friends/request/send/
- quiz/friends/request/{requestId}/respond/
- quiz/search/users/?q={query}
- quiz/groups/
- quiz/groups/create/
- quiz/groups/{groupId}/messages/

Calendar:
- quiz/calendars/
- quiz/calendars/{calendarId}/
- quiz/calendars/{calendarId}/events/
- quiz/calendars/{calendarId}/events/{eventId}/
- quiz/calendars/{calendarId}/invite/

Turn-based game flow (multiplayer):
- quiz/game/create/
- quiz/game/{sessionId}/
- quiz/game/random-question/
- quiz/game/answer/
- quiz/game/active/
- quiz/game/{sessionId}/delete/

## WebSockets
The mobile client uses Django Channels with endpoints like:
- ws/chat/{roomName}/
- ws/game/{gameId}/
- ws/notifications/

Unity does not ship a WebSocket client by default. Use a package like
NativeWebSocket or BestHTTP and mirror the endpoints above.

## Where to start
- `Core/GameConfig.cs`: base URL and timeouts
- `Networking/ApiClient.cs`: HTTP wrapper
- `Networking/*Service.cs`: endpoint groupings
- `State/AppState.cs`: auth and user state

## Contract test runner
There is a stub runner at `Assets/Scripts/Testing/ContractTestRunner.cs`.
Attach it to a GameObject in a test scene, fill in username/password,
and press Play to validate a small set of endpoints.

## Butterfly animation
Use `Assets/Scripts/FX/ButterflyFlight.cs` to animate a butterfly across the screen:
1. Create a butterfly GameObject (mesh or sprite) with optional wing child objects.
2. Add the `ButterflyFlight` component.
3. Assign `leftWing` and `rightWing` transforms to enable flapping.
4. Adjust `durationSeconds`, `waveAmplitude`, and `wingFlapSpeed` for feel.

