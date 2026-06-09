"use client";

import React, { useMemo, useState } from 'react';
import type { Lead, LeadTier } from '@/lib/mentorship-leads';

const tierStyle: Record<LeadTier, string> = {
    A: 'bg-green-500/15 text-green-400 border-green-500/40',
    B: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
    C: 'bg-white/5 text-gray-400 border-white/15',
};

const fmtFollowers = (n: number | null) =>
    n == null ? '—' : n.toLocaleString('cs-CZ');

function relTime(iso: string): string {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'teď';
    if (min < 60) return `před ${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `před ${h} h`;
    const d = Math.floor(h / 24);
    if (d < 30) return `před ${d} d`;
    return new Date(iso).toLocaleDateString('cs-CZ');
}

const avatarSrc = (lead: Lead) =>
    `/api/ig-avatar?username=${encodeURIComponent(lead.ig)}${lead.profilePic ? `&url=${encodeURIComponent(lead.profilePic)}` : ''}`;

type SortKey = 'score' | 'followers' | 'date';

export const LeadsDashboard = ({ leads, clarityProjectId }: { leads: Lead[]; clarityProjectId: string }) => {
    const [q, setQ] = useState('');
    const [tier, setTier] = useState<'all' | LeadTier>('all');
    const [verifiedOnly, setVerifiedOnly] = useState(false);
    const [sort, setSort] = useState<SortKey>('score');
    const [open, setOpen] = useState<string | null>(null);

    const clarityUrl = (lead: Lead) =>
        `https://clarity.microsoft.com/projects/view/${clarityProjectId}/impressions?` +
        encodeURI(`date=Last 30 days&smartEvents=SubmitForm`) +
        `&_lead=${encodeURIComponent(lead.email)}`;

    const filtered = useMemo(() => {
        const needle = q.trim().toLowerCase();
        let r = leads.filter(l => {
            if (tier !== 'all' && l.tier !== tier) return false;
            if (verifiedOnly && !l.verified) return false;
            if (needle) {
                const hay = `${l.email} ${l.ig} ${l.name} ${l.campaign} ${l.source}`.toLowerCase();
                if (!hay.includes(needle)) return false;
            }
            return true;
        });
        r = [...r].sort((a, b) => {
            if (sort === 'score') return b.score - a.score;
            if (sort === 'followers') return (b.followers || 0) - (a.followers || 0);
            return new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime();
        });
        return r;
    }, [leads, q, tier, verifiedOnly, sort]);

    const stats = useMemo(() => ({
        total: leads.length,
        a: leads.filter(l => l.tier === 'A').length,
        b: leads.filter(l => l.tier === 'B').length,
        verified: leads.filter(l => l.verified).length,
    }), [leads]);

    return (
        <main className="min-h-screen bg-[#0E0E0E] text-white font-sans px-4 py-8 md:px-8">
            <div className="max-w-[1400px] mx-auto">
                {/* Hlavička */}
                <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight-custom">Leady</h1>
                        <p className="text-gray-400 text-sm mt-1">VSL formulář · {stats.total} přihlášek</p>
                    </div>
                    <div className="flex gap-2 text-xs">
                        <span className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/30">A: {stats.a}</span>
                        <span className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">B: {stats.b}</span>
                        <span className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-300 border border-white/10">✔ {stats.verified}</span>
                    </div>
                </div>

                {/* Ovládání */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <input
                        value={q}
                        onChange={e => setQ(e.target.value)}
                        placeholder="Hledat e-mail, IG, jméno, kampaň…"
                        className="flex-1 min-w-[200px] bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-red placeholder:text-gray-600"
                    />
                    <div className="flex gap-1 bg-[#1A1A1A] border border-white/10 rounded-lg p-1">
                        {(['all', 'A', 'B', 'C'] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => setTier(t)}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${tier === t ? 'bg-brand-red text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                {t === 'all' ? 'Vše' : t}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setVerifiedOnly(v => !v)}
                        className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${verifiedOnly ? 'bg-brand-red border-brand-red text-white' : 'bg-[#1A1A1A] border-white/10 text-gray-400 hover:text-white'}`}
                    >
                        ✔ jen verified
                    </button>
                    <select
                        value={sort}
                        onChange={e => setSort(e.target.value as SortKey)}
                        className="bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-red"
                    >
                        <option value="score">Řadit: Skóre</option>
                        <option value="followers">Řadit: Sledující</option>
                        <option value="date">Řadit: Datum</option>
                    </select>
                </div>

                {/* Mřížka karet */}
                {filtered.length === 0 ? (
                    <div className="text-center text-gray-500 py-24">Žádné leady neodpovídají filtru.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filtered.map(lead => (
                            <div key={lead.id} className="bg-[#161616] border border-white/10 rounded-xl p-4 flex flex-col gap-3">
                                {/* Hlavička karty */}
                                <div className="flex items-start gap-3">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={avatarSrc(lead)}
                                        alt=""
                                        className="w-12 h-12 rounded-full object-cover border border-white/10 bg-[#262626] shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5">
                                            <a
                                                href={`https://instagram.com/${lead.ig}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-white font-bold truncate hover:text-brand-red transition-colors"
                                            >
                                                @{lead.ig || '—'}
                                            </a>
                                            {lead.verified && (
                                                <svg className="w-4 h-4 text-[#3897f0] shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 1.8 3-.2 1 2.8 2.6 1.4-.6 2.9 1.6 2.5-2 2.2.2 3-2.8.9-1.4 2.6-2.9-.7-2.6 1.5-2.3-1.9-2.3 1.9-2.6-1.5-2.9.7L4.8 16l-2.8-.9.2-3-2-2.2L1.8 7.4 1.2 4.5l2.6-1.4 1-2.8 3 .2L10 .2" /><path d="M10.6 14.6l-2.7-2.7 1.1-1.1 1.6 1.6 3.8-3.8 1.1 1.1z" fill="#fff" /></svg>
                                            )}
                                        </div>
                                        <div className="text-gray-400 text-xs truncate">{lead.name || lead.email}</div>
                                        <div className="text-gray-500 text-xs mt-0.5">{fmtFollowers(lead.followers)} sledujících</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                        <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${tierStyle[lead.tier]}`}>{lead.tier}</span>
                                        <span className="text-gray-500 text-[11px]">{lead.score}/100</span>
                                    </div>
                                </div>

                                {/* Kvalifikace */}
                                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                                    <Field label="Rozpočet" value={lead.budget} highlight />
                                    <Field label="Příjem" value={lead.income} />
                                    <Field label="Problém" value={lead.problem} />
                                    <Field label="Monetizace" value={lead.monetization} />
                                </div>

                                {/* Detail */}
                                {lead.detail && (
                                    <div>
                                        <p className={`text-gray-300 text-xs leading-relaxed ${open === lead.id ? '' : 'line-clamp-2'}`}>
                                            {lead.detail}
                                        </p>
                                        {lead.detail.length > 120 && (
                                            <button onClick={() => setOpen(open === lead.id ? null : lead.id)} className="text-brand-red text-xs mt-1 hover:underline">
                                                {open === lead.id ? 'méně' : 'více'}
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Meta */}
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500 border-t border-white/5 pt-2">
                                    <span>{relTime(lead.createdTime)}</span>
                                    {lead.source && <span>· {lead.source}</span>}
                                    {lead.campaign && <span>· {lead.campaign}</span>}
                                    <span className="truncate">· {lead.email}</span>
                                </div>

                                {/* Akce */}
                                <div className="flex flex-wrap gap-2">
                                    <a href={clarityUrl(lead)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-red/10 text-brand-red border border-brand-red/30 text-xs font-bold hover:bg-brand-red/20 transition-colors">
                                        ▶ Clarity nahrávka
                                    </a>
                                    {lead.notionUrl && (
                                        <a href={lead.notionUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-300 border border-white/10 text-xs font-medium hover:bg-white/10 transition-colors">
                                            Notion
                                        </a>
                                    )}
                                    <a href={`/strategie/${lead.id}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-300 border border-white/10 text-xs font-medium hover:bg-white/10 transition-colors">
                                        VSL stránka
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
};

const Field = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
    <div className="min-w-0">
        <div className="text-gray-500 uppercase tracking-wider text-[10px]">{label}</div>
        <div className={`truncate ${highlight ? 'text-white font-bold' : 'text-gray-300'}`}>{value || '—'}</div>
    </div>
);
