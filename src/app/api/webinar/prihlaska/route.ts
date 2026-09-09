import { NextResponse } from 'next/server';
import { createApplication, getEdition, getRegistrationByToken, updateRegistration } from '@/lib/webinar/db';

export const runtime = 'nodejs';

// Přihláška na hovor po webináři. Kdo projde kvalifikací, dostane odkaz
// rovnou do kalendáře, kdo neprojde, zůstává v sekvenci bez hovoru.
//
// Skóruje jen to, co vypovídá o tom, jestli má hovor smysl: jak dlouho
// člověk podniká, kolik dělá, jak velký má tým, jestli o penězích rozhoduje
// sám, kolik chce investovat a jak rychle. Odpovědi na to, kde se zasekl
// a odkud mu chodí klienti, se ukládají jako kontext pro hovor, ale
// neskórují, protože ani jedna z nich není sama o sobě dobrá nebo špatná.

const CAL_LINK = process.env.WEBINAR_CAL_LINK || 'https://cal.com/creationwithtim/webinar-2030-hovor';

const YEARS_SCORE: Record<string, number> = { 'do-1': 0, '1-3': 10, '3-5': 15, 'nad-5': 15 };
const REVENUE_SCORE: Record<string, number> = { 'do-100': 5, '100-300': 20, '300-1m': 35, '1-3m': 45, 'nad-3m': 50 };
const TEAM_SCORE: Record<string, number> = { sam: 5, '2-5': 15, '6-10': 20, 'nad-10': 20 };
const DECISION_SCORE: Record<string, number> = { ja: 25, 'ja-partner': 20, 'nekdo-jiny': 0 };
const BUDGET_SCORE: Record<string, number> = { nic: 0, 'do-20': 10, '20-50': 25, 'nad-50': 35 };
const WHEN_SCORE: Record<string, number> = { hned: 25, mesic: 18, ctvrtleti: 10, pozdeji: 0, ujasnit: 5 };

// Kontextové odpovědi, ukládají se, ale neskórují.
const STUCK = new Set(['marketing', 'obchod', 'tym', 'ja', 'nevim']);
const LEADS = new Set(['doporuceni', 'reklama', 'obsah', 'oslovuju', 'nemam']);

/** Hranice, od které pouštíme člověka do kalendáře. Maximum je 170. */
const QUALIFY_AT = Number(process.env.WEBINAR_QUALIFY_SCORE || 75);

export async function POST(req: Request) {
    const body = (await req.json().catch(() => ({}))) as Record<string, string>;

    const token = String(body.token || '').trim();
    const { years, revenue, team, stuck, leads, decision, budget, when } = body;

    const valid =
        years in YEARS_SCORE &&
        revenue in REVENUE_SCORE &&
        team in TEAM_SCORE &&
        decision in DECISION_SCORE &&
        budget in BUDGET_SCORE &&
        when in WHEN_SCORE &&
        STUCK.has(stuck) &&
        LEADS.has(leads);
    if (!valid) return NextResponse.json({ ok: false }, { status: 400 });

    try {
        const edition = await getEdition();
        if (!edition) return NextResponse.json({ ok: false }, { status: 500 });

        // Jméno i email bereme z registrace, na jméno se v přihlášce neptáme.
        // Email z formuláře přijde jen tehdy, když člověk přišel bez tokenu.
        const reg = token ? await getRegistrationByToken(token) : null;
        const email = String(body.email || reg?.email || '').trim().toLowerCase();
        const name = reg?.name || '';
        if (!/\S+@\S+\.\S+/.test(email)) return NextResponse.json({ ok: false }, { status: 400 });

        const score =
            YEARS_SCORE[years] +
            REVENUE_SCORE[revenue] +
            TEAM_SCORE[team] +
            DECISION_SCORE[decision] +
            BUDGET_SCORE[budget] +
            WHEN_SCORE[when];

        // Tvrdé diskvalifikace bez ohledu na skóre: kdo o penězích nerozhoduje,
        // kdo nechce investovat nic a kdo to chce řešit někdy později.
        const qualified =
            score >= QUALIFY_AT && decision !== 'nekdo-jiny' && budget !== 'nic' && when !== 'pozdeji';

        await createApplication({
            edition_id: edition.id,
            registration_id: reg?.id ?? null,
            email,
            name: name || undefined,
            phone: reg?.phone ?? null,
            answers: { years, revenue, team, stuck, leads, decision, budget, when },
            score,
            qualified,
        });

        if (reg) await updateRegistration(reg.id, { status: 'applied' }).catch(() => {});

        if (!qualified) return NextResponse.json({ ok: true, qualified: false });

        const qs = new URLSearchParams({ email, ...(name ? { name } : {}) });
        return NextResponse.json({ ok: true, qualified: true, redirect: `${CAL_LINK}?${qs}` });
    } catch (e) {
        console.error('webinar/prihlaska selhalo:', e);
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
