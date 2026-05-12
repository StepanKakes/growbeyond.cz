import { NextRequest, NextResponse, after } from 'next/server';
import { getPublicOrigin, parseClickContext, recordClick } from '@/lib/notion-links';

export async function GET(request: NextRequest) {
    const origin = getPublicOrigin(request);
    const target = `${origin}/?utm_source=instagram&utm_campaign=bio#apply`;
    const ctx = parseClickContext(request);
    after(async () => {
        await recordClick({
            slug: 'i',
            source: 'instagram',
            campaign: 'bio',
            content: '',
            targetUrl: target,
            ctx,
        });
    });
    return NextResponse.redirect(target, 302);
}
