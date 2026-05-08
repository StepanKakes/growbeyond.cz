import { NextRequest, NextResponse, after } from 'next/server';
import { parseClickContext, recordClick } from '@/lib/notion-links';

export async function GET(request: NextRequest) {
    const target = `${request.nextUrl.origin}/?utm_source=instagram&utm_campaign=bio#apply`;
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
