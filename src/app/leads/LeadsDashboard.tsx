"use client";

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Lead, LeadTier } from '@/lib/mentorship-leads';
import { RetentionChart, fmtTime } from './RetentionChart';

const tierStyle: Record<LeadTier, { pill: string; bar: string }> = {
    A: { pill: 'bg-green-500/15 text-green-400 border-green-500/40', bar: 'bg-green-500' },
    B: { pill: 'bg-amber-500/15 text-amber-400 border-amber-500/40', bar: 'bg-amber-500' },
    C: { pill: 'bg-white/5 text-gray-400 border-white/15', bar: 'bg-white/15' },
};

const fmtCompact = (n: number | null) => {
    if (n == null) return '—';
    if (n >= 1000) return (n / 1000).toFixed(n >= 100000 ? 0 : 1).replace('.0', '') + 'k';
    return String(n);
};

function relTime(iso: string): string {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'teď';
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h} h`;
    const d = Math.floor(h / 24);
    if (d < 30) return `${d} d`;
    return new Date(iso).toLocaleDateString('cs-CZ');
}

const avatarSrc = (lead: Lead) =>
    `/api/ig-avatar?username=${encodeURIComponent(lead.ig)}${lead.profilePic ? `&url=${encodeURIComponent(lead.profilePic)}` : ''}`;

type SortKey = 'score' | 'followers' | 'date' | 'watch';

// % dokoukání leada vůči délce videa (0–100), nebo null když nemáme data.
const watchPct = (lead: Lead, duration: number): number | null => {
    if (lead.videoMaxS == null) return null;
    const dur = lead.videoDurationS || duration;
    if (!dur) return null;
    return Math.min(100, Math.round((lead.videoMaxS / dur) * 100));
};

const Verified = () => (
    <svg className="w-4 h-4 text-[#3897f0] shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 1.8 3-.2 1 2.8 2.6 1.4-.6 2.9 1.6 2.5-2 2.2.2 3-2.8.9-1.4 2.6-2.9-.7-2.6 1.5-2.3-1.9-2.3 1.9-2.6-1.5-2.9.7L4.8 16l-2.8-.9.2-3-2-2.2L1.8 7.4 1.2 4.5l2.6-1.4 1-2.8 3 .2L10 .2" /><path d="M10.6 14.6l-2.7-2.7 1.1-1.1 1.6 1.6 3.8-3.8 1.1 1.1z" fill="#fff" /></svg>
);

export const LeadsDashboard = ({ leads, clarityProjectId = 'vuqnag017s' }: { leads: Lead[]; clarityProjectId?: string }) => {
    const [q, setQ] = useState('');
    const [tier, setTier] = useState<'all' | LeadTier>('all');
    const [verifiedOnly, setVerifiedOnly] = useState(false);
    const [sort, setSort] = useState<SortKey>('date');
    const [openId, setOpenId] = useState<string | null>(null);
    const [showScoreInfo, setShowScoreInfo] = useState(false);
    const [enriching, setEnriching] = useState(false);
    const [enrichMsg, setEnrichMsg] = useState('');
    const router = useRouter();

    const runEnrich = async () => {
        setEnriching(true); setEnrichMsg('');
        try {
            const res = await fetch('/api/leads/enrich', { method: 'POST' });
            const d = await res.json();
            if (!res.ok) { setEnrichMsg(d.error || 'Chyba'); return; }
            setEnrichMsg(`Doplněno ${d.enriched}, přeskočeno ${d.skipped}`);
            router.refresh();
        } catch { setEnrichMsg('Chyba'); }
        finally { setEnriching(false); }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Opravdu smazat tento lead? (přesune se do koše v Notionu)')) return;
        try {
            const res = await fetch('/api/leads/delete', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
            });
            if (res.ok) router.refresh();
        } catch { /* ignore */ }
    };

    const filtered = useMemo(() => {
        const needle = q.trim().toLowerCase();
        const r = leads.filter(l => {
            if (tier !== 'all' && l.tier !== tier) return false;
            if (verifiedOnly && !l.verified) return false;
            if (needle) {
                const hay = `${l.email} ${l.ig} ${l.name} ${l.campaign} ${l.source}`.toLowerCase();
                if (!hay.includes(needle)) return false;
            }
            return true;
        });
        return r.sort((a, b) => {
            if (sort === 'score') return b.score - a.score;
            if (sort === 'followers') return (b.followers || 0) - (a.followers || 0);
            if (sort === 'watch') return (b.videoMaxS ?? -1) - (a.videoMaxS ?? -1);
            return new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime();
        });
    }, [leads, q, tier, verifiedOnly, sort]);

    const stats = useMemo(() => ({
        total: leads.length,
        a: leads.filter(l => l.tier === 'A').length,
        b: leads.filter(l => l.tier === 'B').length,
        verified: leads.filter(l => l.verified).length,
    }), [leads]);

    // Společná délka videa pro % dokoukání (nejdelší známá hodnota napříč leady)
    const videoDuration = useMemo(
        () => Math.max(0, ...leads.map(l => l.videoDurationS || 0), ...leads.map(l => l.videoMaxS || 0)),
        [leads],
    );

    return (
        <main className="min-h-screen bg-[#0C0C0C] text-white font-sans">
            {/* Sticky header */}
            <div className="sticky top-0 z-20 bg-[#0C0C0C]/95 backdrop-blur border-b border-white/10">
                <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div className="flex items-baseline gap-3">
                            <h1 className="text-xl md:text-2xl font-bold tracking-tight-custom">Leady</h1>
                            <span className="text-gray-500 text-sm">{stats.total} přihlášek</span>
                            <button onClick={() => setShowScoreInfo(s => !s)} className="text-gray-500 hover:text-white text-xs border border-white/15 rounded-full w-5 h-5 flex items-center justify-center" title="Jak se počítá skóre">ⓘ</button>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold">
                            <span className="px-2.5 py-1 rounded-md bg-green-500/10 text-green-400 border border-green-500/30">A · {stats.a}</span>
                            <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30">B · {stats.b}</span>
                            <span className="px-2.5 py-1 rounded-md bg-white/5 text-gray-300 border border-white/10">✔ {stats.verified}</span>
                            <button
                                onClick={runEnrich}
                                disabled={enriching}
                                title="Dotáhne profilovku, jméno, sledující a verified u starších leadů"
                                className="px-2.5 py-1 rounded-md bg-brand-red/15 text-brand-red border border-brand-red/40 hover:bg-brand-red/25 disabled:opacity-50 transition-colors"
                            >
                                {enriching ? 'Doplňuji…' : '↻ Doplnit profily'}
                            </button>
                            {enrichMsg && <span className="text-gray-400 font-normal">{enrichMsg}</span>}
                        </div>
                    </div>

                    {showScoreInfo && (
                        <div className="mb-4 p-3 rounded-lg bg-[#181818] border border-white/10 text-xs text-gray-300 leading-relaxed">
                            <b className="text-white">Hot skóre (0–100)</b> se počítá z toho, co jsi vybral jako důležité:
                            <span className="text-white"> rozpočet 40 %</span> + <span className="text-white">sledující 30 %</span> + <span className="text-white">příjem 20 %</span> + <span className="text-white">verified 10 %</span>.
                            Každá hodnota se přepočítá na 0–100 % (rozpočet: 100tis+ = max · sledující: 100k = max · příjem: 150tis+ = max · verified: ano/ne).
                            <div className="mt-1.5 flex gap-3">
                                <span><span className="text-green-400 font-bold">A</span> = 66+ (horké)</span>
                                <span><span className="text-amber-400 font-bold">B</span> = 40–65</span>
                                <span><span className="text-gray-400 font-bold">C</span> = pod 40</span>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                        <input
                            value={q}
                            onChange={e => setQ(e.target.value)}
                            placeholder="Hledat e-mail, IG, jméno, kampaň…"
                            className="flex-1 min-w-[180px] bg-[#181818] border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-brand-red placeholder:text-gray-600"
                        />
                        <div className="flex gap-1 bg-[#181818] border border-white/10 rounded-lg p-1">
                            {(['all', 'A', 'B', 'C'] as const).map(t => (
                                <button key={t} onClick={() => setTier(t)}
                                    className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${tier === t ? 'bg-brand-red text-white' : 'text-gray-400 hover:text-white'}`}>
                                    {t === 'all' ? 'Vše' : t}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setVerifiedOnly(v => !v)}
                            className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${verifiedOnly ? 'bg-brand-red border-brand-red text-white' : 'bg-[#181818] border-white/10 text-gray-400 hover:text-white'}`}>
                            ✔ verified
                        </button>
                        <select value={sort} onChange={e => setSort(e.target.value as SortKey)}
                            className="bg-[#181818] border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-red">
                            <option value="date">Nejnovější</option>
                            <option value="score">Skóre</option>
                            <option value="followers">Sledující</option>
                            <option value="watch">Dokoukání</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Retention videa */}
            <div className="max-w-[1100px] mx-auto px-4 md:px-6 pt-5">
                <RetentionChart leads={leads} duration={videoDuration} />
            </div>

            {/* Seznam */}
            <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-5">
                {filtered.length === 0 ? (
                    <div className="text-center text-gray-500 py-24">Žádné leady neodpovídají filtru.</div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {filtered.map(lead => (
                            <LeadRow key={lead.id} lead={lead} open={openId === lead.id} onToggle={() => setOpenId(openId === lead.id ? null : lead.id)} onDelete={handleDelete} clarityProjectId={clarityProjectId} videoDuration={videoDuration} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
};

function LeadRow({ lead, open, onToggle, onDelete, clarityProjectId, videoDuration }: { lead: Lead; open: boolean; onToggle: () => void; onDelete: (id: string) => void; clarityProjectId: string; videoDuration: number }) {
    const ts = tierStyle[lead.tier];
    const claritySearch = `https://clarity.microsoft.com/projects/view/${clarityProjectId}/impressions?` + encodeURI('date=Last 30 days&smartEvents=SubmitForm');
    const pct = watchPct(lead, videoDuration);
    const watchColor = pct == null ? '' : pct >= 75 ? 'text-green-400' : pct >= 40 ? 'text-amber-400' : 'text-gray-400';

    return (
        <div className={`rounded-xl border overflow-hidden transition-colors ${open ? 'border-white/20 bg-[#161616]' : 'border-white/10 bg-[#131313] hover:bg-[#161616]'}`}>
            {/* Řádek */}
            <div onClick={onToggle} role="button" tabIndex={0} className="w-full flex items-center gap-3 md:gap-4 px-3 md:px-4 py-3 text-left cursor-pointer">
                <span className={`w-1 h-10 rounded-full shrink-0 ${ts.bar}`} />
                <a href={`https://instagram.com/${lead.ig}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="shrink-0 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={avatarSrc(lead)} alt="" className="w-10 h-10 rounded-full object-cover border border-white/10 bg-[#262626] group-hover:border-brand-red/60 transition-colors" />
                </a>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                        <a
                            href={`https://instagram.com/${lead.ig}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="font-bold truncate hover:text-brand-red transition-colors"
                        >
                            @{lead.ig || '—'}
                        </a>
                        {lead.verified && <Verified />}
                    </div>
                    <div className="text-gray-500 text-xs truncate">{lead.name || lead.email}</div>
                </div>

                <div className="hidden md:flex items-center gap-1 w-20 text-sm text-gray-300 justify-end">
                    <span className="text-gray-500">👥</span>{fmtCompact(lead.followers)}
                </div>
                <div className="hidden lg:block w-36 text-sm text-right truncate">
                    <span className="text-white font-semibold">{lead.budget || '—'}</span>
                </div>

                {/* Dokoukání VSL */}
                <div className="hidden md:flex items-center justify-end w-24 shrink-0" title={pct == null ? 'Zatím nespustil zvuk na VSL' : `Dokoukal do ${fmtTime(lead.videoMaxS as number)} (${pct} %)`}>
                    {pct == null ? (
                        <span className="text-gray-700 text-xs">▶ —</span>
                    ) : (
                        <span className={`flex items-center gap-1 text-xs font-bold ${watchColor}`}>
                            <span className="text-gray-600">▶</span>{fmtTime(lead.videoMaxS as number)}
                            <span className="text-gray-500 font-normal">{pct}%</span>
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-bold leading-none">{lead.score}</div>
                        <div className="text-[10px] text-gray-500">skóre</div>
                    </div>
                    <span className={`w-7 h-7 rounded-md border flex items-center justify-center text-xs font-bold ${ts.pill}`}>{lead.tier}</span>
                </div>

                <div className="hidden md:block w-14 text-right text-xs text-gray-500 shrink-0">{relTime(lead.createdTime)}</div>

                {lead.clarity && <span className="text-brand-red shrink-0" title="Clarity nahrávka">▶</span>}
                <svg className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
            </div>

            {/* Detail */}
            {open && (
                <div className="px-4 md:px-5 pb-5 pt-1 border-t border-white/10 animate-[fadeIn_0.2s_ease-out]">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3 mt-4">
                        <Field label="Rozpočet" value={lead.budget} highlight />
                        <Field label="Současný příjem" value={lead.income} />
                        <Field label="Problém" value={lead.problem} />
                        <Field label="Monetizace" value={lead.monetization} />
                        <Field label="Sledující" value={lead.followers != null ? lead.followers.toLocaleString('cs-CZ') : '—'} />
                        <Field label="Zdroj" value={lead.source} />
                        <Field label="Kampaň" value={lead.campaign} />
                        <Field label="Přišel" value={relTime(lead.createdTime) + ' zpět'} />
                    </div>

                    {/* Dokoukání VSL — timeline s markerem kam došel */}
                    <div className="mt-4">
                        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                            <span>Dokoukání VSL</span>
                            {pct != null && <span className={watchColor}>{fmtTime(lead.videoMaxS as number)} z {fmtTime(lead.videoDurationS || videoDuration)} · {pct} %</span>}
                        </div>
                        {pct == null ? (
                            <div className="text-xs text-gray-600">Zatím nespustil zvuk na VSL.</div>
                        ) : (
                            <div className="relative h-2.5 rounded-full bg-white/10 overflow-hidden">
                                <div className={`absolute inset-y-0 left-0 rounded-full ${pct >= 75 ? 'bg-green-500' : pct >= 40 ? 'bg-amber-500' : 'bg-white/30'}`} style={{ width: `${pct}%` }} />
                            </div>
                        )}
                    </div>

                    {lead.detail && (
                        <div className="mt-4 p-3 rounded-lg bg-black/30 border border-white/5">
                            <div className="text-gray-500 uppercase tracking-wider text-[10px] mb-1">Detailní odpověď</div>
                            <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{lead.detail}</p>
                        </div>
                    )}

                    {/* Akce */}
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                        {lead.clarity ? (
                            <a href={lead.clarity} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-red text-white text-xs font-bold hover:bg-[#cc0b00] transition-colors">▶ Clarity nahrávka</a>
                        ) : (
                            <a href={claritySearch} target="_blank" rel="noopener noreferrer" title="Lead nemá přímý odkaz (nepřijal cookies nebo přišel jinudy). Otevře hledání v Clarity." className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 border border-white/10 text-xs font-medium hover:bg-white/10 transition-colors">🔎 Hledat v Clarity</a>
                        )}
                        <a href={`mailto:${lead.email}`} className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-200 border border-white/10 text-xs font-medium hover:bg-white/10 transition-colors">✉ {lead.email}</a>
                        <a href={`https://instagram.com/${lead.ig}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-200 border border-white/10 text-xs font-medium hover:bg-white/10 transition-colors">Instagram ↗</a>
                        {lead.notionUrl && <a href={lead.notionUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-200 border border-white/10 text-xs font-medium hover:bg-white/10 transition-colors">Notion ↗</a>}
                        <a href={`/strategie/${lead.id}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-200 border border-white/10 text-xs font-medium hover:bg-white/10 transition-colors">VSL stránka ↗</a>
                        <button onClick={() => onDelete(lead.id)} className="ml-auto px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-medium hover:bg-red-500/20 transition-colors">🗑 Smazat</button>
                    </div>
                </div>
            )}
        </div>
    );
}

const Field = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
    <div className="min-w-0">
        <div className="text-gray-500 uppercase tracking-wider text-[10px]">{label}</div>
        <div className={`truncate text-sm ${highlight ? 'text-white font-bold' : 'text-gray-300'}`}>{value || '—'}</div>
    </div>
);
