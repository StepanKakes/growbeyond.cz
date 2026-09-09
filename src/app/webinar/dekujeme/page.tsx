import type { Metadata } from 'next';
import Link from 'next/link';
import { ThankYouSteps } from '@/components/webinar/ThankYouSteps';
import { TextureOverlay } from '@/components/TextureOverlay';
import { getEdition, getRegistrationByToken, dbConfigured } from '@/lib/webinar/db';
import { WEBINAR } from '@/components/webinar/webinarConfig';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Máš rezervované místo | Webinář Beyond',
    robots: { index: false, follow: false },
};

const TZ = 'Europe/Prague';

function formatWhen(startISO: string) {
    const start = new Date(startISO);
    const f = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('cs-CZ', { ...opts, timeZone: TZ }).format(start);
    const cap = (v: string) => v.charAt(0).toUpperCase() + v.slice(1);
    // Datum na displeji je číselné a dvoumístné, ať drží řádek jako na tabuli.
    const [d2, m2] = f({ day: '2-digit', month: '2-digit' }).split('.').map(v => v.trim());
    return {
        day: cap(f({ weekday: 'long', day: 'numeric', month: 'long' })),
        weekday: cap(f({ weekday: 'long' })),
        dayMonth: `${d2}.${m2}.`,
        year: f({ year: 'numeric' }),
        time: f({ hour: '2-digit', minute: '2-digit' }),
    };
}

/** Odkaz do Google kalendáře. Časy v UTC bez oddělovačů, jak Google chce. */
function googleCalendarUrl(title: string, startISO: string, minutes: number, details: string) {
    const start = new Date(startISO);
    const end = new Date(start.getTime() + minutes * 60000);
    const stamp = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, '');
    const qs = new URLSearchParams({ action: 'TEMPLATE', text: title, dates: `${stamp(start)}/${stamp(end)}`, details });
    return `https://calendar.google.com/calendar/render?${qs}`;
}

// Potvrzení registrace ve dvou krocích, stejný jazyk jako přihláška:
// logo, velký nadpis na střed a pod ním obsah v úzkém sloupci.
export default async function ThankYouPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
    const { t } = await searchParams;

    const edition = dbConfigured() ? await getEdition().catch(() => null) : null;
    const reg = dbConfigured() && t ? await getRegistrationByToken(t).catch(() => null) : null;

    // Bez platného tokenu stránka pořád dává smysl jako obecné potvrzení,
    // jen bez osobního odkazu a bez dotazníku.
    const startISO = edition?.starts_at || `${WEBINAR.dateISO}T${WEBINAR.time}:00+02:00`;
    const minutes = edition?.duration_minutes || WEBINAR.durationMinutes;
    const title = edition?.title || '2030';
    const when = formatWhen(startISO);
    const joinUrl = reg?.zoom_join_url || edition?.zoom_join_url || '';

    return (
        <main className="min-h-screen relative bg-[#0A0A0A] text-white selection:bg-brand-red selection:text-white overflow-x-hidden">
            <TextureOverlay />

            <div className="relative z-10 mx-auto w-full max-w-[820px] px-5 md:px-8">
                <header className="pt-8 md:pt-10 text-center">
                    <Link href="/webinar" className="inline-block text-[26px] md:text-[30px] font-serif italic leading-none text-white">
                        Beyond
                    </Link>
                </header>

                <div className="pt-10 pb-24 md:pt-12 md:pb-28">
                    <ThankYouSteps
                        token={reg?.token ?? null}
                        alreadyQualified={Boolean(reg?.qualified_at)}
                        firstName={reg?.name?.trim().split(/\s+/)[0] ?? null}
                        dayLabel={when.day}
                        weekday={when.weekday}
                        dayMonth={when.dayMonth}
                        year={when.year}
                        timeLabel={when.time}
                        minutes={minutes}
                        joinUrl={joinUrl}
                        groupUrl={edition?.wa_group_invite_url || ''}
                        googleUrl={googleCalendarUrl(title, startISO, minutes, joinUrl || 'Odkaz pošleme emailem')}
                        icsUrl={t ? `/api/webinar/kalendar?t=${encodeURIComponent(t)}` : null}
                    />
                </div>

                <footer className="border-t border-white/10 py-8 text-center text-sm text-white/40">
                    <Link href="/webinar" className="transition-colors duration-200 hover:text-white">
                        Zpět na stránku webináře
                    </Link>
                </footer>
            </div>
        </main>
    );
}
