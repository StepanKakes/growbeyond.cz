import { NextResponse } from 'next/server';
import { validateEmail } from '@/lib/validate-contact';
import { plunkEnroll } from '@/lib/plunk';
import { UTM_KEYS } from '@/lib/utm';

export const runtime = 'nodejs';

// Registrace na webinář 2030: jméno, email, telefon.
// Kontakt jde do Plunku (event webinar-2030-registrace, telefon v datech kontaktu)
// a volitelně na webhook WEBINAR_WEBHOOK_URL (n8n, Notion apod.).

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

    if (name.length < 2) return bad('name', 'Vyplň prosím své jméno.');
    if (!EMAIL_RE.test(email)) return bad('email', 'Zkontroluj prosím email.');
    if (!phone) return bad('phone', 'Zkontroluj prosím telefonní číslo.');

    // Odfiltruje vymyšlené a dočasné schránky; při nejistotě pouští dál (fail-open).
    try {
        const v = await validateEmail(email);
        if (!v.ok) return bad('email', v.reason || 'Zkontroluj prosím email.');
    } catch { /* fail-open */ }

    const utm: Record<string, string> = {};
    if (body.utm && typeof body.utm === 'object') {
        for (const k of UTM_KEYS) {
            const val = body.utm[k];
            if (typeof val === 'string' && val) utm[k] = val.slice(0, 200);
        }
    }

    const data = {
        phone,
        webinar: '2030',
        source: 'growbeyond.cz/webinar',
        registered_at: new Date().toISOString(),
        ...utm,
    };

    const plunkOk = await plunkEnroll({ email, firstName: name, event: PLUNK_EVENT, data });

    let hookOk = false;
    const hook = process.env.WEBINAR_WEBHOOK_URL;
    if (hook) {
        try {
            const res = await fetch(hook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, ...data }),
                signal: AbortSignal.timeout(6000),
            });
            hookOk = res.ok;
            if (!res.ok) console.error('Webinar webhook failed:', res.status);
        } catch (e) {
            console.error('Webinar webhook error:', e);
        }
    }

    if (!plunkOk && !hookOk) {
        console.error('Webinar registration not stored anywhere', { email });
        return NextResponse.json({ ok: false, error: 'Něco se pokazilo, zkus to prosím znovu.' }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
}
