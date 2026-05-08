import { unstable_cache } from 'next/cache';
import { createHash } from 'crypto';
import { UAParser } from 'ua-parser-js';
import type { NextRequest } from 'next/server';

const NOTION_API = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

const SHORT_LINKS_DB_ID = process.env.NOTION_SHORT_LINKS_DB_ID!;
const LINK_CLICKS_DB_ID = process.env.NOTION_LINK_CLICKS_DB_ID!;
const NOTION_TOKEN = process.env.NOTION_API_KEY!;

const headers = () => ({
    'Authorization': `Bearer ${NOTION_TOKEN}`,
    'Content-Type': 'application/json',
    'Notion-Version': NOTION_VERSION,
});

// ───── Types ─────

export type ShortLink = {
    pageId: string;
    slug: string;
    targetUrl: string;
    title: string;
    source: 'custom' | 'youtube' | 'instagram' | 'dms';
    active: boolean;
    createdAt: string;
};

export type ClickRecord = {
    pageId: string;
    slug: string;
    source: string;
    campaign: string;
    content: string;
    targetUrl: string;
    country: string;
    city: string;
    device: string;
    browser: string;
    os: string;
    referer: string;
    timestamp: string;
    linkPageId?: string;
};

export type ClickContext = {
    country: string;
    city: string;
    device: string;
    browser: string;
    os: string;
    referer: string;
    ipHash: string;
};

// ───── Lookup (cached 60s) ─────

type NotionPropTitle = { title?: Array<{ plain_text?: string }> };
type NotionPropUrl = { url?: string | null };
type NotionPropText = { rich_text?: Array<{ plain_text?: string }> };
type NotionPropSelect = { select?: { name?: string } | null };
type NotionPropCheckbox = { checkbox?: boolean };

type NotionPage = {
    id: string;
    created_time: string;
    properties: {
        Slug?: NotionPropTitle;
        'Target URL'?: NotionPropUrl;
        Title?: NotionPropText;
        Source?: NotionPropSelect;
        Active?: NotionPropCheckbox;
    };
};

type NotionQueryResponse = {
    results: NotionPage[];
};

const parseLink = (page: NotionPage): ShortLink => {
    const props = page.properties;
    return {
        pageId: page.id,
        slug: props.Slug?.title?.[0]?.plain_text ?? '',
        targetUrl: props['Target URL']?.url ?? '',
        title: props.Title?.rich_text?.[0]?.plain_text ?? '',
        source: (props.Source?.select?.name ?? 'custom') as ShortLink['source'],
        active: props.Active?.checkbox ?? false,
        createdAt: page.created_time,
    };
};

async function fetchLinkBySlugUncached(slug: string): Promise<ShortLink | null> {
    const res = await fetch(`${NOTION_API}/databases/${SHORT_LINKS_DB_ID}/query`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
            filter: {
                and: [
                    { property: 'Slug', title: { equals: slug } },
                    { property: 'Active', checkbox: { equals: true } },
                ],
            },
            page_size: 1,
        }),
    });
    if (!res.ok) return null;
    const data = await res.json() as NotionQueryResponse;
    const page = data.results?.[0];
    if (!page) return null;
    return parseLink(page);
}

export const getLinkBySlug = (slug: string) =>
    unstable_cache(
        () => fetchLinkBySlugUncached(slug),
        ['short-link', slug],
        { revalidate: 60, tags: ['short-links'] }
    )();

// ───── List (uncached for dashboard) ─────

export async function listLinks(): Promise<ShortLink[]> {
    const res = await fetch(`${NOTION_API}/databases/${SHORT_LINKS_DB_ID}/query`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
            sorts: [{ property: 'Created', direction: 'descending' }],
            page_size: 100,
        }),
    });
    if (!res.ok) return [];
    const data = await res.json() as NotionQueryResponse;
    return data.results.map(parseLink);
}

// ───── Click Recording ─────

export function parseClickContext(request: NextRequest): ClickContext {
    const ua = request.headers.get('user-agent') ?? '';
    const referer = request.headers.get('referer') ?? '';
    const country = request.headers.get('x-vercel-ip-country') ?? '';
    const city = decodeURIComponent(request.headers.get('x-vercel-ip-city') ?? '');
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        ?? request.headers.get('x-real-ip')
        ?? '';
    const ipHash = ip ? createHash('sha256').update(ip).digest('hex').slice(0, 16) : '';

    const parser = new UAParser(ua);
    const result = parser.getResult();
    const deviceType = result.device.type;
    let device: string = 'desktop';
    if (deviceType === 'mobile') device = 'mobile';
    else if (deviceType === 'tablet') device = 'tablet';
    else if (deviceType === 'wearable' || deviceType === 'smarttv' || deviceType === 'console') device = 'unknown';

    return {
        country,
        city,
        device,
        browser: [result.browser.name, result.browser.version].filter(Boolean).join(' '),
        os: [result.os.name, result.os.version].filter(Boolean).join(' '),
        referer,
        ipHash,
    };
}

export type RecordClickInput = {
    slug: string;
    source: string;
    campaign: string;
    content: string;
    targetUrl: string;
    linkPageId?: string;
    ctx: ClickContext;
};

export async function recordClick(input: RecordClickInput): Promise<void> {
    const ts = new Date().toISOString();
    const title = `${input.slug} — ${ts}`;

    const properties: Record<string, unknown> = {
        'Click': { title: [{ text: { content: title } }] },
        'Slug': { rich_text: [{ text: { content: input.slug } }] },
        'Source': { select: { name: input.source || 'direct' } },
        'Campaign': { rich_text: [{ text: { content: input.campaign } }] },
        'Content': { rich_text: [{ text: { content: input.content } }] },
        'Target URL': { rich_text: [{ text: { content: input.targetUrl.slice(0, 2000) } }] },
        'Country': { rich_text: [{ text: { content: input.ctx.country } }] },
        'City': { rich_text: [{ text: { content: input.ctx.city } }] },
        'Device': { select: { name: input.ctx.device } },
        'Browser': { rich_text: [{ text: { content: input.ctx.browser.slice(0, 100) } }] },
        'OS': { rich_text: [{ text: { content: input.ctx.os.slice(0, 100) } }] },
        'Referer': { rich_text: [{ text: { content: input.ctx.referer.slice(0, 500) } }] },
        'IP Hash': { rich_text: [{ text: { content: input.ctx.ipHash } }] },
        'Timestamp': { date: { start: ts } },
    };

    if (input.linkPageId) {
        properties['Link'] = { relation: [{ id: input.linkPageId }] };
    }

    try {
        await fetch(`${NOTION_API}/pages`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({
                parent: { database_id: LINK_CLICKS_DB_ID },
                properties,
            }),
        });
    } catch (e) {
        console.error('[recordClick] failed:', e);
    }
}

// ───── List clicks for dashboard ─────

type ClickQueryResponse = {
    results: Array<{
        id: string;
        properties: {
            Slug?: NotionPropText;
            Source?: NotionPropSelect;
            Campaign?: NotionPropText;
            Content?: NotionPropText;
            Country?: NotionPropText;
            City?: NotionPropText;
            Device?: NotionPropSelect;
            Browser?: NotionPropText;
            OS?: NotionPropText;
            Referer?: NotionPropText;
            Timestamp?: { date?: { start?: string } | null };
        };
    }>;
    has_more: boolean;
    next_cursor: string | null;
};

export type ClickListItem = {
    id: string;
    slug: string;
    source: string;
    campaign: string;
    content: string;
    country: string;
    city: string;
    device: string;
    browser: string;
    os: string;
    referer: string;
    timestamp: string;
};

export async function listClicks(opts?: { sinceDays?: number; limit?: number }): Promise<ClickListItem[]> {
    const sinceDays = opts?.sinceDays ?? 30;
    const limit = opts?.limit ?? 500;
    const since = new Date(Date.now() - sinceDays * 86400000).toISOString();

    const all: ClickListItem[] = [];
    let cursor: string | null = null;

    do {
        const body: Record<string, unknown> = {
            filter: {
                property: 'Timestamp',
                date: { on_or_after: since },
            },
            sorts: [{ property: 'Timestamp', direction: 'descending' }],
            page_size: 100,
        };
        if (cursor) body.start_cursor = cursor;

        const res = await fetch(`${NOTION_API}/databases/${LINK_CLICKS_DB_ID}/query`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify(body),
        });
        if (!res.ok) break;
        const data = await res.json() as ClickQueryResponse;

        for (const page of data.results) {
            const p = page.properties;
            all.push({
                id: page.id,
                slug: p.Slug?.rich_text?.[0]?.plain_text ?? '',
                source: p.Source?.select?.name ?? '',
                campaign: p.Campaign?.rich_text?.[0]?.plain_text ?? '',
                content: p.Content?.rich_text?.[0]?.plain_text ?? '',
                country: p.Country?.rich_text?.[0]?.plain_text ?? '',
                city: p.City?.rich_text?.[0]?.plain_text ?? '',
                device: p.Device?.select?.name ?? '',
                browser: p.Browser?.rich_text?.[0]?.plain_text ?? '',
                os: p.OS?.rich_text?.[0]?.plain_text ?? '',
                referer: p.Referer?.rich_text?.[0]?.plain_text ?? '',
                timestamp: p.Timestamp?.date?.start ?? '',
            });
            if (all.length >= limit) break;
        }
        cursor = data.has_more ? data.next_cursor : null;
    } while (cursor && all.length < limit);

    return all;
}

// ───── Helpers ─────

export function buildYouTubeDeepLink(videoId: string, ua: string): string {
    const isAndroid = /android/i.test(ua);
    const isIOS = /iphone|ipad|ipod/i.test(ua);

    if (isAndroid) {
        return `intent://www.youtube.com/watch?v=${videoId}#Intent;package=com.google.android.youtube;scheme=https;end`;
    }
    if (isIOS) {
        return `https://youtu.be/${videoId}`;
    }
    return `https://www.youtube.com/watch?v=${videoId}`;
}
