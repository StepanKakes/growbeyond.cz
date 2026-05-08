import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

const NOTION_API = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';
const NOTION_TOKEN = process.env.NOTION_API_KEY!;

const headers = () => ({
    'Authorization': `Bearer ${NOTION_TOKEN}`,
    'Content-Type': 'application/json',
    'Notion-Version': NOTION_VERSION,
});

export async function POST(request: NextRequest) {
    const { pageId, active } = await request.json() as { pageId?: string; active?: boolean };
    if (!pageId || typeof active !== 'boolean') {
        return NextResponse.json({ error: 'pageId and active required' }, { status: 400 });
    }

    const res = await fetch(`${NOTION_API}/pages/${pageId}`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({
            properties: { 'Active': { checkbox: active } },
        }),
    });

    if (!res.ok) {
        return NextResponse.json({ error: 'Notion API failed' }, { status: 500 });
    }

    revalidateTag('short-links', 'default');
    return NextResponse.json({ ok: true });
}
