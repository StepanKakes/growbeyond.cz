import { NextResponse } from 'next/server';
import { getRegistrationByToken, updateRegistration } from '@/lib/webinar/db';

export const runtime = 'nodejs';

// Odpovědi z dotazníku na děkovačce, druhý krok registrace.
//
// Skóre je hrubé a slouží jen k tomu, aby tým poznal, komu se vyplatí
// napsat osobně ještě před webinářem. Odpověď na to, kde se člověk
// zasekl, se ukládá jako kontext, ale neskóruje, protože ani jedna
// možnost není sama o sobě dobrá nebo špatná.

const REVENUE_SCORE: Record<string, number> = { rozjezd: 0, 'do-100': 10, '100-300': 25, '300-1m': 40, 'nad-1m': 50 };
const STUCK = new Set(['znamost', 'kapacita', 'obsah', 'nabidka', 'nevim']);

export async function POST(req: Request) {
    const body = (await req.json().catch(() => ({}))) as { token?: string; revenue?: string; stuck?: string };
    const token = String(body.token || '').trim();
    const revenue = String(body.revenue || '').trim();
    const stuck = String(body.stuck || '').trim();

    if (!token || !(revenue in REVENUE_SCORE) || !STUCK.has(stuck)) {
        return NextResponse.json({ ok: false }, { status: 400 });
    }

    try {
        const reg = await getRegistrationByToken(token);
        if (!reg) return NextResponse.json({ ok: false }, { status: 404 });

        await updateRegistration(reg.id, {
            qual_revenue: revenue,
            qual_stuck: stuck,
            qual_score: REVENUE_SCORE[revenue],
            qualified_at: new Date().toISOString(),
        });
        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error('webinar/kvalifikace selhalo:', e);
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
