import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Přijme VSL/funnel event z frontendu a přepošle na n8n webhook
// (N8N_VSL_WEBHOOK_URL). n8n pak zrcadlí do Plunku (+ property vsl_max) a Meta CAPI.
// Když webhook není nastavený, jen potvrdí (200) — neblokuje frontend.
export async function POST(request: NextRequest) {
    const payload = await request.json().catch(() => null) as
        | { cid?: string; event?: string; email?: string; ts?: number }
        | null;

    if (!payload?.cid || !payload?.event) {
        return NextResponse.json({ ok: false }, { status: 400 });
    }

    const url = process.env.N8N_VSL_WEBHOOK_URL;
    if (url) {
        try {
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cid: payload.cid,
                    event: payload.event,
                    email: payload.email || '',
                    ts: payload.ts || Date.now(),
                }),
            });
        } catch (e) {
            console.error('track → n8n failed', e);
        }
    }

    return NextResponse.json({ ok: true });
}
