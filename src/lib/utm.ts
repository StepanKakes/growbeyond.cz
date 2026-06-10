export const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
export type UtmKey = typeof UTM_KEYS[number];
export type UtmData = Partial<Record<UtmKey, string>> & { captured_at?: string };

const STORAGE_KEY = 'gb_utm';

export function captureUtmFromUrl(): UtmData {
    if (typeof window === 'undefined') return {};
    const params = new URLSearchParams(window.location.search);
    const utm: UtmData = {};
    UTM_KEYS.forEach(key => {
        const value = params.get(key);
        if (value) utm[key] = value;
    });
    return utm;
}

export function persistUtm(utm: UtmData): void {
    if (typeof window === 'undefined') return;
    // Last-touch atribuce: nový explicitní UTM v URL (z /d, reklamy, /y…)
    // přepíše dříve uložený. Bez UTM v URL (interní proklik) se nevolá, takže
    // poslední skutečný kanál, kterým člověk přišel, zůstává uložený.
    if (Object.keys(utm).length === 0) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...utm, captured_at: new Date().toISOString() }));
}

export function getStoredUtm(): UtmData {
    if (typeof window === 'undefined') return {};
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return {};
        return JSON.parse(raw) as UtmData;
    } catch {
        return {};
    }
}

type ClarityFn = (...args: unknown[]) => void;

export function setClarityTags(utm: UtmData): void {
    if (typeof window === 'undefined') return;
    const clarity = (window as unknown as { clarity?: ClarityFn }).clarity;
    if (typeof clarity !== 'function') return;
    UTM_KEYS.forEach(key => {
        if (utm[key]) clarity('set', key, utm[key] as string);
    });
}

export function initUtmTracking(): void {
    const fromUrl = captureUtmFromUrl();
    if (Object.keys(fromUrl).length > 0) {
        persistUtm(fromUrl);
        setClarityTags(fromUrl);
    } else {
        setClarityTags(getStoredUtm());
    }
}
