import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { PinGate } from '@/components/webinar/PinGate';
import { buildFunnelReport } from '@/lib/webinar/metrics';
import { dbConfigured } from '@/lib/webinar/db';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Webinář, přehled',
    robots: { index: false, follow: false },
};

const TZ = 'Europe/Prague';

const Stat = ({ label, value, hint }: { label: string; value: string | number; hint?: string }) => (
    <div className="border-b border-white/10 py-5">
        <div className="text-sm text-white/50">{label}</div>
        <div className="mt-1 text-[28px] md:text-[34px] font-bold tracking-[-0.02em] tabular-nums">{value}</div>
        {hint && <div className="mt-1 text-sm text-white/40">{hint}</div>}
    </div>
);

export default async function WebinarAdminPage() {
    const authorized = (await cookies()).get('internal_authorized')?.value === 'true';
    if (!authorized) return <PinGate />;

    if (!dbConfigured()) {
        return (
            <main className="min-h-screen bg-[#0A0A0A] text-white px-5 py-24">
                <p className="mx-auto max-w-[600px] text-white/70">
                    Databáze webináře není nakonfigurovaná, chybí WEBINAR_DB_ANON_KEY nebo WEBINAR_DB_JWT
                </p>
            </main>
        );
    }

    const report = await buildFunnelReport().catch(() => null);

    if (!report) {
        return (
            <main className="min-h-screen bg-[#0A0A0A] text-white px-5 py-24">
                <p className="mx-auto max-w-[600px] text-white/70">Nepodařilo se načíst data edice</p>
            </main>
        );
    }

    const start = new Intl.DateTimeFormat('cs-CZ', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: TZ,
    }).format(new Date(report.edition.startsAt));

    const { totals } = report;

    return (
        <main className="min-h-screen bg-[#0A0A0A] text-white selection:bg-brand-red selection:text-white">
            <div className="mx-auto w-full max-w-[1200px] px-5 md:px-12 py-16 md:py-24">
                <h1 className="text-[32px] md:text-[52px] font-bold tracking-[-0.03em] leading-[1.05]">
                    {report.edition.title}
                </h1>
                <p className="mt-3 text-[17px] text-white/60">{start}</p>

                <section className="mt-14">
                    <h2 className="text-sm uppercase tracking-[0.14em] text-white/45">Stav</h2>
                    <div className="mt-4 grid gap-x-12 md:grid-cols-3 lg:grid-cols-4">
                        <Stat label="Návštěvy stránky" value={totals.views} />
                        <Stat label="Registrace" value={totals.registrations} />
                        <Stat label="Vyplnili dotazník" value={totals.qualified} />
                        <Stat label="Uložili do kalendáře" value={totals.calendarAdded} />
                        <Stat
                            label="Přišli"
                            value={totals.attended}
                            hint={totals.attendanceSynced ? undefined : 'účast se ještě nesynchronizovala ze Zoomu'}
                        />
                        <Stat label="Nepřišli" value={totals.noShow} />
                        <Stat label="Přihlášky" value={totals.applications} />
                        <Stat label="Kvalifikované přihlášky" value={totals.qualifiedApplications} />
                        <Stat label="Rezervované hovory" value={totals.booked} />
                        <Stat label="Uzavřeno" value={totals.won} />
                        <Stat label="Odhlásili WhatsApp" value={totals.whatsappOptOuts} />
                    </div>
                </section>

                <section className="mt-16">
                    <h2 className="text-sm uppercase tracking-[0.14em] text-white/45">Poměry</h2>
                    <div className="mt-4 border-t border-white/10">
                        {report.metrics.map(m => (
                            <div
                                key={m.key}
                                className="grid gap-3 border-b border-white/10 py-6 md:grid-cols-12 md:items-baseline md:gap-8"
                            >
                                <div className="md:col-span-5">
                                    <div className="text-[19px] md:text-[22px] font-bold tracking-[-0.02em]">{m.label}</div>
                                    <div className="mt-1 text-sm text-white/45">{m.question}</div>
                                </div>
                                <div className="md:col-span-4 text-white/55 tabular-nums">
                                    {m.numerator} z {m.denominator}
                                </div>
                                <div className="md:col-span-3 md:text-right">
                                    <span className="text-[28px] md:text-[36px] font-bold tabular-nums">
                                        {m.rate === null ? 'zatím nic' : `${m.rate} %`}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
