import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Persistence nejdál dosažené vteřiny VSL k leadovi v Notionu. cid = Notion page id
// (= /strategie/[id]). Server drží MAX — pošle se jen když přišlo větší číslo.
// Díky no-skip stačí tahle jediná hodnota na celou retention křivku na /leads.
const NOTION = 'https://api.notion.com/v1';
const MAX_PROP = 'Video max (s)';
const DUR_PROP = 'Video délka (s)';

export async function POST(req: Request) {
    try {
        const { cid, second, duration } = await req.json().catch(() => ({}));
        const token = process.env.NOTION_API_KEY;
        if (!token) return NextResponse.json({ ok: false }, { status: 200 });
        if (!cid || typeof second !== 'number' || !/^[0-9a-fA-F-]{32,36}$/.test(cid)) {
            return NextResponse.json({ ok: false }, { status: 400 });
        }

        const sec = Math.max(0, Math.floor(second));
        const headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28',
        };

        const pageRes = await fetch(`${NOTION}/pages/${cid}`, { headers, cache: 'no-store' });
        if (!pageRes.ok) return NextResponse.json({ ok: false }, { status: 200 });
        const page = await pageRes.json();
        const props = page.properties || {};
        const existingMax = typeof props[MAX_PROP]?.number === 'number' ? props[MAX_PROP].number : null;
        const existingDur = typeof props[DUR_PROP]?.number === 'number' ? props[DUR_PROP].number : null;

        const patch: Record<string, unknown> = {};
        if (existingMax == null || sec > existingMax) patch[MAX_PROP] = { number: sec };
        if (existingDur == null && typeof duration === 'number' && duration > 0) {
            patch[DUR_PROP] = { number: Math.round(duration) };
        }
        if (Object.keys(patch).length === 0) return NextResponse.json({ ok: true, skipped: true });

        await fetch(`${NOTION}/pages/${cid}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ properties: patch }),
        });
        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error('vsl-progress error', e);
        return NextResponse.json({ ok: false }, { status: 200 });
    }
}
