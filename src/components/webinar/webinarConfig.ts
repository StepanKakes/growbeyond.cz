// Obsah landing page webináře 2030. Texty jsou výchozí návrh z Figmy
// (BeyondLandingPage → sekce Webinář 2030), Tim si je ladí tady na jednom místě.

export const WEBINAR = {
    // Zástupné údaje termínu, dokud není webinář naplánovaný. Datum drž v ISO,
    // zobrazení a den v týdnu se odvozují (viz webinarDate níže).
    dateISO: '2026-10-15',
    time: '19:00',
    place: 'Online, živě',
    durationMinutes: 75,

    hero: {
        year: '2030',
        headline: 'Bude někoho zajímat tvoje firma, když nebude znát',
        headlineAccent: 'tebe?',
        subline: 'Webinář zdarma o tom, jak z osobní značky udělat distribuční kanál pro tvůj byznys.',
        cta: 'Rezervovat místo zdarma',
        navCta: 'Rezervovat místo',
        live: 'živě',
        note: 'Webinář zdarma, 75 minut. Odkaz na živý přenos ti přijde emailem.',
    },

    agenda: {
        title: 'Co se na webináři dozvíš',
        items: [
            {
                title: 'Proč bude v roce 2030 tvoje jméno cennější než logo tvé firmy',
                text: 'Co se mění v tom, jak si lidé vybírají, komu věří a od koho nakupují.',
            },
            {
                title: 'Co AI nezkopíruje',
                text: 'Obsah, weby i produkty půjdou replikovat stále snáz. Důvěra, identita, reputace a distribuce přes lidi ne.',
            },
            {
                title: 'Jak z osobní značky udělat distribuční kanál',
                text: 'Konkrétní způsob, jak proměnit zkušenosti, znalosti a jméno v stabilní přísun klientů.',
            },
            {
                title: 'Čím začít už dnes',
                text: 'Kroky, které dávají smysl teď, abys v roce 2030 nezačínal od nuly.',
            },
        ],
    },

    tebe: {
        intro: 'V době, kdy dokáže AI vytvořit skoro cokoliv, bude stále těžší zkopírovat jednu věc.',
        word: 'TEBE.',
        explanation:
            'Tvoje jméno, reputace, zkušenosti, příběhy a publikum. Důvěra, kterou sis vybudoval. To je důvod budovat osobní značku. Ne kvůli sledujícím, ale protože se může stát jedním z nejcennějších distribučních aktiv tvého byznysu.',
    },

    audience: {
        title: 'Pro koho webinář je',
        items: [
            'Pro podnikatele, kteří chtějí, aby jim zákazníci věřili dřív, než je vůbec osloví.',
            'Pro kouče, konzultanty a experty, kteří prodávají své znalosti a zkušenosti.',
            'Pro každého, kdo staví firmu na vlastním jméně a chce z toho mít dlouhodobý užitek.',
        ],
        not: 'Není pro tebe, pokud hledáš triky na rychlé sledující.',
    },

    host: {
        title: 'Kdo webinář vede',
        name: 'Tim Trnka',
        role: 'Zakladatel Beyond',
        bio: 'Pomáhá koučům, mentorům a konzultantům budovat osobní značku a prodávat kvalitnějším klientům. Na webináři ukáže, co funguje dnes a co se do roku 2030 změní.',
        // Zástupná fotka, dokud Tim nedodá portrét pro webinář.
        photo: '/images/hero/Still 2026-03-12 235253.jpg',
    },

    closing: {
        title: '2030 ZAČÍNÁ DNES.',
        promise:
            '75 minut o tom, jak postavit osobní značku, která promění tvoje zkušenosti, znalosti a jméno v distribuční kanál pro tvůj byznys.',
    },

    form: {
        title: 'Rezervuj si místo na webináři',
        description: 'Je zdarma. Odkaz na živý přenos ti pošleme emailem.',
        submit: 'Rezervovat místo zdarma',
        consent: 'Odesláním souhlasíš se zpracováním osobních údajů.',
        successTitle: 'Máš rezervované místo.',
        successText: 'Odkaz na živý přenos ti přijde na email.',
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
