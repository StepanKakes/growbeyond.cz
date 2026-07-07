// Free Program — stav účastníka žije v Notion DB "Free Program" (řádek = účastník,
// page id = cid v URL /program/[id]). Identita vůči Beu je IG username: Beo posílá
// odkazy /program/start?u=<username> a /program/den/<n>?u=<username>, web si username
// přeloží na svůj řádek; zpětné webhooky do Bea nesou { username, day } a engine si
// podle username najde leada. Kompletní blueprint: docs/free-program.md

const NOTION = 'https://api.notion.com/v1';

export type ProgramDay = 1 | 2 | 3;

export const PROGRAM_ORIGIN = 'https://growbeyond.cz';

export type ProgramVideoMeta = { src: string; poster?: string; title: string; takeaways: string[]; minutes?: number };

// Úvodní/analýza video (zatím hlavní VSL — TODO(Tim): natočit intro akcelerátoru)
export const PROGRAM_VIDEOS: Record<'analyza', ProgramVideoMeta> = {
    analyza: { src: 'https://video.growbeyond.cz/main-vsl.mp4', poster: '/images/vsl-nahled.jpg', title: 'Úvodní video', takeaways: [] },
};

// Denní videa per bucket (pořadí resources z podkladu Free Program.md).
// Soubory na video.growbeyond.cz (Filebrowser media.growbeyond.cz).
// takeaways = 3 klíčové věci z přepisu videa (zobrazují se pod videem).
const vid = (file: string, minutes: number, title: string, takeaways: string[]): ProgramVideoMeta => ({
    src: `https://video.growbeyond.cz/${file}.mp4`,
    poster: `https://video.growbeyond.cz/${file}.jpg`,
    title,
    takeaways,
    minutes, // zaokrouhlená délka (ffprobe) — Beo agent říká, kolik času si vyhradit
});

const V = {
    byznysModel: vid('program-byznys-model', 19, 'Najdi svůj unikátní úhel pohledu a pozici na trhu. Definuj si cílového zákazníka a začni k němu mluvit.', [
        'Definuj positioning vzorcem: pomáhám X dostat se do Y pomocí Z.',
        'Prodávej konkrétní, měřitelný a časově ohraničený výsledek, ne proces ani čas.',
        'Postav funnel: Instagram přitáhne lidi, YouTube a email vybudují důvěru.',
    ]),
    igBio: vid('program-ig-bio', 8, 'Vytvoř perfektní Instagram bio, které konvertuje.', [
        'První řádek bia: pomáhám komu s jakým výsledkem, ne co děláš.',
        'Druhý řádek ukaž reálný důkaz expertizy, třetí jednu jasnou výzvu k akci.',
        'Bio je filtr: mluv ke konkrétní cílovce a dej jen jeden odkaz.',
    ]),
    middleFunnel: vid('program-middle-funnel', 10, 'Nauč se tvořit obsah, který buduje důvěru a prezentuje tě jako experta.', [
        'Toč dlouhá videa na YouTube. Divák s tebou musí strávit 7 hodin, než koupí.',
        'Poznej svého follower avatara a propoj obsah se svým příběhem a hodnotami.',
        'Nebalancuj trychtýř rovnoměrně. Posiluj vždy jeho aktuálně nejslabší místo.',
    ]),
    klienti120k: vid('program-klienti-120k', 20, 'Nauč se tvořit obsah, který přitáhne tvého ideálního klienta a prodá ho sám.', [
        'Sdílej názory, hodnoty a reálný život. Lidi kupují od lidí, ne od značek.',
        'Popiš problém svého ideálního klienta líp než on sám, získáš důvěru v řešení.',
        'Pojmenuj svůj framework vlastním jménem a pravidelně ukazuj reálné výsledky klientů.',
    ]),
    skalovani600k: vid('program-skalovani-600k', 18, 'Nauč se principy škálování, které ti uvolní ruce a otevřou cestu k 500 000 Kč měsíčně.', [
        'Přestaň prodávat hodiny, prodávej výsledek a transformaci klienta.',
        'Napiš si tři podmínky ideálního klienta a ostatní odmítej.',
        'Nabízej vždy jen jednu nabídku, cenu nastav na 10 % roční hodnoty výsledku.',
    ]),
    maya: vid('program-maya-rozhovor', 41, 'Nauč se stavět architekturu nabídky.', [
        'Neprodávej hodiny. Prodávej výsledek a dražší core nabídku za 5000+ Kč.',
        'Vyber si jednu specializaci a buď známý kvůli jedné větě.',
        'Neprodávej přímo z Instagramu. Buduj důvěru přes lead magnet a email.',
    ]),
    onboarding: vid('program-onboarding-system', 9, 'Doruč ten nejpříjemnější zážitek a postav program, který si buduje jméno sám.', [
        'Nasaď dvě VSL videa a kvalifikační formulář před každý prodejní hovor.',
        'Prvních 48 hodin rozhoduje: úvodní video, tři jasné kroky, osobní přivítání.',
        'Z úvodního dotazníku sestav roadmapu a dávkuj klientovi týdenní úkoly.',
    ]),
};

export const BUCKET_DAY_VIDEOS: Record<string, Record<ProgramDay, ProgramVideoMeta>> = {
    '01 Publikum a positioning': { 1: V.byznysModel, 2: V.klienti120k, 3: V.igBio },
    '02 Málo prodejů': { 1: V.middleFunnel, 2: V.klienti120k, 3: V.byznysModel },
    '03 Strop a škálování': { 1: V.skalovani600k, 2: V.maya, 3: V.onboarding },
};

export function dayVideo(bucket: string, day: ProgramDay): ProgramVideoMeta {
    return BUCKET_DAY_VIDEOS[bucket]?.[day] ?? PROGRAM_VIDEOS.analyza;
}

// Otázka do DM po skončení sledování (dokoukal i nedokoukal) — per bucket+den,
// protože stejné video má v jiném bucketu jinou otázku (podklad Free Program.md).
// Posílá se v payloadu Beo hooku, workflow ji doručí a předá konverzaci Beo AI kroku.
export const BUCKET_DAY_QUESTIONS: Record<string, Record<ProgramDay, string>> = {
    '01 Publikum a positioning': {
        1: 'Víš k jakému člověku mluvíš? Dokážeš popsat jeho největší problémy a touhy?',
        2: 'Kdyby ses zeptal svého průměrného followera co máš rád, dokázal by odpovědět?',
        3: 'Co se týče tvého bia, je něco v čem si nejsi jistý?',
    },
    '02 Málo prodejů': {
        1: 'Jaký obsah děláš pro lidi, co tě už znají, ale ještě nekoupili? Nebo tvoříš jen pro nové diváky a na tuhle skupinu zapomínáš?',
        2: 'Oslovují tě potenciální klienti sami nebo je musíš oslovit a přesvědčit ty sám?',
        3: 'Víš k jakému člověku mluvíš? Dokážeš popsat jeho největší problémy a touhy?',
    },
    '03 Strop a škálování': {
        1: 'Pokud se teď podíváš na své podnikání, co ti bere nejvíc času?',
        2: 'Jak aktuálně vypadá tvoje nabídka? Máš více možností?',
        3: 'Získáváš klienty z referencí nebo to všechno drží pouze na tvém marketingu?',
    },
};

export const dayQuestion = (bucket: string, day: ProgramDay): string =>
    BUCKET_DAY_QUESTIONS[bucket]?.[day] ?? '';

// Kontext zítřejšího videa do payloadu Beo hooku — agent na konci konverzace říká,
// o čem zítřejší video bude a kolik času si na něj vyhradit ({{next_title}}, {{next_minutes}}).
export function nextDayContext(bucket: string, day: ProgramDay): Record<string, string> {
    if (day >= 3) return {};
    const next = BUCKET_DAY_VIDEOS[bucket]?.[(day + 1) as ProgramDay];
    if (!next) return {};
    return { next_title: next.title, ...(next.minutes ? { next_minutes: String(next.minutes) } : {}) };
}

const dbId = () => process.env.NOTION_FREE_PROGRAM_DB_ID || '';

const headers = () => ({
    Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
});

export const isValidPageId = (id: string) => /^[0-9a-fA-F-]{32,36}$/.test(id);

// IG username: písmena/čísla/tečka/podtržítko, max 30 znaků
export function sanitizeUsername(raw: string | null | undefined): string {
    const u = (raw || '').trim().toLowerCase().replace(/^@/, '');
    return /^[a-z0-9._]{1,30}$/.test(u) ? u : '';
}

type NotionProp = {
    type?: string;
    title?: { plain_text?: string }[];
    rich_text?: { plain_text?: string }[];
    select?: { name?: string } | null;
    number?: number | null;
    date?: { start?: string } | null;
    email?: string | null;
};

const plain = (prop?: NotionProp): string => {
    if (!prop) return '';
    if (prop.type === 'title') return prop.title?.[0]?.plain_text ?? '';
    if (prop.type === 'rich_text') return prop.rich_text?.[0]?.plain_text ?? '';
    if (prop.type === 'select') return prop.select?.name ?? '';
    return '';
};

export type ProgramRow = {
    id: string;
    ig: string;
    stav: string;
    bucket: string;
    email: string;
    createdTime: string;
    dayMax: Record<ProgramDay, number | null>;
    dayDur: Record<ProgramDay, number | null>;
    dayWatched: Record<ProgramDay, string>; // ISO datum dokoukání, '' = ne
    dayOpened: Record<ProgramDay, string>; // ISO datum prvního otevření stránky dne
    dayActivity: Record<ProgramDay, string>; // ISO poslední heartbeat přehrávače (throttled)
    dayQuestionSent: Record<ProgramDay, string>; // ISO odeslání post-watch otázky do Bea, '' = ne
    lastNudge: string;
};

function parseRow(page: Record<string, unknown>): ProgramRow {
    const props = ((page.properties ?? {}) as Record<string, NotionProp>);
    const dayMax = {} as ProgramRow['dayMax'];
    const dayDur = {} as ProgramRow['dayDur'];
    const dayWatched = {} as ProgramRow['dayWatched'];
    const dayOpened = {} as ProgramRow['dayOpened'];
    const dayActivity = {} as ProgramRow['dayActivity'];
    const dayQuestionSent = {} as ProgramRow["dayQuestionSent"];
    for (const d of [1, 2, 3] as ProgramDay[]) {
        dayMax[d] = typeof props[`D${d} max (s)`]?.number === 'number' ? (props[`D${d} max (s)`]!.number as number) : null;
        dayDur[d] = typeof props[`D${d} délka (s)`]?.number === 'number' ? (props[`D${d} délka (s)`]!.number as number) : null;
        dayWatched[d] = props[`D${d} dokoukáno`]?.date?.start ?? '';
        dayOpened[d] = props[`D${d} otevřeno`]?.date?.start ?? '';
        dayActivity[d] = props[`D${d} aktivita`]?.date?.start ?? '';
        dayQuestionSent[d] = props[`D${d} otázka`]?.date?.start ?? '';
    }
    return {
        id: String(page.id ?? ''),
        ig: plain(props['IG']),
        stav: plain(props['Stav']),
        bucket: plain(props['Bucket']),
        email: props['Email']?.email ?? '',
        createdTime: String(page.created_time ?? ''),
        dayMax,
        dayDur,
        dayWatched,
        dayOpened,
        dayActivity,
        dayQuestionSent,
        lastNudge: props['Poslední nudge']?.date?.start ?? '',
    };
}

// GET stránky s retry — Notion API má rate limit ~3 req/s; transient 429/5xx
// nesmí shodit render (stránka by chybně redirectla na landing).
async function getPage(id: string): Promise<Record<string, unknown> | null> {
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const res = await fetch(`${NOTION}/pages/${id}`, { headers: headers(), cache: 'no-store' });
            if (res.ok) return res.json();
            if (res.status === 404 || res.status === 400) return null; // reálně neexistuje
            console.warn(`getPage ${id}: HTTP ${res.status}, pokus ${attempt + 1}`);
        } catch (e) {
            console.warn(`getPage ${id}: fetch fail, pokus ${attempt + 1}`, e);
        }
        await new Promise(r => setTimeout(r, 350 * (attempt + 1)));
    }
    return null;
}

async function patchPage(id: string, properties: Record<string, unknown>): Promise<boolean> {
    const res = await fetch(`${NOTION}/pages/${id}`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ properties }),
    });
    return res.ok;
}

export async function getProgramRow(id: string): Promise<ProgramRow | null> {
    if (!process.env.NOTION_API_KEY || !isValidPageId(id)) return null;
    try {
        const page = await getPage(id);
        return page ? parseRow(page) : null;
    } catch {
        return null;
    }
}

export async function findByUsername(username: string): Promise<ProgramRow | null> {
    if (!dbId()) return null;
    try {
        const res = await fetch(`${NOTION}/databases/${dbId()}/query`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({ filter: { property: 'IG', title: { equals: username } }, page_size: 1 }),
        });
        if (!res.ok) return null;
        const data = await res.json();
        const page = data.results?.[0];
        return page ? parseRow(page) : null;
    } catch {
        return null;
    }
}

export async function findOrCreateByUsername(username: string, zdroj?: string): Promise<ProgramRow | null> {
    const existing = await findByUsername(username);
    if (existing) return existing;
    try {
        const res = await fetch(`${NOTION}/pages`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({
                parent: { database_id: dbId() },
                properties: {
                    IG: { title: [{ text: { content: username } }] },
                    Stav: { select: { name: 'Start' } },
                    ...(zdroj ? { Zdroj: { rich_text: [{ text: { content: zdroj.slice(0, 200) } }] } } : {}),
                },
            }),
        });
        if (!res.ok) return null;
        return parseRow(await res.json());
    } catch {
        return null;
    }
}

// ─── Diagnostika ────────────────────────────────────────────────────────────────

export type Diagnostika = { q1: string; q2: string; q3: string; q4: string; q3jinak?: string };

// Bucket primárně podle Q4 ("co tě drží zpátky"), fallback Q1/Q3 — docs/free-program.md
export function computeBucket(d: Diagnostika): string {
    if (d.q4 === 'A') return '01 Publikum a positioning';
    if (d.q4 === 'B') return '02 Málo prodejů';
    if (d.q4 === 'C') return '03 Strop a škálování';
    if (d.q1 === 'A' || d.q1 === 'D') return '01 Publikum a positioning';
    if (d.q3 === 'A' || d.q3 === 'B') return '02 Málo prodejů';
    return '03 Strop a škálování';
}

export async function saveDiagnostika(id: string, d: Diagnostika): Promise<{ bucket: string } | null> {
    const bucket = computeBucket(d);
    const ok = await patchPage(id, {
        'Q1 Publikum': { select: { name: d.q1 } },
        'Q2 Jasnost profilu': { select: { name: d.q2 } },
        'Q3 Cesta klienta': { select: { name: d.q3 } },
        'Q4 Brzda': { select: { name: d.q4 } },
        ...(d.q3jinak ? { 'Q3 Jinak': { rich_text: [{ text: { content: d.q3jinak.slice(0, 500) } }] } } : {}),
        Bucket: { select: { name: bucket } },
        Stav: { select: { name: 'Den 1' } },
    });
    return ok ? { bucket } : null;
}

// ─── Video progress per den ─────────────────────────────────────────────────────

// Server drží MAX dosaženou vteřinu (stejný princip jako /api/vsl-progress).
// Navíc razítkuje "D{n} aktivita" (poslední heartbeat, throttle 2 min) — z něj
// watch-scan pozná, že divák pustil video a přestal sledovat (odešel ze stránky).
const ACTIVITY_THROTTLE_MS = 2 * 60 * 1000;

export async function updateDayProgress(id: string, day: ProgramDay, second: number, duration?: number): Promise<boolean> {
    const page = await getPage(id);
    if (!page) return false;
    const props = (page.properties ?? {}) as Record<string, NotionProp>;
    const sec = Math.max(0, Math.floor(second));
    const existingMax = props[`D${day} max (s)`]?.number;
    const existingDur = props[`D${day} délka (s)`]?.number;
    const lastActivity = props[`D${day} aktivita`]?.date?.start;

    const patch: Record<string, unknown> = {};
    if (existingMax == null || sec > existingMax) patch[`D${day} max (s)`] = { number: sec };
    if (existingDur == null && typeof duration === 'number' && duration > 0) {
        patch[`D${day} délka (s)`] = { number: Math.round(duration) };
    }
    if (!lastActivity || Date.now() - Date.parse(lastActivity) > ACTIVITY_THROTTLE_MS) {
        patch[`D${day} aktivita`] = { date: { start: new Date().toISOString() } };
    }
    if (Object.keys(patch).length === 0) return true;
    return patchPage(id, patch);
}

// Bez vlastního GETu — stav bere z už načteného row (šetří Notion rate limit).
export async function markDayOpened(row: ProgramRow, day: ProgramDay): Promise<void> {
    try {
        if (row.dayOpened[day]) return;
        await patchPage(row.id, { [`D${day} otevřeno`]: { date: { start: new Date().toISOString() } } });
    } catch { /* best-effort */ }
}

const NEXT_STAV: Record<ProgramDay, string> = { 1: 'Den 2', 2: 'Den 3', 3: 'Dokončeno' };

// Idempotentní: first=true jen při PRVNÍM zápisu dokoukání; sendQuestion=true jen pokud
// post-watch otázka ještě neodešla (mohla odejít dřív přes watch-scan po nedokoukání).
// Dokoukáno + Stav + otázka se zapisují jedním patchem (šetří Notion rate limit).
export async function markDayWatched(
    id: string,
    day: ProgramDay,
): Promise<{ first: boolean; sendQuestion: boolean; ig: string; bucket: string } | null> {
    const page = await getPage(id);
    if (!page) return null;
    const row = parseRow(page);
    if (row.dayWatched[day]) return { first: false, sendQuestion: false, ig: row.ig, bucket: row.bucket };
    const now = new Date().toISOString();
    const sendQuestion = !row.dayQuestionSent[day];
    const ok = await patchPage(id, {
        [`D${day} dokoukáno`]: { date: { start: now } },
        Stav: { select: { name: NEXT_STAV[day] } },
        ...(sendQuestion ? { [`D${day} otázka`]: { date: { start: now } } } : {}),
    });
    return ok ? { first: true, sendQuestion, ig: row.ig, bucket: row.bucket } : null;
}

export async function markQuestionSent(id: string, day: ProgramDay): Promise<void> {
    try {
        await patchPage(id, { [`D${day} otázka`]: { date: { start: new Date().toISOString() } } });
    } catch { /* best-effort */ }
}

// ─── Beo webhooky ───────────────────────────────────────────────────────────────

// Fire-and-forget POST do Beo incoming_webhook (URL v env). Nikdy nesmí shodit request.
export async function fireBeoHook(envName: string, payload: Record<string, unknown>): Promise<void> {
    const url = process.env[envName];
    if (!url) {
        console.warn(`fireBeoHook: ${envName} není nastavené`);
        return;
    }
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
    } catch (e) {
        console.error(`fireBeoHook ${envName} failed`, e);
    }
}

export const dayLink = (day: ProgramDay, username: string) =>
    `${PROGRAM_ORIGIN}/program/den/${day}?u=${encodeURIComponent(username)}`;

// ─── Nudge scan ─────────────────────────────────────────────────────────────────

const HOURS = 3600 * 1000;
const STAV_DAY: Record<string, ProgramDay> = { 'Den 1': 1, 'Den 2': 2, 'Den 3': 3 };

export type NudgeCandidate = { id: string; ig: string; day: ProgramDay; link: string };

// Kandidát: rozehraný den, video nedokoukané, uplynul práh (Den 1: 20 h od registrace,
// Den 2/3: 36 h od dokoukání předchozího dne = 16 h delay v Beu + 20 h), nudge max 1× / 20 h.
export async function listNudgeCandidates(now = Date.now()): Promise<NudgeCandidate[]> {
    if (!dbId()) return [];
    const out: NudgeCandidate[] = [];
    let cursor: string | undefined;
    try {
        do {
            const res = await fetch(`${NOTION}/databases/${dbId()}/query`, {
                method: 'POST',
                headers: headers(),
                body: JSON.stringify({
                    filter: {
                        or: [
                            { property: 'Stav', select: { equals: 'Den 1' } },
                            { property: 'Stav', select: { equals: 'Den 2' } },
                            { property: 'Stav', select: { equals: 'Den 3' } },
                        ],
                    },
                    page_size: 100,
                    ...(cursor ? { start_cursor: cursor } : {}),
                }),
            });
            if (!res.ok) break;
            const data = await res.json();
            for (const page of data.results ?? []) {
                const row = parseRow(page);
                const day = STAV_DAY[row.stav];
                if (!day || !row.ig || row.dayWatched[day]) continue;
                if (row.lastNudge && now - Date.parse(row.lastNudge) < 20 * HOURS) continue;
                const reference = day === 1 ? row.createdTime : row.dayWatched[(day - 1) as ProgramDay];
                const threshold = day === 1 ? 20 * HOURS : 36 * HOURS;
                if (!reference || now - Date.parse(reference) < threshold) continue;
                out.push({ id: row.id, ig: row.ig, day, link: dayLink(day, row.ig) });
            }
            cursor = data.has_more ? data.next_cursor : undefined;
        } while (cursor);
    } catch (e) {
        console.error('listNudgeCandidates failed', e);
    }
    return out;
}

export async function markNudged(id: string): Promise<void> {
    try {
        await patchPage(id, { 'Poslední nudge': { date: { start: new Date().toISOString() } } });
    } catch { /* best-effort */ }
}

// ─── Watch scan (konec sledování bez dokoukání) ─────────────────────────────────

const MIN_WATCH_SECONDS = 15; // "pustil video" = aspoň 15 s poctivého sledování
const ABANDON_AFTER_MS = 15 * 60 * 1000; // 15 min bez heartbeatu = odešel

export type AbandonedCandidate = {
    id: string;
    ig: string;
    day: ProgramDay;
    bucket: string;
    question: string;
    watchedPct: number | null; // % videa, kam se poctivě dostal (null = neznámá délka)
};

// Kandidát: rozehraný den, video pustil (max ≥ 15 s), nedokoukal, otázka neodešla
// a poslední heartbeat je starší než 15 min. Vyžaduje "D{n} aktivita" (razítkuje ho
// updateDayProgress), takže řádky z doby před touto funkcí nikdy nematchnou.
export async function listAbandonedCandidates(now = Date.now()): Promise<AbandonedCandidate[]> {
    if (!dbId()) return [];
    const out: AbandonedCandidate[] = [];
    let cursor: string | undefined;
    try {
        do {
            const res = await fetch(`${NOTION}/databases/${dbId()}/query`, {
                method: 'POST',
                headers: headers(),
                body: JSON.stringify({
                    filter: {
                        or: [
                            { property: 'Stav', select: { equals: 'Den 1' } },
                            { property: 'Stav', select: { equals: 'Den 2' } },
                            { property: 'Stav', select: { equals: 'Den 3' } },
                        ],
                    },
                    page_size: 100,
                    ...(cursor ? { start_cursor: cursor } : {}),
                }),
            });
            if (!res.ok) break;
            const data = await res.json();
            for (const page of data.results ?? []) {
                const row = parseRow(page);
                const day = STAV_DAY[row.stav];
                if (!day || !row.ig || !row.bucket) continue;
                if (row.dayWatched[day] || row.dayQuestionSent[day]) continue;
                const max = row.dayMax[day];
                if (max == null || max < MIN_WATCH_SECONDS) continue;
                const activity = row.dayActivity[day];
                if (!activity) continue;
                const idleMs = now - Date.parse(activity);
                if (idleMs < ABANDON_AFTER_MS) continue;
                const dur = row.dayDur[day];
                out.push({
                    id: row.id,
                    ig: row.ig,
                    day,
                    bucket: row.bucket,
                    question: dayQuestion(row.bucket, day),
                    watchedPct: dur && dur > 0 ? Math.min(100, Math.round((max / dur) * 100)) : null,
                });
            }
            cursor = data.has_more ? data.next_cursor : undefined;
        } while (cursor);
    } catch (e) {
        console.error('listAbandonedCandidates failed', e);
    }
    return out;
}
