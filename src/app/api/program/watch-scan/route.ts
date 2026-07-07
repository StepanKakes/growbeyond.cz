import { NextRequest, NextResponse } from 'next/server';
import { fireBeoHook, listAbandonedCandidates, markQuestionSent, nextDayContext } from '@/lib/free-program';

export const runtime = 'nodejs';

// Free program: scan ukončených sledování BEZ dokoukání. Divák pustil video (≥15 s),
// nedokoukal a poslední heartbeat je starší než 15 min → do Beo workflow dne odejde
// stejný hook jako při dokoukání, jen s watched=no + pct. Otázka max 1× za den
// (marker "D{n} otázka" sdílený s /api/program/track). Volá Beo schedule workflow
// každých ~10 min s hlavičkou x-cron-secret.
export async function POST(req: NextRequest) {
    const secret = process.env.PROGRAM_CRON_SECRET;
    if (!secret || req.headers.get('x-cron-secret') !== secret) {
        return NextResponse.json({ ok: false }, { status: 401 });
    }

    const candidates = await listAbandonedCandidates();
    let sent = 0;
    for (const c of candidates) {
        await markQuestionSent(c.id, c.day); // marker před hookem — radši ztratit otázku než ji poslat 2×
        await fireBeoHook(`BEO_PROGRAM_HOOK_D${c.day}`, {
            username: c.ig,
            day: String(c.day),
            event: 'video_stopped',
            watched: 'no',
            ...(c.watchedPct != null ? { pct: String(c.watchedPct) } : {}),
            question: c.question,
            bucket: c.bucket,
            ...nextDayContext(c.bucket, c.day),
        });
        sent++;
    }

    console.log(`program/watch-scan: ${sent} question(s) sent`);
    return NextResponse.json({ ok: true, sent });
}
