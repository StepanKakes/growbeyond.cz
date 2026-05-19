#!/usr/bin/env python3
"""Restyle 7Days templates: centered container, brand styling, fromName=Tim.

Reads template content from each Plunk template (the inner Kit HTML already
converted to {{ vokativ }}), strips Kit's noisy <style> tags, and wraps it in
a clean centered container with brand colors (#FF0E00 for headings + links).
"""
from __future__ import annotations
import json, os, re, sys, urllib.request, urllib.error
from pathlib import Path

API = "https://next-api.useplunk.com"
KEY = os.environ.get("PLUNK_SECRET_KEY") or sys.exit("Missing PLUNK_SECRET_KEY")
STATE_FILE = Path(__file__).parent / "build-7days-workflow.state.json"
KIT_EXPORT_DIR = Path(__file__).parent / "kit-export"

FROM_NAME = "Tim"
BRAND_RED = "#FF0E00"

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
  .footer {{ font-size: 12px; color: #999; padding: 24px 0 0 0; }}
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


def call(method: str, path: str, body=None) -> dict:
    req = urllib.request.Request(f"{API}{path}", method=method,
        headers={"Authorization": f"Bearer {KEY}", "Content-Type": "application/json"},
        data=json.dumps(body).encode() if body else None)
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"{method} {path} → {e.code}: {e.read().decode()}")


def extract_inner(kit_html: str) -> str:
    """Strip Kit's <style> blocks and surrounding <table>/<tbody>/<tr>/<td> wrapper,
    keeping just the paragraph content. Falls back to whole string if no match."""
    # Drop all <style>...</style> blocks
    cleaned = re.sub(r"<style[^>]*>.*?</style>", "", kit_html, flags=re.DOTALL)
    # Strip Kit's table wrapper if present
    m = re.search(r"<table[^>]*>\s*<tbody>\s*<tr>\s*<td[^>]*>(.*?)</td>\s*</tr>\s*</tbody>\s*</table>",
                  cleaned, flags=re.DOTALL)
    inner = m.group(1) if m else cleaned
    # Remove inline text-align:left noise (we control alignment via CSS)
    inner = re.sub(r"text-align:left;?", "", inner)
    inner = re.sub(r"\sstyle=[\"']\s*[\"']", "", inner)
    inner = re.sub(r'\sclass=[\"\']\s*[\"\']', "", inner)
    return inner.strip()


def main():
    state = json.loads(STATE_FILE.read_text())
    print(f"Restyling {len(state['templates'])} templates …")
    for kid, template_id in state["templates"].items():
        kit_email = json.loads((KIT_EXPORT_DIR / f"email-{kid}.json").read_text())["email"]
        original = kit_email["content"].replace("{{ subscriber.vokativ }}", "{{ vokativ }}")
        inner = extract_inner(original)
        new_body = WRAPPER.format(INNER=inner, RED=BRAND_RED)
        res = call("PATCH", f"/templates/{template_id}", {
            "body": new_body,
            "fromName": FROM_NAME,
        })
        print(f"  ✓ {res['name'][:50]:50}  ({len(new_body)} chars)")
    print("Done.")


if __name__ == "__main__":
    main()
