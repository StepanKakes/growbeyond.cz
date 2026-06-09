import { NextRequest, NextResponse } from 'next/server';
import { getInstagramProfile } from '@/lib/validate-contact';

export const runtime = 'nodejs';

// Proxy IG profilovky přes naši doménu — prohlížeče běžně blokují
// cdninstagram.com / fbcdn.net (tracker ochrana), navíc signed URL expirují.
// Když je dán username, dotáhneme vždy čerstvou URL (s cache); url je jen hint.

const ALLOWED_HOST = /(\.cdninstagram\.com|\.fbcdn\.net)$/i;

function hostAllowed(u: string): boolean {
    try { return ALLOWED_HOST.test(new URL(u).hostname); } catch { return false; }
}

async function fetchImage(url: string): Promise<Response | null> {
    try {
        const r = await fetch(url, {
            headers: { 'user-agent': 'Mozilla/5.0', referer: 'https://www.instagram.com/' },
            signal: AbortSignal.timeout(8000),
        });
        if (r.ok && (r.headers.get('content-type') || '').startsWith('image')) return r;
    } catch { /* spadne na fallback */ }
    return null;
}

export async function GET(req: NextRequest) {
    const sp = req.nextUrl.searchParams;
    let url = sp.get('url') || '';
    const username = sp.get('username') || '';

    let imgRes: Response | null = null;
    if (url && hostAllowed(url)) imgRes = await fetchImage(url);

    // Hint URL expiroval/chybí → dotáhni čerstvou podle username
    if (!imgRes && username) {
        const p = await getInstagramProfile(username);
        if (p.profile?.profilePicUrl && hostAllowed(p.profile.profilePicUrl)) {
            url = p.profile.profilePicUrl;
            imgRes = await fetchImage(url);
        }
    }

    if (!imgRes) {
        return NextResponse.redirect(new URL('/images/avatar-fallback.svg', req.url));
    }

    const buf = await imgRes.arrayBuffer();
    return new NextResponse(buf, {
        headers: {
            'Content-Type': imgRes.headers.get('content-type') || 'image/jpeg',
            'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        },
    });
}
