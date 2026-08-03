import { NextRequest, NextResponse } from 'next/server';

// Krátké odkazy se přestěhovaly pod Beo (beo.growbeyond.cz/l/<slug>).
// Web už jen předává dál: kliky, statistiky per lead i otevírání YouTube
// v nativní aplikaci řeší Beo (stránka Odkazy). Historická klik data
// zůstávají v Notion, nové kliky se počítají v Beo.
//
// Sluggy byly do Beo naimportované 1:1. Neznámý slug pošle Beo zpět na
// growbeyond.cz homepage, takže se nikdo neztratí. Scraperům (náhledy
// v chatech) stačí řetěz 302 → YouTube, OG si přečtou z cílové stránky.
const BEO_LINKS = 'https://beo.growbeyond.cz/l';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const search = request.nextUrl.search ?? '';
    return NextResponse.redirect(`${BEO_LINKS}/${encodeURIComponent(slug)}${search}`, 302);
}

export async function HEAD(
    _request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    return NextResponse.redirect(`${BEO_LINKS}/${encodeURIComponent(slug)}`, 302);
}
