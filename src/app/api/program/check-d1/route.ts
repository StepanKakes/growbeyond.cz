import { NextRequest, NextResponse } from 'next/server';
import { dayLink, findByUsername, fireBeoHook, markRegNudged, sanitizeUsername } from '@/lib/free-program';

export const runtime = 'nodejs';

// Free program: cílená kontrola po registraci (event flow místo scanu).
// Volá ji Beo workflow "Free Program: Hlídka prvního videa": registrace vystřelí
// hook do Bea, workflow počká (výchozí 5 min, editovatelné v Beu) a pak POSTne
// sem. Když člověk video dne 1 ještě nespustil, odejde mu připomínka přes
// workflow "Free Program: Nudge registrace". Max 1x (marker Reg nudge).
const BEO_HOOK_FALLBACK = 'https://beo.growbeyond.cz/api/automations/hooks/442d5b0833e969b9d169a46eba7487c81e3a0ff3';

export async function POST(req: NextRequest) {
    const secret = process.env.PROGRAM_CRON_SECRET;
    if (!secret || req.headers.get('x-cron-secret') !== secret) {
        return NextResponse.json({ ok: false }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const username = sanitizeUsername(body?.username);
    if (!username) return NextResponse.json({ ok: false, error: 'username chybí' }, { status: 400 });

    const row = await findByUsername(username);
    if (!row) return NextResponse.json({ ok: true, nudged: false, reason: 'not_found' });

    const watching = !!row.dayWatched[1] || (row.dayMax[1] ?? 0) > 0;
    if (watching || row.regNudge) {
        return NextResponse.json({ ok: true, nudged: false, reason: watching ? 'watching' : 'already_nudged' });
    }

    await markRegNudged(row.id); // marker před hookem — radši ztratit než poslat 2x
    await fireBeoHook('BEO_PROGRAM_HOOK_REG_NUDGE', {
        username: row.ig,
        day: '1',
        link: dayLink(1, row.ig),
        ...(row.email ? { email: row.email } : {}),
    }, BEO_HOOK_FALLBACK);

    console.log(`program/check-d1: nudge sent to @${row.ig}`);
    return NextResponse.json({ ok: true, nudged: true });
}
