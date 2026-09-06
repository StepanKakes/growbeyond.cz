import { NextResponse } from 'next/server';
import { getRegistrationByToken, updateRegistration } from '@/lib/webinar/db';

export const runtime = 'nodejs';

// Odpovědi z dotazníku na děkovačce. Skóre je hrubé, slouží jen k tomu,
// aby tým věděl, komu se vyplatí napsat osobně před webinářem.

const REVENUE_SCORE: Record<string, number> = { 'do-50': 10, '50-150': 30, '150-500': 50, 'nad-500': 60 };
const TEAM_SCORE: Record<string, number> = { sam: 10, '1-3': 25, vic: 40 };

export async function POST(req: Request) {
    const body = (await req.json().catch(() => ({}))) as { token?: string; revenue?: string; team?: string };
    const token = String(body.token || '').trim();
    const revenue = String(body.revenue || '').trim();
    const team = String(body.team || '').trim();

    if (!token || !(revenue in REVENUE_SCORE) || !(team in TEAM_SCORE)) {
        return NextResponse.json({ ok: false }, { status: 400 });
    }

    try {
        const reg = await getRegistrationByToken(token);
        if (!reg) return NextResponse.json({ ok: false }, { status: 404 });

        await updateRegistration(reg.id, {
            qual_revenue: revenue,
            qual_team: team,
            qual_score: REVENUE_SCORE[revenue] + TEAM_SCORE[team],
            qualified_at: new Date().toISOString(),
        });
        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error('webinar/kvalifikace selhalo:', e);
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
