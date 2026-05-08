export function extractYouTubeId(input: string): string | null {
    const trimmed = input.trim();
    if (!trimmed) return null;

    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

    const patterns = [
        /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
        /youtu\.be\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    ];

    for (const re of patterns) {
        const match = trimmed.match(re);
        if (match) return match[1];
    }
    return null;
}

export function youtubeUrlFromId(id: string): string {
    return `https://www.youtube.com/watch?v=${id}`;
}

const YT_QUALITIES = [
    { name: 'maxresdefault', w: 1280, h: 720 },
    { name: 'sddefault',     w: 640,  h: 480 },
    { name: 'hqdefault',     w: 480,  h: 360 },
    { name: 'mqdefault',     w: 320,  h: 180 },
] as const;

// YouTube returns a 120×90 grey "no thumbnail" placeholder (~1–2 KB) when the
// requested quality is missing, instead of 404. Detect by content-length.
const YT_PLACEHOLDER_MAX_BYTES = 2000;

export type YouTubeThumbnail = {
    url: string;
    width: number;
    height: number;
};

/**
 * Probes YouTube CDN for the highest-quality thumbnail that actually exists
 * for a video. Returns a direct i.ytimg.com URL with explicit dimensions —
 * Instagram/Facebook scrapers reject proxied or dimension-less og:image URLs.
 */
export async function resolveYouTubeThumbnail(videoId: string): Promise<YouTubeThumbnail> {
    for (const q of YT_QUALITIES) {
        const url = `https://i.ytimg.com/vi/${videoId}/${q.name}.jpg`;
        try {
            const res = await fetch(url, { method: 'HEAD' });
            if (!res.ok) continue;
            const len = Number(res.headers.get('content-length') ?? '0');
            if (len > 0 && len <= YT_PLACEHOLDER_MAX_BYTES) continue;
            return { url, width: q.w, height: q.h };
        } catch {
            continue;
        }
    }
    // Fallback: hqdefault always exists (we should never reach here, but be safe).
    return {
        url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        width: 480,
        height: 360,
    };
}

export function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
