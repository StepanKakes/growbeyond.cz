import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
    REVENUE_OPTIONS,
    REVENUE_SCORE,
    STUCK_OPTIONS,
    revenueLabel,
    stuckLabel,
} from '@/components/webinar/qualifyOptions';
import { WEBINAR, webinarDate, webinarStart } from '@/components/webinar/webinarConfig';
import {
    countPageViews,
    dbConfigured,
    getEdition,
    listMessageLog,
    listRegistrations,
    type MessageLogRow,
    type Registration,
} from '@/lib/webinar/db';

// Přehled registrací na webinář.
//
// Je to pracovní panel, ne prezentace: hustota a čitelnost mají přednost
// před dekorací. Barva nese význam (čeká / hotovo / selhalo), ne náladu,
// a jediný akcent je značková červená. Čísla jsou tabulková, aby sloupce
// seděly pod sebou.
//
// Čte se jen, nic tu nejde změnit, proto stačí tajný odkaz místo
// přihlašování. Nesmí se cachovat ani indexovat.

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Přehled webináře',
    robots: { index: false, follow: false },
};

const PRAHA = 'Europe/Prague';

const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('cs-CZ', { ...opts, timeZone: PRAHA });

const denKey = (iso: string) => fmt({ day: 'numeric', month: 'numeric' }).format(new Date(iso));
const cas = (iso: string) => fmt({ hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
const hodina = (iso: string) => Number(fmt({ hour: '2-digit', hour12: false }).format(new Date(iso)));

/** Odkud člověk přišel. UTM má přednost, jinak zdroj zapsaný při registraci. */
const zdroj = (r: Registration) => r.utm?.utm_source || r.source || 'neznámý';

function tally<T>(rows: T[], key: (r: T) => string): Map<string, number> {
    const m = new Map<string, number>();
    for (const r of rows) m.set(key(r), (m.get(key(r)) ?? 0) + 1);
    return m;
}

/**
 * Hranice, od které se člověku vyplatí napsat osobně. Odpovídá obratu
 * 100 tisíc měsíčně a výš, tedy někomu, kdo už má co škálovat.
 */
const HORKY_LEAD = 25;

/* ------------------------------------------------------------------ *
 * Stavba stránky
 * ------------------------------------------------------------------ */

const Sekce = ({ titulek, popis, children }: { titulek: string; popis?: string; children: React.ReactNode }) => (
    <section className="border-t border-white/14 pt-6">
        <div className="mb-6 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h2 className="text-[17px] font-bold tracking-[-0.01em]">{titulek}</h2>
            {popis && <p className="text-[14px] text-white/60">{popis}</p>}
        </div>
        {children}
    </section>
);

/** Klíčové číslo. Velikost dělá hierarchii, ne rámeček kolem. */
const Metrika = ({
    popis,
    hodnota,
    detail,
    duraz,
}: {
    popis: string;
    hodnota: string | number;
    detail?: string;
    duraz?: boolean;
}) => (
    <div className="min-w-[8rem] flex-1">
        <div className="text-[13px] text-white/60">{popis}</div>
        <div
            className={`mt-1.5 text-[46px] font-bold leading-[0.95] tabular-nums ${duraz ? 'text-brand-red' : ''}`}
        >
            {hodnota}
        </div>
        {detail && <div className="mt-1.5 text-[13px] text-white/60">{detail}</div>}
    </div>
);

/**
 * Rozpad odpovědí. Podíl je vidět z délky pruhu, přesné číslo vpravo,
 * takže se dá číst rychle i přesně.
 */
const Rozpad = ({
    polozky,
    celkem,
    sirkaPopisku = 'w-[22rem]',
}: {
    polozky: { klic: string; popisek: string; pocet: number; zvyraznit?: boolean }[];
    celkem: number;
    sirkaPopisku?: string;
}) => {
    const max = Math.max(1, ...polozky.map(p => p.pocet));
    return (
        <ul className="flex flex-col gap-2.5">
            {polozky.map(p => (
                <li key={p.klic} className="flex items-center gap-4">
                    <span className={`${sirkaPopisku} shrink-0 truncate text-[14px] ${p.pocet ? 'text-white/85' : 'text-white/35'}`}>
                        {p.popisek}
                    </span>
                    <span className="h-2 flex-1 bg-white/8">
                        <span
                            className={`block h-full ${p.zvyraznit ? 'bg-brand-red' : 'bg-white/80'}`}
                            style={{ width: `${(p.pocet / max) * 100}%` }}
                        />
                    </span>
                    <span className="w-16 shrink-0 text-right text-[14px] tabular-nums">
                        <span className={p.pocet ? 'font-bold' : 'text-white/35'}>{p.pocet}</span>
                        {celkem > 0 && p.pocet > 0 && (
                            <span className="ml-1.5 text-white/50">{Math.round((p.pocet / celkem) * 100)} %</span>
                        )}
                    </span>
                </li>
            ))}
        </ul>
    );
};

/**
 * Registrace po hodinách. Všechny zatím přišly v jediný den, takže denní
 * graf by neřekl nic. Hodinový ukazuje, kdy má smysl postovat.
 */
const DenniKrivka = ({ poHodinach }: { poHodinach: number[] }) => {
    const max = Math.max(1, ...poHodinach);
    const vyska = 96;
    const spicka = poHodinach.indexOf(max);
    return (
        <div>
            {/* Popisky sedí ve stejné mřížce jako sloupce, aby ukazovaly
                na hodinu, ke které patří. */}
            <div className="grid grid-cols-24 items-end gap-[2px]" style={{ height: vyska }}>
                {poHodinach.map((n, h) => (
                    <div key={h} title={`${h}:00, ${n} registrací`} className="flex h-full flex-col justify-end">
                        {n > 0 && (
                            <span className="mb-1 text-center text-[11px] font-bold tabular-nums leading-none">{n}</span>
                        )}
                        <div
                            className={n ? 'bg-brand-red' : 'bg-white/12'}
                            style={{ height: n ? Math.max(4, (n / max) * (vyska - 18)) : 2 }}
                        />
                    </div>
                ))}
            </div>
            <div className="mt-2 grid grid-cols-24 gap-[2px] text-[11px] tabular-nums text-white/50">
                {Array.from({ length: 24 }, (_, h) => (
                    <span key={h} className="text-center">
                        {h % 6 === 0 ? h : ''}
                    </span>
                ))}
            </div>
            <p className="mt-3 text-[13px] text-white/60">
                Nejvíc se hlásí kolem {spicka}:00
            </p>
        </div>
    );
};

/** Stav jedním slovem. Barva má význam, ne náladu. */
const Stav = ({ text, druh }: { text: string; druh: 'ok' | 'ceka' | 'chyba' | 'nic' }) => {
    const barva = {
        ok: 'text-[#4ade80]',
        ceka: 'text-[#fbbf24]',
        chyba: 'text-brand-red',
        nic: 'text-white/45',
    }[druh];
    return <span className={`text-[13px] ${barva}`}>{text}</span>;
};

/** Sloupce seznamu registrovaných. Hlavička i řádky je musí mít stejné. */
const RADEK = 'grid grid-cols-[7.5rem_11rem_1fr_9rem_4.5rem_6.5rem] items-baseline gap-4 px-1';

const Udaj = ({ popis, children }: { popis: string; children: React.ReactNode }) => (
    <div>
        <div className="text-[13px] text-white/55">{popis}</div>
        <div className="mt-1 text-[15px] leading-[1.4]">{children}</div>
    </div>
);

/* ------------------------------------------------------------------ */

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
        listMessageLog().catch(() => [] as MessageLogRow[]),
        countPageViews(edition.id).catch(() => 0),
    ]);

    const celkem = registrace.length;
    const dnesKey = denKey(new Date().toISOString());
    const dnes = registrace.filter(r => denKey(r.created_at) === dnesKey);
    const sDotaznikem = registrace.filter(r => r.qualified_at);
    const vKalendari = registrace.filter(r => r.calendar_added_at);
    const veSkupine = registrace.filter(r => r.wa_group_joined_at);
    const bezTelefonu = registrace.filter(r => !r.phone);

    // Kdo stojí za osobní zprávu. Řadí se od nejsilnějšího.
    const horke = registrace
        .filter(r => (r.qual_score ?? 0) >= HORKY_LEAD)
        .sort((a, b) => (b.qual_score ?? 0) - (a.qual_score ?? 0));

    const poHodinach = Array.from({ length: 24 }, () => 0);
    for (const r of registrace) poHodinach[hodina(r.created_at)]++;

    const zdroje = [...tally(registrace, zdroj).entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([klic, pocet]) => ({ klic, popisek: klic, pocet, zvyraznit: true }));

    const obraty = tally(sDotaznikem, r => r.qual_revenue ?? '');
    const zaseky = tally(sDotaznikem, r => r.qual_stuck ?? '');

    // Odeslané kroky se počítají podle stavu, ať je vidět i to, co selhalo.
    const kroky = new Map<string, { sent: number; failed: number; skipped: number }>();
    for (const l of log) {
        const z = kroky.get(l.step_key) ?? { sent: 0, failed: 0, skipped: 0 };
        if (l.status === 'sent') z.sent++;
        else if (l.status === 'failed') z.failed++;
        else if (l.status === 'skipped') z.skipped++;
        kroky.set(l.step_key, z);
    }
    const odeslano = new Map<string, Set<string>>();
    for (const l of log) {
        if (l.status !== 'sent') continue;
        const s = odeslano.get(l.registration_id) ?? new Set<string>();
        s.add(l.step_key);
        odeslano.set(l.registration_id, s);
    }

    const skore = sDotaznikem.map(r => r.qual_score ?? 0);
    const prumer = skore.length ? Math.round(skore.reduce((a, b) => a + b, 0) / skore.length) : 0;

    const doStartu = Math.max(0, webinarStart().getTime() - Date.now());
    const dniDoStartu = Math.floor(doStartu / 86400000);
    const hodinDoStartu = Math.floor((doStartu % 86400000) / 3600000);
    const { weekday, numeric } = webinarDate();

    const konverze = zobrazeni ? Math.round((celkem / zobrazeni) * 1000) / 10 : null;
    const podil = (n: number) => (celkem ? `${Math.round((n / celkem) * 100)} % z registrovaných` : undefined);

    return (
        <main className="min-h-screen bg-[#0A0A0A] text-white antialiased">
            <div className="mx-auto w-full max-w-[1180px] px-5 pb-24 pt-10 md:px-8 md:pt-14">
                <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 pb-10">
                    <h1 className="text-[30px] md:text-[38px] font-bold leading-none tracking-[-0.03em]">
                        Registrace na webinář {WEBINAR.hero.year}
                    </h1>
                    <p className="text-[15px] tabular-nums text-white/70">
                        {weekday} {numeric} v {WEBINAR.time}
                        {doStartu > 0 && (
                            <span className="text-white/50"> · zbývá {dniDoStartu} dní {hodinDoStartu} hodin</span>
                        )}
                    </p>
                </header>

                {/* Klíčová čísla v jedné řadě. Hierarchii dělá velikost, ne rámeček. */}
                <section className="flex flex-wrap gap-x-10 gap-y-8 border-t border-white/14 pt-8">
                    <Metrika popis="Registrací" hodnota={celkem} detail={`${dnes.length} dnes`} duraz />
                    <Metrika
                        popis="Stojí za osobní zprávu"
                        hodnota={horke.length}
                        detail={`obrat od 100 tisíc výš, průměrné skóre ${prumer}`}
                    />
                    <Metrika popis="Uložilo si termín" hodnota={vKalendari.length} detail={podil(vKalendari.length)} />
                    <Metrika popis="Ve skupině" hodnota={veSkupine.length} detail={podil(veSkupine.length)} />
                    <Metrika
                        popis="Konverze stránky"
                        hodnota={konverze !== null ? `${konverze} %` : '—'}
                        detail={zobrazeni ? `z ${zobrazeni} zobrazení` : 'zatím bez dat'}
                    />
                </section>

                <div className="mt-12 flex flex-col gap-11">
                    {horke.length > 0 && (
                        <Sekce
                            titulek="Komu napsat před webinářem"
                            popis={`${horke.length} z ${celkem}, seřazeno od nejsilnějšího`}
                        >
                            <ul className="flex flex-col">
                                {horke.map(r => (
                                    <li
                                        key={r.id}
                                        className="flex flex-wrap items-baseline gap-x-5 gap-y-1 border-b border-white/10 py-3.5 last:border-b-0"
                                    >
                                        <span className="w-10 shrink-0 text-[20px] font-bold tabular-nums text-brand-red">
                                            {r.qual_score}
                                        </span>
                                        <span className="w-40 shrink-0 truncate text-[16px] font-bold">{r.name || '—'}</span>
                                        <span className="w-60 shrink-0 truncate text-[14px] text-white/70">{r.email}</span>
                                        <span className="text-[14px] text-white/70">{revenueLabel(r.qual_revenue)}</span>
                                        <span className="text-[14px] text-white/55">{stuckLabel(r.qual_stuck)}</span>
                                    </li>
                                ))}
                            </ul>
                        </Sekce>
                    )}

                    <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr]">
                        <Sekce titulek="Kdy se lidé hlásí" popis="podle hodiny, součet za všechny dny">
                            <DenniKrivka poHodinach={poHodinach} />
                        </Sekce>

                        <Sekce titulek="Odkud chodí">
                            {zdroje.length ? (
                                <Rozpad polozky={zdroje} celkem={celkem} sirkaPopisku="w-44" />
                            ) : (
                                <p className="text-[15px] text-white/50">Zatím nic</p>
                            )}
                        </Sekce>
                    </div>

                    <Sekce
                        titulek="Co lidé odpověděli"
                        popis={`dotazník má dvě otázky, vyplnilo ho ${sDotaznikem.length} z ${celkem}`}
                    >
                        <div className="grid gap-10 lg:grid-cols-2">
                            <div>
                                <p className="mb-4 text-[15px] font-bold">Kolik ti dnes byznys měsíčně vydělává?</p>
                                <Rozpad
                                    celkem={sDotaznikem.length}
                                    sirkaPopisku="w-[15rem]"
                                    polozky={REVENUE_OPTIONS.map(o => ({
                                        klic: o.value,
                                        popisek: `${o.label}  ·  ${REVENUE_SCORE[o.value]} b`,
                                        pocet: obraty.get(o.value) ?? 0,
                                        zvyraznit: REVENUE_SCORE[o.value] >= HORKY_LEAD,
                                    }))}
                                />
                                <p className="mt-4 text-[13px] leading-[1.5] text-white/60">
                                    Jediná otázka, která dává body. Čím vyšší obrat, tím víc má člověk co škálovat.
                                </p>
                            </div>
                            <div>
                                <p className="mb-4 text-[15px] font-bold">Kde teď nejvíc cítíš, že ses zasekl?</p>
                                <Rozpad
                                    celkem={sDotaznikem.length}
                                    sirkaPopisku="w-[19rem]"
                                    polozky={STUCK_OPTIONS.map(o => ({
                                        klic: o.value,
                                        popisek: o.label,
                                        pocet: zaseky.get(o.value) ?? 0,
                                    }))}
                                />
                                <p className="mt-4 text-[13px] leading-[1.5] text-white/60">
                                    Neboduje se, žádná odpověď není sama o sobě lepší. Říká, o čem s tím člověkem mluvit
                                    a která část webináře mu sedne.
                                </p>
                            </div>
                        </div>
                    </Sekce>

                    <Sekce titulek="Rozesílání" popis="potvrzení a upomínky, které odešly z aplikace">
                        {kroky.size === 0 ? (
                            <p className="text-[15px] text-white/50">Zatím nic neodešlo</p>
                        ) : (
                            <ul className="flex flex-col gap-2.5">
                                {[...kroky.entries()].map(([krok, z]) => (
                                    <li key={krok} className="flex flex-wrap items-baseline gap-x-5 text-[15px]">
                                        <span className="w-44 shrink-0 text-white/85">{krok}</span>
                                        <span className="tabular-nums">
                                            <span className="font-bold">{z.sent}</span> <Stav text="odesláno" druh="ok" />
                                        </span>
                                        {z.failed > 0 && (
                                            <span className="tabular-nums">
                                                <span className="font-bold">{z.failed}</span>{' '}
                                                <Stav text="selhalo" druh="chyba" />
                                            </span>
                                        )}
                                        {z.skipped > 0 && (
                                            <span className="tabular-nums text-white/50">{z.skipped} přeskočeno</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                        {bezTelefonu.length > 0 && (
                            <p className="mt-4 text-[14px] text-white/60">
                                {bezTelefonu.length} lidí je bez telefonu, těm chodí jen e-mail.
                            </p>
                        )}
                    </Sekce>

                    <Sekce titulek="Všichni registrovaní" popis="klepnutím na řádek se rozbalí odpovědi a stav">
                        <div className="overflow-x-auto">
                            <div className="min-w-[820px]">
                                <div className={`${RADEK} border-b border-white/14 pb-2.5 text-[13px] text-white/55`}>
                                    <span>Kdy</span>
                                    <span>Jméno</span>
                                    <span>E-mail</span>
                                    <span>Zdroj</span>
                                    <span className="text-right">Skóre</span>
                                    <span className="text-right">Termín</span>
                                </div>

                                {/* Rozklik je nativní details, takže funguje i bez skriptů. */}
                                {registrace.map(r => {
                                    const horky = (r.qual_score ?? 0) >= HORKY_LEAD;
                                    const poslano = odeslano.get(r.id);
                                    return (
                                        <details key={r.id} className="border-b border-white/10">
                                            <summary
                                                className={`${RADEK} cursor-pointer list-none py-3 text-[14px] transition-colors duration-150 hover:bg-white/6 focus-visible:bg-white/6 focus-visible:outline-none`}
                                            >
                                                <span className="tabular-nums text-white/60">
                                                    {denKey(r.created_at)} {cas(r.created_at)}
                                                </span>
                                                <span className={`truncate ${horky ? 'font-bold' : ''}`}>{r.name || '—'}</span>
                                                <span className="truncate text-white/70">{r.email}</span>
                                                <span className="truncate text-white/60">{zdroj(r)}</span>
                                                <span
                                                    className={`text-right tabular-nums ${horky ? 'font-bold text-brand-red' : r.qualified_at ? '' : 'text-white/35'}`}
                                                >
                                                    {r.qualified_at ? r.qual_score ?? 0 : '—'}
                                                </span>
                                                <span className="text-right">
                                                    {r.calendar_added_at ? (
                                                        <Stav text="uložen" druh="ok" />
                                                    ) : (
                                                        <Stav text="neuložen" druh="nic" />
                                                    )}
                                                </span>
                                            </summary>

                                            <div className="grid gap-6 border-t border-white/8 bg-white/3 px-4 py-5 md:grid-cols-3">
                                                <Udaj popis="Kolik ti dnes byznys měsíčně vydělává?">
                                                    {revenueLabel(r.qual_revenue) ?? (
                                                        <span className="text-white/45">neodpověděl</span>
                                                    )}
                                                    {r.qualified_at && (
                                                        <span className="text-white/55"> · {r.qual_score ?? 0} bodů</span>
                                                    )}
                                                </Udaj>
                                                <Udaj popis="Kde teď nejvíc cítíš, že ses zasekl?">
                                                    {stuckLabel(r.qual_stuck) ?? (
                                                        <span className="text-white/45">neodpověděl</span>
                                                    )}
                                                </Udaj>
                                                <Udaj popis="Kontakt">
                                                    {r.phone ? (
                                                        <a href={`tel:${r.phone}`} className="tabular-nums underline-offset-4 hover:underline">
                                                            {r.phone}
                                                        </a>
                                                    ) : (
                                                        <span className="text-white/45">bez telefonu</span>
                                                    )}
                                                </Udaj>

                                                <div className="flex flex-wrap gap-x-6 gap-y-2 md:col-span-3">
                                                    <span className="text-[13px] text-white/55">
                                                        WhatsApp{' '}
                                                        {poslano?.has('confirm-wa') ? (
                                                            <Stav text="potvrzení odesláno" druh="ok" />
                                                        ) : r.phone ? (
                                                            <Stav text="čeká na odeslání" druh="ceka" />
                                                        ) : (
                                                            <Stav text="nemá číslo" druh="nic" />
                                                        )}
                                                    </span>
                                                    <span className="text-[13px] text-white/55">
                                                        Zoom{' '}
                                                        {r.zoom_registrant_id ? (
                                                            <Stav text="osobní odkaz vytvořen" druh="ok" />
                                                        ) : (
                                                            <Stav text="jen obecný odkaz" druh="ceka" />
                                                        )}
                                                    </span>
                                                    {r.qualified_at && (
                                                        <span className="text-[13px] text-white/55">
                                                            Dotazník vyplněn {denKey(r.qualified_at)} {cas(r.qualified_at)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </details>
                                    );
                                })}
                            </div>
                        </div>
                        {celkem === 0 && <p className="mt-4 text-[15px] text-white/50">Zatím nikdo</p>}
                    </Sekce>
                </div>
            </div>
        </main>
    );
}
