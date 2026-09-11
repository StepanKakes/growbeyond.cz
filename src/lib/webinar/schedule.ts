// Plán zpráv webinářového funnelu, ta část, kterou nezvládne Plunk.
//
// Dělba práce:
//   Plunk kampaně  = hodnotové maily a upomínky, naplánované na pevné časy
//                    a cílené na segment "Webinář 2030 registrovaní". Text
//                    si Tim upravuje přímo v Plunku, bez nasazení.
//   tenhle soubor  = všechno ostatní, tedy WhatsApp (Plunk ho neumí),
//                    potvrzení hned po registraci (nese osobní token)
//                    a větve po webináři (závisí na tom, kdo přišel).
//
// Kroky jsou časované relativně ke startu webináře, ne od registrace, protože
// "tři hodiny před" je pro všechny stejný okamžik. Kdo se přihlásí až po čase
// kroku, ten krok přeskočí (viz stepMissed).
//
// Pravidla textů: česky, žádná emoji, žádné pomlčky, věty bez tečky na konci.

import type { Edition, Registration } from './db';
import { EMAIL_TEXTY, SKUPINA_TEXTY, WA_TEXTY } from './texty';

export type StepContext = {
    edition: Edition;
    reg: Registration;
    /** Oslovení v pátém pádu, například "Honzo". Prázdné, když jméno neznáme. */
    vocative: string;
    /** Odkaz na děkovačku s tokenem, funguje jako osobní stránka účastníka. */
    pageUrl: string;
    /** Odkaz do živého vysílání. Osobní ze Zoomu, jinak společný. */
    joinUrl: string;
    /** Invite do WhatsApp skupiny, prázdný dokud ho Tim nezaloží. */
    groupUrl: string;
    /** Odkaz na přihlášku po webináři. */
    applyUrl: string;
    /** Termín ve tvaru "v pondělí 21. 9. v 17:00". */
    whenLabel: string;
    /** Samotný čas, "17:00". */
    timeLabel: string;
};

export type Step = {
    key: string;
    channel: 'email' | 'whatsapp';
    /** Minuty vůči startu webináře. Záporné číslo znamená před začátkem. */
    offsetMinutes: number;
    /**
     * Kroky vázané na registraci (potvrzení) se posílají hned po přihlášení
     * bez ohledu na to, kolik zbývá do webináře.
     */
    anchor?: 'start' | 'registration';
    /** Předmět emailu. U WhatsAppu se nepoužívá. */
    subject?: (c: StepContext) => string;
    /** Text zprávy. U WhatsAppu se vybere varianta podle registrace. */
    body: (c: StepContext) => string;
    variants?: ((c: StepContext) => string)[];
    /** Krok se pošle jen když tohle projde. */
    when?: (c: StepContext) => boolean;
};

/**
 * Doplní do textu zástupné značky. Když neznáme jméno, zmizí i čárka za ním
 * a věta se začne velkým písmenem, takže z "{jmeno}, zítra" vznikne "Zítra".
 */
function render(text: string, c: StepContext): string {
    const vals: Record<string, string> = {
        jmeno: c.vocative,
        nazev: c.edition.title,
        termin: c.whenLabel,
        cas: c.timeLabel,
        delka: String(c.edition.duration_minutes),
        odkaz: c.joinUrl,
        skupina: c.groupUrl,
        stranka: c.pageUrl,
        prihlaska: c.applyUrl,
        zaznam: c.edition.replay_url || '',
    };
    let out = text;
    for (const [k, v] of Object.entries(vals)) out = out.split(`{${k}}`).join(v);
    return out
        .replace(/ +,/g, ',')
        .replace(/^,\s*/, '')
        .replace(/^(\p{Ll})/u, m => m.toUpperCase())
        .trim();
}

/** Varianty WhatsApp zprávy jako funkce, aby seděly do plánu kroků. */
const wa = (texty: readonly string[]) => texty.map(t => (c: StepContext) => render(t, c));

/**
 * Z prostého textu udělá tělo mailu. Prázdný řádek dělí odstavce,
 * [tlačítko: popis -> odkaz] je červené tlačítko a [odkaz: popis -> odkaz]
 * je běžný odkaz. Odstavec, ve kterém zůstala nevyplněná značka, vypadne
 * celý, takže se nikomu nepošle věta s prázdným odkazem.
 */
function emailBody(text: string, c: StepContext): string {
    const html = text
        .split(/\n\s*\n/)
        .map(par => {
            const filled = render(par, c);
            // v odstavci zbyla značka, pro kterou nemáme hodnotu
            if (/\{[a-z]+\}/.test(filled) || /-> *\]/.test(filled)) return '';

            const btn = filled.match(/^\[tlačítko: (.+?) -> (.+?)\]$/);
            if (btn) {
                return `<p><a href="${btn[2]}" style="display:inline-block;background:#e30d00;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:bold">${btn[1]}</a></p>`;
            }
            const lines = filled.split('\n').map(l => {
                const link = l.match(/^\[odkaz: (.+?) -> (.+?)\]$/);
                return link ? `<a href="${link[2]}">${link[1]}</a>` : l;
            });
            return `<p>${lines.join('<br>')}</p>`;
        })
        .filter(Boolean)
        .join('\n');

    return emailLayout(html, c);
}

/* ------------------------------------------------------------------ emaily */

const emailLayout = (bodyHtml: string, c: StepContext) => `
<div style="font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#111">
${bodyHtml}
<p style="margin-top:28px">Tim</p>
<hr style="border:none;border-top:1px solid #e5e5e5;margin:28px 0 12px">
<p style="font-size:13px;color:#777;margin:0">
Webinář ${c.edition.title}, ${c.whenLabel}<br>
<a href="${c.pageUrl}" style="color:#777">Tvoje stránka s odkazem a detaily</a>
</p>
</div>`.trim();

/* -------------------------------------------------------------- plán kroků */

export const STEPS: Step[] = [
    // ---------- hned po registraci ----------
    {
        key: 'confirm-email',
        channel: 'email',
        anchor: 'registration',
        offsetMinutes: 0,
        subject: c => render(EMAIL_TEXTY.potvrzeni.predmet, c),
        body: c => emailBody(EMAIL_TEXTY.potvrzeni.telo, c),
    },
    {
        key: 'confirm-wa',
        channel: 'whatsapp',
        anchor: 'registration',
        offsetMinutes: 2,
        // U WhatsAppu se vždy použije některá z variant, body je jen fallback.
        body: () => '',
        variants: wa(WA_TEXTY.potvrzeni),
        when: c => c.reg.consent_whatsapp && Boolean(c.reg.phone),
    },

    // ---------- hodnotové maily a upomínky ----------
    // Emaily v téhle fázi rozesílá Plunk naplánovanými kampaněmi na segment
    // "Webinář 2030 registrovaní", ne scheduler. Zdroj pravdy pro jejich text
    // je Plunk, ať je Tim může upravovat bez nasazení. Osobní odkazy tam chodí
    // jako {{ webinar_join_url }} a {{ webinar_page_url }} z dat kontaktu.
    // Scheduler si tady nechává jen WhatsApp, ten Plunk neumí.
    {
        key: 'reminder-1d-wa',
        channel: 'whatsapp',
        offsetMinutes: -24 * 60,
        body: () => '',
        variants: wa(WA_TEXTY.denPred),
        when: c => c.reg.consent_whatsapp && Boolean(c.reg.phone) && c.reg.wa_status !== 'opted_out',
    },
    {
        key: 'reminder-3h-wa',
        channel: 'whatsapp',
        offsetMinutes: -180,
        body: () => '',
        variants: wa(WA_TEXTY.triHodiny),
        when: c => c.reg.consent_whatsapp && Boolean(c.reg.phone) && c.reg.wa_status !== 'opted_out',
    },
    {
        // Posíláme s předstihem, aby dávka doběhla ještě před startem.
        // Proto text neslibuje přesný počet minut.
        key: 'reminder-5m-wa',
        channel: 'whatsapp',
        offsetMinutes: -12,
        body: () => '',
        variants: wa(WA_TEXTY.tesnePred),
        when: c => c.reg.consent_whatsapp && Boolean(c.reg.phone) && c.reg.wa_status !== 'opted_out',
    },


    // ---------- po webináři ----------
    // Obě větve čekají, až doběhne synchronizace účasti ze Zoomu, jinak
    // bychom účastníkům poslali replay a neúčastníkům přihlášku.
    {
        key: 'post-attended',
        channel: 'email',
        offsetMinutes: 0, // dopočítá se z délky webináře, viz stepDueAt
        subject: () => EMAIL_TEXTY.poWebinariUcastnik.predmet,
        body: c => emailBody(EMAIL_TEXTY.poWebinariUcastnik.telo, c),
        when: c => c.reg.attended === true && Boolean(c.reg.attendance_synced_at),
    },
    {
        key: 'post-noshow',
        channel: 'email',
        offsetMinutes: 0,
        subject: () => EMAIL_TEXTY.poWebinariNedorazil.predmet,
        body: c => emailBody(EMAIL_TEXTY.poWebinariNedorazil.telo, c),
        when: c => c.reg.attended === false && Boolean(c.reg.attendance_synced_at),
    },
];

/**
 * Kdy má krok odejít. Vrací Date.
 * Kroky ukotvené k registraci se počítají od přihlášení, ostatní od startu.
 * Povýkonné kroky (post-*) se posouvají za konec vysílání.
 */
export function stepDueAt(step: Step, edition: Edition, reg: Registration): Date {
    if (step.anchor === 'registration') {
        return new Date(new Date(reg.created_at).getTime() + step.offsetMinutes * 60000);
    }
    const start = new Date(edition.starts_at).getTime();
    if (step.key.startsWith('post-')) {
        // půl hodiny po konci vysílání, ať je čas stáhnout účast ze Zoomu
        return new Date(start + (edition.duration_minutes + 30) * 60000);
    }
    return new Date(start + step.offsetMinutes * 60000);
}

/**
 * Má se krok u téhle registrace vůbec kdy poslat?
 * Kdo se registroval až po čase kroku, ten krok prostě propásl a přeskočíme ho.
 * Výjimka jsou kroky ukotvené k registraci a kroky po webináři.
 */
export function stepMissed(step: Step, edition: Edition, reg: Registration): boolean {
    if (step.anchor === 'registration' || step.key.startsWith('post-')) return false;
    const due = stepDueAt(step, edition, reg);
    const registered = new Date(reg.created_at);
    // Pár minut tolerance, ať se neztratí krok u člověka, co přišel těsně před ním.
    return registered.getTime() > due.getTime() + 60000;
}

/* --------------------------------------------------------------- skupina */

export type GroupStep = { klic: string; popis: string; due: Date; text: string };

/**
 * Skupinové zprávy, které mají teď odejít. Nepatří žádné registraci, proto
 * si značky doplňují z edice samy. Odkaz na vysílání je společný, ve skupině
 * nemá smysl osobní, a na přihlášku se odkazuje bez tokenu.
 */
export function dueGroupSteps(edition: Edition, site: string, now = Date.now()): GroupStep[] {
    const start = new Date(edition.starts_at).getTime();
    const timeLabel = new Intl.DateTimeFormat('cs-CZ', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: edition.timezone || 'Europe/Prague',
    }).format(new Date(start));

    const vals: Record<string, string> = {
        nazev: edition.title,
        cas: timeLabel,
        odkaz: edition.zoom_join_url || `${site}/webinar`,
        prihlaska: `${site}/webinar/prihlaska`,
        zaznam: edition.replay_url || '',
    };

    return SKUPINA_TEXTY.filter(z => start + z.offsetMinut * 60000 <= now)
        .map(z => {
            let text = z.text;
            for (const [k, v] of Object.entries(vals)) text = text.split(`{${k}}`).join(v);
            return { klic: z.klic, popis: z.popis, due: new Date(start + z.offsetMinut * 60000), text };
        })
        // zpráva, které chybí hodnota (typicky záznam), se nepošle
        .filter(z => !/\{[a-z]+\}/.test(z.text));
}
