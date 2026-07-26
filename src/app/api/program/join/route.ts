import { NextResponse } from 'next/server';
import { findOrCreateByUsername, fireBeoHook, PROGRAM_ORIGIN, sanitizeUsername, setRowEmail } from '@/lib/free-program';
import { plunkEnroll, plunkSendEmail } from '@/lib/plunk';

export const runtime = 'nodejs';

// Vstup do programu z LP formuláře (IG username + email) místo psaní "start" do DM.
// Založí/najde řádek v Notionu, uloží email, upsertne Plunk kontakt, pošle uvítací
// email s trvalým odkazem a řekne Beu, ať pošle uvítací DM (funguje jen u lidí,
// kteří už s účtem někdy psali — IG nedovolí napsat první zprávu z naší strany).
// Klient pak přesměruje rovnou na /program/[id] (analýza + diagnostika).

// Fallback URL hooku "Free Program: JOIN (web)" — env BEO_PROGRAM_HOOK_JOIN má přednost.
const JOIN_HOOK_FALLBACK = 'https://beo.growbeyond.cz/api/automations/hooks/whk_GrwrPXo2MWv4OXb39c7wQ8TX';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const username = sanitizeUsername(body.username);
        const email = String(body.email ?? '').trim().toLowerCase();
        if (!username || !EMAIL_RE.test(email)) {
            return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 });
        }

        const row = await findOrCreateByUsername(username, 'web-form');
        if (!row) return NextResponse.json({ ok: false }, { status: 500 });

        const programUrl = `${PROGRAM_ORIGIN}/program/${row.id}`;
        if (row.email !== email) await setRowEmail(row.id, email);

        // Plunk kontakt + event (paralelně s uvítacím emailem, best-effort)
        await Promise.all([
            plunkEnroll({ email, event: 'rentgen_join', data: { ig: username, program_url: programUrl } }),
            plunkSendEmail({
                to: email,
                subject: 'Tvůj vstup do 3denního rentgenu',
                body: `Vítej v programu.\n\nTady je tvůj osobní odkaz, přes který se do programu kdykoliv vrátíš:\n${programUrl}\n\nZačni krátkou analýzou, zabere ti minutku. Další videa ti budu posílat na Instagram i sem na email.\n\nTim`,
            }),
        ]);

        // Uvítací DM přes Beo (jen pokud lead existuje, tzn. někdy nám psal)
        await fireBeoHook('BEO_PROGRAM_HOOK_JOIN', { username, email, link: `${PROGRAM_ORIGIN}/program/start?u=${encodeURIComponent(username)}` }, JOIN_HOOK_FALLBACK);

        return NextResponse.json({ ok: true, next: `/program/${row.id}` });
    } catch (e) {
        console.error('program/join error', e);
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
