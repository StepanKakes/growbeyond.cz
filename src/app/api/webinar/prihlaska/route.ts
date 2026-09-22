import { NextResponse } from 'next/server';
import { eventIdFor } from '@/lib/eventId';
import { APPLICATION_SCORE, LEADS_OPTIONS } from '@/components/webinar/applicationQuestions';
import { STUCK_OPTIONS } from '@/components/webinar/qualifyOptions';
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

// Znění otázek i bodování žije v applicationQuestions, ať se formulář,
// tenhle endpoint a přehled nemůžou rozejít.
const { years: YEARS_SCORE, revenue: REVENUE_SCORE, budget: BUDGET_SCORE, when: WHEN_SCORE } = APPLICATION_SCORE;

// Kontextové odpovědi, ukládají se, ale neskórují.
const STUCK = new Set(STUCK_OPTIONS.map(o => o.value));
const LEADS = new Set(LEADS_OPTIONS.map(o => o.value));

/** Hranice, od které pouštíme člověka do kalendáře. */
const QUALIFY_AT = Number(process.env.WEBINAR_QUALIFY_SCORE || 55);

export async function POST(req: Request) {
    const body = (await req.json().catch(() => ({}))) as Record<string, string>;

    const token = String(body.token || '').trim();
    const { years, revenue, stuck, leads, budget, when } = body;

    // Stejné otázky se ptají na dvou místech. Hned po registraci slouží
    // k poznání publika, takže po nich následuje termín webináře. Po
    // webináři jsou přihláškou na hovor a kdo projde, jde do kalendáře.
    const poRegistraci = body.faze === 'registrace';

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

        // Tvrdá diskvalifikace bez ohledu na skóre: kdo nechce investovat nic.
        const qualified = score >= QUALIFY_AT && budget !== 'nic';

        await createApplication({
            edition_id: edition.id,
            registration_id: reg?.id ?? null,
            email,
            name: name || undefined,
            phone: reg?.phone ?? null,
            answers: { years, revenue, stuck, leads, budget, when, faze: poRegistraci ? 'registrace' : 'hovor' },
            score,
            qualified,
        });

        // Obrat a zásek se kopírují i k registraci, protože podle nich se
        // v přehledu pozná, komu se vyplatí napsat ještě před webinářem.
        if (reg) {
            await updateRegistration(reg.id, {
                qual_revenue: revenue,
                qual_stuck: stuck,
                qual_score: REVENUE_SCORE[revenue],
                qualified_at: new Date().toISOString(),
                ...(poRegistraci ? {} : { status: 'applied' as const }),
            }).catch(() => {});
        }

        // Hned po registraci se hovor nenabízí, na řadě je termín webináře.
        if (poRegistraci || !qualified) return NextResponse.json({ ok: true, qualified });

        const qs = new URLSearchParams({ email, ...(name ? { name } : {}) });
        return NextResponse.json({
            ok: true,
            qualified: true,
            eventId: eventIdFor('webinar-prihlaska', email),
            redirect: `${CAL_LINK}?${qs}`,
        });
    } catch (e) {
        console.error('webinar/prihlaska selhalo:', e);
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
