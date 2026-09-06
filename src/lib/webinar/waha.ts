// Odesílání WhatsApp zpráv přes WAHA (waha.growbeyond.cz, engine NOWEB, session default).
//
// Zprávy chodí z Timova osobního čísla, takže tady žijí všechny pojistky proti
// tomu, aby to WhatsApp vyhodnotil jako hromadné rozesílání: rozestup mezi
// zprávami, denní strop nových konverzací a varianty znění místo jednoho
// identického řetězce.

const BASE = process.env.WAHA_BASE_URL || 'https://waha.growbeyond.cz';
const KEY = process.env.WAHA_API_KEY || '';
const SESSION = process.env.WAHA_SESSION || 'default';

/** Kolik WhatsApp zpráv smí odejít za 24 hodin. Konzervativní strop. */
export const WA_DAILY_CAP = Number(process.env.WEBINAR_WA_DAILY_CAP || 150);

/** Rozestup mezi zprávami v jednom běhu cronu, v milisekundách. */
const GAP_MIN_MS = Number(process.env.WEBINAR_WA_GAP_MIN_MS || 20000);
const GAP_MAX_MS = Number(process.env.WEBINAR_WA_GAP_MAX_MS || 40000);

export function wahaConfigured(): boolean {
    return Boolean(KEY);
}

/** Náhodná pauza v rozmezí, aby odesílání nemělo strojový rytmus. */
export function nextGapMs(): number {
    return GAP_MIN_MS + Math.floor(Math.random() * Math.max(1, GAP_MAX_MS - GAP_MIN_MS));
}

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

/** Telefon na WhatsApp chatId. Očekává už normalizované číslo s předvolbou. */
export function toChatId(phone: string): string | null {
    const digits = phone.replace(/[^\d]/g, '');
    if (digits.length < 9 || digits.length > 15) return null;
    return `${digits}@c.us`;
}

type SendResult = { ok: true; id?: string } | { ok: false; error: string };

/** Pošle text na číslo. Best effort, nikdy nehodí. */
export async function sendText(phone: string, text: string): Promise<SendResult> {
    if (!wahaConfigured()) return { ok: false, error: 'WAHA_API_KEY chybí' };
    const chatId = toChatId(phone);
    if (!chatId) return { ok: false, error: `neplatné číslo ${phone}` };

    try {
        const res = await fetch(`${BASE}/api/sendText`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Api-Key': KEY },
            body: JSON.stringify({ session: SESSION, chatId, text }),
            signal: AbortSignal.timeout(20000),
        });
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

/** Text, kterým člověk odhlásí další WhatsApp zprávy. */
export const OPT_OUT_HINT = 'Kdyby ti zprávy nesedly, napiš stop a už nic nepošlu';

/** Pozná v příchozí zprávě žádost o odhlášení. */
export function isOptOut(text: string): boolean {
    return /^\s*(stop|nezajima|nezajímá|odhlas|odhlaš|nechci|unsubscribe)\b/i.test(text.trim());
}
