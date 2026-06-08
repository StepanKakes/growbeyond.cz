import { promises as dns } from 'dns';

// Instantní „block-nonsense" validace kontaktů. Cílem je odfiltrovat zjevně
// vymyšlené údaje (asdf@asdf, neexistující doména, fake IG handle), NE zaručit
// vlastnictví. U nejistoty (rate-limit, výpadek) raději pustíme dál
// (fail-open), ať nikdy nezablokujeme reálného leada.

export type FieldResult = { ok: boolean; reason?: string };

// Běžné dočasné / odpadové e-mailové schránky
const DISPOSABLE_DOMAINS = new Set([
    'mailinator.com', 'guerrillamail.com', 'guerrillamail.info', 'sharklasers.com',
    '10minutemail.com', '10minutemail.net', 'tempmail.com', 'temp-mail.org',
    'throwawaymail.com', 'yopmail.com', 'getnada.com', 'nada.email', 'maildrop.cc',
    'trashmail.com', 'dispostable.com', 'fakeinbox.com', 'mailnesia.com',
    'mintemail.com', 'mohmal.com', 'spamgourmet.com', 'tempinbox.com',
    'mytemp.email', 'emailondeck.com', 'mailcatch.com', 'tempmailo.com',
    'moakt.com', 'inboxkitten.com', 'burnermail.io', 'mailtemp.net',
    'discard.email', 'tmail.com', 'tmpmail.org', 'spam4.me', 'grr.la',
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const IG_RE = /^[a-zA-Z0-9._]{1,30}$/;

async function domainAcceptsMail(domain: string): Promise<boolean> {
    try {
        const mx = await dns.resolveMx(domain);
        if (mx && mx.length > 0) return true;
    } catch { /* zkus dál A/AAAA */ }
    try {
        const a = await dns.resolve(domain);
        if (a && a.length > 0) return true;
    } catch { /* … */ }
    try {
        const aaaa = await dns.resolve6(domain);
        if (aaaa && aaaa.length > 0) return true;
    } catch { /* … */ }
    return false;
}

export async function validateEmail(raw: string): Promise<FieldResult> {
    const email = (raw || '').trim().toLowerCase();

    if (!EMAIL_RE.test(email)) {
        return { ok: false, reason: 'Zadej platný e-mail (např. jmeno@gmail.com).' };
    }

    const domain = email.split('@')[1];

    if (DISPOSABLE_DOMAINS.has(domain)) {
        return { ok: false, reason: 'Použij prosím svůj reálný e-mail, ne dočasnou schránku.' };
    }

    // Doména musí reálně přijímat poštu (MX, případně A/AAAA fallback)
    const accepts = await domainAcceptsMail(domain).catch(() => true); // fail-open na DNS chybě
    if (!accepts) {
        return { ok: false, reason: 'Tuhle e-mailovou doménu se nepodařilo ověřit. Zkontroluj překlep.' };
    }

    return { ok: true };
}

export function normalizeIg(raw: string): string {
    return (raw || '')
        .trim()
        .replace(/^@+/, '')
        .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
        .replace(/\/+$/, '')
        .split(/[/?#]/)[0]
        .trim();
}

export async function validateInstagram(raw: string): Promise<FieldResult> {
    const handle = normalizeIg(raw);

    if (!IG_RE.test(handle) || handle.includes('..')) {
        return { ok: false, reason: 'Zadej platný Instagram username (např. @creationwithtim).' };
    }

    // Best-effort kontrola existence. Na 404 blokujeme, na cokoliv nejistého
    // (rate-limit, blok, timeout) pouštíme dál.
    try {
        const res = await fetch(
            `https://i.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(handle)}`,
            {
                headers: {
                    'x-ig-app-id': '936619743392459',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
                    accept: '*/*',
                    'accept-language': 'en-US,en;q=0.9',
                },
                signal: AbortSignal.timeout(4500),
            }
        );

        if (res.status === 404) {
            return { ok: false, reason: 'Tenhle Instagram účet jsme nenašli. Zkontroluj username.' };
        }

        if (res.ok) {
            const data = await res.json().catch(() => null);
            const user = data?.data?.user;
            if (user === null) {
                return { ok: false, reason: 'Tenhle Instagram účet jsme nenašli. Zkontroluj username.' };
            }
            // user existuje, nebo nejednoznačná odpověď → pustíme dál
            return { ok: true };
        }

        // 401/429/403/5xx → nejisté → fail-open
        return { ok: true };
    } catch {
        // timeout / síťová chyba → fail-open
        return { ok: true };
    }
}
