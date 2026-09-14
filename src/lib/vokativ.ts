/**
 * Best-effort česká vokativní forma křestního jména.
 * Mirror of the function used in the N8N "Beyond Mentoring — Fáze 2"
 * workflow so /onboarding renders the same form as the welcome e-mail.
 */
export function toVokativ(name: string): string {
    if (!name) return name;
    const n = name.trim();
    if (!n) return n;

    if (/[ieé]e$/i.test(n)) return n;                              // Marie, Lucie
    if (/[^áéí]a$/i.test(n)) return n.slice(0, -1) + 'o';          // Ivana → Ivano
    if (/ek$/i.test(n)) return n.slice(0, -2) + 'ku';              // Marek → Marku
    if (/el$/i.test(n)) return n.slice(0, -2) + 'le';              // Pavel → Pavle
    if (/[ií]k$/i.test(n)) return n.slice(0, -1) + 'ku';           // Patrik → Patriku
    if (/[šžč]$/i.test(n)) return n + 'i';                         // Tomáš → Tomáši
    if (/j$/i.test(n)) return n + 'i';                             // Ondřej → Ondřeji
    if (/[bcdfghklmnprstvxz]$/i.test(n)) return n + 'e';           // Petr → Petre
    return n;
}

export function firstNameFrom(full: string): string {
    return full.trim().split(/\s+/)[0] ?? '';
}

/* ------------------------------------------------------------------ *
 * Skloňování přes knihovnu
 *
 * Funkce výš jsou ruční pravidla zrcadlící n8n workflow u onboardingu.
 * Pro weby a e-maily se používá knihovna, která zvládne i jména, na
 * která ta pravidla nestačí. Je tady, aby oslovení sedělo stejně na
 * serveru i v prohlížeči, dřív to uměl jen server a děkovačka proto
 * psala "Pavel, máš místo" místo "Pavle, máš místo".
 * ------------------------------------------------------------------ */

import { vokativ } from 'vokativ';

/** Z křestního jména (bere první slovo) udělá kapitalizovaný český vokativ. */
export function czVocative(firstNameRaw?: string | null): string | undefined {
    const first = firstNameRaw?.trim().split(/\s+/)[0];
    if (!first) return undefined;
    const v = vokativ(first);
    if (!v) return undefined;
    return v.charAt(0).toUpperCase() + v.slice(1);
}

/**
 * Celé oslovení do jedné hodnoty, aby ho šablona jen vypsala.
 * Kdo nemá použitelné jméno, dostane "Ahoj," bez mezery navíc. Dřív šablony
 * skládaly "Ahoj {{ vokativ }}," a u kontaktů bez jména z toho vznikalo
 * "Ahoj ," s mezerou před čárkou.
 */
export function czGreeting(firstNameRaw?: string | null): string {
    const v = czVocative(firstNameRaw);
    return v ? `Ahoj ${v},` : 'Ahoj,';
}
