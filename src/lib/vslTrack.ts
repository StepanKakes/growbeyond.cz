// Klientský watchtime/funnel tracking VSL videa. Eventy jdou přes /api/track
// na n8n (dedup přes localStorage, keyed per cid = leadId). cid = Notion lead id
// (= /strategie/[id]), takže contact id máme z URL, není nutný query param.

export const VSL_MILESTONES: { p: number; name: string }[] = [
    { p: 0.05, name: 'vsl_started' },
    { p: 0.25, name: 'vsl_25' },
    { p: 0.50, name: 'vsl_50' },
    { p: 0.75, name: 'vsl_75' },
    { p: 0.90, name: 'vsl_finished' },
];

// Doručení, které přežije i zavření tabu / přechod na pozadí. sendBeacon je
// preferovaný, ale v některých IG in-app webview vrací false (nezařadil request)
// → v tom případě fallback na fetch keepalive, ať event nikdy tiše nezmizí.
function beacon(url: string, body: string) {
    try {
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
            const ok = navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
            if (ok) return;
        }
        fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => { });
    } catch { /* tracking nesmí nikdy shodit UI */ }
}

function send(payload: Record<string, unknown>) {
    beacon('/api/track', JSON.stringify(payload));
}

// Pošli nejdál dosaženou vteřinu (max watched) k leadovi do Notionu (přes
// /api/vsl-progress, server drží max). Voláno na pause / odchodu ze stránky.
// Díky no-skip stačí tahle jedna hodnota na kompletní retention křivku na /leads.
// `day` (1-3) přepne na free program endpointy (per-den pole v DB Free Program).
export function sendVslProgress(cid: string, second: number, duration?: number, email?: string, day?: number): void {
    if (typeof window === 'undefined' || !cid || !(second >= 0)) return;
    const body = JSON.stringify({
        cid,
        second: Math.floor(second),
        duration: duration && duration > 0 ? Math.round(duration) : undefined,
        email: email || undefined,
        ...(day ? { day } : {}),
    });
    beacon(day ? '/api/program/progress' : '/api/vsl-progress', body);
}

// Pošli jednorázový event (dedup per cid přes localStorage). `day` = free program.
// Pozn.: localStorage v IG in-app browseru není spolehlivý — server dedupuje taky.
export function trackVslEvent(cid: string, event: string, email?: string, day?: number): boolean {
    if (typeof window === 'undefined' || !cid || !event) return false;
    const key = day ? `vsl_${cid}_d${day}_${event}_sent` : `vsl_${cid}_${event}_sent`;
    try {
        if (localStorage.getItem(key)) return false;
        localStorage.setItem(key, '1');
    } catch { /* private mode apod. — pošli aspoň jednou */ }
    if (day) {
        beacon('/api/program/track', JSON.stringify({ cid, day, event, ts: Date.now() }));
    } else {
        send({ cid, event, email: email || undefined, ts: Date.now() });
    }
    return true;
}
