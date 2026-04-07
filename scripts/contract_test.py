#!/usr/bin/env python3
"""
Lightweight API contract test runner.

Usage:
  BASE_URL=http://localhost:8000 \
  USERNAME=your_user PASSWORD=your_pass \
  python3 scripts/contract_test.py

Notes:
- If USERNAME/PASSWORD are provided, the script signs in and uses the access token.
- Alternatively, set TOKEN to bypass sign-in.
- Some tests require IDs; set env vars like GROUP_ID, CALENDAR_ID, SESSION_ID, ROUND_ID, etc.
- QUESTION_CATEGORY / QUESTION_CATEGORY_MAIN override default category codes.
"""

import json
import os
import sys
import urllib.error
import urllib.request


def request_json(method, url, headers=None, payload=None, timeout=10):
    headers = headers or {}
    data = None
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            body = resp.read().decode("utf-8")
            return resp.status, body, resp.headers.get("Content-Type")
    except urllib.error.HTTPError as err:
        body = err.read().decode("utf-8", errors="replace")
        return err.code, body, err.headers.get("Content-Type")
    except urllib.error.URLError as err:
        return None, str(err), None


def parse_json(body):
    try:
        return json.loads(body)
    except Exception:
        return None


def validate_payload(data, expect):
    if expect is None:
        return True, ""
    if expect.get("type") == "object":
        if not isinstance(data, dict):
            return False, "Expected object response"
        missing = [k for k in expect.get("keys", []) if k not in data]
        if missing:
            return False, f"Missing keys: {', '.join(missing)}"
    if expect.get("type") == "array":
        if not isinstance(data, list):
            return False, "Expected array response"
        item_keys = expect.get("item_keys", [])
        if item_keys and data:
            first = data[0]
            if isinstance(first, dict):
                missing = [k for k in item_keys if k not in first]
                if missing:
                    return False, f"Missing item keys: {', '.join(missing)}"
    return True, ""


def build_base_url():
    base = os.getenv("BASE_URL", "http://localhost:8000").rstrip("/")
    return base


def run_tests():
    base_url = build_base_url()
    timeout = int(os.getenv("REQUEST_TIMEOUT", "10"))

    username = os.getenv("USERNAME")
    password = os.getenv("PASSWORD")
    token = os.getenv("TOKEN")

    # Optional IDs
    env_values = {
        "group_id": os.getenv("GROUP_ID"),
        "calendar_id": os.getenv("CALENDAR_ID"),
        "event_id": os.getenv("EVENT_ID"),
        "question_id": os.getenv("QUESTION_ID"),
        "session_id": os.getenv("SESSION_ID"),
        "round_id": os.getenv("ROUND_ID"),
    }

    if not token and username and password:
        status, body, _ = request_json(
            "POST",
            f"{base_url}/quiz/signin/",
            payload={"username": username, "password": password},
            timeout=timeout,
        )
        if status and 200 <= status < 300:
            data = parse_json(body) or {}
            token = data.get("access") or data.get("token")
            print("[PASS] Sign in")
        else:
            print(f"[FAIL] Sign in: {status} {body}")
            return 1
    elif token:
        print("[INFO] Using TOKEN from environment")
    else:
        print("[WARN] No auth provided. Authenticated tests will be skipped.")

    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    tests = [
        {
            "name": "Search users",
            "method": "GET",
            "path": "/quiz/search/users/?q=test",
            "expect": {"type": "object", "keys": ["users"]},
            "auth": True,
        },
        {
            "name": "Friends list",
            "method": "GET",
            "path": "/quiz/friends/",
            "expect": {"type": "object", "keys": ["friends"]},
            "auth": True,
        },
        {
            "name": "Pending friend requests",
            "method": "GET",
            "path": "/quiz/friends/requests/",
            "expect": {"type": "object", "keys": ["received", "sent"]},
            "auth": True,
        },
        {
            "name": "Groups list",
            "method": "GET",
            "path": "/quiz/groups/",
            "expect": {"type": "object", "keys": ["groups"]},
            "auth": True,
        },
        {
            "name": "Question categories",
            "method": "GET",
            "path": "/quiz/questions/categories/",
            "expect": {"type": "object", "keys": ["categories"]},
            "auth": False,
        },
        {
            "name": "Random question",
            "method": "GET",
            "path": "/quiz/questions/random/",
            "expect": {"type": "object", "keys": ["id", "question_text"]},
            "auth": False,
        },
        {
            "name": "Questions by category",
            "method": "GET",
            "path": "/quiz/questions/{category}/",
            "expect": {"type": "array", "item_keys": ["id", "question_text", "question_number"]},
            "auth": False,
            "template": {"category": os.getenv("QUESTION_CATEGORY", "spiritual_knowing")},
        },
        {
            "name": "Questions list (with category)",
            "method": "GET",
            "path": "/quiz/questions/?category={category}",
            "expect": {"type": "object", "keys": ["questions"]},
            "auth": False,
            "template": {"category": os.getenv("QUESTION_CATEGORY_MAIN", "spiritual_knowing")},
        },
        {
            "name": "User responses",
            "method": "GET",
            "path": "/quiz/questions/responses/",
            "expect": {"type": "object", "keys": ["responses"]},
            "auth": True,
        },
        {
            "name": "Active sessions",
            "method": "GET",
            "path": "/quiz/game/active/",
            "expect": {"type": "object", "keys": ["sessions"]},
            "auth": True,
        },
        {
            "name": "Group messages",
            "method": "GET",
            "path": "/quiz/groups/{group_id}/messages/",
            "expect": {"type": "object", "keys": ["messages"]},
            "auth": True,
            "env": ["GROUP_ID"],
        },
        {
            "name": "Calendar detail",
            "method": "GET",
            "path": "/quiz/calendars/{calendar_id}/",
            "expect": {"type": "object", "keys": ["calendar"]},
            "auth": True,
            "env": ["CALENDAR_ID"],
        },
        {
            "name": "Calendar events",
            "method": "GET",
            "path": "/quiz/calendars/{calendar_id}/events/",
            "expect": {"type": "object", "keys": ["events"]},
            "auth": True,
            "env": ["CALENDAR_ID"],
        },
        {
            "name": "Question detail",
            "method": "GET",
            "path": "/quiz/questions/{question_id}/",
            "expect": {"type": "object", "keys": ["id", "question_text"]},
            "auth": True,
            "env": ["QUESTION_ID"],
        },
        {
            "name": "Game session detail",
            "method": "GET",
            "path": "/quiz/game/{session_id}/",
            "expect": {"type": "object", "keys": ["session"]},
            "auth": True,
            "env": ["SESSION_ID"],
        },
        {
            "name": "Random question (game round)",
            "method": "POST",
            "path": "/quiz/game/random-question/",
            "expect": {"type": "object", "keys": ["round"]},
            "auth": True,
            "payload": {
                "session_id": os.getenv("SESSION_ID"),
                "category": os.getenv("QUESTION_CATEGORY_MAIN", "spiritual_knowing"),
            },
            "env": ["SESSION_ID"],
        },
        {
            "name": "Submit game answer",
            "method": "POST",
            "path": "/quiz/game/answer/",
            "expect": {"type": "object", "keys": ["turn"]},
            "auth": True,
            "payload": {
                "round_id": os.getenv("ROUND_ID"),
                "answer": "Sample answer",
            },
            "env": ["ROUND_ID"],
        },
    ]

    passed = 0
    failed = 0
    skipped = 0

    for test in tests:
        if test.get("auth") and not token:
            skipped += 1
            print(f"[SKIP] {test['name']} (auth required)")
            continue
        required_env = test.get("env", [])
        if any(not os.getenv(var) for var in required_env):
            skipped += 1
            print(f"[SKIP] {test['name']} (missing {', '.join(required_env)})")
            continue

        template = test.get("template", {})
        path = test["path"]
        try:
            path = path.format(**template, **env_values)
        except KeyError:
            skipped += 1
            print(f"[SKIP] {test['name']} (missing template values)")
            continue

        url = f"{base_url}{path}"
        status, body, _ = request_json(
            test["method"],
            url,
            headers=headers if test.get("auth") else {},
            payload=test.get("payload"),
            timeout=timeout,
        )

        if status is None:
            failed += 1
            print(f"[FAIL] {test['name']} (connection error): {body}")
            continue

        data = parse_json(body)
        ok, reason = validate_payload(data, test.get("expect"))
        if status < 200 or status >= 300:
            failed += 1
            print(f"[FAIL] {test['name']} ({status}): {body}")
        elif not ok:
            failed += 1
            print(f"[FAIL] {test['name']} (invalid payload): {reason}")
        else:
            passed += 1
            print(f"[PASS] {test['name']}")

    print(f"\nSummary: {passed} passed, {failed} failed, {skipped} skipped")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(run_tests())

