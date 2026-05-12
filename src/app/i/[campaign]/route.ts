import { NextRequest, NextResponse, after } from 'next/server';
import { slugify } from '@/lib/youtube';
import { getPublicOrigin, parseClickContext, recordClick } from '@/lib/notion-links';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ campaign: string }> }
) {
    const { campaign } = await params;
    const slug = slugify(decodeURIComponent(campaign)) || 'bio';
    const origin = getPublicOrigin(request);
    const target = `${origin}/?utm_source=instagram&utm_campaign=${encodeURIComponent(slug)}#apply`;

    const ctx = parseClickContext(request);
    after(async () => {
        await recordClick({
            slug: `i/${slug}`,
            source: 'instagram',
            campaign: slug,
            content: '',
            targetUrl: target,
            ctx,
        });
    });

    return NextResponse.redirect(target, 302);
}
