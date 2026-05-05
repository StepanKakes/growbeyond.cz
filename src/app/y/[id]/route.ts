import { NextRequest, NextResponse } from 'next/server';
import { slugify } from '@/lib/youtube';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    if (!/^[a-zA-Z0-9_-]{11}$/.test(id)) {
        return NextResponse.redirect(new URL('/', request.url), 302);
    }

    let campaign = `video-${id}`;
    try {
        const res = await fetch(
            `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`,
            { next: { revalidate: 86400 } }
        );
        if (res.ok) {
            const data = await res.json() as { title?: string };
            if (data.title) {
                const slug = slugify(data.title);
                if (slug) campaign = slug;
            }
        }
    } catch {
        // keep default campaign
    }

    const target = `${request.nextUrl.origin}/?utm_source=youtube&utm_campaign=${encodeURIComponent(campaign)}&utm_content=${id}#apply`;
    return NextResponse.redirect(target, 302);
}
