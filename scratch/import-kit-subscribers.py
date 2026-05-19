#!/usr/bin/env python3
"""Import all 322 Kit subscribers into Plunk Next as contacts.

For each Kit subscriber:
  email_address → Plunk email
  first_name    → data.firstName
  fields.vokativ → data.vokativ
  fields.last_name → data.lastName
  state=active → subscribed=true
  state=cancelled/bounced/complained → subscribed=false

Uses POST /contacts which upserts by email. Idempotent.
Persists progress in state file so reruns skip already-imported.
"""
from __future__ import annotations
import json, os, sys, time, urllib.request, urllib.error
from pathlib import Path

PLUNK_API = "https://next-api.useplunk.com"
PLUNK_KEY = os.environ.get("PLUNK_SECRET_KEY") or sys.exit("Missing PLUNK_SECRET_KEY")
KIT_KEY = os.environ.get("KIT_API_KEY") or sys.exit("Missing KIT_API_KEY")
KIT_API = "https://api.kit.com"

HERE = Path(__file__).parent
STATE_FILE = HERE / "import-kit-subscribers.state.json"
INACTIVE_STATES = {"cancelled", "bounced", "complained"}


def plunk(method: str, path: str, body=None) -> dict:
    req = urllib.request.Request(f"{PLUNK_API}{path}", method=method,
        headers={"Authorization": f"Bearer {PLUNK_KEY}", "Content-Type": "application/json"},
        data=json.dumps(body).encode() if body else None)
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"{method} {path} → {e.code}: {e.read().decode()}")


def kit_get(path: str) -> dict:
    req = urllib.request.Request(f"{KIT_API}{path}",
        headers={"X-Kit-Api-Key": KIT_KEY})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())


def fetch_subscribers(status: str):
    cursor = None
    while True:
        path = f"/v4/subscribers?status={status}&per_page=100"
        if cursor:
            path += f"&after={cursor}"
        data = kit_get(path)
        for sub in data.get("subscribers", []):
            yield sub
        pg = data.get("pagination", {})
        if not pg.get("has_next_page"):
            break
        cursor = pg["end_cursor"]


def main():
    state = json.loads(STATE_FILE.read_text()) if STATE_FILE.exists() else {"imported": {}, "failed": {}}
    print(f"Resuming: {len(state['imported'])} already imported, {len(state['failed'])} failed last time")
    print(f"Fetching from Kit …")

    statuses = ["active", "cancelled", "bounced", "complained"]
    total, ok, skip, fail = 0, 0, 0, 0

    for status in statuses:
        subscribed = status not in INACTIVE_STATES
        for sub in fetch_subscribers(status):
            total += 1
            email = sub["email_address"].lower().strip()
            if email in state["imported"]:
                skip += 1
                continue
            first_name = sub.get("first_name") or ""
            just_first = first_name.split()[0] if first_name else None
            full_name = first_name
            fields = sub.get("fields") or {}
            data = {}
            if just_first:
                data["firstName"] = just_first
            if full_name and full_name != just_first:
                data["fullName"] = full_name
            if fields.get("vokativ"):
                data["vokativ"] = fields["vokativ"]
            if fields.get("last_name"):
                data["lastName"] = fields["last_name"]
            if sub.get("created_at"):
                data["kitCreatedAt"] = sub["created_at"]
            if status != "active":
                data["importStatus"] = status

            try:
                resp = plunk("POST", "/contacts", {
                    "email": email,
                    "subscribed": subscribed,
                    "data": data,
                })
                state["imported"][email] = {
                    "id": resp["id"],
                    "kitId": sub["id"],
                    "isNew": resp.get("_meta", {}).get("isNew", True),
                }
                state["failed"].pop(email, None)
                ok += 1
                if ok % 25 == 0:
                    STATE_FILE.write_text(json.dumps(state, indent=2, ensure_ascii=False))
                    print(f"  … {ok} imported (running)")
            except Exception as e:
                state["failed"][email] = str(e)[:200]
                fail += 1
                print(f"  ✗ {email}: {e}")
            time.sleep(0.05)

    STATE_FILE.write_text(json.dumps(state, indent=2, ensure_ascii=False))
    print()
    print(f"=== Done ===")
    print(f"Total Kit subscribers scanned:  {total}")
    print(f"Imported / upserted:            {ok}")
    print(f"Skipped (already in state):     {skip}")
    print(f"Failed:                         {fail}")
    print(f"Plunk has {len(state['imported'])} unique contacts mapped.")


if __name__ == "__main__":
    main()
