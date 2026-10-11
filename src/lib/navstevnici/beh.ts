// Navazující e-mail po návštěvě webu.
//
// Každých 15 minut: vezme z PostHogu ukončené návštěvy lidí, které už známe
// podle e-mailu, přeskočí ty, kterým psát nemáme, zbytek nechá rozhodovací
// model zařadit do typu (typy.ts) a pošle e-mail pro ten typ. Každou návštěvu
// zapíše do webinar.navstevy, i přeskočenou, ať je vidět proč.
//
// Dokud není NAVSTEVNICI_ODESILAT=1, e-mail se jen uloží jako náhled.

import { hogql } from '@/lib/posthog-server';
import { plunkSendEmail } from '@/lib/plunk';
import { czGreeting } from '@/lib/vokativ';
import { rest } from '@/lib/webinar/db';
import { rozhodni, type OdpovedChoice, type OdpovedNoul } from './rozhodovac';
import { TYPY } from './typy';

/** Návštěva je u konce, když se 30 minut nic nestalo. */
const TICHO_MIN = 30;
/** Jeden navazující e-mail za dva týdny, víc ne. */
const ROZESTUP_DNI = 14;
/** Čerstvé kontakty vede uvítací sekvence v Plunku, do té nezasahujeme. */
const CERSTVY_DNI = 7;
const PRAH_TYP = 0.5;
const PRAH_ZAJEM = 0.5;

/** Po těchhle událostech člověk právě konvertoval a má svou sekvenci. */
const KONVERZE = new Set(['optin_strategie', 'prihlaska_mentoring', 'webinar_registrace', 'webinar_prihlaska', 'program_vstup', 'materialy_optin']);
/** Kdo tu kdy byl, už si hovor zarezervoval nebo koupil. */
const HOTOVO = ['/po-rezervaci', '/success'];
const INTERNI = /@(growbeyond\.cz|creationwithtim\.com)$/i;

type Udalost = { cas: string; udalost: string; cesta: string };
type Navsteva = {
    session: string;
    email: string;
    jmeno: string | null;
    kontaktOd: string | null;
    zacatek: string;
    konec: string;
    udalosti: Udalost[];
    odkud: string | null;
};

type Zapis = {
    session_id: string; email: string; jmeno: string | null; zacatek: string; konec: string;
    stranky: Udalost[]; stav: 'preskoceno' | 'nahled' | 'odeslano' | 'chyba'; duvod: string;
    typ?: string; jistota?: number; zajem?: number; pravdepodobnosti?: Record<string, number>;
    predmet?: string; text?: string; odeslano_at?: string;
};

async function nactiNavstevy(): Promise<Navsteva[]> {
    const radky = await hogql<[string, string, string | null, string | null, string, string, [string, string, string | null][], string | null]>(`
        SELECT
            $session_id,
            lower(any(person.properties.email)),
            any(person.properties.name),
            toString(any(person.created_at)),
            toString(min(timestamp)),
            toString(max(timestamp)),
            groupArray(tuple(toString(timestamp), event, coalesce(properties.$pathname, ''))),
            any(properties.$referring_domain)
        FROM events
        WHERE timestamp > now() - INTERVAL 6 HOUR
          AND notEmpty(person.properties.email)
          AND notEmpty($session_id)
        GROUP BY $session_id
        HAVING max(timestamp) < now() - INTERVAL ${TICHO_MIN} MINUTE
        LIMIT 300
    `);
    return radky.map(([session, email, jmeno, kontaktOd, zacatek, konec, udalosti, odkud]) => ({
        session, email, jmeno, kontaktOd, zacatek, konec, odkud,
        udalosti: udalosti
            .map(([cas, udalost, cesta]) => ({ cas, udalost, cesta: cesta || '' }))
            .sort((a, b) => a.cas.localeCompare(b.cas)),
    }));
}

async function hotoviLide(emaily: string[]): Promise<Set<string>> {
    if (!emaily.length) return new Set();
    const radky = await hogql<[string]>(`
        SELECT DISTINCT lower(person.properties.email)
        FROM events
        WHERE event = '$pageview'
          AND properties.$pathname IN {hotovo}
          AND lower(person.properties.email) IN {emaily}
    `, { hotovo: HOTOVO, emaily });
    return new Set(radky.map(r => r[0]));
}

const enc = encodeURIComponent;

async function zpracovaneSession(ids: string[]): Promise<Set<string>> {
    if (!ids.length) return new Set();
    const seznam = ids.map(i => `"${i.replace(/"/g, '')}"`).join(',');
    const radky = await rest<{ session_id: string }[]>(`navstevy?select=session_id&session_id=in.(${enc(seznam)})`);
    return new Set(radky.map(r => r.session_id));
}

async function nedavnoPsano(emaily: string[]): Promise<Set<string>> {
    if (!emaily.length) return new Set();
    const od = new Date(Date.now() - ROZESTUP_DNI * 86400_000).toISOString();
    const seznam = emaily.map(e => `"${e.replace(/"/g, '')}"`).join(',');
    const radky = await rest<{ email: string }[]>(
        `navstevy?select=email&stav=in.(odeslano,nahled)&created_at=gte.${enc(od)}&email=in.(${enc(seznam)})`,
    );
    return new Set(radky.map(r => r.email));
}

/** Kdy se na stránce co dělo, ve tvaru, kterému rozhodovací model rozumí. */
function stavProModel(n: Navsteva) {
    const zacatek = new Date(n.zacatek).getTime();
    const stranky: string[] = [];
    for (const u of n.udalosti) if (u.udalost === '$pageview' && u.cesta && stranky.at(-1) !== u.cesta) stranky.push(u.cesta);
    return {
        stranky,
        udalosti: n.udalosti
            .filter(u => !u.udalost.startsWith('$') || u.udalost === '$pageview')
            .map(u => `${Math.round((new Date(u.cas).getTime() - zacatek) / 1000)} s: ${u.udalost === '$pageview' ? 'zobrazil ' + u.cesta : u.udalost}`)
            .slice(0, 80),
        delka_navstevy_s: Math.round((new Date(n.konec).getTime() - zacatek) / 1000),
        prisel_z: n.odkud || 'přímo',
        ma_osobni_stranku_strategie: Boolean(leadUrl(n)),
    };
}

function leadUrl(n: Navsteva): string | null {
    for (const u of n.udalosti) {
        const m = u.cesta.match(/^\/strategie\/([0-9a-f-]{32,36})\/?$/i);
        if (m) return `https://growbeyond.cz/strategie/${m[1]}`;
    }
    return null;
}

function predbezne(n: Navsteva, hotovi: Set<string>, psano: Set<string>): string | null {
    if (INTERNI.test(n.email)) return 'interní adresa';
    if (hotovi.has(n.email)) return 'už má rezervovaný hovor nebo koupil';
    if (psano.has(n.email)) return `navazující e-mail dostal v posledních ${ROZESTUP_DNI} dnech`;
    if (n.udalosti.some(u => KONVERZE.has(u.udalost))) return 'v téhle návštěvě konvertoval, má svou sekvenci';
    if (n.kontaktOd && Date.now() - new Date(n.kontaktOd).getTime() < CERSTVY_DNI * 86400_000) return 'čerstvý kontakt, vede ho uvítací sekvence';
    const zobrazeni = n.udalosti.filter(u => u.udalost === '$pageview').length;
    const delka = (new Date(n.konec).getTime() - new Date(n.zacatek).getTime()) / 1000;
    if (zobrazeni < 2 && delka < 45) return 'krátká návštěva bez signálu';
    return null;
}

export type Souhrn = { navstev: number; preskoceno: number; nahled: number; odeslano: number; chyby: number; dry: boolean };

export async function zpracujNavstevy({ dry = false } = {}): Promise<Souhrn> {
    const ostre = process.env.NAVSTEVNICI_ODESILAT === '1' && !dry;
    const souhrn: Souhrn = { navstev: 0, preskoceno: 0, nahled: 0, odeslano: 0, chyby: 0, dry };

    const vse = await nactiNavstevy();
    const hotove = await zpracovaneSession(vse.map(n => n.session));
    const nove = vse.filter(n => !hotove.has(n.session));
    souhrn.navstev = nove.length;
    if (!nove.length) return souhrn;

    const emaily = [...new Set(nove.map(n => n.email))];
    const [hotovi, psano] = await Promise.all([hotoviLide(emaily), nedavnoPsano(emaily)]);
    const calUrl = process.env.WEBINAR_CAL_LINK || 'https://cal.com/creationwithtim/strategicky-hovor';

    for (const n of nove) {
        const zaklad = { session_id: n.session, email: n.email, jmeno: n.jmeno, zacatek: n.zacatek, konec: n.konec, stranky: n.udalosti };
        let zapis: Zapis;

        const duvod = predbezne(n, hotovi, psano);
        if (duvod) {
            zapis = { ...zaklad, stav: 'preskoceno', duvod };
        } else {
            try {
                const odpovedi = await rozhodni(stavProModel(n), {
                    typ: {
                        type: 'choice',
                        instructions: 'Kdo je tenhle návštěvník webu koučinku pro tvůrce na Instagramu, podle toho, co na webu dělal?',
                        criteria: Object.fromEntries(Object.entries(TYPY).map(([k, t]) => [k, t.kriterium])),
                    },
                    zajem: {
                        type: 'noul',
                        instructions: 'Je z návštěvy vidět skutečný zájem o spolupráci, kvůli kterému dává smysl poslat jeden osobní navazující e-mail?',
                        criteria: { true: 'Vrátil se k nabídce, sledoval video, otevřel formulář nebo kalendář.', false: 'Náhodné proklikání, nic nesledoval.' },
                    },
                });
                const typ = odpovedi.typ as OdpovedChoice;
                const zajem = (odpovedi.zajem as OdpovedNoul).noul;
                const rozhodnuti = { typ: typ.choice, jistota: typ.confidence, zajem, pravdepodobnosti: typ.probabilities };
                const email = TYPY[typ.choice]?.email?.({ osloveni: czGreeting(n.jmeno), leadUrl: leadUrl(n), calUrl });

                if (!email) {
                    zapis = { ...zaklad, ...rozhodnuti, stav: 'preskoceno', duvod: 'pro tenhle typ e-mail nemáme' };
                } else if (typ.confidence < PRAH_TYP || zajem < PRAH_ZAJEM) {
                    zapis = { ...zaklad, ...rozhodnuti, ...email, stav: 'preskoceno', duvod: `nízká jistota (typ ${Math.round(typ.confidence * 100)} %, zájem ${Math.round(zajem * 100)} %)` };
                } else if (!ostre) {
                    zapis = { ...zaklad, ...rozhodnuti, ...email, stav: 'nahled', duvod: 'odesílání vypnuté' };
                } else {
                    const ok = await plunkSendEmail({ to: n.email, subject: email.predmet, body: email.text });
                    zapis = ok
                        ? { ...zaklad, ...rozhodnuti, ...email, stav: 'odeslano', duvod: '', odeslano_at: new Date().toISOString() }
                        : { ...zaklad, ...rozhodnuti, ...email, stav: 'chyba', duvod: 'Plunk e-mail neodeslal' };
                }
                // Ve stejném běhu už stejnému člověku nepsat podruhé
                if (zapis.stav === 'odeslano' || zapis.stav === 'nahled') psano.add(n.email);
            } catch (e) {
                zapis = { ...zaklad, stav: 'chyba', duvod: e instanceof Error ? e.message.slice(0, 300) : String(e) };
            }
        }

        if (dry) {
            console.log('navstevnici dry:', JSON.stringify({ ...zapis, stranky: undefined, text: undefined }));
        } else {
            await rest('navstevy?on_conflict=session_id', { method: 'POST', body: zapis, prefer: 'resolution=ignore-duplicates,return=minimal' });
        }
        if (zapis.stav === 'preskoceno') souhrn.preskoceno++;
        else if (zapis.stav === 'nahled') souhrn.nahled++;
        else if (zapis.stav === 'odeslano') souhrn.odeslano++;
        else souhrn.chyby++;
    }
    return souhrn;
}

export type NavstevaRadek = Zapis & { id: number; created_at: string };

export async function seznamNavstev(limit = 200): Promise<NavstevaRadek[]> {
    return rest<NavstevaRadek[]>(`navstevy?select=*&order=created_at.desc&limit=${limit}`);
}
