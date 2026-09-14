import { NextResponse } from 'next/server';
import { REVENUE_SCORE, STUCK_OPTIONS } from '@/components/webinar/qualifyOptions';
import { getRegistrationByToken, updateRegistration } from '@/lib/webinar/db';

export const runtime = 'nodejs';

// Odpovědi z dotazníku na děkovačce, druhý krok registrace.
//
// Skóre i znění otázek žijí v qualifyOptions, ať se formulář, tenhle
// endpoint a přehled nemůžou rozejít. Odpověď na to, kde se člověk zasekl,
// se ukládá jako kontext, ale neskóruje, protože ani jedna možnost není
// sama o sobě dobrá nebo špatná.

const STUCK = new Set(STUCK_OPTIONS.map(o => o.value));

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
