import { NextResponse } from 'next/server';
import { dayLink, fireBeoHook, getProgramRow, isValidPageId, saveDiagnostika } from '@/lib/free-program';

export const runtime = 'nodejs';

const OPT = /^[A-D]$/;

// Free program: odeslání diagnostiky (4 otázky z /program/[id]). Zapíše odpovědi
// + dopočítaný Bucket, posune Stav na Den 1 a řekne Beu, ať pošle DM s prvním videem.
export async function POST(req: Request) {
    try {
        const { cid, q1, q2, q3, q4, q3jinak } = await req.json().catch(() => ({}));
        if (!cid || !isValidPageId(cid) || ![q1, q3].every(v => OPT.test(v ?? '')) || !/^[A-E]$/.test(q2 ?? '') || !/^[A-C]$/.test(q4 ?? '')) {
            return NextResponse.json({ ok: false }, { status: 400 });
        }

        const row = await getProgramRow(cid);
        if (!row) return NextResponse.json({ ok: false }, { status: 404 });

        const saved = await saveDiagnostika(cid, { q1, q2, q3, q4, q3jinak: typeof q3jinak === 'string' ? q3jinak : undefined });
        if (!saved) return NextResponse.json({ ok: false }, { status: 500 });

        // Beo pošle do DM odkaz na Den 1 (jen poprvé — opakovaný submit DM neduplikuje)
        if (row.ig && !row.bucket) {
            await fireBeoHook('BEO_PROGRAM_HOOK_DIAG', {
                username: row.ig,
                bucket: saved.bucket,
                link: dayLink(1, row.ig),
                ...(row.email ? { email: row.email } : {}),
            });
        }

        return NextResponse.json({ ok: true, next: `/program/${cid}/1`, bucket: saved.bucket });
    } catch (e) {
        console.error('program/diagnostika error', e);
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
