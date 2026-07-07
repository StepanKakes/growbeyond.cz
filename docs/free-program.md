# Free Program — architektura a konverzace

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
                            └─ vsl_finished → web zapíše "D1 dokoukáno" → webhook do Bea
                                 └─ WF3 DEN 1 DOKOUKÁNO ── 2 otázky → "zítra pošlu další"
                                      → delay 16 h → pošle link Den 2 → (stejně Den 2 → Den 3)
                                           └─ WF5 DEN 3 DOKOUKÁNO ── otázky → pitch → cal_slots → cal_book
Nedokoukané video:
  WF6 NUDGE SCAN (denně, schedule) → GET web /api/program/nudge-scan (secret)
    └─ web najde kandidáty v Notionu → POST per kandidát do Bea
         └─ WF7 NUDGE ── měkká připomínka s odkazem
```

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

### WF3 — Den 1 dokoukáno (webhook: username, day=1)

1. > K dnešnímu videu mám na tebe dvě rychlé otázky. Co z něj na tebe nejvíc sedlo?
   (wait_for_reply, save_as `d1_a1`)
2. > Dobrý. A kdybys měl jednou větou říct, komu pomáháš a s čím — jak by zněla?
   (wait_for_reply, save_as `d1_a2`)
3. > Přesně tohle je základ, se kterým budeme pracovat. Díky.
   >
   > Zítra ti pošlu druhé video. Zatím se měj.
4. delay 57600 s (16 h)
5. > Druhý den, druhé video: https://growbeyond.cz/program/den/2?u={{username}}
   >
   > Až ho zvládneš, ozvu se tady s otázkami.

### WF4 — Den 2 dokoukáno (webhook: username, day=2)

1. > Jak na tebe sedlo dnešní video? Kudy k tobě dneska reálně tečou klienti — co je tvoje cesta zákazníka?
   (save_as `d2_a1`)
2. > Rozumím. A kde ti to na té cestě nejvíc padá — kde lidi ztrácíš?
   (save_as `d2_a2`)
3. > Dává smysl, tohle řeší skoro každý, kdo za mnou přijde. Zítra poslední video — to nejdůležitější.
4. delay 57600 s
5. > Poslední den: https://growbeyond.cz/program/den/3?u={{username}}
   >
   > Po něm si řekneme, co dál.

### WF5 — Den 3 dokoukáno (webhook: username, day=3)

1. > Tři dny za námi. Co byl pro tebe za tu dobu největší aha-moment?
   (save_as `d3_a1`)
2. > Dobrý. Jestli chceš, projdeme tvoji situaci napřímo — krátký call, kde ti ukážu,
   > jak to poskládat u tebe. Vyber si termín:
3. cal_slots → (condition email) → cal_book → pipeline "Call Scheduled"

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
Bucket (01/02/03), Q1-Q4 (+Q3 Jinak), D1-D3 max/délka/dokoukáno (+ otevřeno, nudge — viz kód).

## Web (growbeyond.cz repo)

- `/program/start` (GET ?u=) → find-or-create row → redirect `/program/[id]`
- `/program/[id]` → analýza video + diagnostika → POST `/api/program/diagnostika`
- `/program/den/[den]` (GET ?u=) → resolve → redirect `/program/[id]/[den]`
- `/program/[id]/[den]` → denní video, tracking s `day`
- `/api/program/progress` → D{n} max/délka (obdoba /api/vsl-progress)
- `/api/program/track` → milníky; na `vsl_finished` zapíše "D{n} dokoukáno" a
  **idempotentně** (jen při prvním zápisu) POST do Beo webhooku dne
- `/api/program/nudge-scan` → hlavička `x-cron-secret`; kandidáti → Beo nudge webhook

ENV (viz .env.local): `NOTION_FREE_PROGRAM_DB_ID`, `BEO_PROGRAM_HOOK_DIAG`,
`BEO_PROGRAM_HOOK_D1..D3`, `BEO_PROGRAM_HOOK_NUDGE`, `PROGRAM_CRON_SECRET`.
Stejné hodnoty nastavit v Coolify.

## TODO obsah (Tim)

- 3 denní videa (zatím placeholder main-vsl.mp4) + analýza video na /program/[id]
- finální texty otázek per den (návrhy výše), případně per-bucket varianty
- redesign stránek (snapshot současné /strategie: ~/Downloads/strategie-web.html)
