import { NextRequest, NextResponse, after } from 'next/server';
import { getLinkBySlug, parseClickContext, recordClick, buildYouTubeDeepLink } from '@/lib/notion-links';
import { extractYouTubeId, resolveYouTubeThumbnail } from '@/lib/youtube';

const BOT_REGEX = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|Slackbot|WhatsApp|TelegramBot|Discordbot|Instagram|Pinterest|Skype|vk\.com|googlebot|bingbot|YandexBot|DuckDuckBot|Baiduspider|Applebot|Googlebot|preview|crawler|spider/i;

const escHtml = (s: string) =>
    s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] ?? c));

function ogHtml(opts: {
    title: string;
    description: string;
    image: string;
    imageWidth: number;
    imageHeight: number;
    url: string;
    redirectTo: string;
    isYouTube: boolean;
}): string {
    const twitterCard = opts.imageWidth >= 600 ? 'summary_large_image' : 'summary';
    return `<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escHtml(opts.title)}</title>
<link rel="canonical" href="${escHtml(opts.url)}">
<meta property="og:type" content="${opts.isYouTube ? 'video.other' : 'website'}">
<meta property="og:url" content="${escHtml(opts.url)}">
<meta property="og:title" content="${escHtml(opts.title)}">
<meta property="og:description" content="${escHtml(opts.description)}">
<meta property="og:image" content="${escHtml(opts.image)}">
<meta property="og:image:secure_url" content="${escHtml(opts.image)}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="${opts.imageWidth}">
<meta property="og:image:height" content="${opts.imageHeight}">
<meta property="og:image:alt" content="${escHtml(opts.title)}">
<meta property="og:site_name" content="GrowBeyond">
<meta property="og:locale" content="cs_CZ">
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
        if (ytId) {
            const thumb = await resolveYouTubeThumbnail(ytId);
            image = thumb.url;
            imageWidth = thumb.width;
            imageHeight = thumb.height;
        } else {
            image = `${request.nextUrl.origin}/images/og-default.jpg`;
        }
        const description = ytId ? 'Pusť si video na YouTube' : (() => {
            try { return new URL(link.targetUrl).hostname.replace(/^www\./, ''); } catch { return ''; }
        })();
        const html = ogHtml({
            title: link.title || link.slug,
            description,
            image,
            imageWidth,
            imageHeight,
            url: `${request.nextUrl.origin}/l/${slug}`,
            redirectTo: link.targetUrl,
            isYouTube: !!ytId,
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
