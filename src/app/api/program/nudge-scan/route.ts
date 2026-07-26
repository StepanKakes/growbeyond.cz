import { NextRequest, NextResponse } from 'next/server';
import { fireBeoHook, listNudgeCandidates, markNudged } from '@/lib/free-program';

export const runtime = 'nodejs';

// Free program: denní scan nedokoukaných videí. Volá ho Beo workflow
// "Free Program: Nudge scan" (schedule) s hlavičkou x-cron-secret. Pro každého
// kandidáta pošleme payload do Beo workflow "Free Program: Nudge", které doručí
// měkkou připomínku do DM. Nudge max 1× / 20 h na osobu (hlídá listNudgeCandidates).
export async function POST(req: NextRequest) {
    const secret = process.env.PROGRAM_CRON_SECRET;
    if (!secret || req.headers.get('x-cron-secret') !== secret) {
        return NextResponse.json({ ok: false }, { status: 401 });
    }

    const candidates = await listNudgeCandidates();
    let sent = 0;
    for (const c of candidates) {
        await fireBeoHook('BEO_PROGRAM_HOOK_NUDGE', {
            username: c.ig,
            day: String(c.day),
            link: c.link,
            ...(c.email ? { email: c.email } : {}),
        });
        await markNudged(c.id);
        sent++;
    }

    console.log(`program/nudge-scan: ${sent} nudge(s) sent`);
    return NextResponse.json({ ok: true, sent });
}
