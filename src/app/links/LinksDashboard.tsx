"use client";

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import type { ShortLink, ClickListItem } from '@/lib/notion-links';
import { extractYouTubeId } from '@/lib/youtube';

const ORIGIN = typeof window !== 'undefined' ? window.location.origin : 'https://growbeyond.cz';

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
    const router = useRouter();
    const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
    const [days, setDays] = useState(30);

    // Create form state
    const [createUrl, setCreateUrl] = useState('');
    const [createSlug, setCreateSlug] = useState('');
    const [createTitle, setCreateTitle] = useState('');
    const [createSource, setCreateSource] = useState<'custom' | 'youtube' | 'instagram' | 'dms'>('custom');
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState('');
    const [createdSlug, setCreatedSlug] = useState('');
    const [copiedSlug, setCopiedSlug] = useState('');

    const handleCreate = async () => {
        if (!createUrl.trim()) return;
        setCreating(true);
        setCreateError('');
        try {
            const res = await fetch('/api/links/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetUrl: createUrl,
                    slug: createSlug || undefined,
                    title: createTitle || undefined,
                    source: createSource,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? 'Vytvoření selhalo');
            setCreatedSlug(data.slug);
            setCreateUrl('');
            setCreateSlug('');
            setCreateTitle('');
            setCreateSource('custom');
            setAdvancedOpen(false);
            router.refresh();
        } catch (e) {
            setCreateError(e instanceof Error ? e.message : 'Chyba');
        } finally {
            setCreating(false);
        }
    };

    const handleCopy = async (slug: string) => {
        await navigator.clipboard.writeText(`${ORIGIN}/l/${slug}`);
        setCopiedSlug(slug);
        setTimeout(() => setCopiedSlug(''), 1500);
    };

    const handleToggle = async (pageId: string, active: boolean) => {
        await fetch('/api/links/toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pageId, active }),
        });
        router.refresh();
    };

    const handleDelete = async (pageId: string, slug: string) => {
        if (!confirm(`Smazat link /l/${slug}? (Klick history zůstane v Notion.)`)) return;
        await fetch('/api/links/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pageId }),
        });
        router.refresh();
    };

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

                {/* Create Link Form */}
                <div className="bg-[#0d0d0d] border border-white/10 rounded-xl p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold">Vytvořit krátký link</h2>
                        <button
                            onClick={() => setAdvancedOpen(!advancedOpen)}
                            className="text-xs text-white/50 hover:text-white/80 underline"
                        >
                            {advancedOpen ? 'Skrýt nastavení' : 'Pokročilé nastavení'}
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="url"
                            value={createUrl}
                            onChange={e => setCreateUrl(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !creating) handleCreate(); }}
                            placeholder="Vlož URL (např. https://youtube.com/watch?v=...)"
                            className="flex-1 bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red"
                        />
                        <button
                            onClick={handleCreate}
                            disabled={creating || !createUrl.trim()}
                            className="px-6 py-3 bg-brand-red hover:bg-[#cc0b00] disabled:bg-[#333] disabled:cursor-not-allowed text-white font-bold rounded-lg uppercase text-sm tracking-wider"
                        >
                            {creating ? '...' : 'Vytvořit'}
                        </button>
                    </div>
                    {advancedOpen && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                            <input
                                type="text"
                                value={createSlug}
                                onChange={e => setCreateSlug(e.target.value)}
                                placeholder="Custom slug (volitelné)"
                                className="bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red"
                            />
                            <input
                                type="text"
                                value={createTitle}
                                onChange={e => setCreateTitle(e.target.value)}
                                placeholder="Title (auto-detect z YouTube)"
                                className="bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red"
                            />
                            <select
                                value={createSource}
                                onChange={e => setCreateSource(e.target.value as typeof createSource)}
                                className="bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-red"
                            >
                                <option value="custom">custom</option>
                                <option value="youtube">youtube</option>
                                <option value="instagram">instagram</option>
                                <option value="dms">dms</option>
                            </select>
                        </div>
                    )}
                    {createError && (
                        <p className="text-red-400 text-sm mt-3">{createError}</p>
                    )}
                    {createdSlug && (
                        <div className="mt-3 flex items-center gap-3 bg-brand-red/10 border border-brand-red/20 rounded-lg px-4 py-3">
                            <span className="text-sm text-white/80">Vytvořeno:</span>
                            <code className="font-mono text-sm text-white">{ORIGIN}/l/{createdSlug}</code>
                            <button
                                onClick={() => handleCopy(createdSlug)}
                                className="ml-auto text-xs text-white/70 hover:text-white underline"
                            >
                                {copiedSlug === createdSlug ? 'Zkopírováno ✓' : 'Zkopírovat'}
                            </button>
                        </div>
                    )}
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

                {/* Recent Click Activity */}
                <div className="bg-[#0d0d0d] border border-white/10 rounded-xl p-6 mb-8">
                    <h2 className="text-lg font-bold mb-4">Recent Click Activity</h2>
                    {filteredClicks.length === 0 ? (
                        <p className="text-white/40 text-sm">Žádné kliky.</p>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {filteredClicks.slice(0, 25).map(c => {
                                const link = links.find(l => l.slug === c.slug);
                                const refererHost = (() => {
                                    if (!c.referer) return '';
                                    try { return new URL(c.referer).hostname.replace(/^www\./, ''); } catch { return ''; }
                                })();
                                return (
                                    <div key={c.id} className="py-4 first:pt-0 last:pb-0">
                                        <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2">{timeAgo(c.timestamp)}</div>
                                        <div className="flex items-start gap-3 mb-2">
                                            <SourceIcon source={c.source} />
                                            {link?.targetUrl && <YouTubeThumb url={link.targetUrl} size="sm" />}
                                            <div className="flex-1 min-w-0">
                                                <div className="text-white font-medium truncate">{link?.title || c.slug}</div>
                                            </div>
                                            <code className="text-xs font-mono bg-white/5 px-2 py-1 rounded text-white/60 whitespace-nowrap">/l/{c.slug}</code>
                                        </div>
                                        <div className="flex items-center gap-3 flex-wrap text-xs text-white/60">
                                            {c.country && (
                                                <span className="flex items-center gap-1.5">
                                                    <span>{countryFlag(c.country)}</span>
                                                    <span>{c.city ? `${c.city}, ${countryName(c.country)}` : countryName(c.country)}</span>
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1.5">
                                                <DeviceIcon os={c.os} device={c.device} />
                                                <span>{shortOs(c.os) || c.device}</span>
                                            </span>
                                            {refererHost && (
                                                <span className="flex items-center gap-1.5 text-white/50">
                                                    <span>↩</span>
                                                    <span className="font-mono">{refererHost}</span>
                                                </span>
                                            )}
                                            {c.browser && (
                                                <span className="text-white/40">{c.browser.split(' ')[0]}</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Links table */}
                <div className="bg-[#0d0d0d] border border-white/10 rounded-xl p-6">
                    <h2 className="text-lg font-bold mb-4">Krátké linky <span className="text-white/40 text-sm font-normal">({links.length})</span></h2>
                    {links.length === 0 ? (
                        <p className="text-white/40 text-sm">Žádné linky. Vytvoř první nahoře.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-white/40 text-xs uppercase tracking-wider border-b border-white/10">
                                        <th className="text-left py-3 pr-4 w-[80px]">Náhled</th>
                                        <th className="text-left py-3 pr-4">Short URL</th>
                                        <th className="text-left py-3 pr-4">Title</th>
                                        <th className="text-left py-3 pr-4">Source</th>
                                        <th className="text-left py-3 pr-4">Target</th>
                                        <th className="text-center py-3 pr-4">Aktivní</th>
                                        <th className="text-right py-3 pr-4">Kliky</th>
                                        <th className="text-right py-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {links.map(l => (
                                        <tr key={l.pageId} className={`border-b border-white/5 hover:bg-white/[0.02] ${!l.active ? 'opacity-40' : ''}`}>
                                            <td className="py-3 pr-4">
                                                <YouTubeThumb url={l.targetUrl} size="md" />
                                            </td>
                                            <td className="py-3 pr-4">
                                                <div className="flex items-center gap-2">
                                                    <code className="font-mono text-white/90 text-xs">/l/{l.slug}</code>
                                                    <button
                                                        onClick={() => handleCopy(l.slug)}
                                                        className="text-xs text-white/40 hover:text-white px-1.5 py-0.5 rounded border border-white/10 hover:border-white/30"
                                                        title="Zkopírovat"
                                                    >
                                                        {copiedSlug === l.slug ? '✓' : '⎘'}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="py-3 pr-4 text-white/70 max-w-[200px] truncate">{l.title || '—'}</td>
                                            <td className="py-3 pr-4">
                                                <span className="px-2 py-0.5 rounded text-xs font-mono" style={{ background: (SOURCE_COLORS[l.source] ?? '#444') + '33', color: SOURCE_COLORS[l.source] ?? '#fff' }}>
                                                    {l.source}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-4 text-white/40 max-w-[200px] truncate">
                                                <a href={l.targetUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white/80 underline">{l.targetUrl}</a>
                                            </td>
                                            <td className="py-3 pr-4 text-center">
                                                <button
                                                    onClick={() => handleToggle(l.pageId, !l.active)}
                                                    className={`w-9 h-5 rounded-full transition-colors relative ${l.active ? 'bg-brand-red' : 'bg-white/10'}`}
                                                    title={l.active ? 'Deaktivovat' : 'Aktivovat'}
                                                >
                                                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${l.active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                                </button>
                                            </td>
                                            <td className="py-3 pr-4 text-right font-bold">{linkClicks.get(l.slug) ?? 0}</td>
                                            <td className="py-3 text-right">
                                                <button
                                                    onClick={() => handleDelete(l.pageId, l.slug)}
                                                    className="text-white/30 hover:text-red-400 px-2"
                                                    title="Smazat"
                                                >
                                                    ✕
                                                </button>
                                            </td>
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

// ───── Helpers ─────

function timeAgo(iso: string): string {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'Just now';
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return hr === 1 ? '1 hour ago' : `${hr} hours ago`;
    const days = Math.floor(hr / 24);
    return days === 1 ? '1 day ago' : `${days} days ago`;
}

function countryFlag(cc: string): string {
    if (!cc || cc.length !== 2) return '🌐';
    return cc.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

const COUNTRY_NAMES: Record<string, string> = {
    CZ: 'Czechia', SK: 'Slovakia', US: 'USA', GB: 'UK', DE: 'Germany',
    AT: 'Austria', PL: 'Poland', HU: 'Hungary', FR: 'France', IT: 'Italy',
    ES: 'Spain', NL: 'Netherlands', BE: 'Belgium', CH: 'Switzerland',
    UA: 'Ukraine', RU: 'Russia', CA: 'Canada', AU: 'Australia',
    BR: 'Brazil', MX: 'Mexico', IN: 'India', JP: 'Japan', CN: 'China',
};

function countryName(cc: string): string {
    if (!cc) return '';
    return COUNTRY_NAMES[cc.toUpperCase()] ?? cc.toUpperCase();
}

function shortOs(os: string): string {
    if (!os) return '';
    const lower = os.toLowerCase();
    if (lower.includes('ios')) return 'iPhone';
    if (lower.includes('mac')) return 'Mac';
    if (lower.includes('android')) return 'Android';
    if (lower.includes('windows')) return 'Windows';
    if (lower.includes('linux')) return 'Linux';
    return os.split(' ')[0];
}

const YouTubeThumb = ({ url, size = 'sm' }: { url: string; size?: 'sm' | 'md' }) => {
    const id = extractYouTubeId(url);
    const dim = size === 'md' ? 'w-16 h-12' : 'w-12 h-9';
    if (!id) {
        let host = '';
        try { host = new URL(url).hostname.replace(/^www\./, ''); } catch {}
        return (
            <div className={`${dim} rounded bg-[#1a1a1a] border border-white/10 flex items-center justify-center text-[8px] text-white/40 font-mono flex-shrink-0 truncate px-1`}>
                {host ? host.slice(0, 8) : '🔗'}
            </div>
        );
    }
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`}
            alt=""
            className={`${dim} rounded object-cover flex-shrink-0 border border-white/10`}
        />
    );
};

const SourceIcon = ({ source }: { source: string }) => {
    const color = SOURCE_COLORS[source] ?? '#888';
    const letter = (source || 'D')[0].toUpperCase();
    return (
        <div
            className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-black flex-shrink-0"
            style={{ background: color + '22', color }}
            title={source}
        >
            {letter}
        </div>
    );
};

const DeviceIcon = ({ os, device }: { os: string; device: string }) => {
    const lower = (os || '').toLowerCase();
    if (lower.includes('ios') || lower.includes('mac')) return <span></span>;
    if (lower.includes('android')) return <span>🤖</span>;
    if (lower.includes('windows')) return <span>🪟</span>;
    if (lower.includes('linux')) return <span>🐧</span>;
    if (device === 'mobile') return <span>📱</span>;
    if (device === 'tablet') return <span>📱</span>;
    return <span>💻</span>;
};
