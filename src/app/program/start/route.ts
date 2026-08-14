import { NextRequest, NextResponse } from 'next/server';
import { findOrCreateByUsername, fireBeoHook, igBrowserBreakout, PROGRAM_ORIGIN, sanitizeUsername } from '@/lib/free-program';

export const runtime = 'nodejs';

// Vstup do free programu z Beo DM: /program/start?u=<ig_username>
// Založí (nebo najde) řádek v Notion DB Free Program a přesměruje na kanonickou
// URL /program/[id] (analýza + diagnostika). Beo zná jen username — most na cid.
export async function GET(req: NextRequest) {
    // IG webview → pokus o otevření v systémovém prohlížeči
    const breakout = igBrowserBreakout(req.headers.get('user-agent'), req.nextUrl.pathname, req.nextUrl.searchParams.toString());
    if (breakout) return breakout;

    // Za Traefikem/Coolify je req.nextUrl.origin localhost — vždy kanonický origin.
    const origin = PROGRAM_ORIGIN;
    const u = sanitizeUsername(req.nextUrl.searchParams.get('u'));
    if (!u) return NextResponse.redirect(`${origin}/program`, 302);

    const utm = req.nextUrl.searchParams.get('utm_source') || 'ig-dm';
    const row = await findOrCreateByUsername(u, utm);
    if (!row) return NextResponse.redirect(`${origin}/program`, 302);

    // Hlídka prvního videa (idempotentní — check-d1 má marker, opakovaný vstup nevadí).
    await fireBeoHook('BEO_PROGRAM_HOOK_REGISTERED', { username: u }, 'https://app.growbeyond.cz/api/automations/hooks/85c07cf4a93692a8c08cf5bd3b8bfb5893b4b5fc');

    return NextResponse.redirect(`${origin}/program/${row.id}`, 302);
}
