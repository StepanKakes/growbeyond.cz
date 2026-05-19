#!/usr/bin/env python3
"""Build remaining Kit sequences as Plunk workflows.

For each configured sequence:
  1. Fetch Kit email content (cached in kit-export/)
  2. Create Plunk template with brand styling
  3. Create Plunk workflow with EVENT trigger + SEND_EMAIL steps
  4. Persist IDs to state file for idempotency

CSP-link-clicked is intentionally skipped (Kit placeholder content,
published=false, never finished).
"""
from __future__ import annotations
import json, os, re, sys, urllib.request, urllib.error
from pathlib import Path

PLUNK_API = "https://next-api.useplunk.com"
PLUNK_KEY = os.environ.get("PLUNK_SECRET_KEY") or sys.exit("Missing PLUNK_SECRET_KEY")
KIT_KEY = os.environ.get("KIT_API_KEY") or sys.exit("Missing KIT_API_KEY")
KIT_API = "https://api.kit.com"
FROM_EMAIL = "tim@creationwithtim.com"
FROM_NAME = "Tim"
BRAND_RED = "#FF0E00"

HERE = Path(__file__).parent
KIT_EXPORT_DIR = HERE / "kit-export"
STATE_FILE = HERE / "build-other-workflows.state.json"

# Sequences to port. Each entry: dict with seq_id, slug, name, emails:[(kit_id, delay)]
# delay is None for immediate, else (amount, unit) where unit ∈ minutes|hours|days.
SEQUENCES = [
    {"seq_id": "2707301", "slug": "mission90", "name": "Mission90",
     "emails": [("9679326", None)]},
    {"seq_id": "2686504", "slug": "consistency-blueprint", "name": "Consistency Blueprint",
     "emails": [("9609157", None)]},
    {"seq_id": "2685271", "slug": "personal-brand-2026", "name": "PersonalBrand2026 Blueprint",
     "emails": [("9604719", None)]},
    {"seq_id": "2682409", "slug": "csp-call-schedule", "name": "CSP Call schedule",
     "emails": [("9595463", None)]},
    {"seq_id": "2682327", "slug": "csp-welcome", "name": "CSP Welcome",
     "emails": [("9595255", None)]},
    {"seq_id": "2655663", "slug": "identity-blueprint", "name": "Identity Blueprint",
     "emails": [("9506223", None)]},
]

WRAPPER = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body {{
    margin: 0;
    padding: 0;
    background: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    color: #1a1a1a;
    -webkit-font-smoothing: antialiased;
  }}
  table.outer {{ width: 100%; border-collapse: collapse; }}
  td.outer {{ padding: 40px 16px; }}
  table.inner {{ width: 100%; max-width: 600px; margin: 0 auto; border-collapse: collapse; }}
  .content {{
    font-size: 17px;
    line-height: 1.65;
    color: #1a1a1a;
  }}
  .content p {{ margin: 0 0 16px 0; text-align: left; }}
  .content h1, .content h2, .content h3, .content h4 {{
    display: inline-block;
    background: {RED};
    color: #000000;
    padding: 4px 10px;
    margin: 28px 0 14px 0;
    font-weight: 700;
    font-size: 19px;
    line-height: 1.3;
  }}
  .content a {{ color: {RED}; text-decoration: underline; }}
  .content strong {{ font-weight: 700; }}
  .content em {{ font-style: italic; }}
</style>
</head>
<body>
<table class="outer" cellpadding="0" cellspacing="0"><tr><td class="outer" align="center">
  <table class="inner" cellpadding="0" cellspacing="0"><tr><td class="content">
    {INNER}
  </td></tr></table>
</td></tr></table>
</body>
</html>"""


def plunk(method: str, path: str, body=None) -> dict:
    req = urllib.request.Request(f"{PLUNK_API}{path}", method=method,
        headers={"Authorization": f"Bearer {PLUNK_KEY}", "Content-Type": "application/json"},
        data=json.dumps(body).encode() if body else None)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"{method} {path} → {e.code}: {e.read().decode()}")


def kit_email_cached(seq_id: str, email_id: str) -> dict:
    path = KIT_EXPORT_DIR / f"email-{email_id}.json"
    if not path.exists():
        req = urllib.request.Request(
            f"{KIT_API}/v4/sequences/{seq_id}/emails/{email_id}",
            headers={"X-Kit-Api-Key": KIT_KEY},
        )
        with urllib.request.urlopen(req, timeout=20) as r:
            path.write_bytes(r.read())
    return json.loads(path.read_text())["email"]


def convert_vars(s: str) -> str:
    return s.replace("{{ subscriber.vokativ }}", "{{ vokativ }}")


def extract_inner(kit_html: str) -> str:
    cleaned = re.sub(r"<style[^>]*>.*?</style>", "", kit_html, flags=re.DOTALL)
    m = re.search(r"<table[^>]*>\s*<tbody>\s*<tr>\s*<td[^>]*>(.*?)</td>\s*</tr>\s*</tbody>\s*</table>",
                  cleaned, flags=re.DOTALL)
    inner = m.group(1) if m else cleaned
    inner = re.sub(r"text-align:left;?", "", inner)
    inner = re.sub(r"\sstyle=[\"']\s*[\"']", "", inner)
    inner = re.sub(r'\sclass=[\"\']\s*[\"\']', "", inner)
    return inner.strip()


def load_state() -> dict:
    return json.loads(STATE_FILE.read_text()) if STATE_FILE.exists() else {}


def save_state(state: dict) -> None:
    STATE_FILE.write_text(json.dumps(state, indent=2, ensure_ascii=False))


def build_sequence(state: dict, seq: dict) -> None:
    slug = seq["slug"]
    if slug not in state:
        state[slug] = {"templates": {}, "workflow_id": None, "steps": {}}
    s = state[slug]
    print(f"\n=== {seq['name']} (event: {slug}) ===")

    # 1. Templates
    template_ids = []
    for i, (kit_id, _) in enumerate(seq["emails"]):
        if kit_id in s["templates"]:
            template_ids.append(s["templates"][kit_id])
            print(f"  template (cached): {kit_id}")
            continue
        ke = kit_email_cached(seq["seq_id"], kit_id)
        subject = convert_vars(ke["subject"])
        inner = extract_inner(convert_vars(ke["content"]))
        body = WRAPPER.format(INNER=inner, RED=BRAND_RED)
        # Per-email name. For single-email sequences use just the slug.
        if len(seq["emails"]) == 1:
            tname = f"{slug}/email"
        else:
            tname = f"{slug}/E{i} — {ke['subject'][:50]}"
        print(f"  creating template: {tname}")
        resp = plunk("POST", "/templates", {
            "name": tname,
            "subject": subject,
            "body": body,
            "from": FROM_EMAIL,
            "fromName": FROM_NAME,
        })
        s["templates"][kit_id] = resp["id"]
        template_ids.append(resp["id"])
        save_state(state)

    # 2. Workflow
    if not s["workflow_id"]:
        print(f"  creating workflow: {seq['name']}")
        resp = plunk("POST", "/workflows", {
            "name": seq["name"],
            "description": f"Ported from Kit sequence id {seq['seq_id']}",
            "triggerType": "EVENT",
            "eventName": slug,
        })
        s["workflow_id"] = resp["id"]
        save_state(state)
    wf_id = s["workflow_id"]
    print(f"  workflow ID: {wf_id}")

    # 3. Steps (linear: optional DELAY → SEND_EMAIL repeating)
    pos = 1
    last_sid = None
    for i, (kit_id, delay) in enumerate(seq["emails"]):
        if delay is not None:
            amount, unit = delay
            key = f"delay_E{i}"
            if key not in s["steps"]:
                resp = plunk("POST", f"/workflows/{wf_id}/steps", {
                    "type": "DELAY",
                    "name": f"Delay {amount}{unit[0]}",
                    "position": pos,
                    "config": {"amount": amount, "unit": unit},
                })
                s["steps"][key] = resp["id"]
                save_state(state)
                print(f"  step pos={pos}: DELAY {amount}{unit[0]}")
            last_sid = s["steps"][key]
            pos += 1
        key = f"send_E{i}"
        if key not in s["steps"]:
            resp = plunk("POST", f"/workflows/{wf_id}/steps", {
                "type": "SEND_EMAIL",
                "name": f"E{i}",
                "position": pos,
                "templateId": template_ids[i],
                "config": {"templateId": template_ids[i],
                           "recipient": {"type": "CONTACT"}},
            })
            s["steps"][key] = resp["id"]
            save_state(state)
            print(f"  step pos={pos}: SEND_EMAIL → template {template_ids[i][:8]}…")
        last_sid = s["steps"][key]
        pos += 1

    # 4. Transitions: chain all steps. Plunk auto-creates trigger→position1; we only
    #    need transitions between user-created steps (i.e., 2nd onward).
    all_step_ids = [s["steps"][k] for k in sorted(s["steps"], key=lambda k: (
        int(re.search(r"\d+", k).group()), "delay" not in k))]
    # Actually we need to chain in created order. Use position-based lookup:
    # Refetch workflow to get current step list with positions:
    wf = plunk("GET", f"/workflows/{wf_id}")
    user_steps = sorted([st for st in wf["steps"] if st["type"] != "TRIGGER"],
                        key=lambda x: x["position"])
    existing_trans = set()
    for st in user_steps:
        for t in st.get("outgoingTransitions", []):
            existing_trans.add((t["fromStepId"], t["toStepId"]))
    for a, b in zip(user_steps, user_steps[1:]):
        pair = (a["id"], b["id"])
        if pair in existing_trans:
            continue
        plunk("POST", f"/workflows/{wf_id}/transitions",
              {"fromStepId": a["id"], "toStepId": b["id"]})
        print(f"  transition: pos{a['position']} → pos{b['position']}")


def main():
    state = load_state()
    print(f"Building {len(SEQUENCES)} workflows on Plunk Next …")
    for seq in SEQUENCES:
        build_sequence(state, seq)
    print("\n=== Summary ===")
    for slug, info in state.items():
        print(f"  {slug}: workflow={info['workflow_id']}, templates={len(info['templates'])}, steps={len(info['steps'])}")
    print("All in DRAFT (enabled=false). Enable manually in dashboard.")


if __name__ == "__main__":
    main()
