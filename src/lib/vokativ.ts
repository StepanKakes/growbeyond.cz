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
