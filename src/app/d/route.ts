import { NextRequest, NextResponse, after } from 'next/server';
import { parseClickContext, recordClick } from '@/lib/notion-links';

export async function GET(request: NextRequest) {
    const target = `${request.nextUrl.origin}/?utm_source=dms&utm_campaign=default#apply`;
    const ctx = parseClickContext(request);
    after(async () => {
        await recordClick({
            slug: 'd',
            source: 'dms',
            campaign: 'default',
            content: '',
            targetUrl: target,
            ctx,
        });
    });
    return NextResponse.redirect(target, 302);
}
