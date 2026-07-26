import { NextRequest, NextResponse } from 'next/server';
import { findByUsername, igBrowserBreakout, PROGRAM_ORIGIN, sanitizeUsername } from '@/lib/free-program';

export const runtime = 'nodejs';

// Denní odkaz z Beo DM: /program/den/<n>?u=<ig_username> → redirect na
// /program/[id]/[den]. Když řádek neexistuje (odkaz přeposlaný dál apod.),
// pošleme člověka na start (diagnostika je vstupní brána programu).
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ den: string }> }
) {
    // IG webview → pokus o otevření v systémovém prohlížeči
    const breakout = igBrowserBreakout(req.headers.get('user-agent'), req.nextUrl.pathname, req.nextUrl.searchParams.toString());
    if (breakout) return breakout;

    // Za Traefikem/Coolify je req.nextUrl.origin localhost — vždy kanonický origin.
    const origin = PROGRAM_ORIGIN;
    const { den } = await params;
    const day = Number(den);
    const u = sanitizeUsername(req.nextUrl.searchParams.get('u'));

    if (!u || ![1, 2, 3].includes(day)) return NextResponse.redirect(`${origin}/program`, 302);

    const row = await findByUsername(u);
    if (!row) return NextResponse.redirect(`${origin}/program/start?u=${encodeURIComponent(u)}`, 302);

    return NextResponse.redirect(`${origin}/program/${row.id}/${day}`, 302);
}
