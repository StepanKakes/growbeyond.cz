// Zoom Server to Server OAuth.
//
// Účet je Zoom Pro, takže jedeme přes běžný meeting se zapnutou registrací,
// ne přes Webinars addon. Registrace přes API dá každému vlastní join link,
// díky čemuž po webináři z participant reportu poznáme, kdo skutečně přišel.
//
// Potřebné scopes: meeting:read:admin, meeting:write:admin, report:read:admin

const ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID || '';
const CLIENT_ID = process.env.ZOOM_CLIENT_ID || '';
const CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET || '';

export function zoomConfigured(): boolean {
    return Boolean(ACCOUNT_ID && CLIENT_ID && CLIENT_SECRET);
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function accessToken(): Promise<string> {
    if (!zoomConfigured()) throw new Error('Zoom není nakonfigurovaný');
    if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) return cachedToken.value;

    const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const res = await fetch(
        `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${encodeURIComponent(ACCOUNT_ID)}`,
        {
            method: 'POST',
            headers: { Authorization: `Basic ${basic}` },
            signal: AbortSignal.timeout(10000),
        },
    );
    const payload = await res.json().catch(() => ({}));
    if (!res.ok || !payload?.access_token) {
        throw new Error(`Zoom token selhal: ${res.status} ${JSON.stringify(payload).slice(0, 200)}`);
    }
    cachedToken = { value: payload.access_token, expiresAt: Date.now() + (payload.expires_in || 3600) * 1000 };
    return cachedToken.value;
}

async function zoomFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = await accessToken();
    const res = await fetch(`https://api.zoom.us/v2${path}`, {
        ...init,
        headers: { ...(init.headers || {}), Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(15000),
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`Zoom ${init.method || 'GET'} ${path}: ${res.status} ${text.slice(0, 300)}`);
    return (text ? JSON.parse(text) : null) as T;
}

/** Založí meeting s povinnou registrací. Vrací id a odkaz pro Tima. */
export async function createMeeting(input: {
    topic: string;
    startISO: string;
    durationMinutes: number;
    timezone?: string;
}): Promise<{ id: string; start_url: string; join_url: string }> {
    const meeting = await zoomFetch<{ id: number; start_url: string; join_url: string }>('/users/me/meetings', {
        method: 'POST',
        body: JSON.stringify({
            topic: input.topic,
            type: 2, // naplánovaný meeting
            start_time: input.startISO,
            duration: input.durationMinutes,
            timezone: input.timezone || 'Europe/Prague',
            settings: {
                approval_type: 0, // registrace se schvaluje automaticky
                registration_type: 1,
                join_before_host: false,
                waiting_room: false,
                participant_video: false,
                host_video: true,
                mute_upon_entry: true,
                auto_recording: 'cloud',
            },
        }),
    });
    return { id: String(meeting.id), start_url: meeting.start_url, join_url: meeting.join_url };
}

/** Přihlásí člověka na meeting a vrátí jeho osobní join link. */
export async function addRegistrant(
    meetingId: string,
    input: { email: string; firstName: string; lastName?: string },
): Promise<{ registrantId: string; joinUrl: string }> {
    const res = await zoomFetch<{ registrant_id: string; join_url: string }>(
        `/meetings/${encodeURIComponent(meetingId)}/registrants`,
        {
            method: 'POST',
            body: JSON.stringify({
                email: input.email,
                first_name: input.firstName || input.email.split('@')[0],
                last_name: input.lastName || '',
            }),
        },
    );
    return { registrantId: res.registrant_id, joinUrl: res.join_url };
}

export type ZoomParticipant = { email: string | null; name: string; duration: number };

/**
 * Účastníci proběhlého meetingu. Zoom stránkuje, projdeme všechny stránky.
 * Report je k dispozici až po skončení, obvykle do pár minut.
 */
export async function listParticipants(meetingId: string): Promise<ZoomParticipant[]> {
    const out: ZoomParticipant[] = [];
    let nextPageToken = '';

    do {
        const qs = new URLSearchParams({ page_size: '300' });
        if (nextPageToken) qs.set('next_page_token', nextPageToken);
        const page = await zoomFetch<{
            participants: { user_email?: string; name: string; duration: number }[];
            next_page_token?: string;
        }>(`/report/meetings/${encodeURIComponent(meetingId)}/participants?${qs}`);

        for (const p of page.participants || []) {
            out.push({ email: p.user_email?.toLowerCase() || null, name: p.name, duration: p.duration || 0 });
        }
        nextPageToken = page.next_page_token || '';
    } while (nextPageToken);

    return out;
}
