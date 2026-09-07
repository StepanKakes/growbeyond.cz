import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
    dbConfigured,
    findApplicationByEmail,
    getEdition,
    updateApplication,
    updateRegistration,
} from '@/lib/webinar/db';

export const runtime = 'nodejs';

// Zápis rezervace hovoru z Cal.comu. Bez něj zůstanou poslední dva poměry
// funnelu prázdné, protože bychom nevěděli, kdo si po přihlášce opravdu
// zarezervoval termín.
//
// Ostrá cesta je POST, tedy webhook z Cal.comu (BOOKING_CREATED,
// BOOKING_CANCELLED). Nastavuje se ručně v Cal.com pod Settings, Webhooks.
//
// GET je připravený jako druhá pojistka pro případ, že by se na Cal.comu
// nastavilo přesměrování po rezervaci. Dnes se nepoužívá, protože
// successRedirectUrl je tam funkce placeného týmového tarifu.

const SITE = process.env.NEXT_PUBLIC_BASE_URL || 'https://growbeyond.cz';

/** Ověří podpis webhooku, když je v Cal.comu nastavený secret. */
function signatureValid(raw: string, header: string | null): boolean {
    const secret = process.env.WEBINAR_CAL_WEBHOOK_SECRET;
    if (!secret) return true; // bez secretu se neověřuje
    if (!header) return false;
    const expected = createHmac('sha256', secret).update(raw).digest('hex');
    const a = Buffer.from(expected);
    const b = Buffer.from(header);
    return a.length === b.length && timingSafeEqual(a, b);
}

/** Zapíše rezervaci k přihlášce a posune stav registrace. */
async function recordBooking(input: {
    email: string;
    uid?: string;
    startTime?: string;
    cancelled?: boolean;
}): Promise<'ok' | 'no-application' | 'no-edition'> {
    const edition = await getEdition();
    if (!edition) return 'no-edition';

    const app = await findApplicationByEmail(edition.id, input.email.toLowerCase());
    if (!app) return 'no-application';

    if (input.cancelled) {
        await updateApplication(app.id, { booked_at: null, call_at: null });
        if (app.registration_id) await updateRegistration(app.registration_id, { status: 'applied' }).catch(() => {});
        return 'ok';
    }

    await updateApplication(app.id, {
        ...(input.uid ? { cal_booking_uid: input.uid } : {}),
        booked_at: new Date().toISOString(),
        ...(input.startTime ? { call_at: new Date(input.startTime).toISOString() } : {}),
    });
    if (app.registration_id) await updateRegistration(app.registration_id, { status: 'booked' }).catch(() => {});
    return 'ok';
}

export async function POST(req: NextRequest) {
    if (!dbConfigured()) return NextResponse.json({ ok: true });

    const raw = await req.text();
    if (!signatureValid(raw, req.headers.get('x-cal-signature-256'))) {
        return NextResponse.json({ ok: false }, { status: 401 });
    }

    let body: {
        triggerEvent?: string;
        payload?: {
            uid?: string;
            startTime?: string;
            attendees?: { email?: string }[];
            responses?: { email?: { value?: string } };
        };
    };
    try {
        body = JSON.parse(raw);
    } catch {
        return NextResponse.json({ ok: false }, { status: 400 });
    }

    const p = body.payload || {};
    const email = p.attendees?.[0]?.email || p.responses?.email?.value || '';
    if (!email) return NextResponse.json({ ok: true, action: 'no-email' });

    const cancelled = body.triggerEvent === 'BOOKING_CANCELLED';

    try {
        const result = await recordBooking({ email, uid: p.uid, startTime: p.startTime, cancelled });
        console.log('webinar/cal webhook:', body.triggerEvent, email, result);
        return NextResponse.json({ ok: true, action: result });
    } catch (e) {
        console.error('webinar/cal webhook selhal:', e);
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}

// Návrat z Cal.comu po dokončení rezervace. Cal sem přidá parametry díky
// forwardParamsSuccessRedirect, my zapíšeme a pošleme člověka na potvrzení.
export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const email = (url.searchParams.get('attendeeEmail') || url.searchParams.get('email') || '').toLowerCase();
    const uid = url.searchParams.get('uid') || url.searchParams.get('bookingUid') || undefined;
    const startTime = url.searchParams.get('startTime') || undefined;

    if (dbConfigured() && email) {
        try {
            await recordBooking({ email, uid, startTime });
        } catch (e) {
            console.error('webinar/cal navrat selhal:', e);
        }
    }

    return NextResponse.redirect(`${SITE}/webinar/hotovo`, 302);
}
