"use client";

import React, { useMemo, useState } from 'react';
import type { Lead, LeadTier } from '@/lib/mentorship-leads';

const tierStyle: Record<LeadTier, { pill: string; bar: string; dot: string }> = {
    A: { pill: 'bg-green-500/15 text-green-400 border-green-500/40', bar: 'bg-green-500', dot: 'text-green-400' },
    B: { pill: 'bg-amber-500/15 text-amber-400 border-amber-500/40', bar: 'bg-amber-500', dot: 'text-amber-400' },
    C: { pill: 'bg-white/5 text-gray-400 border-white/15', bar: 'bg-white/15', dot: 'text-gray-500' },
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

type SortKey = 'score' | 'followers' | 'date';

const Verified = () => (
    <svg className="w-4 h-4 text-[#3897f0] shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 1.8 3-.2 1 2.8 2.6 1.4-.6 2.9 1.6 2.5-2 2.2.2 3-2.8.9-1.4 2.6-2.9-.7-2.6 1.5-2.3-1.9-2.3 1.9-2.6-1.5-2.9.7L4.8 16l-2.8-.9.2-3-2-2.2L1.8 7.4 1.2 4.5l2.6-1.4 1-2.8 3 .2L10 .2" /><path d="M10.6 14.6l-2.7-2.7 1.1-1.1 1.6 1.6 3.8-3.8 1.1 1.1z" fill="#fff" /></svg>
);

export const LeadsDashboard = ({ leads, clarityProjectId }: { leads: Lead[]; clarityProjectId: string }) => {
    const [q, setQ] = useState('');
    const [tier, setTier] = useState<'all' | LeadTier>('all');
    const [verifiedOnly, setVerifiedOnly] = useState(false);
    const [sort, setSort] = useState<SortKey>('score');
    const [openId, setOpenId] = useState<string | null>(null);
    const [clarityMap, setClarityMap] = useState<Record<string, string>>(
        () => Object.fromEntries(leads.map(l => [l.id, l.clarity]))
    );

    const findInClarity = `https://clarity.microsoft.com/projects/view/${clarityProjectId}/impressions?` +
        encodeURI('date=Last 30 days&smartEvents=SubmitForm');

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
            return new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime();
        });
    }, [leads, q, tier, verifiedOnly, sort]);

    const stats = useMemo(() => ({
        total: leads.length,
        a: leads.filter(l => l.tier === 'A').length,
        b: leads.filter(l => l.tier === 'B').length,
        verified: leads.filter(l => l.verified).length,
    }), [leads]);

    return (
        <main className="min-h-screen bg-[#0C0C0C] text-white font-sans">
            {/* Sticky header */}
            <div className="sticky top-0 z-20 bg-[#0C0C0C]/95 backdrop-blur border-b border-white/10">
                <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div className="flex items-baseline gap-3">
                            <h1 className="text-xl md:text-2xl font-bold tracking-tight-custom">Leady</h1>
                            <span className="text-gray-500 text-sm">{stats.total} přihlášek</span>
                        </div>
                        <div className="flex gap-2 text-xs font-bold">
                            <span className="px-2.5 py-1 rounded-md bg-green-500/10 text-green-400 border border-green-500/30">A · {stats.a}</span>
                            <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30">B · {stats.b}</span>
                            <span className="px-2.5 py-1 rounded-md bg-white/5 text-gray-300 border border-white/10">✔ {stats.verified}</span>
                        </div>
                    </div>

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
                            <option value="score">Skóre</option>
                            <option value="followers">Sledující</option>
                            <option value="date">Nejnovější</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Seznam */}
            <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-5">
                {filtered.length === 0 ? (
                    <div className="text-center text-gray-500 py-24">Žádné leady neodpovídají filtru.</div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {filtered.map(lead => (
                            <LeadRow
                                key={lead.id}
                                lead={lead}
                                open={openId === lead.id}
                                onToggle={() => setOpenId(openId === lead.id ? null : lead.id)}
                                clarity={clarityMap[lead.id] || ''}
                                onClaritySaved={(url) => setClarityMap(m => ({ ...m, [lead.id]: url }))}
                                findInClarity={findInClarity}
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
};

function LeadRow({
    lead, open, onToggle, clarity, onClaritySaved, findInClarity,
}: {
    lead: Lead; open: boolean; onToggle: () => void;
    clarity: string; onClaritySaved: (url: string) => void; findInClarity: string;
}) {
    const ts = tierStyle[lead.tier];

    return (
        <div className={`rounded-xl border overflow-hidden transition-colors ${open ? 'border-white/20 bg-[#161616]' : 'border-white/10 bg-[#131313] hover:bg-[#161616]'}`}>
            {/* Řádek */}
            <button onClick={onToggle} className="w-full flex items-center gap-3 md:gap-4 px-3 md:px-4 py-3 text-left">
                <span className={`w-1 h-10 rounded-full shrink-0 ${ts.bar}`} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatarSrc(lead)} alt="" className="w-10 h-10 rounded-full object-cover border border-white/10 bg-[#262626] shrink-0" />

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                        <span className="font-bold truncate">@{lead.ig || '—'}</span>
                        {lead.verified && <Verified />}
                    </div>
                    <div className="text-gray-500 text-xs truncate">{lead.name || lead.email}</div>
                </div>

                {/* Sloupce desktop */}
                <div className="hidden md:flex items-center gap-1 w-20 text-sm text-gray-300 justify-end">
                    <span className="text-gray-500">👥</span>{fmtCompact(lead.followers)}
                </div>
                <div className="hidden lg:block w-36 text-sm text-right truncate">
                    <span className="text-white font-semibold">{lead.budget || '—'}</span>
                </div>

                {/* Skóre + tier */}
                <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-bold leading-none">{lead.score}</div>
                        <div className="text-[10px] text-gray-500">skóre</div>
                    </div>
                    <span className={`w-7 h-7 rounded-md border flex items-center justify-center text-xs font-bold ${ts.pill}`}>{lead.tier}</span>
                </div>

                <div className="hidden md:block w-14 text-right text-xs text-gray-500 shrink-0">{relTime(lead.createdTime)}</div>

                {clarity && (
                    <span className="text-brand-red shrink-0" title="Clarity nahrávka uložena">▶</span>
                )}
                <svg className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
            </button>

            {/* Detail */}
            {open && (
                <div className="px-4 md:px-5 pb-5 pt-1 border-t border-white/10 animate-[fadeIn_0.2s_ease-out]">
                    {/* Kvalifikace */}
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

                    {/* Detailní odpověď */}
                    {lead.detail && (
                        <div className="mt-4 p-3 rounded-lg bg-black/30 border border-white/5">
                            <div className="text-gray-500 uppercase tracking-wider text-[10px] mb-1">Detailní odpověď</div>
                            <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{lead.detail}</p>
                        </div>
                    )}

                    {/* Clarity */}
                    <ClaritySection leadId={lead.id} clarity={clarity} onSaved={onClaritySaved} findInClarity={findInClarity} />

                    {/* Akce */}
                    <div className="flex flex-wrap gap-2 mt-4">
                        <a href={`mailto:${lead.email}`} className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-200 border border-white/10 text-xs font-medium hover:bg-white/10 transition-colors">✉ {lead.email}</a>
                        <a href={`https://instagram.com/${lead.ig}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-200 border border-white/10 text-xs font-medium hover:bg-white/10 transition-colors">Instagram ↗</a>
                        {lead.notionUrl && <a href={lead.notionUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-200 border border-white/10 text-xs font-medium hover:bg-white/10 transition-colors">Notion ↗</a>}
                        <a href={`/strategie/${lead.id}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-200 border border-white/10 text-xs font-medium hover:bg-white/10 transition-colors">VSL stránka ↗</a>
                    </div>
                </div>
            )}
        </div>
    );
}

function ClaritySection({
    leadId, clarity, onSaved, findInClarity,
}: { leadId: string; clarity: string; onSaved: (url: string) => void; findInClarity: string }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(clarity);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState('');

    const save = async (url: string) => {
        setSaving(true); setErr('');
        try {
            const res = await fetch('/api/leads/clarity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: leadId, url }),
            });
            const data = await res.json();
            if (!res.ok) { setErr(data.error || 'Uložení selhalo'); return; }
            onSaved(url);
            setEditing(false);
        } catch { setErr('Uložení selhalo'); }
        finally { setSaving(false); }
    };

    return (
        <div className="mt-4 p-3 rounded-lg bg-brand-red/5 border border-brand-red/20">
            <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-brand-red uppercase tracking-wider text-[10px] font-bold">🎬 Clarity nahrávka</span>
                <a href={findInClarity} target="_blank" rel="noopener noreferrer" className="text-gray-400 text-xs hover:text-white transition-colors">Najít v Clarity ↗</a>
            </div>

            {clarity && !editing ? (
                <div className="flex items-center gap-2">
                    <a href={clarity} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-red text-white text-xs font-bold hover:bg-[#cc0b00] transition-colors">
                        ▶ Přehrát nahrávku
                    </a>
                    <button onClick={() => { setDraft(clarity); setEditing(true); }} className="text-gray-400 text-xs hover:text-white">změnit</button>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-2">
                        <input
                            value={draft}
                            onChange={e => setDraft(e.target.value)}
                            placeholder="Vlož Clarity odkaz (Share nebo player link)…"
                            className="flex-1 min-w-[200px] bg-[#181818] border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-brand-red placeholder:text-gray-600"
                        />
                        <button disabled={saving} onClick={() => save(draft.trim())}
                            className="px-3 py-1.5 rounded-lg bg-brand-red text-white text-xs font-bold hover:bg-[#cc0b00] disabled:opacity-50 transition-colors">
                            {saving ? 'Ukládám…' : 'Uložit'}
                        </button>
                        {clarity && <button onClick={() => setEditing(false)} className="text-gray-400 text-xs hover:text-white px-2">zrušit</button>}
                    </div>
                    {err && <span className="text-brand-red text-xs">{err}</span>}
                    <span className="text-gray-500 text-[11px]">Tip: v Clarity najdi session (přes „Najít v Clarity" → filtr SubmitForm, poznáš podle e-mailu), klikni Share / zkopíruj odkaz a vlož sem.</span>
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
