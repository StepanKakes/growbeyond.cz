import { NextRequest, NextResponse } from 'next/server';
import { findOrCreateByUsername, sanitizeUsername } from '@/lib/free-program';

export const runtime = 'nodejs';

// Vstup do free programu z Beo DM: /program/start?u=<ig_username>
// Založí (nebo najde) řádek v Notion DB Free Program a přesměruje na kanonickou
// URL /program/[id] (analýza + diagnostika). Beo zná jen username — most na cid.
export async function GET(req: NextRequest) {
    const origin = req.nextUrl.origin;
    const u = sanitizeUsername(req.nextUrl.searchParams.get('u'));
    if (!u) return NextResponse.redirect(`${origin}/strategie`, 302);

    const utm = req.nextUrl.searchParams.get('utm_source') || 'ig-dm';
    const row = await findOrCreateByUsername(u, utm);
    if (!row) return NextResponse.redirect(`${origin}/strategie`, 302);

    return NextResponse.redirect(`${origin}/program/${row.id}`, 302);
}
