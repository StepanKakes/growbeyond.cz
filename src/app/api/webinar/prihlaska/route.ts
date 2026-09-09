import { NextResponse } from 'next/server';
import { createApplication, getEdition, getRegistrationByToken, updateRegistration } from '@/lib/webinar/db';

export const runtime = 'nodejs';

// Přihláška na hovor po webináři. Kdo projde kvalifikací, dostane odkaz
// rovnou do kalendáře, kdo neprojde, zůstává v sekvenci bez hovoru.
//
// Skóruje jen to, co vypovídá o tom, jestli má hovor smysl: jak dlouho
// člověk podniká, kolik dělá, kolik chce investovat a jak rychle to chce
// řešit. Odpovědi na to, kde se zasekl a odkud mu chodí klienti, se
// ukládají jako kontext pro hovor, ale neskórují, protože ani jedna z nich
// není sama o sobě dobrá nebo špatná.

const CAL_LINK = process.env.WEBINAR_CAL_LINK || 'https://cal.com/creationwithtim/webinar-2030-hovor';

const YEARS_SCORE: Record<string, number> = { 'do-1': 0, '1-3': 10, '3-5': 15, 'nad-5': 15 };
const REVENUE_SCORE: Record<string, number> = { rozjezd: 0, 'do-100': 10, '100-300': 25, '300-1m': 40, 'nad-1m': 50 };
const BUDGET_SCORE: Record<string, number> = { nic: 0, 'do-20': 10, '20-50': 25, 'nad-50': 35 };
const WHEN_SCORE: Record<string, number> = { hned: 25, mesic: 18, ctvrtleti: 10, pozdeji: 0, ujasnit: 5 };

// Kontextové odpovědi, ukládají se, ale neskórují.
const STUCK = new Set(['znamost', 'odliseni', 'obsah', 'nabidka', 'nevim']);
const LEADS = new Set(['doporuceni', 'reklama', 'obsah', 'oslovuju', 'nemam']);

/** Hranice, od které pouštíme člověka do kalendáře. Maximum je 125. */
const QUALIFY_AT = Number(process.env.WEBINAR_QUALIFY_SCORE || 55);

export async function POST(req: Request) {
    const body = (await req.json().catch(() => ({}))) as Record<string, string>;

    const token = String(body.token || '').trim();
    const { years, revenue, stuck, leads, budget, when } = body;

    const valid =
        years in YEARS_SCORE &&
        revenue in REVENUE_SCORE &&
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

        const score = YEARS_SCORE[years] + REVENUE_SCORE[revenue] + BUDGET_SCORE[budget] + WHEN_SCORE[when];

        // Tvrdé diskvalifikace bez ohledu na skóre: kdo nechce investovat nic
        // a kdo to chce řešit někdy později.
        const qualified = score >= QUALIFY_AT && budget !== 'nic' && when !== 'pozdeji';

        await createApplication({
            edition_id: edition.id,
            registration_id: reg?.id ?? null,
            email,
            name: name || undefined,
            phone: reg?.phone ?? null,
            answers: { years, revenue, stuck, leads, budget, when },
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
