"use client";

import { useMemo, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import type { ShortLink, ClickListItem } from '@/lib/notion-links';

const COLORS = ['#FF0E00', '#FF6B00', '#FFB800', '#00C896', '#0096FF', '#9B5BFF', '#FF4FC3'];

const SOURCE_COLORS: Record<string, string> = {
    youtube: '#FF0E00',
    instagram: '#E1306C',
    dms: '#9B5BFF',
    custom: '#0096FF',
    direct: '#888888',
};

type Props = {
    links: ShortLink[];
    clicks: ClickListItem[];
};

const SOURCE_FILTERS = ['all', 'youtube', 'instagram', 'dms', 'custom'] as const;
type SourceFilter = typeof SOURCE_FILTERS[number];

export const LinksDashboard = ({ links, clicks }: Props) => {
    const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
    const [days, setDays] = useState(30);

    const filteredClicks = useMemo(() => {
        const since = Date.now() - days * 86400000;
        return clicks.filter(c => {
            if (!c.timestamp) return false;
            if (new Date(c.timestamp).getTime() < since) return false;
            if (sourceFilter !== 'all' && c.source !== sourceFilter) return false;
            return true;
        });
    }, [clicks, sourceFilter, days]);

    const stats = useMemo(() => {
        const total = filteredClicks.length;
        const countries = new Set(filteredClicks.map(c => c.country).filter(Boolean));
        const ipCount = new Set(filteredClicks.map(c => c.referer + c.browser + c.os)).size;
        const sources = new Map<string, number>();
        filteredClicks.forEach(c => sources.set(c.source, (sources.get(c.source) ?? 0) + 1));
        const topSource = [...sources.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
        return { total, countries: countries.size, uniqueVisitors: ipCount, topSource };
    }, [filteredClicks]);

    const timeline = useMemo(() => {
        const map = new Map<string, number>();
        const dayMs = 86400000;
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(Date.now() - i * dayMs);
            const key = d.toISOString().slice(0, 10);
            map.set(key, 0);
        }
        filteredClicks.forEach(c => {
            const key = c.timestamp.slice(0, 10);
            if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1);
        });
        return [...map.entries()].map(([date, clicks]) => ({
            date: date.slice(5),
            clicks,
        }));
    }, [filteredClicks, days]);

    const sourceBreakdown = useMemo(() => {
        const map = new Map<string, number>();
        filteredClicks.forEach(c => map.set(c.source || 'direct', (map.get(c.source || 'direct') ?? 0) + 1));
        return [...map.entries()]
            .map(([name, value]) => ({ name, value, color: SOURCE_COLORS[name] ?? '#888' }))
            .sort((a, b) => b.value - a.value);
    }, [filteredClicks]);

    const deviceBreakdown = useMemo(() => {
        const map = new Map<string, number>();
        filteredClicks.forEach(c => map.set(c.device || 'unknown', (map.get(c.device || 'unknown') ?? 0) + 1));
        return [...map.entries()]
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [filteredClicks]);

    const countryBreakdown = useMemo(() => {
        const map = new Map<string, number>();
        filteredClicks.forEach(c => {
            const k = c.country || 'Unknown';
            map.set(k, (map.get(k) ?? 0) + 1);
        });
        return [...map.entries()]
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
    }, [filteredClicks]);

    const linkClicks = useMemo(() => {
        const map = new Map<string, number>();
        filteredClicks.forEach(c => map.set(c.slug, (map.get(c.slug) ?? 0) + 1));
        return map;
    }, [filteredClicks]);

    return (
        <main className="min-h-screen bg-brand-dark text-white font-sans py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold">Links Dashboard</h1>
                        <p className="text-white/50 mt-1 text-sm">Tracking přes Notion DB. Správa linků v Notion.</p>
                    </div>
                    <div className="flex gap-2">
                        <a
                            href="https://www.notion.so/e218a2f17cf34c85936ee33c30f7cfa6"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-[#1A1A1A] border border-white/10 rounded-lg text-sm hover:bg-[#252525]"
                        >
                            Spravovat v Notion ↗
                        </a>
                        <a
                            href="/utm"
                            className="px-4 py-2 bg-brand-red rounded-lg text-sm font-bold hover:bg-[#cc0b00]"
                        >
                            UTM Generator
                        </a>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-8">
                    <div className="flex bg-[#1A1A1A] border border-white/10 rounded-lg overflow-hidden">
                        {SOURCE_FILTERS.map(s => (
                            <button
                                key={s}
                                onClick={() => setSourceFilter(s)}
                                className={`px-4 py-2 text-sm transition-colors ${sourceFilter === s ? 'bg-brand-red text-white' : 'text-white/60 hover:bg-white/5'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                    <div className="flex bg-[#1A1A1A] border border-white/10 rounded-lg overflow-hidden">
                        {[7, 14, 30].map(d => (
                            <button
                                key={d}
                                onClick={() => setDays(d)}
                                className={`px-4 py-2 text-sm transition-colors ${days === d ? 'bg-brand-red text-white' : 'text-white/60 hover:bg-white/5'}`}
                            >
                                {d}d
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard label="Celkem kliků" value={stats.total.toString()} />
                    <StatCard label="Unikátní zařízení" value={stats.uniqueVisitors.toString()} />
                    <StatCard label="Země" value={stats.countries.toString()} />
                    <StatCard label="Top zdroj" value={stats.topSource} />
                </div>

                {/* Timeline */}
                <div className="bg-[#0d0d0d] border border-white/10 rounded-xl p-6 mb-8">
                    <h2 className="text-lg font-bold mb-4">Kliky v čase</h2>
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={timeline}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
                            <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} allowDecimals={false} />
                            <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                            <Line type="monotone" dataKey="clicks" stroke="#FF0E00" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Source + Device side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-[#0d0d0d] border border-white/10 rounded-xl p-6">
                        <h2 className="text-lg font-bold mb-4">Zdroje</h2>
                        {sourceBreakdown.length === 0 ? (
                            <p className="text-white/40 text-sm">Žádná data.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={240}>
                                <PieChart>
                                    <Pie
                                        data={sourceBreakdown}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label={(e: { name?: string; value?: number }) => `${e.name ?? ''} (${e.value ?? 0})`}
                                    >
                                        {sourceBreakdown.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    <div className="bg-[#0d0d0d] border border-white/10 rounded-xl p-6">
                        <h2 className="text-lg font-bold mb-4">Zařízení</h2>
                        {deviceBreakdown.length === 0 ? (
                            <p className="text-white/40 text-sm">Žádná data.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={deviceBreakdown}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
                                    <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} allowDecimals={false} />
                                    <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                                    <Bar dataKey="value" fill="#FF0E00" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Countries */}
                <div className="bg-[#0d0d0d] border border-white/10 rounded-xl p-6 mb-8">
                    <h2 className="text-lg font-bold mb-4">Top země</h2>
                    {countryBreakdown.length === 0 ? (
                        <p className="text-white/40 text-sm">Žádná data.</p>
                    ) : (
                        <div className="space-y-2">
                            {countryBreakdown.map(c => {
                                const max = countryBreakdown[0].value;
                                const pct = (c.value / max) * 100;
                                return (
                                    <div key={c.name} className="flex items-center gap-3">
                                        <div className="w-12 font-mono text-sm text-white/60">{c.name}</div>
                                        <div className="flex-1 bg-white/5 rounded-full h-6 overflow-hidden">
                                            <div className="h-full bg-brand-red rounded-full flex items-center justify-end pr-2" style={{ width: `${pct}%` }}>
                                                <span className="text-xs font-bold">{c.value}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Links table */}
                <div className="bg-[#0d0d0d] border border-white/10 rounded-xl p-6">
                    <h2 className="text-lg font-bold mb-4">Krátké linky</h2>
                    {links.length === 0 ? (
                        <p className="text-white/40 text-sm">Žádné linky. Vytvoř první v Notion DB nebo přes UTM Generator.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-white/40 text-xs uppercase tracking-wider border-b border-white/10">
                                        <th className="text-left py-3 pr-4">Slug</th>
                                        <th className="text-left py-3 pr-4">Title</th>
                                        <th className="text-left py-3 pr-4">Source</th>
                                        <th className="text-left py-3 pr-4">Target</th>
                                        <th className="text-right py-3">Kliky</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {links.map(l => (
                                        <tr key={l.pageId} className="border-b border-white/5 hover:bg-white/[0.02]">
                                            <td className="py-3 pr-4 font-mono text-white/90">{l.slug}</td>
                                            <td className="py-3 pr-4 text-white/70">{l.title || '—'}</td>
                                            <td className="py-3 pr-4">
                                                <span className="px-2 py-0.5 rounded text-xs font-mono" style={{ background: (SOURCE_COLORS[l.source] ?? '#444') + '33', color: SOURCE_COLORS[l.source] ?? '#fff' }}>
                                                    {l.source}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-4 text-white/40 max-w-xs truncate">
                                                <a href={l.targetUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white/80 underline">{l.targetUrl}</a>
                                            </td>
                                            <td className="py-3 text-right font-bold">{linkClicks.get(l.slug) ?? 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

const StatCard = ({ label, value }: { label: string; value: string }) => (
    <div className="bg-[#0d0d0d] border border-white/10 rounded-xl p-5">
        <div className="text-white/40 text-xs uppercase tracking-wider mb-1">{label}</div>
        <div className="text-2xl md:text-3xl font-bold">{value}</div>
    </div>
);
