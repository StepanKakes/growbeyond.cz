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

const hello = (c: StepContext) => (c.vocative ? `Ahoj ${c.vocative},` : 'Ahoj,');

/* -------------------------------------------------------------- plán kroků */

export const STEPS: Step[] = [
    // ---------- hned po registraci ----------
    {
        key: 'confirm-email',
        channel: 'email',
        anchor: 'registration',
        offsetMinutes: 0,
        subject: c => `Máš místo na webináři ${c.edition.title}`,
        body: c =>
            emailLayout(
                `<p>${hello(c)}</p>
<p>máš rezervované místo na webináři <strong>${c.edition.title}</strong>, vysíláme živě ${c.whenLabel}</p>
<p><a href="${c.joinUrl}" style="display:inline-block;background:#e30d00;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:bold">Odkaz na živé vysílání</a></p>
<p>Ulož si ho, pošlu ti ho ještě několikrát, ale ať ho máš po ruce</p>
${c.groupUrl ? `<p>Založil jsem k webináři <strong>WhatsApp skupinu</strong>, kam do té doby dávám videa a věci, co se na webinář nevejdou. Píšu tam jen já a tým, takže tě to nezavalí<br><a href="${c.groupUrl}">Přidej se do skupiny</a></p>` : ''}
<p>Ať z toho vytěžíš co nejvíc, mrkni na svoji stránku a odpověz mi na dvě otázky, podle nich poskládám obsah tak, aby seděl lidem, co přijdou<br><a href="${c.pageUrl}">Otevřít moji stránku</a></p>`,
                c,
            ),
    },
    {
        key: 'confirm-wa',
        channel: 'whatsapp',
        anchor: 'registration',
        offsetMinutes: 2,
        // U WhatsAppu se vždy použije některá z variant, body je jen fallback.
        body: () => '',
        variants: [
            c =>
                `${c.vocative ? `Ahoj ${c.vocative}` : 'Ahoj'}, tady Tim, díky za přihlášku na webinář ${c.edition.title}, vysíláme ${c.whenLabel}` +
                (c.groupUrl ? `\n\nDo té doby dávám videa a materiály do skupiny, píšu tam jen já a tým\n${c.groupUrl}` : '') +
                `\n\nOdkaz na vysílání máš i v mailu, přidám ho znovu před startem`,
            c =>
                `${c.vocative ? `Ahoj ${c.vocative}` : 'Ahoj'}, Tim z Beyond, mám tvoji rezervaci na ${c.edition.title}, jdeme živě ${c.whenLabel}` +
                (c.groupUrl ? `\n\nMezitím posílám věci do skupiny k webináři, ať máš kontext dopředu\n${c.groupUrl}` : '') +
                `\n\nPřed startem ti připomenu, ať to nezmeškáš`,
            c =>
                `${c.vocative ? `Ahoj ${c.vocative}` : 'Ahoj'}, tady Tim, potvrzuju ti místo na webináři ${c.edition.title}, ${c.whenLabel}` +
                (c.groupUrl ? `\n\nKe skupině, kde do té doby sdílím materiály, se přidáš tady\n${c.groupUrl}` : '') +
                `\n\nOzvu se ještě před začátkem`,
        ],
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
        variants: [
            c => `${c.vocative ? `${c.vocative}, ` : ''}zítra v ${c.timeLabel} jdeme živě, odkaz máš v mailu i tady\n${c.joinUrl}`,
            c => `Připomínka, zítra ${c.timeLabel} začínáme, tady je odkaz na vysílání\n${c.joinUrl}`,
            c => `${c.vocative ? `${c.vocative}, ` : ''}zítra se vidíme, start v ${c.timeLabel}\n${c.joinUrl}`,
        ],
        when: c => c.reg.consent_whatsapp && Boolean(c.reg.phone) && c.reg.wa_status !== 'opted_out',
    },
    {
        key: 'reminder-3h-wa',
        channel: 'whatsapp',
        offsetMinutes: -180,
        body: () => '',
        variants: [
            c => `Za tři hodiny startujeme, odkaz\n${c.joinUrl}`,
            c => `${c.vocative ? `${c.vocative}, ` : ''}za tři hodiny jdeme na to\n${c.joinUrl}`,
            c => `Dnes v ${c.timeLabel}, zbývají tři hodiny\n${c.joinUrl}`,
        ],
        when: c => c.reg.consent_whatsapp && Boolean(c.reg.phone) && c.reg.wa_status !== 'opted_out',
    },
    {
        // Posíláme s předstihem, aby dávka doběhla ještě před startem.
        // Proto text neslibuje přesný počet minut.
        key: 'reminder-5m-wa',
        channel: 'whatsapp',
        offsetMinutes: -12,
        body: () => '',
        variants: [
            c => `Jdeme na to, za chvíli začínám\n${c.joinUrl}`,
            c => `${c.vocative ? `${c.vocative}, ` : ''}za chvilku startujeme\n${c.joinUrl}`,
            c => `Už to bude, přidej se\n${c.joinUrl}`,
        ],
        when: c => c.reg.consent_whatsapp && Boolean(c.reg.phone) && c.reg.wa_status !== 'opted_out',
    },


    // ---------- po webináři ----------
    // Obě větve čekají, až doběhne synchronizace účasti ze Zoomu, jinak
    // bychom účastníkům poslali replay a neúčastníkům přihlášku.
    {
        key: 'post-attended',
        channel: 'email',
        offsetMinutes: 0, // dopočítá se z délky webináře, viz stepDueAt
        subject: () => 'Díky, že jsi byl, a co dál',
        body: c =>
            emailLayout(
                `<p>${hello(c)}</p>
<p>díky, že sis udělal čas</p>
<p>Jak jsem na konci říkal, pro ty, co s tím chtějí něco udělat, máme volné termíny na osobní hovor. Projdeme, kde jsi teď, co ti v distribuci chybí a jestli ti umíme pomoct</p>
<p>Není to prodejní hovor na sílu, když to nedává smysl, řeknu to rovnou</p>
<p><a href="${c.applyUrl}" style="display:inline-block;background:#e30d00;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:bold">Vyplnit přihlášku</a></p>`,
                c,
            ),
        when: c => c.reg.attended === true && Boolean(c.reg.attendance_synced_at),
    },
    {
        key: 'post-noshow',
        channel: 'email',
        offsetMinutes: 0,
        subject: () => 'Nestihl jsi to, mám pro tebe záznam',
        body: c =>
            emailLayout(
                `<p>${hello(c)}</p>
<p>nedorazil jsi, což chápu, život se stane</p>
<p>${c.edition.replay_url ? `Záznam ti nechám dostupný pár dní, potom ho stahuju<br><a href="${c.edition.replay_url}" style="display:inline-block;margin-top:10px;background:#e30d00;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:bold">Pustit záznam</a>` : 'Záznam připravuju, pošlu ti ho, jakmile bude hotový'}</p>`,
                c,
            ),
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
