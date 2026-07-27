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
                body: `<div style="background:#111111;padding:32px 16px;font-family:-apple-system,Helvetica,Arial,sans-serif"><div style="max-width:480px;margin:0 auto"><img src="https://growbeyond.cz/images/program/logo-rentgen.png" alt="3denni rentgen" width="150" style="display:block;margin:0 auto 24px"><div style="background:#0C0C0C;border:1px solid #262626;border-radius:16px;padding:32px 28px;text-align:center"><h1 style="margin:0 0 12px;font-size:20px;line-height:1.4;color:#ffffff;font-weight:700">Vítej v programu</h1><p style="margin:0 0 26px;font-size:15px;line-height:1.7;color:#b3b3b3">Tohle je tvůj osobní přístup, přes který se do programu kdykoliv vrátíš. Začni krátkou analýzou, zabere ti minutku. Další videa ti budu posílat na Instagram i sem na email.</p><a href="${programUrl}" style="display:inline-block;background:#FF0E00;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 30px;border-radius:999px">Vstoupit do programu</a></div><p style="margin:20px 0 0;text-align:center;font-size:12px;color:#737373">Tim, growbeyond.cz</p></div></div>`,
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
