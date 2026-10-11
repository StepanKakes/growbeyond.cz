// Serverová strana PostHogu: odkaz na osobu a dotazy přes HogQL.
// POSTHOG_PERSONAL_KEY je osobní klíč s právem číst projekt (query:read,
// person:read). Bez něj dotazy vrací prázdno a nic dalšího se nerozbije.

const APP = 'https://eu.posthog.com';
const PROJEKT = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID || '';

/** Osoba v PostHogu podle e-mailu (distinct id skládá lib/posthog.ts stejně). */
export function posthogOsobaUrl(email: string): string {
    const id = email.trim().toLowerCase();
    if (!PROJEKT || !id) return '';
    return `${APP}/project/${PROJEKT}/person/${encodeURIComponent(id)}#activeTab=sessionRecordings`;
}

export async function hogql<T extends unknown[] = unknown[]>(dotaz: string, hodnoty: Record<string, unknown> = {}): Promise<T[]> {
    const klic = process.env.POSTHOG_PERSONAL_KEY;
    if (!klic || !PROJEKT) return [];
    const res = await fetch(`${APP}/api/projects/${PROJEKT}/query/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${klic}` },
        body: JSON.stringify({ query: { kind: 'HogQLQuery', query: dotaz, values: hodnoty } }),
        cache: 'no-store',
    });
    if (!res.ok) throw new Error(`PostHog query ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const data = await res.json() as { results?: T[] };
    return data.results || [];
}
