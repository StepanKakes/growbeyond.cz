import { NextRequest, NextResponse } from 'next/server';

const NOTION_API = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';
const NOTION_TOKEN = process.env.NOTION_API_KEY!;

const headers = () => ({
    'Authorization': `Bearer ${NOTION_TOKEN}`,
    'Content-Type': 'application/json',
    'Notion-Version': NOTION_VERSION,
});

export async function POST(request: NextRequest) {
    if (request.cookies.get('internal_authorized')?.value !== 'true') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { pageId } = await request.json() as { pageId?: string };
    if (!pageId) return NextResponse.json({ error: 'pageId required' }, { status: 400 });

    const res = await fetch(`${NOTION_API}/pages/${pageId}`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ archived: true }),
    });

    if (!res.ok) {
        return NextResponse.json({ error: 'Notion API failed' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}
