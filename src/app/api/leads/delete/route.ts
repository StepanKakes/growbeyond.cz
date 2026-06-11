import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Smaže (archivuje) lead v Notionu. Archivace = obnovitelné z koše.
// Chráněno stejnou cookie jako /leads dashboard.
export async function POST(request: NextRequest) {
    if (request.cookies.get('sop_authorized')?.value !== 'true') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json().catch(() => ({})) as { id?: string };
    if (!id || !/^[0-9a-fA-F-]{32,36}$/.test(id)) {
        return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const token = process.env.NOTION_API_KEY;
    if (!token) return NextResponse.json({ error: 'Server config' }, { status: 500 });

    const res = await fetch(`https://api.notion.com/v1/pages/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'Notion-Version': '2022-06-28' },
        body: JSON.stringify({ archived: true }),
    });

    if (!res.ok) {
        console.error('Notion delete error', await res.text());
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
}
