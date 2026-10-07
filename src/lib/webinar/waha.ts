// Odesílání WhatsApp zpráv přes WAHA (waha.growbeyond.cz, engine NOWEB, session default).
//
// Zprávy chodí z Timova osobního čísla, takže tady žijí všechny pojistky proti
// tomu, aby to WhatsApp vyhodnotil jako hromadné rozesílání: rozestup mezi
// zprávami napříč běhy, hodinový i denní strop, psaní před odesláním, jen přes
// den a varianty znění místo jednoho identického řetězce.

const BASE = process.env.WAHA_BASE_URL || 'https://waha.growbeyond.cz';
const KEY = process.env.WAHA_API_KEY || '';
const SESSION = process.env.WAHA_SESSION || 'default';

/**
 * Tempo odesílání. Číslo je Timovo osobní, takže zprávy musí chodit tak, jak by
 * je psal člověk: jedna za minutu až dvě, s psaním, jen přes den. Po dávce
 * 57 zpráv za 6 minut (28. 9. 2026) WhatsApp propojené zařízení vyhodil
 * a týden ho nešlo znovu připojit.
 */
export const WA_DAILY_CAP = Number(process.env.WEBINAR_WA_DAILY_CAP || 60);
export const WA_HOURLY_CAP = Number(process.env.WEBINAR_WA_HOURLY_CAP || 20);

/** Nejkratší rozestup mezi dvěma zprávami jednotlivcům, napříč všemi běhy cronu. */
const GAP_MIN_MS = Number(process.env.WEBINAR_WA_GAP_MIN_MS || 60000);
const GAP_MAX_MS = Number(process.env.WEBINAR_WA_GAP_MAX_MS || 150000);

/** Kdy se smí psát lidem, hodiny v Praze. */
const DAY_FROM = 8;
const DAY_TO = 21;

export function wahaConfigured(): boolean {
    return Boolean(KEY);
}

/** Náhodný rozestup, aby odesílání nemělo strojový rytmus. */
export function nextGapMs(): number {
    return GAP_MIN_MS + Math.floor(Math.random() * Math.max(1, GAP_MAX_MS - GAP_MIN_MS));
}

/** Je teď noc, kdy by člověk nikomu nepsal? */
export function quietHours(now = new Date()): boolean {
    const hour = Number(
        new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hourCycle: 'h23', timeZone: 'Europe/Prague' }).format(now),
    );
    return hour < DAY_FROM || hour >= DAY_TO;
}

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

/** Telefon na WhatsApp chatId. Očekává už normalizované číslo s předvolbou. */
export function toChatId(phone: string): string | null {
    const digits = phone.replace(/[^\d]/g, '');
    if (digits.length < 9 || digits.length > 15) return null;
    return `${digits}@c.us`;
}

type SendResult = { ok: true; id?: string } | { ok: false; error: string };

async function call(path: string, body: Record<string, unknown>) {
    const res = await fetch(`${BASE}/api/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Api-Key': KEY },
        body: JSON.stringify({ session: SESSION, ...body }),
        signal: AbortSignal.timeout(20000),
    });
    return res;
}

/**
 * Pošle text na číslo jako člověk: přečte chat, chvíli píše, pak odešle.
 * Délka psaní odpovídá délce zprávy. Best effort, nikdy nehodí.
 */
export async function sendText(phone: string, text: string): Promise<SendResult> {
    if (!wahaConfigured()) return { ok: false, error: 'WAHA_API_KEY chybí' };
    const chatId = phone.includes('@') ? phone : toChatId(phone);
    if (!chatId) return { ok: false, error: `neplatné číslo ${phone}` };

    try {
        await call('sendSeen', { chatId }).catch(() => null);
        await call('startTyping', { chatId }).catch(() => null);
        await sleep(Math.min(9000, Math.max(2500, text.length * 45)));
        await call('stopTyping', { chatId }).catch(() => null);

        const res = await call('sendText', { chatId, text });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) return { ok: false, error: `WAHA ${res.status} ${JSON.stringify(payload).slice(0, 200)}` };
        return { ok: true, id: payload?.id?._serialized || payload?.id };
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
}

/** Je session spárovaná a schopná posílat? */
export async function sessionWorking(): Promise<boolean> {
    if (!wahaConfigured()) return false;
    try {
        const res = await fetch(`${BASE}/api/sessions/${SESSION}`, {
            headers: { 'X-Api-Key': KEY },
            signal: AbortSignal.timeout(8000),
            cache: 'no-store',
        });
        if (!res.ok) return false;
        const s = await res.json();
        return s?.status === 'WORKING';
    } catch {
        return false;
    }
}

/**
 * Vybere variantu znění podle registrace, ať nejde tisíckrát za sebou
 * identický řetězec. Deterministicky, aby se stejnému člověku držel styl.
 */
export function pickVariant(seed: string, count: number): number {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    return h % count;
}

/**
 * Pozná v příchozí zprávě žádost o odhlášení. O možnosti se ve zprávách
 * nepíše, ale kdo napíše stop, vypadne ze všech dalších.
 */
export function isOptOut(text: string): boolean {
    return /^\s*(stop|nezajima|nezajímá|odhlas|odhlaš|nechci|unsubscribe)\b/i.test(text.trim());
}
