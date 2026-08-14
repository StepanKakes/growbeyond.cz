import { NextRequest, NextResponse } from 'next/server';
import { fireBeoHook, listRegNudgeCandidates, markRegNudged } from '@/lib/free-program';

export const runtime = 'nodejs';

// Free program: follow-up 10 minut po registraci, když člověk nespustil video
// dne 1. Volá ho Beo workflow "Free Program: Register scan" (schedule ~2 min)
// s hlavičkou x-cron-secret. Kandidátům odejde hook do Beo workflow
// "Free Program: Nudge registrace" (DM s odkazem na první video). Max 1×
// na osobu (marker "Reg nudge" v Notion, zapisuje se PŘED hookem — radši
// připomínku ztratit než poslat dvakrát).
const BEO_HOOK_FALLBACK = 'https://app.growbeyond.cz/api/automations/hooks/442d5b0833e969b9d169a46eba7487c81e3a0ff3';

export async function POST(req: NextRequest) {
    const secret = process.env.PROGRAM_CRON_SECRET;
    if (!secret || req.headers.get('x-cron-secret') !== secret) {
        return NextResponse.json({ ok: false }, { status: 401 });
    }

    const candidates = await listRegNudgeCandidates();
    let sent = 0;
    for (const c of candidates) {
        await markRegNudged(c.id);
        await fireBeoHook('BEO_PROGRAM_HOOK_REG_NUDGE', {
            username: c.ig,
            day: '1',
            link: c.link,
            ...(c.email ? { email: c.email } : {}),
        }, BEO_HOOK_FALLBACK);
        sent++;
    }

    if (sent) console.log(`program/register-scan: ${sent} nudge(s) sent`);
    return NextResponse.json({ ok: true, sent });
}
