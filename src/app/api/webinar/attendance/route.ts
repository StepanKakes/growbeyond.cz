import { NextRequest, NextResponse } from 'next/server';
import { getEdition, listRegistrations, updateRegistration } from '@/lib/webinar/db';
import { listParticipants, zoomConfigured } from '@/lib/webinar/zoom';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Stáhne ze Zoomu, kdo na webináři skutečně byl, a zapíše to k registracím.
// Tohle rozhoduje větvení po webináři: účastník dostane přihlášku,
// neúčastník záznam. Dokud tenhle běh neproběhne, scheduler oba kroky drží.
//
// Volá se z n8n po skončení webináře (klidně opakovaně, je idempotentní),
// nebo ručně: curl -X POST -H "x-cron-secret: ..." .../api/webinar/attendance

/** Kolik minut musí člověk vydržet, aby se počítal jako účastník. */
const MIN_MINUTES = Number(process.env.WEBINAR_MIN_ATTEND_MINUTES || 5);

export async function POST(req: NextRequest) {
    const secret = process.env.WEBINAR_CRON_SECRET;
    if (!secret || req.headers.get('x-cron-secret') !== secret) {
        return NextResponse.json({ ok: false }, { status: 401 });
    }
    if (!zoomConfigured()) {
        return NextResponse.json({ ok: false, error: 'Zoom není nakonfigurovaný' }, { status: 503 });
    }

    try {
        const edition = await getEdition();
        if (!edition?.zoom_meeting_id) {
            return NextResponse.json({ ok: false, error: 'edice nemá zoom_meeting_id' }, { status: 400 });
        }

        const [participants, registrations] = await Promise.all([
            listParticipants(edition.zoom_meeting_id),
            listRegistrations(edition.id),
        ]);

        // Zoom může jednoho člověka vrátit víckrát (odpojil se a vrátil),
        // proto minuty sčítáme.
        const minutesByEmail = new Map<string, number>();
        for (const p of participants) {
            if (!p.email) continue;
            minutesByEmail.set(p.email, (minutesByEmail.get(p.email) || 0) + Math.round(p.duration / 60));
        }

        let attended = 0;
        let noShow = 0;

        for (const reg of registrations) {
            const minutes = minutesByEmail.get(reg.email.toLowerCase()) || 0;
            const didAttend = minutes >= MIN_MINUTES;

            // Přepisujeme jen když se stav mění, ať zbytečně nebušíme do DB.
            if (reg.attended === didAttend && reg.attendance_synced_at) continue;

            await updateRegistration(reg.id, {
                attended: didAttend,
                attend_minutes: minutes,
                attendance_synced_at: new Date().toISOString(),
                status: didAttend ? 'attended' : 'no_show',
            });
            if (didAttend) attended++;
            else noShow++;
        }

        const summary = { ok: true, participants: participants.length, attended, noShow, minMinutes: MIN_MINUTES };
        console.log('webinar/attendance:', JSON.stringify(summary));
        return NextResponse.json(summary);
    } catch (e) {
        console.error('webinar/attendance selhalo:', e);
        return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 });
    }
}
