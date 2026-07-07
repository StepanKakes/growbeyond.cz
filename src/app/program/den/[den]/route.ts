import { NextRequest, NextResponse } from 'next/server';
import { findByUsername, sanitizeUsername } from '@/lib/free-program';

export const runtime = 'nodejs';

// Denní odkaz z Beo DM: /program/den/<n>?u=<ig_username> → redirect na
// /program/[id]/[den]. Když řádek neexistuje (odkaz přeposlaný dál apod.),
// pošleme člověka na start (diagnostika je vstupní brána programu).
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ den: string }> }
) {
    const origin = req.nextUrl.origin;
    const { den } = await params;
    const day = Number(den);
    const u = sanitizeUsername(req.nextUrl.searchParams.get('u'));

    if (!u || ![1, 2, 3].includes(day)) return NextResponse.redirect(`${origin}/strategie`, 302);

    const row = await findByUsername(u);
    if (!row) return NextResponse.redirect(`${origin}/program/start?u=${encodeURIComponent(u)}`, 302);

    return NextResponse.redirect(`${origin}/program/${row.id}/${day}`, 302);
}
