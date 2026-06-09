import { NextRequest, NextResponse } from 'next/server';
import { listMentorshipLeads } from '@/lib/mentorship-leads';
import { getInstagramProfile } from '@/lib/validate-contact';

export const runtime = 'nodejs';
export const maxDuration = 300;

// Bulk doplnění IG enrichmentu (profilovka, jméno, sledující, verified)
// u starších leadů, kteří to ještě nemají. Chráněno cookie jako /leads.
export async function POST(request: NextRequest) {
    if (request.cookies.get('sop_authorized')?.value !== 'true') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = process.env.NOTION_API_KEY;
    if (!token) return NextResponse.json({ error: 'Server config' }, { status: 500 });

    const leads = await listMentorshipLeads();
    // Co potřebuje doplnit: má IG handle, ale chybí profilovka nebo sledující
    const todo = leads.filter(l => l.ig && (!l.profilePic || l.followers == null));

    let enriched = 0;
    let skipped = 0;

    const updateNotion = async (id: string, profile: { followers: number | null; isVerified: boolean; profilePicUrl: string; fullName: string }) => {
        const properties: Record<string, unknown> = {
            'Verified': { checkbox: profile.isVerified },
            ...(profile.followers != null ? { 'Sledující': { number: profile.followers } } : {}),
            ...(profile.profilePicUrl ? { 'Profilovka': { url: profile.profilePicUrl } } : {}),
            ...(profile.fullName ? { 'Jméno': { rich_text: [{ text: { content: profile.fullName } }] } } : {}),
        };
        await fetch(`https://api.notion.com/v1/pages/${id}`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'Notion-Version': '2022-06-28' },
            body: JSON.stringify({ properties }),
        });
    };

    // Zpracuj po dávkách (concurrency 4), ať šetříme proxy i nepřetížíme Notion
    const BATCH = 4;
    for (let i = 0; i < todo.length; i += BATCH) {
        const batch = todo.slice(i, i + BATCH);
        await Promise.all(batch.map(async (lead) => {
            try {
                const p = await getInstagramProfile(lead.ig);
                if (p.found && p.profile) {
                    await updateNotion(lead.id, p.profile);
                    enriched++;
                } else {
                    skipped++;
                }
            } catch {
                skipped++;
            }
        }));
    }

    return NextResponse.json({ ok: true, total: leads.length, candidates: todo.length, enriched, skipped });
}
