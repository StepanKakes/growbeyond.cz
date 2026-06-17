// Meta (Facebook) Pixel — načítá se POUZE na /strategie funnelu a AŽ po souhlasu
// s cookies (gb_cookie_consent === "accepted"). Stejný consent model jako Clarity.
// Pixel ID se nastavuje přes NEXT_PUBLIC_META_PIXEL_ID. Bez ID je vše no-op.

declare global {
    interface Window {
        fbq?: ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue?: unknown[]; loaded?: boolean; version?: string; push?: unknown };
        _fbq?: unknown;
    }
}

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/** Vloží base snippet, inicializuje pixel a odešle PageView. Idempotentní. */
export const loadMetaPixel = () => {
    if (typeof window === 'undefined' || !META_PIXEL_ID) return;

    // Už načteno → jen další PageView (např. při client-side navigaci /strategie → /strategie/[id])
    if (window.fbq) {
        window.fbq('track', 'PageView');
        return;
    }

    /* eslint-disable */
    // @ts-ignore – oficiální Meta Pixel base snippet
    !function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
        if (!f._fbq) f._fbq = n;
        n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
        t = b.createElement(e); t.async = !0; t.src = v;
        s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */

    window.fbq!('init', META_PIXEL_ID);
    window.fbq!('track', 'PageView');
};

/** Odešle Lead event (pokud je pixel načtený). Bez souhlasu / bez ID je no-op. */
export const trackMetaLead = (params?: Record<string, unknown>) => {
    if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
    window.fbq('track', 'Lead', params);
};
