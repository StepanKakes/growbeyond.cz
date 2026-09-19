import { NextRequest, NextResponse } from 'next/server';
import { dbConfigured, getEdition, getRegistrationByToken, updateRegistration } from '@/lib/webinar/db';

export const runtime = 'nodejs';

// Stažení termínu do kalendáře (.ics). Zároveň si poznamenáme, že si člověk
// termín uložil, což je podle diagramu první signál commitmentu.

const escape = (s: string) => s.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
const stamp = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, '');

/**
 * RFC 5545 povoluje nejvýš 75 oktetů na řádek, delší se lámou a pokračovací
 * řádek začíná mezerou. Zoom odkaz s heslem i popis s odstavci tu hranici
 * překročí a přísnější parsery (Outlook) takový řádek zahodí i s událostí.
 * Lámeme po bajtech, ale nikdy uprostřed vícebajtového znaku, jinak by se
 * rozsypala diakritika.
 */
function fold(line: string): string {
    const bytes = Buffer.from(line, 'utf8');
    if (bytes.length <= 75) return line;

    const parts: string[] = [];
    let start = 0;
    let limit = 75;
    while (start < bytes.length) {
        let end = Math.min(start + limit, bytes.length);
        while (end > start + 1 && end < bytes.length && (bytes[end] & 0xc0) === 0x80) end--;
        parts.push(bytes.subarray(start, end).toString('utf8'));
        start = end;
        limit = 74; // pokračovací řádek si jeden oktet bere ta úvodní mezera
    }
    return parts.join('\r\n ');
}

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
        const pageUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://growbeyond.cz'}/webinar`;

        // V kalendáři je "2030" samo o sobě hádanka, ale kdyby si Tim edici
        // přejmenoval na "Webinář 2030", nechceme to slovo tam mít dvakrát.
        const summary = /^webinář/i.test(edition.title) ? edition.title : `Webinář ${edition.title}`;

        const description = [
            joinUrl ? `Odkaz na vysílání: ${joinUrl}` : 'Odkaz na vysílání pošleme emailem',
            `${edition.duration_minutes} minut živě o tom, jak využít tvé zkušenosti a příběh k růstu byznysu pomocí sociálních sítí`,
            `Stránka webináře: ${pageUrl}`,
        ].join('\n\n');

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
            `SUMMARY:${escape(summary)}`,
            `DESCRIPTION:${escape(description)}`,
            // Místo je text, ne odkaz: Google by URL bral jako adresu do Map.
            // Tlačítko "Připojit se" v Google kalendáři dělá až
            // X-GOOGLE-CONFERENCE, Apple si odkaz najde v popisu a v URL.
            'LOCATION:Online\\, Zoom',
            ...(joinUrl ? [`URL:${joinUrl}`, `X-GOOGLE-CONFERENCE:${joinUrl}`] : []),
            'BEGIN:VALARM',
            'TRIGGER:-PT30M',
            'ACTION:DISPLAY',
            `DESCRIPTION:${escape(summary)}`,
            'END:VALARM',
            'END:VEVENT',
            'END:VCALENDAR',
        ];

        return new NextResponse(lines.map(fold).join('\r\n'), {
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
