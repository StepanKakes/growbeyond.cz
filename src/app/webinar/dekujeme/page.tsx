import type { Metadata } from 'next';
import Link from 'next/link';
import { LedText } from '@/components/webinar/LedText';
import { QualifyForm } from '@/components/webinar/QualifyForm';
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
    const day = new Intl.DateTimeFormat('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long', timeZone: TZ }).format(start);
    const time = new Intl.DateTimeFormat('cs-CZ', { hour: '2-digit', minute: '2-digit', timeZone: TZ }).format(start);
    return { day: day.charAt(0).toUpperCase() + day.slice(1), time };
}

/** Odkaz do Google kalendáře. Časy v UTC bez oddělovačů, jak Google chce. */
function googleCalendarUrl(title: string, startISO: string, minutes: number, details: string) {
    const start = new Date(startISO);
    const end = new Date(start.getTime() + minutes * 60000);
    const stamp = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, '');
    const qs = new URLSearchParams({
        action: 'TEMPLATE',
        text: title,
        dates: `${stamp(start)}/${stamp(end)}`,
        details,
    });
    return `https://calendar.google.com/calendar/render?${qs}`;
}

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex items-baseline justify-between gap-6 border-b border-white/10 py-4">
        <span className="text-sm text-white/50">{label}</span>
        <span className="text-[18px] md:text-[21px] font-bold text-right">{value}</span>
    </div>
);

export default async function ThankYouPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
    const { t } = await searchParams;

    const edition = dbConfigured() ? await getEdition().catch(() => null) : null;
    const reg = dbConfigured() && t ? await getRegistrationByToken(t).catch(() => null) : null;

    // Bez platného tokenu stránka pořád dává smysl jako obecné potvrzení,
    // jen bez osobního odkazu a bez dotazníku.
    const startISO = edition?.starts_at || `${WEBINAR.dateISO}T${WEBINAR.time}:00+02:00`;
    const minutes = edition?.duration_minutes || WEBINAR.durationMinutes;
    const title = edition?.title || 'Webinář 2030';
    const when = formatWhen(startISO);
    const joinUrl = reg?.zoom_join_url || edition?.zoom_join_url || '';
    const groupUrl = edition?.wa_group_invite_url || '';

    const firstName = reg?.name?.trim().split(/\s+/)[0];

    return (
        <main className="min-h-screen relative bg-[#0A0A0A] text-white selection:bg-brand-red selection:text-white overflow-x-hidden">
            <TextureOverlay />

            <section className="relative z-10">
                <div className="mx-auto w-full max-w-[1200px] px-5 md:px-12 pt-24 pb-16 md:pt-36 md:pb-24">
                    <p className="text-[15px] uppercase tracking-[0.14em] text-white/50">
                        {firstName ? `${firstName}, máš to potvrzené` : 'Máš to potvrzené'}
                    </p>
                    <LedText
                        as="h1"
                        text="MÁŠ MÍSTO"
                        className="mt-5 block font-bold leading-[0.92] tracking-[-0.04em] text-[clamp(52px,11vw,148px)]"
                    />
                    <p className="mt-7 max-w-[46ch] text-[18px] md:text-[22px] text-white/70 leading-[1.5]">
                        Sejdeme se {when.day.toLowerCase()} v {when.time}, vysíláme živě {minutes} minut a bude prostor na otázky
                    </p>
                </div>
            </section>

            <section className="relative z-10 border-t border-white/10">
                <div className="mx-auto w-full max-w-[1200px] px-5 md:px-12 py-14 md:py-20 grid gap-12 md:grid-cols-12 md:gap-16">
                    <div className="md:col-span-5">
                        <h2 className="text-[32px] md:text-[44px] font-bold tracking-[-0.03em] leading-[1.05]">
                            Ulož si termín
                        </h2>
                        <p className="mt-4 text-[17px] text-white/60 leading-[1.55] max-w-[38ch]">
                            Lidé, co si webinář hodí do kalendáře, na něj dorazí podstatně častěji
                        </p>
                    </div>

                    <div className="md:col-span-7">
                        <div className="border-t border-white/10">
                            <Row label="Datum" value={when.day} />
                            <Row label="Začátek" value={when.time} />
                            <Row label="Délka" value={`${minutes} minut`} />
                            <Row label="Kde" value="Online, živě" />
                        </div>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <a
                                href={googleCalendarUrl(title, startISO, minutes, joinUrl || 'Odkaz pošleme emailem')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-13 items-center rounded-full bg-brand-red px-8 text-base font-bold text-white transition-colors hover:bg-[#d40c00]"
                            >
                                Přidat do Google kalendáře
                            </a>
                            {t && (
                                <a
                                    href={`/api/webinar/kalendar?t=${encodeURIComponent(t)}`}
                                    className="inline-flex h-13 items-center rounded-full border border-white/25 px-8 text-base font-bold text-white transition-colors hover:border-white"
                                >
                                    Stáhnout do kalendáře
                                </a>
                            )}
                        </div>

                        {joinUrl && (
                            <p className="mt-8 text-[17px] text-white/60 leading-[1.55]">
                                Tvůj odkaz na vysílání{' '}
                                <a href={joinUrl} className="text-white underline underline-offset-[3px]">
                                    otevřít
                                </a>
                                <br />
                                Pošlu ti ho ještě mailem i před začátkem, takže si ho nemusíš hlídat
                            </p>
                        )}
                    </div>
                </div>
            </section>

            {groupUrl && (
                <section className="relative z-10 border-t border-white/10">
                    <div className="mx-auto w-full max-w-[1200px] px-5 md:px-12 py-14 md:py-20 grid gap-12 md:grid-cols-12 md:gap-16">
                        <div className="md:col-span-5">
                            <h2 className="text-[32px] md:text-[44px] font-bold tracking-[-0.03em] leading-[1.05]">
                                Skupina k webináři
                            </h2>
                        </div>
                        <div className="md:col-span-7">
                            <p className="text-[18px] md:text-[21px] text-white/70 leading-[1.5] max-w-[46ch]">
                                Do webináře tam dávám videa a věci, co se do vysílání nevejdou. Píšeme tam jen já a tým, takže tě to nezavalí
                            </p>
                            <a
                                href={groupUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-8 inline-flex h-13 items-center rounded-full border border-white/25 px-8 text-base font-bold text-white transition-colors hover:border-white"
                            >
                                Přidat se do skupiny
                            </a>
                        </div>
                    </div>
                </section>
            )}

            {reg && !reg.qualified_at && (
                <section className="relative z-10 border-t border-white/10">
                    <div className="mx-auto w-full max-w-[1200px] px-5 md:px-12 py-14 md:py-20 grid gap-12 md:grid-cols-12 md:gap-16">
                        <div className="md:col-span-5">
                            <h2 className="text-[32px] md:text-[44px] font-bold tracking-[-0.03em] leading-[1.05]">
                                Dvě otázky, ať to sedne
                            </h2>
                            <p className="mt-4 text-[17px] text-white/60 leading-[1.55] max-w-[38ch]">
                                Podle odpovědí poskládám obsah tak, aby seděl lidem, co přijdou. Zabere to půl minuty
                            </p>
                        </div>
                        <div className="md:col-span-7">
                            <QualifyForm token={reg.token} />
                        </div>
                    </div>
                </section>
            )}

            <footer className="relative z-10 border-t border-white/10">
                <div className="mx-auto w-full max-w-[1200px] px-5 md:px-12 py-10 flex flex-wrap items-center justify-between gap-4 text-sm text-white/45">
                    <span>Beyond</span>
                    <Link href="/webinar" className="hover:text-white">
                        Zpět na stránku webináře
                    </Link>
                </div>
            </footer>
        </main>
    );
}
