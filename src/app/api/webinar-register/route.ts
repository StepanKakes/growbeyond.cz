import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { validateEmail } from '@/lib/validate-contact';
import { plunkEnroll } from '@/lib/plunk';
import { UTM_KEYS } from '@/lib/utm';
import { dbConfigured, getEdition, updateRegistration, upsertRegistration } from '@/lib/webinar/db';
import { addRegistrant, zoomConfigured } from '@/lib/webinar/zoom';

export const runtime = 'nodejs';

// Registrace na webinář. Zdroj pravdy je tabulka webinar.registrations,
// odkud si bere práci scheduler. Plunk zůstává kvůli kontaktní databázi,
// ale sekvenci už neřídí (kroky jsou časované ke startu webináře, ne
// k registraci, což Plunk workflows neumí).

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PLUNK_EVENT = 'webinar-2030-registrace';

function normalizePhone(raw: string): string | null {
    const s = raw.replace(/[\s\-().]/g, '');
    if (!/^\+?\d{9,15}$/.test(s)) return null;
    if (s.startsWith('+')) return s;
    if (s.startsWith('00')) return `+${s.slice(2)}`;
    return s.length === 9 ? `+420${s}` : s;
}

const bad = (field: string, error: string) => NextResponse.json({ ok: false, field, error }, { status: 400 });

export async function POST(req: Request) {
    const body = (await req.json().catch(() => ({}))) as {
        name?: string;
        email?: string;
        phone?: string;
        utm?: Record<string, string>;
    };

    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const phone = normalizePhone(String(body.phone || ''));

    if (name.length < 2) return bad('name', 'Vyplň prosím své jméno');
    if (!EMAIL_RE.test(email)) return bad('email', 'Zkontroluj prosím email');
    if (!phone) return bad('phone', 'Zkontroluj prosím telefonní číslo');

    // Odfiltruje vymyšlené a dočasné schránky; při nejistotě pouští dál (fail-open).
    try {
        const v = await validateEmail(email);
        if (!v.ok) return bad('email', 'Zadej prosím email, který skutečně používáš');
    } catch { /* fail-open */ }

    const utm: Record<string, string> = {};
    if (body.utm && typeof body.utm === 'object') {
        for (const k of UTM_KEYS) {
            const val = body.utm[k];
            if (typeof val === 'string' && val) utm[k] = val.slice(0, 200);
        }
    }

    let token: string | null = null;
    let joinUrl = '';
    let stored = false;

    if (dbConfigured()) {
        try {
            const edition = await getEdition();
            if (!edition) throw new Error('edice nenalezena');

            const { registration, created } = await upsertRegistration({
                edition_id: edition.id,
                token: randomBytes(12).toString('base64url'),
                email,
                name,
                phone,
                consent_marketing: true,
                consent_whatsapp: true,
                source: utm.utm_source || 'growbeyond.cz/webinar',
                utm,
            });
            token = registration.token;
            joinUrl = registration.zoom_join_url || edition.zoom_join_url || '';
            stored = true;

            // Osobní join link ze Zoomu. Když Zoom ještě není nakonfigurovaný,
            // registrace projde a odkaz doplní pozdější synchronizace.
            if (created && zoomConfigured() && edition.zoom_meeting_id && !registration.zoom_join_url) {
                try {
                    const [first, ...rest] = name.split(/\s+/);
                    const r = await addRegistrant(edition.zoom_meeting_id, {
                        email,
                        firstName: first,
                        lastName: rest.join(' '),
                    });
                    await updateRegistration(registration.id, {
                        zoom_registrant_id: r.registrantId,
                        zoom_join_url: r.joinUrl,
                    });
                    joinUrl = r.joinUrl;
                } catch (e) {
                    console.error('Zoom registrant selhal:', e);
                }
            }
        } catch (e) {
            console.error('Webinar DB zápis selhal:', e);
        }
    }

    // Plunk drží kontakty a rozesílá naplánované kampaně. Osobní odkazy proto
    // musí být v datech kontaktu, kampaň je vezme jako {{ webinar_join_url }}
    // a {{ webinar_page_url }}.
    const site = process.env.NEXT_PUBLIC_BASE_URL || 'https://growbeyond.cz';
    const pageUrl = token ? `${site}/webinar/dekujeme?t=${token}` : `${site}/webinar`;

    const plunkOk = await plunkEnroll({
        email,
        firstName: name,
        event: PLUNK_EVENT,
        data: {
            phone,
            webinar: '2030',
            source: 'growbeyond.cz/webinar',
            registered_at: new Date().toISOString(),
            webinar_page_url: pageUrl,
            webinar_join_url: joinUrl || pageUrl,
            webinar_apply_url: token ? `${site}/webinar/prihlaska?t=${token}` : `${site}/webinar/prihlaska`,
            ...utm,
        },
    });

    if (!stored && !plunkOk) {
        console.error('Webinar registration not stored anywhere', { email });
        return NextResponse.json({ ok: false, error: 'Něco se pokazilo, zkus to prosím znovu' }, { status: 502 });
    }

    return NextResponse.json({ ok: true, redirect: token ? `/webinar/dekujeme?t=${token}` : '/webinar/dekujeme' });
}
