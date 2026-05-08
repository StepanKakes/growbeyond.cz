import { NextRequest, NextResponse } from 'next/server';

const QUALITIES = ['maxresdefault', 'sddefault', 'hqdefault', 'mqdefault'] as const;

// YouTube serves a 120x90 grey "no thumbnail" placeholder when a requested
// quality doesn't exist (instead of 404). We detect it by content-length —
// real thumbnails are >> 1 KB; the placeholder is well under 2 KB.
const PLACEHOLDER_MAX_BYTES = 2000;

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ videoId: string }> }
) {
    const { videoId } = await params;
    if (!/^[a-zA-Z0-9_-]{6,20}$/.test(videoId)) {
        return NextResponse.json({ error: 'invalid videoId' }, { status: 400 });
    }

    for (const q of QUALITIES) {
        const url = `https://img.youtube.com/vi/${videoId}/${q}.jpg`;
        try {
            const head = await fetch(url, { method: 'HEAD' });
            if (!head.ok) continue;
            const len = Number(head.headers.get('content-length') ?? '0');
            if (len > 0 && len <= PLACEHOLDER_MAX_BYTES) continue;

            const img = await fetch(url);
            if (!img.ok || !img.body) continue;
            return new NextResponse(img.body, {
                status: 200,
                headers: {
                    'content-type': 'image/jpeg',
                    'cache-control': 'public, max-age=86400, s-maxage=604800, immutable',
                },
            });
        } catch {
            continue;
        }
    }

    return NextResponse.redirect(new URL('/images/og-default.jpg', _request.url), 302);
}
