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
    const qs = new URLSearchParams({ action: 'TEMPLATE', text: title, dates: `${stamp(start)}/${stamp(end)}`, details });
    return `https://calendar.google.com/calendar/render?${qs}`;
}

/** Nadpis bloku, drží stejnou velikost jako otázky v dotazníku pod ním. */
const BlockTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-[19px] md:text-[22px] font-bold tracking-[-0.02em] leading-[1.2]">{children}</h2>
);

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex items-baseline justify-between gap-6 border-b border-white/10 py-3.5">
        <span className="text-sm text-white/50">{label}</span>
        <span className="text-right text-[17px] md:text-[19px] font-bold">{value}</span>
    </div>
);

// Potvrzení registrace, stejný jazyk jako přihláška: logo, velký nadpis
// na střed a pod ním obsah v úzkém sloupci.
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
    const groupUrl = edition?.wa_group_invite_url || '';
    const firstName = reg?.name?.trim().split(/\s+/)[0];

    return (
        <main className="min-h-screen relative bg-[#0A0A0A] text-white selection:bg-brand-red selection:text-white overflow-x-hidden">
            <TextureOverlay />

            <div className="relative z-10 mx-auto w-full max-w-[820px] px-5 md:px-8">
                <header className="pt-8 md:pt-10 text-center">
                    <Link href="/webinar" className="inline-block text-[26px] md:text-[30px] font-serif italic leading-none text-white">
                        Beyond
                    </Link>
                </header>

                <div className="pt-10 md:pt-12 text-center">
                    <h1 className="mx-auto max-w-[14ch] text-[34px] md:text-[56px] font-bold tracking-[-0.035em] leading-[1.04]">
                        {firstName ? `${firstName}, máš ` : 'Máš '}
                        <LedText soft color="red" text="místo" className="whitespace-nowrap" />
                    </h1>
                    <p className="mx-auto mt-5 max-w-[46ch] text-[17px] md:text-[19px] text-white/60 leading-[1.5]">
                        Sejdeme se {when.day.toLowerCase()} v {when.time}, vysíláme živě {minutes} minut a bude prostor na otázky
                    </p>
                </div>

                <div className="mx-auto mt-12 w-full max-w-[560px] pb-24 md:mt-14 md:pb-28">
                    <section>
                        <BlockTitle>Ulož si termín</BlockTitle>
                        <p className="mt-2 text-[15px] md:text-[16px] text-white/50 leading-[1.5]">
                            Kdo si webinář hodí do kalendáře, dorazí podstatně častěji
                        </p>

                        <div className="mt-5 border-t border-white/10">
                            <Row label="Datum" value={when.day} />
                            <Row label="Začátek" value={when.time} />
                            <Row label="Délka" value={`${minutes} minut`} />
                            <Row label="Kde" value="Online, živě" />
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <a
                                href={googleCalendarUrl(title, startISO, minutes, joinUrl || 'Odkaz pošleme emailem')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-13 items-center rounded-full bg-brand-red px-8 text-base font-bold text-white transition-colors duration-200 hover:bg-[#d40c00]"
                            >
                                Přidat do Google kalendáře
                            </a>
                            {t && (
                                <a
                                    href={`/api/webinar/kalendar?t=${encodeURIComponent(t)}`}
                                    className="inline-flex h-13 items-center rounded-full border border-white/25 px-8 text-base font-bold text-white transition-colors duration-200 hover:border-white"
                                >
                                    Stáhnout do kalendáře
                                </a>
                            )}
                        </div>

                        {joinUrl && (
                            <p className="mt-6 text-[16px] text-white/55 leading-[1.55]">
                                Tvůj odkaz na vysílání{' '}
                                <a href={joinUrl} className="text-white underline underline-offset-[3px]">
                                    otevřít
                                </a>
                                <br />
                                Pošlu ti ho ještě mailem i před začátkem, takže si ho nemusíš hlídat
                            </p>
                        )}
                    </section>

                    {groupUrl && (
                        <section className="mt-14 border-t border-white/10 pt-10">
                            <BlockTitle>Skupina k webináři</BlockTitle>
                            <p className="mt-2 max-w-[46ch] text-[16px] md:text-[17px] text-white/55 leading-[1.55]">
                                Do webináře tam dávám videa a věci, co se do vysílání nevejdou. Píšeme tam jen já a tým, takže tě to nezavalí
                            </p>
                            <a
                                href={groupUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-6 inline-flex h-13 items-center rounded-full border border-white/25 px-8 text-base font-bold text-white transition-colors duration-200 hover:border-white"
                            >
                                Přidat se do skupiny
                            </a>
                        </section>
                    )}

                    {reg && !reg.qualified_at && (
                        <section className="mt-14 border-t border-white/10 pt-10">
                            <p className="text-sm text-white/45">Krok 2 ze 2</p>
                            <div className="mt-4">
                                <BlockTitle>Dvě otázky, ať webinář sedne i tobě</BlockTitle>
                                <p className="mt-2 max-w-[46ch] text-[15px] md:text-[16px] text-white/50 leading-[1.5]">
                                    Podle odpovědí poskládám obsah tak, aby seděl lidem, co přijdou. Zabere to půl minuty
                                </p>
                            </div>
                            <div className="mt-8">
                                <QualifyForm token={reg.token} />
                            </div>
                        </section>
                    )}
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
