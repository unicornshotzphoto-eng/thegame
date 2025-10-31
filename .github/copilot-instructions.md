## Quick orientation

- Repo contains two main components:
  - Django backend: `thegamebackend/` (Django 5.2.7, Django REST Framework). Key apps: `authentication/`, `users/`.
  - Flutter frontend: `thegamefrontend/` (standard Flutter project layout under `thegamefrontend/`).

## How to run locally (Windows / PowerShell)

1. Activate Python virtualenv located at the repo root:

   .\thegame\Scripts\Activate.ps1

2. Backend (from the repo root or `thegamebackend/`):

   cd thegamebackend
   python manage.py migrate
   python manage.py runserver

3. Frontend (from `thegamefrontend/`):

   cd thegamefrontend
   flutter pub get
   flutter run   # or `flutter build <platform>` as needed

## Key files & patterns to reference

- Backend settings: `thegamebackend/thegamebackend/settings.py` — uses SQLite at `BASE_DIR / 'db.sqlite3'`.
- Django apps: `thegamebackend/authentication/` and `thegamebackend/users/`.
- Main entry: `thegamebackend/manage.py` and `thegamebackend/thegamebackend/urls.py`.
- Database artifact: `thegamebackend/db.sqlite3` (committed in repo root of backend).

## Project-specific conventions and gotchas

- Virtualenv lives in `thegame/` (not a top-level `venv` or `env`). Always activate `thegame\Scripts\Activate.ps1` on Windows before running management commands.
- The backend uses Django + DRF, so prefer `python manage.py` commands for migrations, tests and running the API.
- The codebase contains a non-standard filename typo: `authentication/serilizers.py` (misspelled). When searching for serializers or authentication code, include the misspelling as a possible match.
- Some small bugs / discoverable issues exist in the code (example in `authentication/serilizers.py`: duplicate `password` in `Meta.fields` and `validate` references bare names instead of string keys). Only change behavior after running tests and confirming intent.

## Useful quick examples for editing or generating code

- Add a new API view: put views in `thegamebackend/authentication/views.py` (or app-specific `views.py`), register route in `thegamebackend/thegamebackend/urls.py` or include the app's `urls.py`.
- When creating serializers, check existing pattern in `authentication/serilizers.py` (note the misspelling) and use DRF's `serializers.ModelSerializer` with `extra_kwargs = {'password': {'write_only': True}}` for password fields.

## Integration points

- Backend REST API (Django REST Framework) is the primary integration surface for the Flutter frontend.
- No external API keys or cloud deployments are present in the repository; secrets (if any) live outside this repo — don't attempt to infer secrets from the code.

## Tests, linting and verification

- Run backend tests with:

  cd thegamebackend
  python manage.py test

- There is no central `requirements.txt` or lockfile in the repo root; rely on the Python virtualenv in `thegame/` or inspect `thegame/Lib/site-packages/`.

## When in doubt

- Search for app folders `authentication` and `users` for auth-related logic.
- If code references a name that can't be found, check for typos (e.g., `serilizers.py`).

---

If any of these notes are incomplete or you'd like the instructions to include CI commands, build badges, or stricter editing rules (tests required for PRs, preferred branch), tell me which areas to expand and I will iterate.
