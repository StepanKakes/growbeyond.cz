import { NextRequest, NextResponse } from 'next/server';
import { dbConfigured, getEdition, listRegistrations, updateRegistration } from '@/lib/webinar/db';
import { isOptOut } from '@/lib/webinar/waha';

export const runtime = 'nodejs';

// Příchozí WhatsApp zprávy. Zajímá nás jediné: když někdo napíše stop,
// okamžitě ho vyřadíme z dalších zpráv. Bez tohohle by opt out byla jen
// věta v textu, kterou nikdo nevyslyší.
//
// Volá n8n z WAHA webhooku message.any, nebo WAHA přímo.

export async function POST(req: NextRequest) {
    const secret = process.env.WEBINAR_WA_WEBHOOK_SECRET;
    if (secret && req.headers.get('x-webinar-secret') !== secret) {
        return NextResponse.json({ ok: false }, { status: 401 });
    }
    if (!dbConfigured()) return NextResponse.json({ ok: true });

    const body = (await req.json().catch(() => ({}))) as {
        // podporujeme jak surový WAHA tvar, tak zjednodušený z n8n
        payload?: { from?: string; body?: string; fromMe?: boolean };
        from?: string;
        text?: string;
    };

    const from = body.payload?.from || body.from || '';
    const text = body.payload?.body || body.text || '';
    const fromMe = body.payload?.fromMe === true;

    if (fromMe || !from || !text || !isOptOut(text)) {
        return NextResponse.json({ ok: true, action: 'ignored' });
    }

    // WhatsApp chatId má tvar 420777123456@c.us, my držíme telefon s plusem.
    const digits = from.split('@')[0].replace(/[^\d]/g, '');
    if (!digits) return NextResponse.json({ ok: true, action: 'ignored' });

    try {
        const edition = await getEdition();
        if (!edition) return NextResponse.json({ ok: true });

        const registrations = await listRegistrations(edition.id);
        const match = registrations.find(r => r.phone && r.phone.replace(/[^\d]/g, '') === digits);
        if (!match) return NextResponse.json({ ok: true, action: 'no-match' });

        await updateRegistration(match.id, {
            wa_status: 'opted_out',
            wa_opted_out_at: new Date().toISOString(),
            consent_whatsapp: false,
        });
        console.log('webinar/wa-inbound: opt out', match.email);
        return NextResponse.json({ ok: true, action: 'opted-out' });
    } catch (e) {
        console.error('webinar/wa-inbound selhalo:', e);
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
