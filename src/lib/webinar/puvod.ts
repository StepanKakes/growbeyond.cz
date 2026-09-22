import { adsetNazev, kanal, kanalPopisek, type Kanal } from '@/lib/atribuce';
import type { BeoPuvod, PageViewRow, Registration } from './db';

// Původ jedné registrace, poskládaný z toho, co web uložil (UTM, id z Mety,
// stopa z Bea, odkazovač) a z toho, co o člověku ví Beo (lead, komentář,
// story, DM). Přehled z toho staví rozpad po kanálech, reklamách a
// příspěvcích; seznam registrovaných z toho čte řádek „Zdroj".

export type Puvod = {
    kanal: Kanal;
    /** Krátký popis do řádku seznamu, např. „Reklama · s-b5-uvod-diagnoza". */
    kratce: string;
    kampan?: string;
    sada?: string;
    reklama?: string;
    /** Co v Beovi člověka přivedlo, když to jde dohledat. */
    beo?: BeoPuvod;
    /** První dotek, když se liší od posledního. */
    prvni?: { kanal: Kanal; popis: string; kdy?: string };
};

export const BEO_DRUH: Record<BeoPuvod['druh'], string> = {
    komentar: 'komentář',
    story: 'odpověď na story',
    dm: 'klíčové slovo v DM',
};

/** Popis doteku bez Bea: reklama jménem, jinak zdroj nebo odkazovač. */
function popisDoteku(a: Record<string, string | undefined>, k: Kanal): string {
    if (k === 'reklama') return a.utm_content || adsetNazev(a) || a.utm_campaign || 'reklama';
    if (k === 'beo') return 'DM od Bea';
    if (k === 'youtube') return a.utm_content ? `video ${a.utm_content}` : 'YouTube';
    if (a.utm_source) return [a.utm_source, a.utm_medium, a.utm_campaign].filter(Boolean).join(' / ');
    if (a.referrer) return a.referrer;
    return kanalPopisek(k);
}

/**
 * Spáruje registrace s tím, co vrátilo Beo. Přednost má přesná stopa
 * (id prokliku, pak id odkazu), e-mail je záloha pro starší registrace.
 */
export function sparujBeo(registrace: Registration[], puvody: BeoPuvod[]): Map<string, BeoPuvod> {
    const podleKliku = new Map<string, BeoPuvod>();
    const podleOdkazu = new Map<string, BeoPuvod>();
    const podleEmailu = new Map<string, BeoPuvod>();
    for (const p of puvody) {
        if (p.klik_id) podleKliku.set(p.klik_id, p);
        if (p.odkaz_id && !podleOdkazu.has(p.odkaz_id)) podleOdkazu.set(p.odkaz_id, p);
        if (p.email) podleEmailu.set(p.email.toLowerCase(), p);
    }
    const out = new Map<string, BeoPuvod>();
    for (const r of registrace) {
        const a = r.utm || {};
        const p =
            (a.beo_klik && podleKliku.get(a.beo_klik)) ||
            (a.beo_odkaz && podleOdkazu.get(a.beo_odkaz)) ||
            podleEmailu.get(r.email.toLowerCase());
        if (p) out.set(r.id, p);
    }
    return out;
}

export function puvodRegistrace(r: Registration, beo?: BeoPuvod): Puvod {
    const a = (r.utm || {}) as Record<string, string | undefined>;
    let k = kanal(a);
    // Beo ví o člověku víc než UTM: když ho dohledal a poslední dotek není
    // reklama s vlastním id, je to jeho registrace.
    if (beo && k !== 'reklama') k = 'beo';

    const out: Puvod = { kanal: k, kratce: '' };

    if (k === 'reklama') {
        out.kampan = a.utm_campaign || a.campaign_id;
        out.sada = adsetNazev(a);
        out.reklama = a.utm_content || (a.ad_id ? `reklama ${a.ad_id}` : undefined);
        out.kratce = `Reklama · ${out.reklama || out.sada || out.kampan || 'bez jména'}`;
    } else if (k === 'beo') {
        out.kratce = beo
            ? `Beo · ${BEO_DRUH[beo.druh]}${beo.ig_username ? ` · @${beo.ig_username}` : ''}`
            : 'Beo · DM';
    } else {
        out.kratce = `${kanalPopisek(k)}${a.utm_content || a.referrer ? ` · ${popisDoteku(a, k)}` : ''}`;
    }
    if (beo) out.beo = beo;

    // První dotek, když ho web zachytil a liší se od posledního.
    if (a.first_at && a.first_at !== a.at) {
        const prvni = {
            utm_source: a.first_source,
            utm_medium: a.first_medium,
            utm_campaign: a.first_campaign,
            utm_content: a.first_content,
            utm_term: a.first_term,
            ad_id: a.first_ad_id,
            beo_klik: a.first_beo_klik,
            referrer: a.first_referrer,
        };
        const pk = kanal(prvni);
        const popis = popisDoteku(prvni, pk);
        if (pk !== k || popis !== popisDoteku(a, k)) out.prvni = { kanal: pk, popis, kdy: a.first_at };
    }

    return out;
}

/* ------------------------------------------------------------------ *
 * Rozpady
 * ------------------------------------------------------------------ */

export type Radek = {
    klic: string;
    popisek: string;
    zobrazeni: number;
    registrace: number;
    dotaznik: number;
    horke: number;
    /** Odsazení ve stromu reklam: 0 kampaň, 1 sada, 2 reklama. */
    uroven?: number;
    odkaz?: string;
    nahled?: string;
    lide?: { jmeno: string; odkaz?: string }[];
};

const zobrazeniKanalu = (views: PageViewRow[]) => {
    const m = new Map<Kanal, number>();
    for (const v of views) {
        const k = kanal(v.utm || {});
        m.set(k, (m.get(k) ?? 0) + 1);
    }
    return m;
};

export function rozpadKanalu(
    registrace: Registration[],
    puvody: Map<string, Puvod>,
    views: PageViewRow[],
    horky: (r: Registration) => boolean,
): Radek[] {
    const zobr = zobrazeniKanalu(views);
    const m = new Map<Kanal, Radek>();
    const radek = (k: Kanal) => {
        let r = m.get(k);
        if (!r) {
            r = { klic: k, popisek: kanalPopisek(k), zobrazeni: zobr.get(k) ?? 0, registrace: 0, dotaznik: 0, horke: 0 };
            m.set(k, r);
        }
        return r;
    };
    for (const k of zobr.keys()) radek(k);
    for (const r of registrace) {
        const p = puvody.get(r.id);
        const z = radek(p?.kanal ?? 'primo');
        z.registrace++;
        if (r.qualified_at) z.dotaznik++;
        if (horky(r)) z.horke++;
    }
    return [...m.values()].sort((a, b) => b.registrace - a.registrace || b.zobrazeni - a.zobrazeni);
}

/** Strom kampaň → sada → reklama. Zobrazení se počítají ze stejných klíčů. */
export function rozpadReklam(
    registrace: Registration[],
    puvody: Map<string, Puvod>,
    views: PageViewRow[],
    horky: (r: Registration) => boolean,
): Radek[] {
    type Uzel = Radek & { deti: Map<string, Uzel> };
    const koren = new Map<string, Uzel>();
    const cesta = (a: Record<string, string | undefined>): string[] => [
        a.utm_campaign || a.campaign_id || 'bez kampaně',
        adsetNazev(a) || 'bez sady',
        a.utm_content || (a.ad_id ? `reklama ${a.ad_id}` : 'bez jména reklamy'),
    ];
    const uzel = (kroky: string[]): Uzel[] => {
        const out: Uzel[] = [];
        let mapa = koren;
        kroky.forEach((krok, i) => {
            let u = mapa.get(krok);
            if (!u) {
                u = { klic: kroky.slice(0, i + 1).join(' / '), popisek: krok, zobrazeni: 0, registrace: 0, dotaznik: 0, horke: 0, uroven: i, deti: new Map() };
                mapa.set(krok, u);
            }
            out.push(u);
            mapa = u.deti;
        });
        return out;
    };

    for (const v of views) {
        const a = v.utm || {};
        if (kanal(a) !== 'reklama') continue;
        for (const u of uzel(cesta(a))) u.zobrazeni++;
    }
    for (const r of registrace) {
        if (puvody.get(r.id)?.kanal !== 'reklama') continue;
        for (const u of uzel(cesta(r.utm || {}))) {
            u.registrace++;
            if (r.qualified_at) u.dotaznik++;
            if (horky(r)) u.horke++;
        }
    }

    const out: Radek[] = [];
    const projdi = (mapa: Map<string, Uzel>) => {
        for (const u of [...mapa.values()].sort((a, b) => b.registrace - a.registrace || b.zobrazeni - a.zobrazeni)) {
            const { deti, ...radek } = u;
            out.push(radek);
            projdi(deti);
        }
    };
    projdi(koren);
    return out;
}

/** První řádek popisku příspěvku, zkrácený, aby se vešel do řádku tabulky. */
const prvniRadek = (text: string, limit = 70) => {
    const radek = text.split('\n').map(t => t.trim()).find(Boolean) ?? '';
    return radek.length > limit ? `${radek.slice(0, limit - 1)}…` : radek;
};

/** Rozpad Bea: každý příspěvek s komentářovou automatizací zvlášť, pak story a DM. */
export function rozpadBea(
    registrace: Registration[],
    puvody: Map<string, Puvod>,
    horky: (r: Registration) => boolean,
    beoApp: string,
): Radek[] {
    const m = new Map<string, Radek>();
    for (const r of registrace) {
        const p = puvody.get(r.id);
        if (p?.kanal !== 'beo') continue;
        const b = p.beo;
        const klic = !b ? 'nedohledano' : b.druh === 'komentar' ? `komentar:${b.prispevek_url || 'bez odkazu'}` : b.druh;
        let z = m.get(klic);
        if (!z) {
            const popisek = !b
                ? 'DM od Bea, člověk nedohledán'
                : b.druh === 'komentar'
                    ? `Komentář pod příspěvkem${b.prispevek_popis ? `: ${prvniRadek(b.prispevek_popis)}` : ''}`
                    : b.druh === 'story'
                        ? 'Odpověď na story'
                        : 'Klíčové slovo v DM';
            z = {
                klic,
                popisek,
                zobrazeni: 0,
                registrace: 0,
                dotaznik: 0,
                horke: 0,
                odkaz: b?.prispevek_url || undefined,
                nahled: b?.prispevek_nahled || undefined,
                lide: [],
            };
            m.set(klic, z);
        }
        z.registrace++;
        if (r.qualified_at) z.dotaznik++;
        if (horky(r)) z.horke++;
        z.lide!.push({
            jmeno: b?.ig_username ? `@${b.ig_username}` : r.name || r.email,
            odkaz: b?.conversation_id ? `${beoApp}/inbox/${b.conversation_id}` : undefined,
        });
    }
    return [...m.values()].sort((a, b) => b.registrace - a.registrace);
}
