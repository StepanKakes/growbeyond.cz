import { NextResponse } from 'next/server';
import { dbConfigured, getEdition, logPageView } from '@/lib/webinar/db';
import { UTM_KEYS } from '@/lib/utm';
import { kanal, ocistiAtribuci } from '@/lib/atribuce';

export const runtime = 'nodejs';

// Zápis návštěvy landing page. Bez tohohle čísla nejde spočítat první poměr
// z funnelu (návštěva na registraci). Prohlížeč posílá jednou za relaci.

export async function POST(req: Request) {
    if (!dbConfigured()) return NextResponse.json({ ok: true });

    const body = (await req.json().catch(() => ({}))) as {
        path?: string;
        sessionId?: string;
        utm?: Record<string, string>;
        atribuce?: unknown;
    };

    const utm: Record<string, string> = {};
    if (body.utm && typeof body.utm === 'object') {
        for (const k of UTM_KEYS) {
            const v = body.utm[k];
            if (typeof v === 'string' && v) utm[k] = v.slice(0, 200);
        }
    }

    // Detail původu (id reklamy, stopa z Bea, odkazovač) se ukládá do stejného
    // jsonb jako UTM. UTM z adresy mají přednost před tím, co je v úložišti.
    const atribuce = { ...ocistiAtribuci(body.atribuce), ...utm };

    try {
        const edition = await getEdition();
        await logPageView({
            edition_id: edition?.id,
            path: String(body.path || '/webinar').slice(0, 200),
            source: kanal(atribuce),
            utm: atribuce,
            session_id: String(body.sessionId || '').slice(0, 64) || undefined,
        });
    } catch (e) {
        // Statistika nesmí shodit stránku.
        console.error('webinar/view selhalo:', e);
    }

    return NextResponse.json({ ok: true });
}
