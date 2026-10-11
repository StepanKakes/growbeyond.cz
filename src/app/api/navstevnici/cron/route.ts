import { NextRequest, NextResponse } from 'next/server';
import { zpracujNavstevy } from '@/lib/navstevnici/beh';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Navazující e-maily po návštěvě webu. Volá se jednou denně v 7:00 ze systémového
// crontabu na serveru se stejným x-cron-secret jako scheduler webináře.
//
// Ruční kontrola bez zápisu a odesílání:
//   curl -H "x-cron-secret: ..." "https://growbeyond.cz/api/navstevnici/cron?dry=1"

async function handle(req: NextRequest) {
    const secret = process.env.WEBINAR_CRON_SECRET;
    if (!secret || req.headers.get('x-cron-secret') !== secret) {
        return NextResponse.json({ ok: false }, { status: 401 });
    }
    const dry = new URL(req.url).searchParams.get('dry') === '1';
    try {
        const souhrn = await zpracujNavstevy({ dry });
        if (souhrn.navstev) console.log('navstevnici/cron:', JSON.stringify(souhrn));
        return NextResponse.json(souhrn);
    } catch (e) {
        console.error('navstevnici/cron selhal:', e);
        return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 });
    }
}

export const POST = handle;
export const GET = handle;
