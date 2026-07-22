# Free Program — architektura a konverzace

Název programu: **3denní rentgen** (logo `ProgramLogo` v `src/components/program/ui.tsx`).
3denní free program: IG DM "START" → diagnostika na webu → 3 denní videa → Beo konverzačně
doprovází, doptává se po dokoukání a nakonec rezervuje call. Stav žije v Notionu
(DB "Free Program", id `cfe2c40e7d4d42148e922cdb6d5b7f60`), konverzace v Beu, web trackuje.

## Principy konverzací

1. **Nikdy neprozradit tracking.** Beo nikdy neřekne "vidím, žes dokoukal" ani "nedokoukal jsi".
   Po dokoukání přirozeně naváže otázkami k videu. Při nedokoukání jen měkce připomene
   ("jen se připomínám s dnešním videem"), žádné výčitky, žádné "ještě jsi to neviděl".
2. **Doptávat se, ne vyslýchat.** Max 2 otázky na den, jedna po druhé, konverzačně.
   Odpovědi se ukládají (save_as) a slouží AI coachi jako kontext.
3. **Bez emoji.**
4. **Tykání, krátké zprávy, Timův DM styl** (viz workflow "DM solo → kvalifikační konverzace").
5. **Odkazy vždy v textu zprávy** (button URL v Beu neinterpolují {{proměnné}}).

## Flow (kdo co posílá)

```
IG DM "start"
  └─ WF1 START ── pošle link /program/start?u={{username}}
        └─ web: založí Notion row, redirect na /program/[id] (analýza video + diagnostika)
             └─ submit diagnostiky → web zapíše Q1-Q4 + Bucket → webhook do Bea
                  └─ WF2 DIAGNOSTIKA HOTOVÁ ── pošle link na Den 1 (/program/den/1?u=...)
                       └─ web /program/[id]/1: video Den 1, tracking per den
                            └─ KONEC SLEDOVÁNÍ (dokoukal → /api/program/track,
                               NEBO pustil a přestal → watch-scan po 15 min ticha)
                                 └─ WF3/4 DEN N ── pošle {{question}} (per bucket+den)
                                      → beo_agent (wait_first): 2-3 doptávací otázky,
                                        na konci "zítra ti připravím video o X (~Y min),
                                        kdy ti ho mám poslat?" → capture send_time
                                      → wait_until send_time (fallback 08:00, min 6 h)
                                      → pošle link dalšího dne → (Den 2 → Den 3)
                                 └─ WF5 DEN 3 ── {{question}} → beo_agent (závěr, teaser
                                    callu) → condition beo_outcome=done → cal_slots
                                    → cal_book → pipeline "Call Scheduled"
Nedokoukané video (dny bez aktivity):
  WF6 NUDGE SCAN (denně 17:00) → /api/program/nudge-scan → WF7 NUDGE (odkaz znovu)
Watch scan:
  WF8 WATCH SCAN (každých 10 min) → /api/program/watch-scan (x-cron-secret)
    └─ web: rozehraný den, max ≥ 15 s, nedokoukáno, otázka neodešla, aktivita
       (heartbeat) starší 15 min → POST do D{n} hooku s watched=no + pct
```

Otázka dne odchází právě JEDNOU (marker "D{n} otázka" v Notionu) — buď hned po
dokoukání (watched=yes), nebo po opuštění videa (watched=no). Payload hooku:
`{ username, day, event, watched, pct?, question, bucket, next_title?, next_minutes? }`.
Program workflows D1-D3 jsou `persistent` — běžná zpráva od leada je nezruší.

Identita: Beo zná `username` (IG). Web klíčuje na Notion page id (`cid` v URL).
Most: `/program/start?u=<username>` a `/program/den/<n>?u=<username>` — web si
username přeloží na svůj row a přesměruje na kanonickou URL s id. Zpětně web posílá
do Beo webhooků `{ username, day, ... }` — engine si podle username najde leada.

## Diagnostika (form na /program/[id])

4 otázky z podkladu (Free Program.md), odpovědi A-D. Bucket se dopočítá:

- **01 Publikum a positioning** — Q4=A, nebo Q1∈{A,D}
- **02 Málo prodejů** — Q4=B, nebo Q3∈{A,B}
- **03 Strop a škálování** — Q4=C, nebo Q1=C&Q3=C

(Pravidlo: primárně Q4 "co tě drží zpátky", fallback podle Q1/Q3.)

## Copy zpráv (zdroj pravdy)

### WF1 — START (dm_keyword "start", exact)

> Super, jdeme na to.
>
> Připravil jsem pro tebe 3 dny — každý den jedno video a pár otázek, ať to
> rovnou překlopíš do praxe.
>
> Začni tady, zabere to minutku:
> https://growbeyond.cz/program/start?u={{username}}
>
> Až budeš mít hotovo, ozvu se ti tady.

### WF2 — Diagnostika hotová (webhook, payload: username, bucket, link)

> Díky, mám to. Podle toho, cos vyplnil, vím přesně, na co se u tebe zaměřit.
>
> Tady je první video: {{link}}
>
> Dej si na něj klid, není dlouhé. Pak se ti tu ozvu s pár otázkami.

### WF3/WF4 — Den 1/2 (webhook: question payload, watched yes/no)

1. `{{question}}` — otázka per bucket+den (BUCKET_DAY_QUESTIONS v free-program.ts)
2. **beo_agent** `wait_first` + `use_dna` — počká na odpověď, pak 2-3 přirozené
   doptávací otázky (hlas přibalený z Creator DNA přes use_dna switch; ví
   watched/pct, NIKDY to neprozradí, při nedokoukání jemně povzbudí k dokoukání). Na konci poděkuje,
   řekne o čem je zítřejší video ({{next_title}}, ~{{next_minutes}} min) a zeptá
   se, kdy ho poslat → capture `send_time` (HH:MM). Bez odpovědi 10 h → timeout,
   flow pokračuje.
3. **wait_until** `send_time`, fallback 08:00, min. odstup 6 h ("ve 20:00" řečené
   večer = zítra 20:00).
4. Zpráva s linkem dalšího dne (`/program/den/N?u={{username}}`).

### WF5 — Den 3 (webhook: question payload)

1. `{{question}}`
2. **beo_agent** `wait_first` — doptá se k tématu + co daly 3 dny (aha-moment),
   na závěr teaser hovoru zdarma a "pošlu ti termíny".
3. condition `beo_outcome` = done → dál, jinak stop (timeout/handoff = žádný pitch).
4. cal_slots (day_first) → (condition email) → cal_book → pipeline "Call Scheduled".

### WF7 — Nudge (webhook: username, day, link)

> Čau, jen se připomínám s videem na dnešek — kdyby se ti ztratil odkaz: {{link}}
>
> Jestli ti do toho něco vlítlo, v pohodě, nikam neuteče. Kdyžtak mi dej vědět.

Nudge se posílá max 1× denně na osobu (web hlídá "Poslední nudge" v Notionu),
jen když je den rozehraný a video nedokoukané (Den 1: >20 h od registrace;
Den 2/3: >36 h od dokoukání předchozího dne).

## Notion DB "Free Program"

`cfe2c40e7d4d42148e922cdb6d5b7f60` (parent: Databases). Row = účastník, page id = cid.
IG (title), Jméno, Email, Stav (Start/Diagnostika/Den 1-3/Dokončeno/Call),
Bucket (01/02/03), Q1-Q4 (+Q3 Jinak), D1-D3 max/délka/dokoukáno/otevřeno/aktivita
(poslední heartbeat, throttle 2 min)/otázka (marker odeslané otázky), Poslední nudge.

## Web (growbeyond.cz repo)

- `/program/start` (GET ?u=) → find-or-create row → redirect `/program/[id]`
- `/program/[id]` → analýza video + diagnostika → POST `/api/program/diagnostika`
- `/program/den/[den]` (GET ?u=) → resolve → redirect `/program/[id]/[den]`
- `/program/[id]/[den]` → denní video, tracking s `day`
- `/api/program/progress` → D{n} max/délka (obdoba /api/vsl-progress)
- `/api/program/track` → milníky; na `vsl_finished` zapíše "D{n} dokoukáno" a
  **idempotentně** POST do Beo webhooku dne (jen pokud otázka ještě neodešla)
- `/api/program/watch-scan` → `x-cron-secret`; "pustil a přestal" → D{n} hook watched=no
- `/api/program/nudge-scan` → `x-cron-secret`; kandidáti → Beo nudge webhook

ENV (viz .env.local): `NOTION_FREE_PROGRAM_DB_ID`, `BEO_PROGRAM_HOOK_DIAG`,
`BEO_PROGRAM_HOOK_D1..D3`, `BEO_PROGRAM_HOOK_NUDGE`, `PROGRAM_CRON_SECRET`.
V Coolify nastaveno (2026-07-08).

## TODO obsah (Tim)

- analýza/intro video na /program/[id] (zatím placeholder main-vsl.mp4; denní videa nahraná)
- finální texty otázek per den (návrhy výše), případně per-bucket varianty

