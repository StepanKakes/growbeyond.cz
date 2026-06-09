import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Uloží/smaže Clarity odkaz u leada (Notion property "Clarity").
// Chráněno stejnou cookie jako /leads dashboard.
export async function POST(request: NextRequest) {
    if (request.cookies.get('sop_authorized')?.value !== 'true') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, url } = await request.json().catch(() => ({})) as { id?: string; url?: string };
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const clean = (url || '').trim();
    if (clean && !/^https?:\/\/(www\.)?clarity\.microsoft\.com\//i.test(clean)) {
        return NextResponse.json({ error: 'Nevypadá to jako Clarity odkaz' }, { status: 400 });
    }

    const token = process.env.NOTION_API_KEY;
    if (!token) return NextResponse.json({ error: 'Server config' }, { status: 500 });

    const res = await fetch(`https://api.notion.com/v1/pages/${id}`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({ properties: { Clarity: { url: clean || null } } }),
    });

    if (!res.ok) {
        console.error('Notion clarity update error', await res.text());
        return NextResponse.json({ error: 'Notion update failed' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, url: clean });
}
