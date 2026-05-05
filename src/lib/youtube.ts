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

export function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
