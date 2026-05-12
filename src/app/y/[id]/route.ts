import { NextRequest, NextResponse, after } from 'next/server';
import { slugify } from '@/lib/youtube';
import { getPublicOrigin, parseClickContext, recordClick } from '@/lib/notion-links';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const origin = getPublicOrigin(request);

    if (!/^[a-zA-Z0-9_-]{11}$/.test(id)) {
        return NextResponse.redirect(`${origin}/`, 302);
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

    const target = `${origin}/?utm_source=youtube&utm_campaign=${encodeURIComponent(campaign)}&utm_content=${id}`;

    const ctx = parseClickContext(request);
    after(async () => {
        await recordClick({
            slug: `y/${id}`,
            source: 'youtube',
            campaign,
            content: id,
            targetUrl: target,
            ctx,
        });
    });

    return NextResponse.redirect(target, 302);
}
