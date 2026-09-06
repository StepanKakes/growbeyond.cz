import { NextResponse } from 'next/server';
import { createApplication, getEdition, getRegistrationByToken, updateRegistration } from '@/lib/webinar/db';

export const runtime = 'nodejs';

// Přihláška na hovor po webináři. Kdo projde kvalifikací, dostane odkaz
// rovnou do kalendáře, kdo neprojde, zůstává v sekvenci bez hovoru.

const CAL_LINK = process.env.WEBINAR_CAL_LINK || 'https://cal.com/creationwithtim/strategicky-hovor';

const REVENUE_SCORE: Record<string, number> = { 'do-50': 5, '50-150': 25, '150-500': 40, 'nad-500': 50 };
const TEAM_SCORE: Record<string, number> = { sam: 5, '1-3': 15, vic: 25 };
const BUDGET_SCORE: Record<string, number> = { nic: 0, 'do-20': 10, '20-50': 25, 'nad-50': 35 };
const WHEN_SCORE: Record<string, number> = { hned: 25, mesic: 18, ctvrtleti: 8, rozhlizim: 0 };

/** Hranice, od které pouštíme člověka do kalendáře. */
const QUALIFY_AT = Number(process.env.WEBINAR_QUALIFY_SCORE || 55);

export async function POST(req: Request) {
    const body = (await req.json().catch(() => ({}))) as Record<string, string>;

    const token = String(body.token || '').trim();
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const { revenue, team, budget, when } = body;
    const blocker = String(body.blocker || '').trim().slice(0, 2000);

    const valid =
        name.length > 1 &&
        /\S+@\S+\.\S+/.test(email) &&
        revenue in REVENUE_SCORE &&
        team in TEAM_SCORE &&
        budget in BUDGET_SCORE &&
        when in WHEN_SCORE;
    if (!valid) return NextResponse.json({ ok: false }, { status: 400 });

    const score = REVENUE_SCORE[revenue] + TEAM_SCORE[team] + BUDGET_SCORE[budget] + WHEN_SCORE[when];
    // Kdo nechce investovat nic nebo se jen rozhlíží, nejde na hovor bez ohledu na skóre.
    const qualified = score >= QUALIFY_AT && budget !== 'nic' && when !== 'rozhlizim';

    try {
        const edition = await getEdition();
        if (!edition) return NextResponse.json({ ok: false }, { status: 500 });

        const reg = token ? await getRegistrationByToken(token) : null;

        await createApplication({
            edition_id: edition.id,
            registration_id: reg?.id ?? null,
            email,
            name,
            phone: reg?.phone ?? null,
            answers: { revenue, team, budget, when, blocker },
            score,
            qualified,
        });

        if (reg) await updateRegistration(reg.id, { status: 'applied' }).catch(() => {});

        if (!qualified) return NextResponse.json({ ok: true, qualified: false });

        const qs = new URLSearchParams({ name, email });
        return NextResponse.json({ ok: true, qualified: true, redirect: `${CAL_LINK}?${qs}` });
    } catch (e) {
        console.error('webinar/prihlaska selhalo:', e);
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
