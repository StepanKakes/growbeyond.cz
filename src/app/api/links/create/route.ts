import { NextRequest, NextResponse } from 'next/server';
import { extractYouTubeId } from '@/lib/youtube';

const NOTION_API = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';
const SHORT_LINKS_DB_ID = process.env.NOTION_SHORT_LINKS_DB_ID!;
const NOTION_TOKEN = process.env.NOTION_API_KEY!;

const headers = () => ({
    'Authorization': `Bearer ${NOTION_TOKEN}`,
    'Content-Type': 'application/json',
    'Notion-Version': NOTION_VERSION,
});

const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
function randomSlug(len = 6): string {
    let s = '';
    for (let i = 0; i < len; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    return s;
}

async function slugExists(slug: string): Promise<boolean> {
    const res = await fetch(`${NOTION_API}/databases/${SHORT_LINKS_DB_ID}/query`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
            filter: { property: 'Slug', title: { equals: slug } },
            page_size: 1,
        }),
    });
    if (!res.ok) return false;
    const data = await res.json() as { results: unknown[] };
    return data.results.length > 0;
}

async function fetchYoutubeTitle(videoId: string): Promise<string> {
    try {
        const res = await fetch(
            `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
            { next: { revalidate: 86400 } }
        );
        if (!res.ok) return '';
        const data = await res.json() as { title?: string };
        return data.title ?? '';
    } catch {
        return '';
    }
}

export async function POST(request: NextRequest) {
    try {
        if (request.cookies.get('internal_authorized')?.value !== 'true') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        if (!SHORT_LINKS_DB_ID) {
            return NextResponse.json({ error: 'Chybí env var NOTION_SHORT_LINKS_DB_ID' }, { status: 500 });
        }
        if (!NOTION_TOKEN) {
            return NextResponse.json({ error: 'Chybí env var NOTION_API_KEY' }, { status: 500 });
        }

        const body = await request.json() as {
            targetUrl?: string;
            slug?: string;
            title?: string;
            source?: string;
        };

        const targetUrl = body.targetUrl?.trim();
        if (!targetUrl) {
            return NextResponse.json({ error: 'Target URL je povinné' }, { status: 400 });
        }

        let url: URL;
        try {
            url = new URL(targetUrl);
        } catch {
            return NextResponse.json({ error: 'Neplatné URL' }, { status: 400 });
        }

        let slug = body.slug?.trim();
        if (slug) {
            if (!/^[a-zA-Z0-9_-]{1,32}$/.test(slug)) {
                return NextResponse.json({ error: 'Slug může obsahovat jen písmena, čísla, _ a -' }, { status: 400 });
            }
            if (await slugExists(slug)) {
                return NextResponse.json({ error: 'Slug už existuje' }, { status: 409 });
            }
        } else {
            for (let i = 0; i < 10; i++) {
                slug = randomSlug(6);
                if (!(await slugExists(slug))) break;
            }
        }

        let source = body.source ?? 'custom';
        if (!['custom', 'youtube', 'instagram', 'dms'].includes(source)) source = 'custom';

        let title = body.title?.trim() ?? '';
        if (!title) {
            const ytId = extractYouTubeId(targetUrl);
            if (ytId) {
                title = await fetchYoutubeTitle(ytId);
                if (source === 'custom') source = 'youtube';
            }
            if (!title) title = url.hostname;
        }

        const res = await fetch(`${NOTION_API}/pages`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({
                parent: { database_id: SHORT_LINKS_DB_ID },
                properties: {
                    'Slug': { title: [{ text: { content: slug! } }] },
                    'Target URL': { url: targetUrl },
                    'Title': { rich_text: [{ text: { content: title } }] },
                    'Source': { select: { name: source } },
                    'Active': { checkbox: true },
                },
            }),
        });

        if (!res.ok) {
            const err = await res.text();
            console.error('[create-link] Notion error:', err);
            return NextResponse.json({ error: `Notion API ${res.status}: ${err.slice(0, 200)}` }, { status: 500 });
        }

        return NextResponse.json({ slug, title, source, targetUrl });
    } catch (e) {
        console.error('[create-link] unexpected:', e);
        const msg = e instanceof Error ? e.message : 'Unknown error';
        return NextResponse.json({ error: `Server error: ${msg}` }, { status: 500 });
    }
}
