// Datová vrstva webinářového funnelu.
//
// Data žijí ve schématu `webinar` v self-hosted Supabase (supabase.growbeyond.cz).
// Pozor: ta instance je zároveň produkční DB beo-saas, proto se sem nechodí
// service klíčem. WEBINAR_DB_JWT je podepsaný pro roli `webinar_app`, která má
// práva výhradně na schema `webinar` a na beo-saas tabulky dostane 403.

const BASE = process.env.WEBINAR_DB_URL || 'https://supabase.growbeyond.cz';
const ANON = process.env.WEBINAR_DB_ANON_KEY || '';
const JWT = process.env.WEBINAR_DB_JWT || '';

export const EDITION_SLUG = process.env.WEBINAR_EDITION_SLUG || '2030';

export type Edition = {
    id: string;
    slug: string;
    title: string;
    starts_at: string;
    duration_minutes: number;
    timezone: string;
    zoom_meeting_id: string | null;
    zoom_join_url: string | null;
    wa_group_invite_url: string | null;
    wa_group_chat_id: string | null;
    replay_url: string | null;
    apply_open: boolean;
};

export type Registration = {
    id: string;
    edition_id: string;
    token: string;
    email: string;
    name: string | null;
    phone: string | null;
    consent_marketing: boolean;
    consent_whatsapp: boolean;
    source: string | null;
    utm: Record<string, string>;
    qual_revenue: string | null;
    qual_team: string | null;
    qual_score: number | null;
    qualified_at: string | null;
    calendar_added_at: string | null;
    zoom_registrant_id: string | null;
    zoom_join_url: string | null;
    attended: boolean | null;
    attend_minutes: number | null;
    attendance_synced_at: string | null;
    wa_status: 'pending' | 'no_phone' | 'sending' | 'sent' | 'failed' | 'opted_out';
    wa_opted_out_at: string | null;
    wa_group_joined_at: string | null;
    status: 'registered' | 'attended' | 'no_show' | 'applied' | 'booked' | 'won' | 'lost';
    created_at: string;
};

export type MessageLogRow = {
    id: number;
    registration_id: string;
    step_key: string;
    channel: 'email' | 'whatsapp';
    status: 'queued' | 'sending' | 'sent' | 'failed' | 'skipped';
    variant: number | null;
    attempts: number;
    error: string | null;
    scheduled_for: string | null;
    sent_at: string | null;
};

export function dbConfigured(): boolean {
    return Boolean(ANON && JWT);
}

type RestOpts = {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    body?: unknown;
    /** Prefer hlavička, např. 'return=representation' nebo 'resolution=merge-duplicates'. */
    prefer?: string;
};

/**
 * Volání PostgREST nad schématem `webinar`.
 * Hodí při chybě, ať volající rozhodne, jestli to je fatální.
 */
async function rest<T>(path: string, opts: RestOpts = {}): Promise<T> {
    if (!dbConfigured()) throw new Error('Webinar DB není nakonfigurovaná (WEBINAR_DB_ANON_KEY, WEBINAR_DB_JWT)');

    const method = opts.method || 'GET';
    const headers: Record<string, string> = {
        apikey: ANON,
        Authorization: `Bearer ${JWT}`,
        'Content-Type': 'application/json',
        // PostgREST vybírá schema podle profilu; čtení Accept-Profile, zápis Content-Profile.
        ...(method === 'GET' ? { 'Accept-Profile': 'webinar' } : { 'Content-Profile': 'webinar' }),
    };
    if (opts.prefer) headers.Prefer = opts.prefer;

    const res = await fetch(`${BASE}/rest/v1/${path}`, {
        method,
        headers,
        body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
        cache: 'no-store',
        signal: AbortSignal.timeout(10000),
    });

    const text = await res.text();
    if (!res.ok) throw new Error(`Webinar DB ${method} ${path} selhalo: ${res.status} ${text.slice(0, 300)}`);
    return (text ? JSON.parse(text) : null) as T;
}

const enc = encodeURIComponent;

/** Aktivní edice webináře. Termín i odkazy se mění tady, ne v kódu. */
export async function getEdition(slug = EDITION_SLUG): Promise<Edition | null> {
    const rows = await rest<Edition[]>(`editions?slug=eq.${enc(slug)}&limit=1`);
    return rows[0] || null;
}

export async function updateEdition(id: string, patch: Partial<Edition>): Promise<void> {
    await rest(`editions?id=eq.${enc(id)}`, { method: 'PATCH', body: patch });
}

/**
 * Založí registraci. Když už email u téhle edice existuje, vrátí původní řádek,
 * aby druhé odeslání formuláře nezaložilo duplicitu ani nespustilo sekvenci znovu.
 */
export async function upsertRegistration(input: {
    edition_id: string;
    token: string;
    email: string;
    name?: string;
    phone?: string | null;
    consent_marketing?: boolean;
    consent_whatsapp?: boolean;
    source?: string;
    utm?: Record<string, string>;
}): Promise<{ registration: Registration; created: boolean }> {
    const existing = await rest<Registration[]>(
        `registrations?edition_id=eq.${enc(input.edition_id)}&email=eq.${enc(input.email)}&limit=1`,
    );
    if (existing[0]) {
        // Telefon mohl chybět napoprvé, doplníme ho, ale sekvenci nespouštíme znovu.
        if (input.phone && !existing[0].phone) {
            const patched = await rest<Registration[]>(`registrations?id=eq.${enc(existing[0].id)}`, {
                method: 'PATCH',
                body: { phone: input.phone, consent_whatsapp: input.consent_whatsapp ?? existing[0].consent_whatsapp },
                prefer: 'return=representation',
            });
            return { registration: patched[0] || existing[0], created: false };
        }
        return { registration: existing[0], created: false };
    }

    const rows = await rest<Registration[]>('registrations', {
        method: 'POST',
        body: {
            ...input,
            wa_status: input.phone ? 'pending' : 'no_phone',
        },
        prefer: 'return=representation',
    });
    return { registration: rows[0], created: true };
}

export async function getRegistrationByToken(token: string): Promise<Registration | null> {
    const rows = await rest<Registration[]>(`registrations?token=eq.${enc(token)}&limit=1`);
    return rows[0] || null;
}

export async function updateRegistration(id: string, patch: Partial<Registration>): Promise<void> {
    await rest(`registrations?id=eq.${enc(id)}`, { method: 'PATCH', body: patch });
}

/** Všechny registrace edice, které ještě nejsou odhlášené. Pro scheduler. */
export async function listRegistrations(editionId: string, limit = 5000): Promise<Registration[]> {
    return rest<Registration[]>(`registrations?edition_id=eq.${enc(editionId)}&order=created_at.asc&limit=${limit}`);
}

/**
 * Zamluví krok pro danou registraci. Unikátní index (registration_id, step_key)
 * zajistí, že i při souběžném běhu cronu projde jen jeden zápis, takže se
 * zpráva nikdy neodešle dvakrát.
 * Vrací false, když krok už existuje (odeslaný, běžící nebo přeskočený).
 */
export async function claimStep(input: {
    registration_id: string;
    step_key: string;
    channel: 'email' | 'whatsapp';
    scheduled_for: string;
}): Promise<boolean> {
    try {
        await rest('message_log', {
            method: 'POST',
            body: { ...input, status: 'sending', attempts: 1 },
            prefer: 'return=minimal',
        });
        return true;
    } catch (e) {
        // 23505 = porušení unikátního indexu, čili krok už někdo zabral.
        if (e instanceof Error && /23505|duplicate key/i.test(e.message)) return false;
        throw e;
    }
}

export async function finishStep(
    registrationId: string,
    stepKey: string,
    patch: { status: 'sent' | 'failed' | 'skipped'; error?: string; variant?: number },
): Promise<void> {
    await rest(`message_log?registration_id=eq.${enc(registrationId)}&step_key=eq.${enc(stepKey)}`, {
        method: 'PATCH',
        body: { ...patch, sent_at: patch.status === 'sent' ? new Date().toISOString() : null },
    });
}

/**
 * Kroky, které u registrací už proběhly, běží nebo byly přeskočené.
 * Vrací mapu registrace na množinu klíčů kroků.
 */
export async function listDoneSteps(): Promise<Map<string, Set<string>>> {
    const rows = await rest<{ registration_id: string; step_key: string }[]>(
        `message_log?select=registration_id,step_key&status=in.(queued,sending,sent,skipped)&limit=100000`,
    );
    const map = new Map<string, Set<string>>();
    for (const r of rows) {
        let set = map.get(r.registration_id);
        if (!set) map.set(r.registration_id, (set = new Set()));
        set.add(r.step_key);
    }
    return map;
}

/** Kolik WhatsApp zpráv už dnes odešlo, kvůli dennímu stropu. */
export async function countWhatsAppSentToday(): Promise<number> {
    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const rows = await rest<{ id: number }[]>(
        `message_log?select=id&channel=eq.whatsapp&status=eq.sent&sent_at=gte.${enc(since)}&limit=10000`,
    );
    return rows.length;
}

export async function logPageView(input: {
    edition_id?: string;
    path: string;
    source?: string;
    utm?: Record<string, string>;
    session_id?: string;
}): Promise<void> {
    await rest('page_views', { method: 'POST', body: input, prefer: 'return=minimal' });
}

export async function createApplication(input: {
    edition_id: string;
    registration_id?: string | null;
    email: string;
    name?: string;
    phone?: string | null;
    answers: Record<string, unknown>;
    score?: number;
    qualified?: boolean;
}): Promise<{ id: string }> {
    const rows = await rest<{ id: string }[]>('applications', {
        method: 'POST',
        body: input,
        prefer: 'return=representation',
    });
    return rows[0];
}

export async function listApplications(editionId: string) {
    return rest<
        { id: string; email: string; qualified: boolean | null; booked_at: string | null; call_outcome: string | null }[]
    >(`applications?select=id,email,qualified,booked_at,call_outcome&edition_id=eq.${enc(editionId)}&limit=5000`);
}

export async function countPageViews(editionId: string): Promise<number> {
    const rows = await rest<{ id: number }[]>(`page_views?select=id&edition_id=eq.${enc(editionId)}&limit=100000`);
    return rows.length;
}
