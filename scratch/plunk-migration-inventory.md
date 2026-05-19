# Plunk Migration — Inventura (2026-05-18)

## Resend (stávající stav)

**Doména:** `creationwithtim.com` (verified, EU region, sending enabled)
**Templates:** 0 (vše jako inline HTML body v n8n SMTP nodech)
**Broadcasts:** 0
**Webhooks:** 0
**Segments:** 1 ("General")
**API klíče:** (existují, fungují)

**Použití:** Resend funguje primárně jako SMTP relay (`smtp.resend.com`) pro n8n; Resend API se z growbeyond.cz repo přímo nepoužívá.

## Aktivní emailové kampaně/série (přes Resend SMTP)

### 1. Strategický call s Timem — 4-email série
Workflow: `70V8myPJKqeTMiKu` "Cal.com Booking – Potvrzení a Připomínky"
- "Tvůj strategický call je rezervovaný" — confirmation hned po booking
- "Připomínka: Tvůj call s Timem je pozítří" — 48h před
- "Zítra: Strategický call s Timem" — 24h před
- "Za hodinu: Strategický call s Timem!" — 1h před

Trigger: Webhook z Cal.com booking
From: `tim@creationwithtim.com` ("Tim z Beyond")
Footer: "GrowBeyond | growbeyond.cz"

### 2. Beyond Mentoring onboarding
Workflows:
- `AGNPOfubL0lQvmdk` — "Beyond Mentoring — Fáze 1: Spustit onboarding"
- `TmhHv3XbxOYFK0M3` — "Beyond Mentoring — Fáze 2: Po zaplacení"
- `gngArc3kiyIwHrTI` — "CSP #1 Stripe -> Onboard Mail"
- `OQQjAwHVgwZwiE1C` — "CSP #2 Tally Submission -> Call Schedule Mail"

### 3. Interní notifikace
- "💰 PLATBA: Ivana Juříková startuje program" — admin notifikace o platbě

## n8n workflows posílající emaily (k portování)

| ID | Název | Active |
|---|---|---|
| 70V8myPJKqeTMiKu | Cal.com Booking – Potvrzení a Připomínky | ✓ |
| AGNPOfubL0lQvmdk | Beyond Mentoring — Fáze 1: Spustit onboarding | ✓ |
| TmhHv3XbxOYFK0M3 | Beyond Mentoring — Fáze 2: Po zaplacení | ✓ |
| OQQjAwHVgwZwiE1C | CSP #2 Tally Submission -> Call Schedule Mail | ✓ |
| gngArc3kiyIwHrTI | CSP #1 Stripe -> Onboard Mail | ✓ |

## Kit / ConvertKit (stávající stav)

**API klíč:** v4 PAT `kit_58d3e86d...` (read-only). Použít header `X-Kit-Api-Key`, NE Bearer.
**Účet:** "Beyond" (id 2611168), Creator plán
**Sender:** `tim@creationwithtim.com` (verified, DMARC OK)
**Kit DNS běží taky na creationwithtim.com** (ckespa, cka._domainkey, cka2._domainkey)

**Použití v kódu:**
- `src/app/api/subscribe/route.ts` — newsletter signup z webu (volá ConvertKit v3 API)
- Form ID, Tag ID, Sequence ID se předávají z UI z Notion resource entries
- Používá `vokativ` knihovnu na český 5. pád pro personalizaci

### Subscribers
- **322 active**
- 6 cancelled, 7 bounced, 3 complained
- Celkem ~338 kontaktů

### Forms (2)
| ID | Název | Format |
|---|---|---|
| 9102248 | Charlotte form | inline |
| 9102199 | Creator Profile | (none) |

### Sequences (8) — celkem 16 emailů k portování
| ID | Název | Emails | Aktivní subs |
|---|---|---|---|
| 2707301 | Mission90 | 1 | ano |
| 2686645 | CSP - link clicked | 2 | 0 |
| 2686504 | cosistency blueprint | 1 | ano |
| 2685271 | PersonalBrand2026_Blueprint | 1 | ano |
| 2682409 | CSP Call schedule | 1 | ano |
| 2682327 | CSP Welcome | 1 | ano |
| 2656279 | 7Days to Authentic Personal Brand | **8** | ano |
| 2655663 | Identity blueprint | 1 | ano |

Většina sekvencí = single resource-delivery email; nurture je jen "7Days to Authentic PB".

### Tags (13)
- **Resource:** beyond-mission90-blueprint, beyond-consistency-blueprint, PersonalBrand2026_Blueprint, consistency-blueprint, resource-bnd-identity
- **Behavioral:** clicked-ytb-link, clicked-csp-offer, csp-call_trigger, csp-purchase
- **Cleanup:** test
- **Import batches:** 3x "Imported [date]"

### Custom Fields (2)
- vokativ (Vokativ)
- last_name (Last Name)

### Broadcasts
Pravidelné marketingové emaily (max 5 nedávných):
- "80% close rate díky tomuto post-booking systému" (2026-05-13)
- "5 důvodů proč tvůj Instagram nevydělává" (2026-05-03)
- "Jak bych od nuly vybudoval os. značku na 500k/měs" (2026-04-19)
- "Dveře se zavírají za 3 hodiny" (2026-04-10)
- "Je čas jednat ⏳" (2026-04-10)
→ Broadcasts se nemigrují (one-off sends). V Plunku budeme posílat přes Campaigns.

## Plunk (cíl)

**Dashboard:** `https://next-app.useplunk.com` (nový "next" dashboard)
**API:** `https://api.useplunk.com` (potvrzeno, vrací validní chyby)
**Klíč:** `sk_0cf407…` — vrací "That project was not found" → key není napárovaný na projekt.

**Akce:** uživatel musí vstoupit do konkrétního projektu v dashboardu a vygenerovat API klíč v project-level Settings → API Keys.

## Plánovaný mapping

### Kit → Plunk
- Forms + Tags → Plunk **events** (event-driven model)
- Sequences → Plunk **automations**
- Subscribers → Plunk **contacts**
- Migrace: CSV export z Kit → bulk create přes Plunk API

### Resend SMTP → Plunk
Dvě varianty:
1. **SMTP relay přes Plunk** (pokud Plunk podporuje SMTP) — minimální změna v n8n
2. **HTTP Request na `POST /v1/send`** — nahradit `emailSend` nody za HTTP Request v n8n

Doporučení: varianta 2 (HTTP) — využije Plunk templates, event tracking, automations a zachová HTML obsah s {{variables}}.

### Web signup form (`/api/subscribe`)
Přepsat z ConvertKit v3 API na `POST /v1/track` (event) nebo `POST /v1/contacts` (přímé vytvoření).

## DNS / Doména pro odesílání

Aktuální odesílací doména: `creationwithtim.com` (přes Resend SMTP)
Cílová: stejně `creationwithtim.com` nebo migrovat na `growbeyond.cz`?
→ Otevřená otázka pro uživatele.
