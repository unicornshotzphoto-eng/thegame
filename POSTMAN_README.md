# Postman Setup

This repo includes a Postman collection and environment for the resolved backend API.

## Files
- `postman_collection.json` — Collection with requests grouped by feature
- `postman_environment.json` — Environment variables for local use

## Import
1. Open Postman.
2. Click **Import**.
3. Select both files:
   - `postman_collection.json`
   - `postman_environment.json`

## Configure
1. Select environment **TheGame Local**.
2. Set variables as needed:
   - `base_url` (default: `http://localhost:8000`)
   - `token` (set after sign-in)
   - `group_id`, `calendar_id`, `event_id`, `question_id`, `session_id`, `round_id`

## Typical Flow
1. **Auth → Sign In**
2. Copy the `access` token.
3. Paste into the environment variable `token`.
4. Run other requests.

## Notes
- Authenticated endpoints require `Authorization: Bearer {{token}}`.
- Some requests need IDs; use earlier responses to populate the environment variables.

