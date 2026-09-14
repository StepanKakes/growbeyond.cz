// Přihláška na hovor, druhý a delší dotazník. Ptá se až po webináři na
// /webinar/prihlaska a odpovědi jdou do tabulky applications, ne k registraci.
//
// Znění i bodování je tady, aby formulář, endpoint a přehled mluvily stejně.
// Krátký dotazník z děkovačky je vedle v qualifyOptions.

import { REVENUE_OPTIONS, STUCK_OPTIONS, type Choice } from './qualifyOptions';

export const YEARS_OPTIONS: Choice[] = [
    { value: 'do-1', label: 'Méně než rok' },
    { value: '1-3', label: '1 až 3 roky' },
    { value: '3-5', label: '3 až 5 let' },
    { value: 'nad-5', label: 'Víc než 5 let' },
];

export const LEADS_OPTIONS: Choice[] = [
    { value: 'doporuceni', label: 'Z doporučení' },
    { value: 'reklama', label: 'Z placené reklamy' },
    { value: 'obsah', label: 'Z obsahu na sítích' },
    { value: 'oslovuju', label: 'Oslovuju si je sám' },
    { value: 'nemam', label: 'Nemám stabilní zdroj' },
];

export const BUDGET_OPTIONS: Choice[] = [
    { value: 'nic', label: 'Zatím nechci investovat nic' },
    { value: 'do-20', label: 'Do 20 tisíc' },
    { value: '20-50', label: '20 až 50 tisíc' },
    { value: 'nad-50', label: 'Nad 50 tisíc' },
];

export const WHEN_OPTIONS: Choice[] = [
    { value: 'hned', label: 'Hned' },
    { value: 'mesic', label: 'Během následujícího měsíce' },
    { value: 'ctvrtleti', label: 'Během tří měsíců' },
    { value: 'ujasnit', label: 'Nejdřív si to chci ujasnit' },
];

/** Body za jednotlivé odpovědi. Otázky mimo tenhle seznam se nebodují. */
export const APPLICATION_SCORE: Record<string, Record<string, number>> = {
    years: { 'do-1': 0, '1-3': 10, '3-5': 15, 'nad-5': 15 },
    revenue: { rozjezd: 0, 'do-100': 10, '100-300': 25, '300-1m': 40, 'nad-1m': 50 },
    budget: { nic: 0, 'do-20': 10, '20-50': 25, 'nad-50': 35 },
    when: { hned: 25, mesic: 18, ctvrtleti: 10, ujasnit: 5 },
};

export type AppQuestion = { key: string; question: string; options: Choice[]; boduje: boolean };

/** Otázky v pořadí, v jakém je člověk dostane. */
export const APPLICATION_QUESTIONS: AppQuestion[] = [
    { key: 'years', question: 'Jak dlouho už podnikáš?', options: YEARS_OPTIONS, boduje: true },
    { key: 'revenue', question: 'Kolik ti dnes byznys měsíčně vydělává?', options: REVENUE_OPTIONS, boduje: true },
    { key: 'stuck', question: 'Kde teď nejvíc cítíš, že ses zasekl?', options: STUCK_OPTIONS, boduje: false },
    { key: 'leads', question: 'Odkud ti dnes chodí klienti?', options: LEADS_OPTIONS, boduje: false },
    { key: 'budget', question: 'Kolik jsi připraven do růstu investovat?', options: BUDGET_OPTIONS, boduje: true },
    { key: 'when', question: 'Jak rychle bys to chtěl začít řešit?', options: WHEN_OPTIONS, boduje: true },
];

/** Nejvyšší dosažitelné skóre, kvůli poměru na přehledu. */
export const APPLICATION_MAX = Object.values(APPLICATION_SCORE).reduce(
    (sum, tabulka) => sum + Math.max(...Object.values(tabulka)),
    0,
);

export const answerLabel = (key: string, value: unknown): string | undefined =>
    APPLICATION_QUESTIONS.find(q => q.key === key)?.options.find(o => o.value === value)?.label;
