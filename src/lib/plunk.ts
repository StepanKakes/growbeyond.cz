// Server-side Plunk helper — upsert kontaktu + track event v jednom.
// Používá PLUNK_SECRET_KEY (bearer). Vokativ řešíme tady, ať /strategie optin
// i ostatní formuláře plní `data.vokativ` konzistentně (s defaultem v Plunku).

import { vokativ } from 'vokativ';

const PLUNK_API_URL = process.env.PLUNK_API_URL || 'https://next-api.useplunk.com';

/** Z křestního jména (bere první slovo) udělá kapitalizovaný český vokativ. */
export function czVocative(firstNameRaw?: string): string | undefined {
    const first = firstNameRaw?.trim().split(/\s+/)[0];
    if (!first) return undefined;
    const v = vokativ(first);
    if (!v) return undefined;
    return v.charAt(0).toUpperCase() + v.slice(1);
}

/**
 * Transakční email přes Plunk (POST /v1/send). Plain text dostane <br> zalomení.
 * Best-effort: nikdy nehodí, vrací jen success flag.
 */
export async function plunkSendEmail(opts: { to: string; subject: string; body: string }): Promise<boolean> {
    const key = process.env.PLUNK_SECRET_KEY;
    if (!key || !opts.to) return false;
    const body = opts.body.includes('<') ? opts.body : opts.body.replace(/\n/g, '<br>');
    try {
        // next-api = aktuální Plunk (starý api.useplunk.com vrací Unauthorized);
        // /v1/send vyžaduje ověřeného odesílatele
        const res = await fetch(`${PLUNK_API_URL}/v1/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
            body: JSON.stringify({ to: opts.to, from: 'tim@creationwithtim.com', name: 'Tim', subject: opts.subject, body }),
        });
        if (!res.ok) console.error('Plunk send failed:', res.status, await res.text().catch(() => ''));
        return res.ok;
    } catch (e) {
        console.error('Plunk send error:', e);
        return false;
    }
}

type EnrollInput = {
    email: string;
    firstName?: string;
    event: string;
    /** Extra contact data (lead_url, vsl_max init, …). */
    data?: Record<string, string | number | boolean>;
};

/**
 * Upsertne Plunk kontakt (subscribed) s firstName/fullName/vokativ + extra daty
 * a hned na něj odpálí event. Best-effort: nikdy nehodí, vrací jen success flag.
 */
export async function plunkEnroll({ email, firstName, event, data }: EnrollInput): Promise<boolean> {
    const key = process.env.PLUNK_SECRET_KEY;
    if (!key || !email) return false;

    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` };
    const first = firstName?.trim().split(/\s+/)[0];
    const vok = czVocative(firstName);

    const contactData: Record<string, unknown> = { ...(data || {}) };
    if (first) contactData.firstName = first;
    if (firstName?.trim()) contactData.fullName = firstName.trim();
    if (vok) contactData.vokativ = vok;

    try {
        const cRes = await fetch(`${PLUNK_API_URL}/contacts`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ email, subscribed: true, data: contactData }),
        });
        const contact = await cRes.json().catch(() => ({}));
        if (!cRes.ok || !contact?.id) {
            console.error('Plunk upsert contact failed:', contact);
            return false;
        }

        const tRes = await fetch(`${PLUNK_API_URL}/events/track`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ name: event, contactId: contact.id, data: contactData }),
        });
        if (!tRes.ok) {
            console.error('Plunk track event failed:', await tRes.json().catch(() => ({})));
        }
        return true;
    } catch (e) {
        console.error('Plunk enroll error:', e);
        return false;
    }
}
