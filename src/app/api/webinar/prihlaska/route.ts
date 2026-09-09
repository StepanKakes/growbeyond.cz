import { NextResponse } from 'next/server';
import { createApplication, getEdition, getRegistrationByToken, updateRegistration } from '@/lib/webinar/db';

export const runtime = 'nodejs';

// Přihláška na hovor po webináři. Kdo projde kvalifikací, dostane odkaz
// rovnou do kalendáře, kdo neprojde, zůstává v sekvenci bez hovoru.
//
// Do skóre vstupuje jen to, co vypovídá o tom, jestli má hovor smysl:
// čím se člověk živí, kolik dělá, kolik chce investovat a kdy chce začít.
// Odpovědi na zdroj klientů a obsah se ukládají jako kontext pro hovor,
// skóre neovlivňují, protože ani jedna z nich není sama o sobě dobrá
// nebo špatná.

const CAL_LINK = process.env.WEBINAR_CAL_LINK || 'https://cal.com/creationwithtim/webinar-2030-hovor';

const PROFESSION_SCORE: Record<string, number> = { expert: 20, firma: 20, produkt: 10, tvurce: 10, zacinam: 0 };
const REVENUE_SCORE: Record<string, number> = { 'do-50': 5, '50-150': 25, '150-500': 40, 'nad-500': 50 };
const BUDGET_SCORE: Record<string, number> = { nic: 0, 'do-20': 10, '20-50': 25, 'nad-50': 35 };
const WHEN_SCORE: Record<string, number> = { hned: 25, mesic: 18, ctvrtleti: 8, rozhlizim: 0 };

// Kontextové odpovědi, ukládají se, ale neskórují.
const LEADS = new Set(['doporuceni', 'reklama', 'obsah', 'oslovuju', 'nemam']);
const CONTENT = new Set(['netvorim', 'nepravidelne', 'bez-vysledku', 'funguje']);

/** Hranice, od které pouštíme člověka do kalendáře. Maximum je 130. */
const QUALIFY_AT = Number(process.env.WEBINAR_QUALIFY_SCORE || 55);

export async function POST(req: Request) {
    const body = (await req.json().catch(() => ({}))) as Record<string, string>;

    const token = String(body.token || '').trim();
    const { profession, revenue, budget, when, leads, content } = body;
    const blocker = String(body.blocker || '').trim().slice(0, 2000);

    const valid =
        profession in PROFESSION_SCORE &&
        revenue in REVENUE_SCORE &&
        budget in BUDGET_SCORE &&
        when in WHEN_SCORE &&
        LEADS.has(leads) &&
        CONTENT.has(content);
    if (!valid) return NextResponse.json({ ok: false }, { status: 400 });

    try {
        const edition = await getEdition();
        if (!edition) return NextResponse.json({ ok: false }, { status: 500 });

        // Jméno a email bereme z registrace, na jméno se v přihlášce neptáme.
        const reg = token ? await getRegistrationByToken(token) : null;
        const email = String(body.email || reg?.email || '').trim().toLowerCase();
        const name = reg?.name || '';
        if (!/\S+@\S+\.\S+/.test(email)) return NextResponse.json({ ok: false }, { status: 400 });

        const score =
            PROFESSION_SCORE[profession] + REVENUE_SCORE[revenue] + BUDGET_SCORE[budget] + WHEN_SCORE[when];
        // Kdo nechce investovat nic nebo se jen rozhlíží, nejde na hovor bez ohledu na skóre.
        const qualified = score >= QUALIFY_AT && budget !== 'nic' && when !== 'rozhlizim';

        await createApplication({
            edition_id: edition.id,
            registration_id: reg?.id ?? null,
            email,
            name: name || undefined,
            phone: reg?.phone ?? null,
            answers: { profession, revenue, leads, content, budget, when, blocker },
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
