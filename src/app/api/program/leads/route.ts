import { NextRequest, NextResponse } from 'next/server';
import { archiveRow, listAllRows } from '@/lib/free-program';

export const runtime = 'nodejs';

// Free program: kompletní stav všech účastníků pro tracking dashboard v Beu.
// Autorizace stejným secretem jako scan endpointy (x-cron-secret).
export async function GET(req: NextRequest) {
    const secret = process.env.PROGRAM_CRON_SECRET;
    if (!secret || req.headers.get('x-cron-secret') !== secret) {
        return NextResponse.json({ ok: false }, { status: 401 });
    }
    const rows = await listAllRows();
    return NextResponse.json({ ok: true, rows });
}

// Odstranění účastníka z programu (archivace Notion řádku) — z Beo trackingu.
export async function DELETE(req: NextRequest) {
    const secret = process.env.PROGRAM_CRON_SECRET;
    if (!secret || req.headers.get('x-cron-secret') !== secret) {
        return NextResponse.json({ ok: false }, { status: 401 });
    }
    const { id } = await req.json().catch(() => ({}));
    if (!id || typeof id !== 'string') return NextResponse.json({ ok: false }, { status: 400 });
    const ok = await archiveRow(id);
    return NextResponse.json({ ok }, { status: ok ? 200 : 500 });
}
