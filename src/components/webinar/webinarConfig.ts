// Obsah landing page webináře 2030 podle finálního návrhu ve Figmě
// (BeyondLandingPage → Export → Webinář 2030 / Mobil - FINAL). Texty se ladí tady.

export const WEBINAR = {
    // Zástupné údaje termínu, dokud není webinář naplánovaný. Datum drž v ISO,
    // zobrazení a den v týdnu se odvozují (viz webinarDate níže).
    dateISO: '2026-10-15',
    time: '19:00',
    place: 'Online, živě',
    durationMinutes: 75,

    topBar: {
        label: 'Uzavření registrace za:',
    },

    hero: {
        year: '2030',
        headline: 'Jsi profík v tom, co děláš?',
        headlineAccent: 'A ví o tom dost lidí?',
        subline: 'Za 75 minut budeš vědět, jak využít tvé zkušenosti a příběh k růstu tvého byznysu pomocí sociálních sítí',
        cta: 'Rezervovat místo zdarma',
        live: 'živě',
    },

    statement: {
        label: '2030',
        paragraphs: [
            'AI dnes dokáže replikovat informace, obsah, design i produkty.',
            'Nedokáže ti přes noc vytvořit jméno, reputaci, příběh, publikum a roky vybudované důvěry.',
        ],
        closing: '2030 ZAČÍNÁ DNES',
    },

    agenda: {
        title: 'Za 75 minut zjistíš',
        items: [
            'Jak najít svou unikátní pozici na již saturovaném trhu',
            'Jak tvořit obsah, který přitahuje správné lidi a prodává',
            'Jak vytvořit nabídku, na kterou se těžko říká ne',
            'Projdeme reálná čísla, zjistíš kolik čeho potřebuješ abys postavil úspěšný byznys',
        ],
    },

    audience: {
        title: 'Pro koho webinář je',
        items: [
            { lead: 'Podnikatelé', text: 'Pro ty, kteří chtějí využít svůj příběh a zkušenosti k vyškálování podnikání' },
            { lead: 'Experti', text: 'Pro kouče, konzultanty a experty, kteří nabízí službu online' },
            { lead: 'Zakladatelé', text: 'Pro každého, kdo staví firmu na vlastní jméno a chce z toho vytěžit maximum' },
        ],
        not: 'Není pro tebe, pokud hledáš triky na rychlé sledující',
    },

    host: {
        title: 'Kdo webinář vede',
        name: 'Tim Trnka',
        role: 'Zakladatel Beyond',
        bio: 'Pomáhá koučům, mentorům a konzultantům budovat osobní značku a prodávat kvalitnějším klientům. Na webináři ukáže, co funguje dnes a co se do roku 2030 změní',
        // Zástupná fotka, dokud Tim nedodá portrét pro webinář.
        photo: '/images/hero/Still 2026-03-12 235253.jpg',
    },

    closing: {
        title: '2030 ZAČÍNÁ DNES',
        promise: '75 minut o tom, jak postavit osobní značku, která promění tvé zkušenosti a osobnost v distribuční kanál pro tvůj byznys',
    },

    form: {
        title: 'Rezervuj si místo na webináři',
        description: 'Je zdarma. Odkaz na živý přenos ti pošleme emailem',
        submit: 'Rezervovat místo zdarma',
        consent: 'Odesláním souhlasíš se zpracováním osobních údajů',
        successTitle: 'Máš rezervované místo',
        successText: 'Odkaz na živý přenos ti přijde na email',
    },
} as const;

/** Datum webináře pro zobrazení: "15. 10. 2026" a den v týdnu "Čtvrtek". */
export function webinarDate() {
    const [y, m, d] = WEBINAR.dateISO.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const weekdayRaw = new Intl.DateTimeFormat('cs-CZ', { weekday: 'long' }).format(date);
    return {
        display: `${d}. ${m}. ${y}`,
        weekday: weekdayRaw.charAt(0).toUpperCase() + weekdayRaw.slice(1),
    };
}

/** Začátek webináře jako Date v místním čase prohlížeče (pro odpočet). */
export function webinarStart() {
    const [y, m, d] = WEBINAR.dateISO.split('-').map(Number);
    const [hh, mm] = WEBINAR.time.split(':').map(Number);
    return new Date(y, m - 1, d, hh, mm, 0, 0);
}
