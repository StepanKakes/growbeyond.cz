import { NextRequest, NextResponse } from 'next/server';
import { runScheduler } from '@/lib/webinar/runner';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Scheduler webinářového funnelu. Volá se každou minutu z n8n s hlavičkou
// x-cron-secret. Jeden běh má rozpočet zhruba 50 sekund, zbytek dobere
// příští minuta, takže na dlouhé dávce WhatsApp zpráv nic neuvázne.
//
// Ruční kontrola bez odesílání:
//   curl -H "x-cron-secret: ..." "https://growbeyond.cz/api/webinar/cron?dry=1"

async function handle(req: NextRequest) {
    const secret = process.env.WEBINAR_CRON_SECRET;
    if (!secret || req.headers.get('x-cron-secret') !== secret) {
        return NextResponse.json({ ok: false }, { status: 401 });
    }

    const dryRun = new URL(req.url).searchParams.get('dry') === '1';

    try {
        const summary = await runScheduler({ dryRun });
        if (summary.emailsSent || summary.waSent || summary.failed) {
            console.log('webinar/cron:', JSON.stringify(summary));
        }
        return NextResponse.json(summary);
    } catch (e) {
        console.error('webinar/cron selhal:', e);
        return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 });
    }
}

export const POST = handle;
export const GET = handle;
