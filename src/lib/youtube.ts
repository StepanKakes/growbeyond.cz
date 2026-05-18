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

export type YouTubeMeta = {
    title: string;
    author: string;
    description: string;
};

const decodeHtmlEntities = (s: string) =>
    s.replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
        .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(parseInt(d, 10)));

/**
 * Fetches title + author from YouTube oEmbed (always available, no key) and
 * tries to extract og:description from the public watch page HTML so social
 * previews match a raw YouTube share. Falls back gracefully on any failure.
 */
export async function fetchYouTubeMeta(videoId: string): Promise<YouTubeMeta> {
    let title = '';
    let author = '';
    let description = '';

    try {
        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        const res = await fetch(oembedUrl, { next: { revalidate: 86400 } });
        if (res.ok) {
            const data = (await res.json()) as { title?: string; author_name?: string };
            title = data.title ?? '';
            author = data.author_name ?? '';
        }
    } catch {}

    try {
        const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const res = await fetch(watchUrl, {
            headers: {
                'user-agent':
                    'Mozilla/5.0 (compatible; GrowBeyondLinkPreview/1.0; +https://growbeyond.cz)',
                'accept-language': 'en-US,en;q=0.9',
            },
            next: { revalidate: 86400 },
        });
        if (res.ok) {
            const html = await res.text();
            const m = html.match(
                /<meta\s+name="description"\s+content="([^"]*)"|<meta\s+property="og:description"\s+content="([^"]*)"/i,
            );
            if (m) description = decodeHtmlEntities(m[1] || m[2] || '');
        }
    } catch {}

    return { title, author, description };
}

export function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
