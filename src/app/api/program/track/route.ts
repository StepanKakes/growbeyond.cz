import { NextResponse } from 'next/server';
import { dayQuestion, fireBeoHook, isValidPageId, markDayWatched, nextDayContext, type ProgramDay } from '@/lib/free-program';

export const runtime = 'nodejs';

// Free program: milníky denního videa. Na vsl_finished zapíše "D{n} dokoukáno"
// + posune Stav a IDEMPOTENTNĚ (markDayWatched vrací first/sendQuestion) spustí
// Beo workflow dne přes incoming_webhook. Otázka odchází jednou za den — pokud už
// odešla dřív přes watch-scan (nedokoukal a odešel), hook se znovu nespouští.
// Klientský dedup (localStorage) v IG in-app browseru nestačí, dedup drží server.
export async function POST(req: Request) {
    try {
        const { cid, day, event } = await req.json().catch(() => ({}));
        if (!cid || !isValidPageId(cid) || ![1, 2, 3].includes(day) || typeof event !== 'string') {
            return NextResponse.json({ ok: false }, { status: 400 });
        }

        // Ostatní milníky (vsl_started/25/50/75) zatím jen potvrdíme — retenci per den
        // drží max vteřina v /api/program/progress.
        if (event !== 'vsl_finished') return NextResponse.json({ ok: true });

        const result = await markDayWatched(cid, day as ProgramDay);
        if (result?.first && result.sendQuestion && result.ig) {
            await fireBeoHook(`BEO_PROGRAM_HOOK_D${day}`, {
                username: result.ig,
                day: String(day),
                event: 'video_finished',
                watched: 'yes',
                question: dayQuestion(result.bucket, day as ProgramDay),
                bucket: result.bucket,
                ...nextDayContext(result.bucket, day as ProgramDay),
            });
        }
        return NextResponse.json({ ok: true, first: result?.first ?? false });
    } catch (e) {
        console.error('program/track error', e);
        return NextResponse.json({ ok: false }, { status: 200 });
    }
}
