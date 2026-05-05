import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const id = request.nextUrl.searchParams.get('id');
    if (!id || !/^[a-zA-Z0-9_-]{11}$/.test(id)) {
        return NextResponse.json({ error: 'Invalid video ID' }, { status: 400 });
    }
    try {
        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`;
        const res = await fetch(oembedUrl, { next: { revalidate: 86400 } });
        if (!res.ok) {
            return NextResponse.json({ error: 'Video not found' }, { status: 404 });
        }
        const data = await res.json() as { title?: string; author_name?: string };
        return NextResponse.json({ title: data.title ?? '', author: data.author_name ?? '' });
    } catch {
        return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
    }
}
