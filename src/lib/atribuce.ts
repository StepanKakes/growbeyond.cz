import { UTM_KEYS, captureUtmFromUrl, persistUtm, setClarityTags, getStoredUtm } from '@/lib/utm';

// Odkud člověk přišel, do detailu.
//
// Samotné UTM řeknou „z Instagramu, placené". To nestačí, když se má
// rozhodovat, kterou reklamu vypnout a který příspěvek zopakovat. Proto se
// vedle UTM sbírá i to, co Meta doplní do odkazu sama (id kampaně, sady a
// reklamy, umístění), stopa z Bea (id prokliku z přesměrování /l/ a cookie
// sledovaného odkazu) a odkud prohlížeč přišel, když v adrese nic nebylo.
//
// První a poslední dotek se drží zvlášť: reklama může člověka přivést poprvé,
// registruje se ale až z odkazu v DM od Bea. Obojí je pravda a obojí je vidět.

/** Parametry, které Meta doplní do adresy reklamy přes {{campaign.id}} a spol. */
export const AD_KEYS = ['campaign_id', 'adset_id', 'ad_id', 'placement', 'site_source'] as const;

/** Poslední dotek, tak jak se posílá na server. */
export const TOUCH_KEYS = [
    ...UTM_KEYS,
    ...AD_KEYS,
    'fbclid',
    'beo_klik',
    'beo_odkaz',
    'referrer',
    'landing',
    'at',
] as const;

/** První dotek se ukládá s předponou, aby seděl vedle posledního v jednom objektu. */
export const FIRST_KEYS = [
    'first_source',
    'first_medium',
    'first_campaign',
    'first_content',
    'first_term',
    'first_ad_id',
    'first_beo_klik',
    'first_referrer',
    'first_landing',
    'first_at',
] as const;

export const ATRIBUCE_KEYS = [...TOUCH_KEYS, ...FIRST_KEYS] as const;

export type Atribuce = Partial<Record<(typeof ATRIBUCE_KEYS)[number], string>>;
type Dotek = Partial<Record<(typeof TOUCH_KEYS)[number], string>>;

const STORAGE_KEY = 'gb_atribuce';
const MAX_LEN = 300;

/** Parametr v adrese → klíč, pod kterým se ukládá. Meta posílá site_source_name, my držíme kratší jméno. */
const URL_ALIASES: Record<string, (typeof TOUCH_KEYS)[number]> = {
    campaign_id: 'campaign_id',
    adset_id: 'adset_id',
    ad_id: 'ad_id',
    placement: 'placement',
    site_source: 'site_source',
    site_source_name: 'site_source',
    fbclid: 'fbclid',
    beo: 'beo_klik',
};

const cookie = (name: string): string | undefined => {
    if (typeof document === 'undefined') return undefined;
    const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
    return m ? decodeURIComponent(m[1]) : undefined;
};

/** Cizí odkazovač bez protokolu a bez parametrů. Vlastní web se neuvádí. */
const externiReferrer = (): string | undefined => {
    if (typeof document === 'undefined' || !document.referrer) return undefined;
    try {
        const u = new URL(document.referrer);
        if (u.hostname === window.location.hostname) return undefined;
        return `${u.hostname}${u.pathname === '/' ? '' : u.pathname}`.slice(0, MAX_LEN);
    } catch {
        return undefined;
    }
};

const aktualniDotek = (): { dotek: Dotek; explicitni: boolean } => {
    const dotek: Dotek = {};
    const params = new URLSearchParams(window.location.search);
    let explicitni = false;

    const utm = captureUtmFromUrl();
    for (const k of UTM_KEYS) if (utm[k]) { dotek[k] = utm[k]!.slice(0, MAX_LEN); explicitni = true; }

    for (const [param, key] of Object.entries(URL_ALIASES)) {
        const v = params.get(param);
        if (v) { dotek[key] = v.slice(0, MAX_LEN); explicitni = true; }
    }

    // Cookie ze sledovaného odkazu Bea platí na celé doméně growbeyond.cz.
    // Nový odkaz = nový dotek, i když adresa nic nenese.
    const beoOdkaz = cookie('beo_click');
    if (beoOdkaz) dotek.beo_odkaz = beoOdkaz.slice(0, 64);

    const ref = externiReferrer();
    if (ref) { dotek.referrer = ref; explicitni = true; }

    dotek.landing = `${window.location.pathname}${window.location.search}`.slice(0, MAX_LEN);
    dotek.at = new Date().toISOString();

    return { dotek, explicitni };
};

type Ulozeno = { first?: Dotek; last?: Dotek };

const nacti = (): Ulozeno => {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as Ulozeno) : {};
    } catch {
        return {};
    }
};

/**
 * Zavolat jednou při načtení stránky, dřív než měřicí skript Bea uklidí
 * `?beo=` z adresy. Drží i staré `gb_utm`, na které spoléhají ostatní stránky.
 */
export function initAtribuce(): void {
    if (typeof window === 'undefined') return;

    const { dotek, explicitni } = aktualniDotek();
    const utm = captureUtmFromUrl();
    if (Object.keys(utm).length > 0) persistUtm(utm);
    setClarityTags(Object.keys(utm).length > 0 ? utm : getStoredUtm());

    try {
        const ulozeno = nacti();
        const novyOdkaz = Boolean(dotek.beo_odkaz) && dotek.beo_odkaz !== ulozeno.last?.beo_odkaz;
        const next: Ulozeno = { ...ulozeno };
        if (!next.first) next.first = dotek;
        if (explicitni || novyOdkaz || !next.last) next.last = dotek;
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch { /* soukromý režim bez úložiště, pošle se aspoň to, co je v adrese */ }
}

/** Poslední a první dotek v jednom plochém objektu, připravený k odeslání. */
export function getAtribuce(): Atribuce {
    if (typeof window === 'undefined') return {};
    let ulozeno = nacti();
    if (!ulozeno.last) ulozeno = { first: aktualniDotek().dotek, last: aktualniDotek().dotek };

    const out: Atribuce = { ...ulozeno.last };
    const f = ulozeno.first ?? ulozeno.last ?? {};
    if (f.utm_source) out.first_source = f.utm_source;
    if (f.utm_medium) out.first_medium = f.utm_medium;
    if (f.utm_campaign) out.first_campaign = f.utm_campaign;
    if (f.utm_content) out.first_content = f.utm_content;
    if (f.utm_term) out.first_term = f.utm_term;
    if (f.ad_id) out.first_ad_id = f.ad_id;
    if (f.beo_klik) out.first_beo_klik = f.beo_klik;
    if (f.referrer) out.first_referrer = f.referrer;
    if (f.landing) out.first_landing = f.landing;
    if (f.at) out.first_at = f.at;
    return out;
}

/* ------------------------------------------------------------------ *
 * Server: očištění vstupu a odvození kanálu. Bez závislosti na window.
 * ------------------------------------------------------------------ */

/** Nechá jen známé klíče se stringovou hodnotou, oříznuté na rozumnou délku. */
export function ocistiAtribuci(input: unknown): Atribuce {
    const out: Atribuce = {};
    if (!input || typeof input !== 'object') return out;
    const src = input as Record<string, unknown>;
    for (const k of ATRIBUCE_KEYS) {
        const v = src[k];
        if (typeof v === 'string' && v) out[k] = v.slice(0, MAX_LEN);
    }
    return out;
}

export type Kanal = 'reklama' | 'beo' | 'youtube' | 'instagram' | 'facebook' | 'google' | 'email' | 'primo' | 'jiny';

const KANAL_POPISEK: Record<Kanal, string> = {
    reklama: 'Reklama',
    beo: 'Beo (DM)',
    youtube: 'YouTube',
    instagram: 'Instagram bez UTM',
    facebook: 'Facebook bez UTM',
    google: 'Google',
    email: 'E-mail',
    primo: 'Přímo nebo neznámo',
    jiny: 'Jiné',
};

export const kanalPopisek = (k: Kanal) => KANAL_POPISEK[k];

/**
 * Kanál posledního doteku. Pořadí záleží: reklama má id, které nic jiného
 * nenese; Beo se pozná podle stopy z /l/ nebo podle medium=dm; zbytek podle
 * utm_source a nakonec podle odkazovače.
 */
export function kanal(a: Partial<Record<string, string>> | null | undefined): Kanal {
    if (!a) return 'primo';
    const src = (a.utm_source || '').toLowerCase();
    const med = (a.utm_medium || '').toLowerCase();
    const ref = (a.referrer || '').toLowerCase();

    if (a.ad_id || a.adset_id || a.campaign_id || med === 'paid' || med === 'cpc' || med === 'ads') return 'reklama';
    if (a.beo_klik || a.beo_odkaz || med === 'dm') return 'beo';
    if (src === 'youtube' || src === 'yt' || ref.includes('youtube.') || ref.includes('youtu.be')) return 'youtube';
    if (med === 'email' || src === 'plunk' || src === 'newsletter') return 'email';
    if (a.fbclid && !src) return 'reklama';
    if (src === 'instagram' || src === 'ig') return 'instagram';
    if (src === 'facebook' || src === 'fb') return 'facebook';
    if (src) return 'jiny';
    if (ref.includes('instagram.')) return 'instagram';
    if (ref.includes('facebook.') || ref.startsWith('lm.facebook') || ref.startsWith('l.facebook')) return 'facebook';
    if (ref.includes('google.')) return 'google';
    if (ref) return 'jiny';
    return 'primo';
}

/** Sady reklam z doby, kdy odkaz nesl jen id sady v utm_term. Nové odkazy posílají jméno. */
export const ADSET_NAMES: Record<string, string> = {
    '120251961371950312': 'WEB2030 | STUDENE | stories',
    '120251961433460312': 'WEB2030 | TEPLE | stories',
};

/** Jméno sady reklam: z utm_term (jméno nebo staré id), nebo z adset_id. */
export function adsetNazev(a: Partial<Record<string, string>>): string | undefined {
    const term = a.utm_term;
    if (term && !/^\d{10,}$/.test(term)) return term;
    const id = a.adset_id || term;
    if (id) return ADSET_NAMES[id] || `sada ${id}`;
    // Nejstarší odkazy kampaně web2030 nesly jen jméno reklamy; její předpona
    // říká, ve které sadě běžela (s = studené, t = teplé publikum).
    if (a.utm_campaign === 'web2030' && a.utm_content) {
        if (a.utm_content.startsWith('s-')) return ADSET_NAMES['120251961371950312'];
        if (a.utm_content.startsWith('t-')) return ADSET_NAMES['120251961433460312'];
    }
    return undefined;
}
