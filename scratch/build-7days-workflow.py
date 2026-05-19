#!/usr/bin/env python3
"""Build the '7Days to Authentic Personal Brand' workflow in Plunk Next.

Reads exported Kit emails from scratch/kit-export/, converts variable syntax,
creates Plunk templates, workflow, steps, and transitions. Leaves the workflow
as DRAFT (enabled=false) for manual review in the Plunk dashboard.

Idempotent: re-running skips already-created resources by matching names.
"""
from __future__ import annotations
import json, os, sys, urllib.request, urllib.error
from pathlib import Path

PLUNK_API = "https://next-api.useplunk.com"
PLUNK_KEY = os.environ.get("PLUNK_SECRET_KEY")
if not PLUNK_KEY:
    sys.exit("Missing PLUNK_SECRET_KEY env var")

FROM_EMAIL = "tim@creationwithtim.com"
FROM_NAME = "Tim z Beyond"
WORKFLOW_NAME = "7Days to Authentic Personal Brand"
EVENT_NAME = "7days-signup"

KIT_EXPORT_DIR = Path(__file__).parent / "kit-export"
STATE_FILE = Path(__file__).parent / "build-7days-workflow.state.json"

# Order: (kit_email_id, delay_before_send)
EMAILS_ORDERED = [
    ("9508333", None),               # E0: welcome, immediate
    ("9510651", (1, "hours")),       # E1: Day 1, 1h after welcome
    ("9511197", (1, "days")),        # E2: Day 2
    ("9511823", (1, "days")),        # E3: Day 3
    ("9515135", (1, "days")),        # E4: Day 4
    ("9515275", (1, "days")),        # E5: Day 5
    ("9520203", (1, "days")),        # E6: Day 6
    ("9520241", (1, "days")),        # E7: Day 7
]


def api(method: str, path: str, body: dict | None = None) -> dict:
    req = urllib.request.Request(
        f"{PLUNK_API}{path}",
        method=method,
        headers={
            "Authorization": f"Bearer {PLUNK_KEY}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        data=json.dumps(body).encode() if body is not None else None,
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        msg = e.read().decode()
        raise RuntimeError(f"{method} {path} → {e.code}: {msg}")


def load_state() -> dict:
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {"templates": {}, "workflow_id": None, "steps": {}, "transitions": []}


def save_state(state: dict) -> None:
    STATE_FILE.write_text(json.dumps(state, indent=2, ensure_ascii=False))


def kit_email(kid: str) -> dict:
    return json.loads((KIT_EXPORT_DIR / f"email-{kid}.json").read_text())["email"]


def convert_html(html: str) -> str:
    return html.replace("{{ subscriber.vokativ }}", "{{ vokativ }}")


def ensure_template(state: dict, kid: str, position: int) -> str:
    if kid in state["templates"]:
        return state["templates"][kid]
    e = kit_email(kid)
    body = convert_html(e["content"])
    name = f"7Days/E{position} — {e['subject']}"
    print(f"  Creating template: {name}")
    resp = api("POST", "/templates", {
        "name": name,
        "subject": e["subject"],
        "body": body,
        "from": FROM_EMAIL,
        "fromName": FROM_NAME,
    })
    tid = resp.get("id") or resp.get("template", {}).get("id")
    if not tid:
        raise RuntimeError(f"No template id in response: {resp}")
    state["templates"][kid] = tid
    save_state(state)
    return tid


def ensure_workflow(state: dict) -> str:
    if state.get("workflow_id"):
        return state["workflow_id"]
    print(f"Creating workflow: {WORKFLOW_NAME}")
    resp = api("POST", "/workflows", {
        "name": WORKFLOW_NAME,
        "description": "Ported from Kit sequence id 2656279 (8 emails).",
        "triggerType": "EVENT",
        "eventName": EVENT_NAME,
    })
    wf_id = resp["id"]
    state["workflow_id"] = wf_id
    save_state(state)
    return wf_id


def ensure_step(state: dict, wf_id: str, key: str, step_type: str, name: str, position: int, config: dict) -> str:
    if key in state["steps"]:
        return state["steps"][key]
    print(f"  Step {position}: {step_type} — {name}")
    body = {"type": step_type, "name": name, "position": position, "config": config}
    if step_type == "SEND_EMAIL":
        body["templateId"] = config["templateId"]
    resp = api("POST", f"/workflows/{wf_id}/steps", body)
    sid = resp["id"]
    state["steps"][key] = sid
    save_state(state)
    return sid


def ensure_transition(state: dict, wf_id: str, from_sid: str, to_sid: str) -> None:
    key = f"{from_sid}->{to_sid}"
    if key in state["transitions"]:
        return
    print(f"  Transition: {from_sid[:8]}… → {to_sid[:8]}…")
    api("POST", f"/workflows/{wf_id}/transitions", {
        "fromStepId": from_sid,
        "toStepId": to_sid,
    })
    state["transitions"].append(key)
    save_state(state)


def main() -> None:
    state = load_state()
    print(f"=== Build 7Days workflow ===")
    print(f"Plunk: {PLUNK_API}")
    print(f"Event: {EVENT_NAME}")
    print(f"State file: {STATE_FILE.name}")
    print()

    print("1. Templates")
    template_ids: list[str] = []
    for i, (kid, _) in enumerate(EMAILS_ORDERED):
        tid = ensure_template(state, kid, i)
        template_ids.append(tid)

    print()
    print("2. Workflow")
    wf_id = ensure_workflow(state)
    print(f"  ID: {wf_id}")

    print()
    print("3. Steps")
    step_ids: list[str] = []
    pos = 1
    for i, (kid, delay) in enumerate(EMAILS_ORDERED):
        if delay is not None:
            amount, unit = delay
            delay_sid = ensure_step(state, wf_id, f"delay_before_E{i}", "DELAY",
                                    f"Delay {amount}{unit[0]}", pos,
                                    {"amount": amount, "unit": unit})
            step_ids.append(delay_sid)
            pos += 1
        send_sid = ensure_step(state, wf_id, f"send_E{i}", "SEND_EMAIL",
                               f"E{i}: {kit_email(kid)['subject'][:50]}", pos,
                               {"templateId": template_ids[i],
                                "recipient": {"type": "CONTACT"}})
        step_ids.append(send_sid)
        pos += 1

    print()
    print("4. Transitions")
    for a, b in zip(step_ids, step_ids[1:]):
        ensure_transition(state, wf_id, a, b)

    print()
    print("=== Done ===")
    print(f"Workflow: https://next-app.useplunk.com/workflows/{wf_id}")
    print(f"State persisted to: {STATE_FILE.name}")
    print(f"Status: DRAFT (enabled=false). Review in dashboard, then toggle to enable.")


if __name__ == "__main__":
    main()
