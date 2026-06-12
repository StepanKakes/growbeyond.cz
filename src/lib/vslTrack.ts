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

function send(payload: Record<string, unknown>) {
    try {
        const body = JSON.stringify(payload);
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
            navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }));
        } else {
            fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true });
        }
    } catch { /* tracking nesmí nikdy shodit UI */ }
}

// Pošli nejdál dosaženou vteřinu (max watched) k leadovi do Notionu (přes
// /api/vsl-progress, server drží max). Voláno na pause / odchodu ze stránky.
// Díky no-skip stačí tahle jedna hodnota na kompletní retention křivku na /leads.
export function sendVslProgress(cid: string, second: number, duration?: number, email?: string): void {
    if (typeof window === 'undefined' || !cid || !(second >= 0)) return;
    const body = JSON.stringify({
        cid,
        second: Math.floor(second),
        duration: duration && duration > 0 ? Math.round(duration) : undefined,
        email: email || undefined,
    });
    try {
        if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/vsl-progress', new Blob([body], { type: 'application/json' }));
        } else {
            fetch('/api/vsl-progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true });
        }
    } catch { /* tracking nesmí nikdy shodit UI */ }
}

// Pošli jednorázový event (dedup per cid přes localStorage).
export function trackVslEvent(cid: string, event: string, email?: string): boolean {
    if (typeof window === 'undefined' || !cid || !event) return false;
    const key = `vsl_${cid}_${event}_sent`;
    try {
        if (localStorage.getItem(key)) return false;
        localStorage.setItem(key, '1');
    } catch { /* private mode apod. — pošli aspoň jednou */ }
    send({ cid, event, email: email || undefined, ts: Date.now() });
    return true;
}
