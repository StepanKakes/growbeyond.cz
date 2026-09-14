import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { REVENUE_OPTIONS, REVENUE_SCORE, revenueLabel, stuckLabel } from '@/components/webinar/qualifyOptions';
import { WEBINAR, webinarDate, webinarStart } from '@/components/webinar/webinarConfig';
import {
    countPageViews,
    dbConfigured,
    getEdition,
    listMessageLog,
    listRegistrations,
    type Registration,
} from '@/lib/webinar/db';

// Přehled registrací na webinář. Čte se jen, nic tu nejde změnit, proto stačí
// tajný odkaz místo přihlašování. Stránka se nesmí indexovat ani cachovat,
// čísla mají být aktuální při každém načtení.

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Přehled webináře',
    robots: { index: false, follow: false },
};

const PRAHA = 'Europe/Prague';

const denKey = (iso: string) =>
    new Intl.DateTimeFormat('cs-CZ', { day: 'numeric', month: 'numeric', timeZone: PRAHA }).format(new Date(iso));

const cas = (iso: string) =>
    new Intl.DateTimeFormat('cs-CZ', { hour: '2-digit', minute: '2-digit', timeZone: PRAHA }).format(new Date(iso));

/** Odkud člověk přišel. UTM má přednost, jinak zdroj zapsaný při registraci. */
function zdroj(r: Registration): string {
    return r.utm?.utm_source || r.source || 'neznámý';
}

function sectCount<T>(rows: T[], key: (r: T) => string): [string, number][] {
    const m = new Map<string, number>();
    for (const r of rows) m.set(key(r), (m.get(key(r)) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

const Cislo = ({ popis, hodnota, detail }: { popis: string; hodnota: string | number; detail?: string }) => (
    <div className="border-t border-white/12 pt-4">
        <div className="text-[12px] uppercase tracking-[0.16em] text-white/45">{popis}</div>
        <div className="mt-2 text-[40px] md:text-[52px] font-bold leading-none tabular-nums">{hodnota}</div>
        {detail && <div className="mt-2 text-[13px] text-white/55">{detail}</div>}
    </div>
);

const Nadpis = ({ children }: { children: React.ReactNode }) => (
    <h2 className="mb-5 text-[13px] uppercase tracking-[0.16em] text-white/45">{children}</h2>
);

/** Vodorovný pruh dlouhý podle podílu z maxima. */
const Pruh = ({ podil }: { podil: number }) => (
    <div className="h-1.5 w-full rounded-full bg-white/8">
        <div className="h-full rounded-full bg-brand-red" style={{ width: `${Math.max(3, podil * 100)}%` }} />
    </div>
);

/** Sloupce seznamu registrovaných. Hlavička i řádky je musí mít stejné. */
const RADEK = 'grid grid-cols-[7.5rem_1fr_1.6fr_9rem_4.5rem_5.5rem] items-baseline gap-4 px-1';

const Odpoved = ({ otazka, odpoved, poznamka }: { otazka: string; odpoved?: string; poznamka?: string }) => (
    <div>
        <div className="text-[12px] uppercase tracking-[0.12em] text-white/40">{otazka}</div>
        <div className="mt-1.5 text-[15px] leading-[1.45]">
            {odpoved ?? <span className="text-white/40">neodpověděl</span>}
            {poznamka && <span className="text-white/45"> · {poznamka}</span>}
        </div>
    </div>
);

export default async function PrehledPage({ searchParams }: { searchParams: Promise<{ k?: string }> }) {
    const { k } = await searchParams;
    const token = process.env.WEBINAR_DASHBOARD_TOKEN;

    // Bez nastaveného tokenu stránka neexistuje, ať se omylem neotevře veřejně.
    if (!token || k !== token) notFound();
    if (!dbConfigured()) notFound();

    const edition = await getEdition();
    if (!edition) notFound();

    const [registrace, log, zobrazeni] = await Promise.all([
        listRegistrations(edition.id),
        listMessageLog().catch(() => []),
        countPageViews(edition.id).catch(() => 0),
    ]);

    const dnesKey = denKey(new Date().toISOString());
    const dnes = registrace.filter(r => denKey(r.created_at) === dnesKey);
    const sDotaznikem = registrace.filter(r => r.qualified_at);
    const vKalendari = registrace.filter(r => r.calendar_added_at);
    const veSkupine = registrace.filter(r => r.wa_group_joined_at);
    const bezTelefonu = registrace.filter(r => !r.phone);

    const podleDnu = sectCount(registrace, r => denKey(r.created_at)).reverse();
    const maxDen = Math.max(1, ...podleDnu.map(([, n]) => n));
    const podleZdroje = sectCount(registrace, zdroj);
    const maxZdroj = Math.max(1, ...podleZdroje.map(([, n]) => n));

    const kroky = sectCount(log, l => `${l.step_key}|${l.status}`);
    const selhalo = log.filter(l => l.status === 'failed');

    const skore = sDotaznikem.map(r => r.qual_score ?? 0);
    const prumer = skore.length ? Math.round(skore.reduce((a, b) => a + b, 0) / skore.length) : 0;

    const start = webinarStart();
    const doStartu = Math.max(0, start.getTime() - Date.now());
    const dniDoStartu = Math.floor(doStartu / 86400000);
    const hodinDoStartu = Math.floor((doStartu % 86400000) / 3600000);
    const { weekday, numeric } = webinarDate();

    const konverze = zobrazeni ? Math.round((registrace.length / zobrazeni) * 1000) / 10 : null;

    return (
        <main className="min-h-screen bg-[#0A0A0A] text-white">
            <div className="mx-auto w-full max-w-[1080px] px-5 py-10 md:px-8 md:py-14">
                <header className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-[12px] uppercase tracking-[0.16em] text-white/45">Přehled registrací</p>
                        <h1 className="mt-2 text-[30px] md:text-[40px] font-bold leading-none tracking-[-0.03em]">
                            Webinář {WEBINAR.hero.year}
                        </h1>
                    </div>
                    <p className="text-[14px] text-white/55 tabular-nums">
                        {weekday} {numeric} v {WEBINAR.time}
                        {doStartu > 0 && <> · zbývá {dniDoStartu} dní {hodinDoStartu} hodin</>}
                    </p>
                </header>

                <section className="mt-10 grid grid-cols-2 gap-x-8 gap-y-8 md:mt-14 md:grid-cols-4">
                    <Cislo popis="Registrací" hodnota={registrace.length} detail={`${dnes.length} dnes`} />
                    <Cislo
                        popis="Vyplnilo dotazník"
                        hodnota={sDotaznikem.length}
                        detail={sDotaznikem.length ? `průměrné skóre ${prumer}` : undefined}
                    />
                    <Cislo
                        popis="V kalendáři"
                        hodnota={vKalendari.length}
                        detail={registrace.length ? `${Math.round((vKalendari.length / registrace.length) * 100)} %` : undefined}
                    />
                    <Cislo
                        popis="Ve skupině"
                        hodnota={veSkupine.length}
                        detail={konverze !== null ? `${zobrazeni} zobrazení stránky, ${konverze} % konverze` : undefined}
                    />
                </section>

                <div className="mt-14 grid gap-12 md:mt-16 md:grid-cols-2 md:gap-14">
                    <section>
                        <Nadpis>Registrace po dnech</Nadpis>
                        {podleDnu.length === 0 ? (
                            <p className="text-[15px] text-white/45">Zatím nic</p>
                        ) : (
                            <ul className="flex flex-col gap-3">
                                {podleDnu.map(([den, pocet]) => (
                                    <li key={den} className="flex items-center gap-4">
                                        <span className="w-14 shrink-0 text-[14px] tabular-nums text-white/55">{den}</span>
                                        <Pruh podil={pocet / maxDen} />
                                        <span className="w-8 shrink-0 text-right text-[14px] font-bold tabular-nums">{pocet}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <section>
                        <Nadpis>Odkud přišli</Nadpis>
                        {podleZdroje.length === 0 ? (
                            <p className="text-[15px] text-white/45">Zatím nic</p>
                        ) : (
                            <ul className="flex flex-col gap-3">
                                {podleZdroje.map(([z, pocet]) => (
                                    <li key={z} className="flex items-center gap-4">
                                        <span className="w-28 shrink-0 truncate text-[14px] text-white/55">{z}</span>
                                        <Pruh podil={pocet / maxZdroj} />
                                        <span className="w-8 shrink-0 text-right text-[14px] font-bold tabular-nums">{pocet}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>

                <section className="mt-14 md:mt-16">
                    <Nadpis>Jak se počítá skóre</Nadpis>
                    <p className="mb-5 max-w-[70ch] text-[14px] leading-[1.55] text-white/60">
                        Body dává jen odpověď na měsíční obrat. Druhá otázka, kde se člověk zasekl, se neboduje,
                        protože žádná odpověď není sama o sobě lepší, je to kontext pro rozhovor. Kdo dotazník
                        nevyplnil, nemá skóre žádné.
                    </p>
                    <ul className="flex flex-wrap gap-x-8 gap-y-2 text-[14px]">
                        {REVENUE_OPTIONS.map(o => (
                            <li key={o.value}>
                                <span className="tabular-nums font-bold">{REVENUE_SCORE[o.value]}</span>{' '}
                                <span className="text-white/60">{o.label.toLowerCase()}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="mt-14 md:mt-16">
                    <Nadpis>Rozesílání</Nadpis>
                    <div className="flex flex-wrap gap-x-10 gap-y-3">
                        {kroky.length === 0 && <p className="text-[15px] text-white/45">Zatím nic neodešlo</p>}
                        {kroky.map(([klic, pocet]) => {
                            const [krok, stav] = klic.split('|');
                            return (
                                <div key={klic} className="text-[14px]">
                                    <span className="tabular-nums font-bold">{pocet}×</span>{' '}
                                    <span className="text-white/70">{krok}</span>{' '}
                                    <span className={stav === 'failed' ? 'text-brand-red' : 'text-white/45'}>{stav}</span>
                                </div>
                            );
                        })}
                    </div>
                    {(selhalo.length > 0 || bezTelefonu.length > 0) && (
                        <p className="mt-4 text-[14px] text-white/55">
                            {selhalo.length > 0 && <>Neodesláno {selhalo.length}×, poslední důvod: {selhalo[0].error?.slice(0, 90)}. </>}
                            {bezTelefonu.length > 0 && <>Bez telefonu {bezTelefonu.length} lidí, těm chodí jen e-mail.</>}
                        </p>
                    )}
                </section>

                <section className="mt-14 md:mt-16">
                    <Nadpis>Registrovaní</Nadpis>
                    <div className="overflow-x-auto">
                        <div className="min-w-[760px]">
                            <div className={`${RADEK} border-b border-white/12 pb-3 text-[12px] uppercase tracking-[0.12em] text-white/40`}>
                                <span>Kdy</span>
                                <span>Jméno</span>
                                <span>E-mail</span>
                                <span>Zdroj</span>
                                <span className="text-right">Skóre</span>
                                <span className="text-right">Kalendář</span>
                            </div>

                            {/* Rozklik je nativní details, takže funguje i bez skriptů. */}
                            {registrace.map(r => (
                                <details key={r.id} className="group border-b border-white/8">
                                    <summary className={`${RADEK} cursor-pointer list-none py-3 text-[14px] transition-colors duration-150 hover:bg-white/4`}>
                                        <span className="tabular-nums text-white/55">
                                            {denKey(r.created_at)} {cas(r.created_at)}
                                        </span>
                                        <span className="truncate">{r.name || '—'}</span>
                                        <span className="truncate text-white/70">{r.email}</span>
                                        <span className="truncate text-white/55">{zdroj(r)}</span>
                                        <span className="text-right tabular-nums">{r.qualified_at ? r.qual_score ?? 0 : '—'}</span>
                                        <span className="text-right text-white/55">{r.calendar_added_at ? 'ano' : '—'}</span>
                                    </summary>

                                    <div className="grid gap-5 pb-6 pl-1 pr-1 pt-1 md:grid-cols-2">
                                        <Odpoved
                                            otazka="Kde teď nejvíc cítíš, že ses zasekl?"
                                            odpoved={stuckLabel(r.qual_stuck)}
                                        />
                                        <Odpoved
                                            otazka="Kolik ti dnes byznys měsíčně vydělává?"
                                            odpoved={revenueLabel(r.qual_revenue)}
                                            poznamka={r.qualified_at ? `${r.qual_score ?? 0} bodů` : undefined}
                                        />
                                        <div className="text-[13px] text-white/55 md:col-span-2">
                                            {r.phone ? `Telefon ${r.phone}` : 'Bez telefonu, chodí jen e-mail'}
                                            {' · '}WhatsApp {r.wa_status}
                                            {r.zoom_registrant_id ? ' · osobní odkaz na Zoom vytvořen' : ' · bez osobního odkazu na Zoom'}
                                            {r.qualified_at && <> · dotazník vyplněn {denKey(r.qualified_at)} {cas(r.qualified_at)}</>}
                                        </div>
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                    {registrace.length === 0 && <p className="mt-4 text-[15px] text-white/45">Zatím nikdo</p>}
                </section>
            </div>
        </main>
    );
}
