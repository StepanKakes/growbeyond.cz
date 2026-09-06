import { NextRequest, NextResponse } from 'next/server';
import { dbConfigured, getEdition, getRegistrationByToken, updateRegistration } from '@/lib/webinar/db';

export const runtime = 'nodejs';

// Stažení termínu do kalendáře (.ics). Zároveň si poznamenáme, že si člověk
// termín uložil, což je podle diagramu první signál commitmentu.

const escape = (s: string) => s.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
const stamp = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, '');

export async function GET(req: NextRequest) {
    if (!dbConfigured()) return NextResponse.json({ ok: false }, { status: 503 });

    const token = new URL(req.url).searchParams.get('t') || '';

    try {
        const edition = await getEdition();
        if (!edition) return NextResponse.json({ ok: false }, { status: 404 });

        const reg = token ? await getRegistrationByToken(token) : null;
        if (reg && !reg.calendar_added_at) {
            await updateRegistration(reg.id, { calendar_added_at: new Date().toISOString() }).catch(() => {});
        }

        const start = new Date(edition.starts_at);
        const end = new Date(start.getTime() + edition.duration_minutes * 60000);
        const joinUrl = reg?.zoom_join_url || edition.zoom_join_url || '';

        const lines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Beyond//Webinar//CS',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'BEGIN:VEVENT',
            `UID:webinar-${edition.slug}-${reg?.id || 'anon'}@growbeyond.cz`,
            `DTSTAMP:${stamp(new Date())}`,
            `DTSTART:${stamp(start)}`,
            `DTEND:${stamp(end)}`,
            `SUMMARY:${escape(edition.title)}`,
            `DESCRIPTION:${escape(joinUrl ? `Odkaz na vysílání: ${joinUrl}` : 'Odkaz na vysílání pošleme emailem')}`,
            ...(joinUrl ? [`URL:${joinUrl}`, `LOCATION:${escape(joinUrl)}`] : []),
            'BEGIN:VALARM',
            'TRIGGER:-PT30M',
            'ACTION:DISPLAY',
            `DESCRIPTION:${escape(edition.title)}`,
            'END:VALARM',
            'END:VEVENT',
            'END:VCALENDAR',
        ];

        return new NextResponse(lines.join('\r\n'), {
            headers: {
                'Content-Type': 'text/calendar; charset=utf-8',
                'Content-Disposition': `attachment; filename="webinar-${edition.slug}.ics"`,
                'Cache-Control': 'no-store',
            },
        });
    } catch (e) {
        console.error('webinar/kalendar selhalo:', e);
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
