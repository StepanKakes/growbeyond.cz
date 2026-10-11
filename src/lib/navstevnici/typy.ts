// Typy návštěvníků a navazující e-mail pro každý z nich.
//
// Verze 1 je odhad z toho, jak funnely stojí. Po dvou týdnech dat z PostHogu
// se typy přepočítají podle skutečných návštěv (kdo kam kliká, kde odpadá)
// a tenhle soubor se přepíše. Texty jsou návrhy, dokud je NAVSTEVNICI_ODESILAT
// vypnuté, jen se ukládají do náhledu na /navstevnici.

export type Typ = {
    /** Pro rozhodovací model: podle čeho typ poznat. */
    kriterium: string;
    /** Bez e-mailu, když typ jen popisuje, že nic poslat nemáme. */
    email?: (v: Promenne) => { predmet: string; text: string } | null;
};

export type Promenne = {
    osloveni: string;
    /** Osobní stránka leada /strategie/<id>, když ji má. */
    leadUrl: string | null;
};

const podpis = '\n\nTim';

export const TYPY: Record<string, Typ> = {
    video_bez_rezervace: {
        kriterium:
            'Byl na své osobní stránce /strategie/<id>, video viděl aspoň z poloviny (vsl_50, vsl_75 nebo vsl_finished) nebo otevřel formulář (form_viewed, form_started), ale hovor si nezarezervoval.',
        email: ({ osloveni, leadUrl }) => leadUrl ? {
            predmet: 'K tomu videu',
            text:
`${osloveni}

kdo dojde ve videu až sem, většinou neváhá kvůli tomu, jestli to dává smysl. Váhá kvůli otázce, jestli to bude fungovat i u něj.

Přesně na to je ten hovor. Projdeme tvůj účet a řeknu ti narovinu, jestli ti umím pomoct. Když ne, řeknu ti i to a odejdeš aspoň s jasným dalším krokem.

Termín si vybereš tady:
${leadUrl}` + podpis,
        } : null,
    },
    video_nedokoukane: {
        kriterium:
            'Otevřel svou osobní stránku /strategie/<id>, ale video skoro nesledoval (nanejvýš vsl_started nebo vsl_25) a formulář neotevřel.',
        email: ({ osloveni, leadUrl }) => leadUrl ? {
            predmet: 'Nemusíš to dát najednou',
            text:
`${osloveni}

video je dlouhé, vím. Nemusíš ho dát na jeden zátah.

Pusť si ho, až budeš mít klid, a zastav se v místě, kde si řekneš „tohle je přesně můj problém“. Od toho místa je to o tobě.

Najdeš ho pořád tady:
${leadUrl}` + podpis,
        } : null,
    },
    zacatecnik: {
        kriterium:
            'Prochází obecné stránky (úvod, /program, /resources, /csp), osobní stránku /strategie/<id> nemá nebo na ní nebyl, působí jako někdo na začátku, kdo zatím sbírá informace.',
        email: ({ osloveni }) => ({
            predmet: 'Kde začít',
            text:
`${osloveni}

když jsi na začátku, nejvíc času se ztratí tím, že děláš všechno trochu. Trochu reelů, trochu stories, trochu nabídky.

Proto jsem udělal tři dny zdarma, kde to poskládáš v pořadí, které funguje. Každý den jedno video a jeden úkol.

Začneš tady:
https://growbeyond.cz/program` + podpis,
        }),
    },
    jen_kouka: {
        kriterium:
            'Krátká nebo náhodná návštěva bez jasného signálu: jedna dvě stránky, nic nesledoval, neklikal na nic podstatného.',
    },
};
