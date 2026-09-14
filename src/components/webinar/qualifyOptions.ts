// Otázky z dotazníku na děkovačce na jednom místě: formulář je vykresluje,
// API podle nich ověřuje odpovědi a počítá skóre, přehled je překládá zpátky
// na čitelný text. Dřív byly rozkopírované a hrozilo, že se rozejdou.

export type Choice = { value: string; label: string };

/**
 * Kde se člověk zasekl. Neskóruje se, žádná odpověď není sama o sobě lepší,
 * je to kontext pro rozhovor. Každá možnost míří na jinou část webináře.
 */
export const STUCK_OPTIONS: Choice[] = [
    { value: 'znamost', label: 'Jsem dobrý v tom, co dělám, ale ví o mně málo lidí' },
    { value: 'kapacita', label: 'Mám dost lidí, ale nestíhám to' },
    { value: 'obsah', label: 'Tvořím obsah, ale nepřitahuje správné lidi' },
    { value: 'nabidka', label: 'Mám co nabídnout, ale těžko se to prodává' },
    { value: 'nevim', label: 'Nevím, právě to chci zjistit' },
];

/** Měsíční obrat. Jediné, co se promítá do skóre. */
export const REVENUE_OPTIONS: Choice[] = [
    { value: 'rozjezd', label: 'Ještě to nemám rozjeté' },
    { value: 'do-100', label: 'Do 100 tisíc měsíčně' },
    { value: '100-300', label: '100 až 300 tisíc měsíčně' },
    { value: '300-1m', label: '300 tisíc až milion měsíčně' },
    { value: 'nad-1m', label: 'Přes milion měsíčně' },
];

/**
 * Skóre je hrubé a slouží jen k tomu, aby tým poznal, komu se vyplatí napsat
 * osobně ještě před webinářem. Vyšší obrat znamená, že má člověk co škálovat.
 */
export const REVENUE_SCORE: Record<string, number> = {
    rozjezd: 0,
    'do-100': 10,
    '100-300': 25,
    '300-1m': 40,
    'nad-1m': 50,
};

const label = (options: Choice[], value: string | null | undefined) =>
    options.find(o => o.value === value)?.label;

export const stuckLabel = (value: string | null | undefined) => label(STUCK_OPTIONS, value);
export const revenueLabel = (value: string | null | undefined) => label(REVENUE_OPTIONS, value);
