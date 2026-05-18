import { NextRequest, NextResponse, after } from 'next/server';
import { getLinkBySlug, parseClickContext, recordClick, buildYouTubeDeepLink } from '@/lib/notion-links';
import { extractYouTubeId, fetchYouTubeMeta, resolveYouTubeThumbnail } from '@/lib/youtube';

// Scraper-specific patterns. Do NOT match in-app browser UAs (Instagram,
// Pinterest, FBAN, etc.) — those are real users and must reach the deep-link
// branch so YouTube opens in the app. Instagram & Facebook share Meta's
// `facebookexternalhit` scraper, so previews still work for both.
const BOT_REGEX = /facebookexternalhit\/|Facebot|Twitterbot|LinkedInBot|Slackbot|WhatsApp\/|TelegramBot|Discordbot|Pinterestbot|Skype|vk\.com|googlebot|bingbot|YandexBot|DuckDuckBot|Baiduspider|Applebot|preview-bot|link-checker|MetaInspector|Embedly|Iframely|crawler|spider/i;

const escHtml = (s: string) =>
    s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] ?? c));

type YouTubeOg = {
    videoId: string;
    author: string;
    embedUrl: string;
    canonicalUrl: string;
};

function ogHtml(opts: {
    title: string;
    description: string;
    image: string;
    imageWidth: number;
    imageHeight: number;
    url: string;
    redirectTo: string;
    youtube: YouTubeOg | null;
}): string {
    const isYouTube = !!opts.youtube;
    const twitterCard = isYouTube
        ? 'player'
        : opts.imageWidth >= 600
            ? 'summary_large_image'
            : 'summary';
    // YouTube embed dimensions track the thumbnail's aspect; clients prefer 16:9.
    const playerW = isYouTube ? 1280 : opts.imageWidth;
    const playerH = isYouTube ? 720 : opts.imageHeight;

    const youtubeTags = opts.youtube
        ? `
<meta property="og:video" content="${escHtml(opts.youtube.embedUrl)}">
<meta property="og:video:url" content="${escHtml(opts.youtube.embedUrl)}">
<meta property="og:video:secure_url" content="${escHtml(opts.youtube.embedUrl)}">
<meta property="og:video:type" content="text/html">
<meta property="og:video:width" content="${playerW}">
<meta property="og:video:height" content="${playerH}">
<meta property="al:ios:app_store_id" content="544007664">
<meta property="al:ios:app_name" content="YouTube">
<meta property="al:ios:url" content="vnd.youtube://${escHtml(opts.youtube.videoId)}">
<meta property="al:android:app_name" content="YouTube">
<meta property="al:android:package" content="com.google.android.youtube">
<meta property="al:android:url" content="vnd.youtube://${escHtml(opts.youtube.videoId)}">
<meta property="al:web:url" content="${escHtml(opts.youtube.canonicalUrl)}">
<meta name="twitter:player" content="${escHtml(opts.youtube.embedUrl)}">
<meta name="twitter:player:width" content="${playerW}">
<meta name="twitter:player:height" content="${playerH}">
<meta name="twitter:site" content="@YouTube">
<meta name="twitter:app:name:iphone" content="YouTube">
<meta name="twitter:app:id:iphone" content="544007664">
<meta name="twitter:app:url:iphone" content="vnd.youtube://${escHtml(opts.youtube.videoId)}">
<meta name="twitter:app:name:googleplay" content="YouTube">
<meta name="twitter:app:id:googleplay" content="com.google.android.youtube">
<meta name="twitter:app:url:googleplay" content="https://www.youtube.com/watch?v=${escHtml(opts.youtube.videoId)}">`
        : '';

    return `<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escHtml(opts.title)}</title>
<link rel="canonical" href="${escHtml(opts.url)}">
<meta property="og:type" content="${isYouTube ? 'video.other' : 'website'}">
<meta property="og:url" content="${escHtml(opts.url)}">
<meta property="og:title" content="${escHtml(opts.title)}">
<meta property="og:description" content="${escHtml(opts.description)}">
<meta property="og:image" content="${escHtml(opts.image)}">
<meta property="og:image:secure_url" content="${escHtml(opts.image)}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="${opts.imageWidth}">
<meta property="og:image:height" content="${opts.imageHeight}">
<meta property="og:image:alt" content="${escHtml(opts.title)}">
<meta property="og:site_name" content="${isYouTube ? 'YouTube' : 'GrowBeyond'}">
<meta property="og:locale" content="cs_CZ">${youtubeTags}
<meta name="twitter:card" content="${twitterCard}">
<meta name="twitter:title" content="${escHtml(opts.title)}">
<meta name="twitter:description" content="${escHtml(opts.description)}">
<meta name="twitter:image" content="${escHtml(opts.image)}">
<meta http-equiv="refresh" content="0; url=${escHtml(opts.redirectTo)}">
</head>
<body style="margin:0;background:#000;color:#fff;font-family:-apple-system,BlinkMacSystemFont,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:20px;">
<div>
<h1 style="font-size:24px;margin:0 0 12px 0;">${escHtml(opts.title)}</h1>
<p style="color:#888;margin:0 0 24px 0;">${escHtml(opts.description)}</p>
<a href="${escHtml(opts.redirectTo)}" style="background:#FF0E00;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">Pokračovat →</a>
</div>
<script>window.location.href = ${JSON.stringify(opts.redirectTo)};</script>
</body>
</html>`;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const link = await getLinkBySlug(slug);

    if (!link) {
        return NextResponse.redirect(new URL('/', request.url), 302);
    }

    const ua = request.headers.get('user-agent') ?? '';
    const ytId = extractYouTubeId(link.targetUrl);

    // Bot / link preview crawler → serve OG HTML, don't track, don't deeplink
    if (BOT_REGEX.test(ua)) {
        let image: string;
        let imageWidth = 1200;
        let imageHeight = 630;
        let title = link.title || link.slug;
        let description = '';
        let youtube: YouTubeOg | null = null;

        if (ytId) {
            const [thumb, meta] = await Promise.all([
                resolveYouTubeThumbnail(ytId),
                fetchYouTubeMeta(ytId),
            ]);
            image = thumb.url;
            imageWidth = thumb.width;
            imageHeight = thumb.height;
            if (meta.title) title = meta.title;
            description = meta.description || meta.author || 'YouTube';
            youtube = {
                videoId: ytId,
                author: meta.author,
                embedUrl: `https://www.youtube.com/embed/${ytId}`,
                canonicalUrl: `https://www.youtube.com/watch?v=${ytId}`,
            };
        } else {
            image = `${request.nextUrl.origin}/images/og-default.jpg`;
            try {
                description = new URL(link.targetUrl).hostname.replace(/^www\./, '');
            } catch {}
        }

        const html = ogHtml({
            title,
            description,
            image,
            imageWidth,
            imageHeight,
            url: `${request.nextUrl.origin}/l/${slug}`,
            redirectTo: link.targetUrl,
            youtube,
        });
        return new NextResponse(html, {
            status: 200,
            headers: {
                'content-type': 'text/html; charset=utf-8',
                'cache-control': 'public, max-age=3600',
            },
        });
    }

    // Real user → deep link + track
    const target = ytId ? buildYouTubeDeepLink(ytId, ua) : link.targetUrl;

    const ctx = parseClickContext(request);
    after(async () => {
        await recordClick({
            slug,
            source: link.source,
            campaign: '',
            content: link.title,
            targetUrl: target,
            linkPageId: link.pageId,
            ctx,
        });
    });

    return NextResponse.redirect(target, 302);
}
