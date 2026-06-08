import { promises as dns } from 'dns';
import disposableList from './disposable-domains.json';

// Instantní validace kontaktů ve formuláři. Cíl: odfiltrovat zjevně vymyšlené
// nebo nedoručitelné údaje (asdf@asdf, neexistující doména, dočasná schránka,
// neexistující IG profil), aniž bychom kdy zablokovali reálného leada.
// U nejistoty (rate-limit, výpadek) pouštíme dál (fail-open).

const DISPOSABLE = new Set(disposableList as string[]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const IG_RE = /^[a-zA-Z0-9._]{1,30}$/;

// Placeholder / „test" pokusy
const PLACEHOLDER_DOMAINS = new Set([
    'test.com', 'test.cz', 'test.test', 'test.email', 'test.io', 'test.org',
    'example.com', 'example.org', 'example.net', 'asdf.com', 'mail.com',
]);
const looksLikeTest = (s: string): boolean => /test/i.test(s);

export type EmailDetails = {
    ok: boolean;
    reason?: string;
    email: string;
    domain: string;
    formatValid: boolean;
    placeholder: boolean;
    disposable: boolean;
    domainAcceptsMail: boolean | null; // null = nekontrolováno
    provider: { used: boolean; name?: string; status?: string };
};

export type IgDetails = {
    ok: boolean;
    reason?: string;
    handle: string;
    formatValid: boolean;
    placeholder: boolean;
    status: 'exists' | 'not_found' | 'uncertain';
    httpStatus?: number;
};

async function domainAcceptsMail(domain: string): Promise<boolean> {
    try {
        const mx = await dns.resolveMx(domain);
        if (mx && mx.length > 0) return true;
    } catch { /* zkus A/AAAA */ }
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

// Volitelné ověření doručitelnosti / existence schránky přes externí service.
// Zapne se přidáním API klíče do env (ZeroBounce / Reoon / AbstractAPI).
// Vrací: 'block' (nedoručitelné/disposable), 'ok' (doručitelné), nebo null
// (nepoužito / nejisté → fail-open).
async function verifyEmailWithService(
    email: string
): Promise<{ verdict: 'ok' | 'block' | null; name?: string; status?: string }> {
    try {
        const zb = process.env.ZEROBOUNCE_API_KEY;
        if (zb) {
            const r = await fetch(
                `https://api.zerobounce.net/v2/validate?api_key=${zb}&email=${encodeURIComponent(email)}`,
                { signal: AbortSignal.timeout(6000) }
            );
            if (!r.ok) return { verdict: null, name: 'zerobounce' };
            const d = await r.json();
            const status: string = d.status;
            const block = ['invalid', 'spamtrap', 'abuse', 'do_not_mail'].includes(status);
            return { verdict: block ? 'block' : 'ok', name: 'zerobounce', status };
        }

        const reoon = process.env.REOON_API_KEY;
        if (reoon) {
            const r = await fetch(
                `https://emailverifier.reoon.com/api/v1/verify?email=${encodeURIComponent(email)}&key=${reoon}&mode=power`,
                { signal: AbortSignal.timeout(8000) }
            );
            if (!r.ok) return { verdict: null, name: 'reoon' };
            const d = await r.json();
            const status: string = d.status;
            const block = status === 'invalid' || d.is_disposable === true || d.is_safe_to_send === false;
            return { verdict: block ? 'block' : 'ok', name: 'reoon', status };
        }

        const abstract = process.env.ABSTRACT_EMAIL_API_KEY;
        if (abstract) {
            const r = await fetch(
                `https://emailvalidation.abstractapi.com/v1/?api_key=${abstract}&email=${encodeURIComponent(email)}`,
                { signal: AbortSignal.timeout(6000) }
            );
            if (!r.ok) return { verdict: null, name: 'abstract' };
            const d = await r.json();
            const status: string = d.deliverability;
            const block = status === 'UNDELIVERABLE' || d.is_disposable_email?.value === true;
            return { verdict: block ? 'block' : 'ok', name: 'abstract', status };
        }
    } catch {
        return { verdict: null };
    }
    return { verdict: null };
}

export async function validateEmail(raw: string): Promise<EmailDetails> {
    const email = (raw || '').trim().toLowerCase();
    const domain = email.includes('@') ? email.split('@')[1] : '';

    const base: EmailDetails = {
        ok: true,
        email,
        domain,
        formatValid: EMAIL_RE.test(email),
        placeholder: false,
        disposable: false,
        domainAcceptsMail: null,
        provider: { used: false },
    };

    if (!base.formatValid) {
        return { ...base, ok: false, reason: 'Zadej platný e-mail (např. jmeno@gmail.com).' };
    }

    const localPart = email.split('@')[0];
    if (looksLikeTest(localPart) || PLACEHOLDER_DOMAINS.has(domain)) {
        return { ...base, ok: false, placeholder: true, reason: 'Zadej prosím svůj reálný e-mail.' };
    }

    if (DISPOSABLE.has(domain)) {
        return { ...base, ok: false, disposable: true, reason: 'Použij prosím svůj reálný e-mail, ne dočasnou schránku.' };
    }

    const accepts = await domainAcceptsMail(domain).catch(() => true);
    base.domainAcceptsMail = accepts;
    if (!accepts) {
        return { ...base, ok: false, reason: 'Tuhle e-mailovou doménu se nepodařilo ověřit. Zkontroluj překlep.' };
    }

    // Volitelné: ověření existence schránky přes service (pokud je klíč)
    const svc = await verifyEmailWithService(email);
    if (svc.verdict) {
        base.provider = { used: true, name: svc.name, status: svc.status };
        if (svc.verdict === 'block') {
            return { ...base, ok: false, reason: 'Tenhle e-mail se nepodařilo ověřit jako reálný. Zkontroluj ho prosím.' };
        }
    } else if (svc.name) {
        base.provider = { used: false, name: svc.name, status: 'unchecked' };
    }

    return base;
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

// ── IG existence: cache + proxy ─────────────────────────────────────────────
type IgCached = { ok: boolean; status: 'exists' | 'not_found'; reason?: string };
const IG_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 h
const igCache = new Map<string, { res: IgCached; exp: number }>();

function igCacheGet(handle: string): IgCached | null {
    const hit = igCache.get(handle.toLowerCase());
    if (hit && hit.exp > Date.now()) return hit.res;
    if (hit) igCache.delete(handle.toLowerCase());
    return null;
}
function igCacheSet(handle: string, res: IgCached) {
    // pojistka proti neomezenému růstu
    if (igCache.size > 5000) igCache.clear();
    igCache.set(handle.toLowerCase(), { res, exp: Date.now() + IG_CACHE_TTL_MS });
}

const IG_HEADERS = (handle: string): Record<string, string> => ({
    'x-ig-app-id': '936619743392459',
    'x-asbd-id': '129477',
    'x-ig-www-claim': '0',
    'x-requested-with': 'XMLHttpRequest',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    accept: '*/*',
    'accept-language': 'en-US,en;q=0.9',
    referer: `https://www.instagram.com/${encodeURIComponent(handle)}/`,
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
});

// Vrátí status + JSON profilu. Přes ScrapingBee (rezidenční proxy, obchází 429
// z datacentra) pokud je klíč; jinak přímý dotaz (funguje z rezidenční IP).
// Pozn.: bez plné sady browser-XHR hlaviček vrací IG na Node fetch HTTP 400.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchIgProfile(handle: string): Promise<{ status: number; json: any }> {
    const target = `https://i.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(handle)}`;
    const beeKey = process.env.SCRAPINGBEE_API_KEY;

    if (beeKey) {
        // ScrapingBee přeposílá naše hlavičky s prefixem Spb-; transparent_status_code
        // vrátí původní 404/200 místo vlastního stavu.
        const params = new URLSearchParams({
            api_key: beeKey,
            url: target,
            render_js: 'false',
            premium_proxy: 'true',
            transparent_status_code: 'true',
            forward_headers: 'true',
        });
        const spbHeaders: Record<string, string> = {};
        for (const [k, v] of Object.entries(IG_HEADERS(handle))) spbHeaders[`Spb-${k}`] = v;

        const res = await fetch(`https://app.scrapingbee.com/api/v1/?${params.toString()}`, {
            headers: spbHeaders,
            signal: AbortSignal.timeout(15000),
        });
        const json = await res.json().catch(() => null);
        return { status: res.status, json };
    }

    // Fallback: přímý dotaz
    const res = await fetch(target, { headers: IG_HEADERS(handle), signal: AbortSignal.timeout(5000) });
    const json = await res.json().catch(() => null);
    return { status: res.status, json };
}

export async function validateInstagram(raw: string): Promise<IgDetails> {
    const handle = normalizeIg(raw);

    const base: IgDetails = {
        ok: true,
        handle,
        formatValid: IG_RE.test(handle) && !handle.includes('..'),
        placeholder: false,
        status: 'uncertain',
    };

    if (!base.formatValid) {
        return { ...base, ok: false, status: 'not_found', reason: 'Zadej platný Instagram username (např. @creationwithtim).' };
    }

    if (looksLikeTest(handle)) {
        return { ...base, ok: false, placeholder: true, status: 'not_found', reason: 'Zadej prosím svůj reálný Instagram.' };
    }

    // Cache: stejný handle neověřuj opakovaně (šetří proxy kredity i 429)
    const cached = igCacheGet(handle);
    if (cached) {
        return { ...base, ...cached };
    }

    try {
        const { status, json } = await fetchIgProfile(handle);
        base.httpStatus = status;

        if (status === 404) {
            const res = { ok: false, status: 'not_found' as const, reason: 'Tenhle Instagram účet jsme nenašli. Zkontroluj username.' };
            igCacheSet(handle, res);
            return { ...base, ...res };
        }

        if (status >= 200 && status < 300) {
            const user = json?.data?.user;
            if (user === null) {
                const res = { ok: false, status: 'not_found' as const, reason: 'Tenhle Instagram účet jsme nenašli. Zkontroluj username.' };
                igCacheSet(handle, res);
                return { ...base, ...res };
            }
            if (user) {
                const res = { ok: true, status: 'exists' as const };
                igCacheSet(handle, res);
                return { ...base, ...res };
            }
            return { ...base, ok: true, status: 'uncertain' };
        }

        // 401/403/429/5xx → nejisté → fail-open (necachujeme)
        return { ...base, ok: true, status: 'uncertain' };
    } catch {
        return { ...base, ok: true, status: 'uncertain' };
    }
}
