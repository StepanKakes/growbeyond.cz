import { NextRequest, NextResponse, after } from 'next/server';
import { slugify } from '@/lib/youtube';
import { parseClickContext, recordClick } from '@/lib/notion-links';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ campaign: string }> }
) {
    const { campaign } = await params;
    const slug = slugify(decodeURIComponent(campaign)) || 'bio';
    const target = `${request.nextUrl.origin}/?utm_source=instagram&utm_campaign=${encodeURIComponent(slug)}#apply`;

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
