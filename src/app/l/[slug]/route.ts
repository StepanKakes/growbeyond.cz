import { NextRequest, NextResponse, after } from 'next/server';
import { getLinkBySlug, parseClickContext, recordClick, buildYouTubeDeepLink } from '@/lib/notion-links';
import { extractYouTubeId } from '@/lib/youtube';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const link = await getLinkBySlug(slug);

    if (!link) {
        return NextResponse.redirect(new URL('/', request.url), 302);
    }

    let target = link.targetUrl;
    const ua = request.headers.get('user-agent') ?? '';

    // YouTube deep link on mobile
    const ytId = extractYouTubeId(link.targetUrl);
    if (ytId) {
        target = buildYouTubeDeepLink(ytId, ua);
    }

    const ctx = parseClickContext(request);
    after(async () => {
        await recordClick({
            slug,
            source: link.source,
            campaign: '',
            content: link.title,
            targetUrl: target,
            linkPageId: link.pageId,
            ctx,
        });
    });

    return NextResponse.redirect(target, 302);
}
