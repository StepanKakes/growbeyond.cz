import { NextResponse } from 'next/server';
import { isValidPageId, updateDayProgress, type ProgramDay } from '@/lib/free-program';

export const runtime = 'nodejs';

// Free program: persistence nejdál dosažené vteřiny denního videa (server drží MAX).
// Obdoba /api/vsl-progress, jen per-den pole v DB Free Program.
export async function POST(req: Request) {
    try {
        const { cid, day, second, duration } = await req.json().catch(() => ({}));
        if (!process.env.NOTION_API_KEY) return NextResponse.json({ ok: false }, { status: 200 });
        if (!cid || !isValidPageId(cid) || ![1, 2, 3].includes(day) || typeof second !== 'number') {
            return NextResponse.json({ ok: false }, { status: 400 });
        }
        const ok = await updateDayProgress(cid, day as ProgramDay, second, typeof duration === 'number' ? duration : undefined);
        return NextResponse.json({ ok });
    } catch (e) {
        console.error('program/progress error', e);
        return NextResponse.json({ ok: false }, { status: 200 });
    }
}
