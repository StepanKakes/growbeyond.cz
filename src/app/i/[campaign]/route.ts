import { NextRequest, NextResponse } from 'next/server';
import { slugify } from '@/lib/youtube';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ campaign: string }> }
) {
    const { campaign } = await params;
    const slug = slugify(decodeURIComponent(campaign)) || 'bio';
    const target = `${request.nextUrl.origin}/?utm_source=instagram&utm_campaign=${encodeURIComponent(slug)}#apply`;
    return NextResponse.redirect(target, 302);
}
