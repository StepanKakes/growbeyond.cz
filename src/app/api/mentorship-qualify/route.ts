import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Doplní kvalifikační odpovědi k existujícímu leadu (vytvořenému při e-mail+IG).
export async function POST(request: NextRequest) {
    const { id, q3, q4, q5, q6 } = await request.json().catch(() => ({})) as {
        id?: string; q3?: string; q4?: string; q5?: string; q6?: string;
    };

    if (!id || !/^[0-9a-fA-F-]{32,36}$/.test(id)) {
        return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const token = process.env.NOTION_API_KEY;
    if (!token) return NextResponse.json({ error: 'Server config' }, { status: 500 });

    const q3Short = q3 ? q3.split(':')[0].trim() : '';
    const properties: Record<string, unknown> = {
        ...(q3Short ? { 'Problém': { select: { name: q3Short } } } : {}),
        ...(q4 ? { 'Současný příjem': { select: { name: q4 } } } : {}),
        ...(q5 ? { 'Způsob monetizace': { select: { name: q5 } } } : {}),
        ...(q6 ? { 'Investice do růstu': { select: { name: q6 } } } : {}),
    };

    try {
        const res = await fetch(`https://api.notion.com/v1/pages/${id}`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'Notion-Version': '2022-06-28' },
            body: JSON.stringify({ properties }),
        });
        if (!res.ok) {
            console.error('Notion qualify error', await res.text());
            return NextResponse.json({ error: 'Update failed' }, { status: 500 });
        }
        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error('qualify error', e);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
