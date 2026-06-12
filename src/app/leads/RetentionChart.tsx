"use client";

import React, { useMemo, useRef, useState } from 'react';
import type { Lead } from '@/lib/mentorship-leads';

export const fmtTime = (s: number): string => {
    if (!isFinite(s) || s < 0) s = 0;
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
};

const W = 1000;
const H = 240;
const PAD_TOP = 12;
const PAD_BOTTOM = 30;
const CHART_H = H - PAD_TOP - PAD_BOTTOM;

const x = (t: number, dur: number) => (dur > 0 ? (t / dur) * W : 0);
const y = (pct: number) => PAD_TOP + (1 - pct / 100) * CHART_H;

export const RetentionChart = ({ leads, duration }: { leads: Lead[]; duration: number }) => {
    const wrapRef = useRef<HTMLDivElement>(null);
    const [hoverT, setHoverT] = useState<number | null>(null);

    const { points, started, dropT, dropPct, avgPct, completed } = useMemo(() => {
        const watched = leads.filter(l => l.videoMaxS != null).map(l => l.videoMaxS as number);
        const startedN = watched.length;
        const dur = Math.max(duration, ...watched, 1);

        if (startedN === 0) {
            return { points: [], started: 0, dropT: 0, dropPct: 0, avgPct: 0, completed: 0 };
        }

        // Vzorkuj retention po vteřinách (díky no-skip: retention(t)=#(max>=t)/started)
        const step = Math.max(1, Math.round(dur / 240)); // max ~240 bodů
        const pts: { t: number; pct: number; count: number }[] = [];
        for (let t = 0; t <= dur; t += step) {
            const count = watched.filter(m => m >= t).length;
            pts.push({ t, pct: (count / startedN) * 100, count });
        }

        // Největší propad mezi sousedními body = kde nejvíc lidí odchází
        let maxDrop = 0, dropAt = 0;
        for (let i = 1; i < pts.length; i++) {
            const d = pts[i - 1].pct - pts[i].pct;
            if (d > maxDrop) { maxDrop = d; dropAt = pts[i].t; }
        }

        const avg = watched.reduce((a, m) => a + Math.min(m / dur, 1), 0) / startedN * 100;
        const comp = watched.filter(m => m / dur >= 0.9).length;

        return { points: pts, started: startedN, dropT: dropAt, dropPct: maxDrop, avgPct: avg, completed: comp };
    }, [leads, duration]);

    const dur = Math.max(duration, ...leads.map(l => l.videoMaxS ?? 0), 1);

    if (started === 0) {
        return (
            <div className="rounded-xl border border-white/10 bg-[#131313] p-5 text-sm text-gray-500">
                Zatím nemáme data o přehrávání. Jakmile někdo zapne zvuk na VSL, objeví se tu retention křivka.
            </div>
        );
    }

    const areaD =
        `M ${x(points[0].t, dur).toFixed(1)} ${y(points[0].pct).toFixed(1)} ` +
        points.map(p => `L ${x(p.t, dur).toFixed(1)} ${y(p.pct).toFixed(1)}`).join(' ') +
        ` L ${x(points[points.length - 1].t, dur).toFixed(1)} ${(PAD_TOP + CHART_H).toFixed(1)} L ${x(points[0].t, dur).toFixed(1)} ${(PAD_TOP + CHART_H).toFixed(1)} Z`;

    const lineD =
        `M ${x(points[0].t, dur).toFixed(1)} ${y(points[0].pct).toFixed(1)} ` +
        points.map(p => `L ${x(p.t, dur).toFixed(1)} ${y(p.pct).toFixed(1)}`).join(' ');

    const hoverPoint = hoverT != null
        ? points.reduce((best, p) => (Math.abs(p.t - hoverT) < Math.abs(best.t - hoverT) ? p : best), points[0])
        : null;

    const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = wrapRef.current?.getBoundingClientRect();
        if (!rect) return;
        const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
        setHoverT(ratio * dur);
    };

    return (
        <div className="rounded-xl border border-white/10 bg-[#131313] p-4 md:p-5">
            <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
                <div>
                    <div className="text-sm font-bold text-white">Retention videa</div>
                    <div className="text-xs text-gray-500">{started} diváků (zapnuli zvuk) · délka {fmtTime(dur)}</div>
                </div>
                <div className="flex gap-4 text-right">
                    <Stat label="Ø dokoukáno" value={`${Math.round(avgPct)} %`} />
                    <Stat label="Dokoukali" value={`${completed}`} sub={`${Math.round((completed / started) * 100)} %`} />
                    {dropPct >= 3 && <Stat label="Největší odchod" value={fmtTime(dropT)} sub={`−${Math.round(dropPct)} %`} accent />}
                </div>
            </div>

            <div
                ref={wrapRef}
                className="relative w-full select-none"
                onMouseMove={onMove}
                onMouseLeave={() => setHoverT(null)}
            >
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" preserveAspectRatio="none">
                    {/* mřížka 25/50/75/100 % */}
                    {[0, 25, 50, 75, 100].map(p => (
                        <g key={p}>
                            <line x1={0} x2={W} y1={y(p)} y2={y(p)} stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
                            <text x={6} y={y(p) - 3} fill="rgba(255,255,255,0.35)" fontSize={11}>{p}%</text>
                        </g>
                    ))}

                    {/* drop-off marker */}
                    {dropPct >= 3 && (
                        <line x1={x(dropT, dur)} x2={x(dropT, dur)} y1={PAD_TOP} y2={PAD_TOP + CHART_H}
                            stroke="#FF0E00" strokeWidth={1.5} strokeDasharray="4 4" opacity={0.7} />
                    )}

                    <path d={areaD} fill="rgba(255,14,0,0.12)" />
                    <path d={lineD} fill="none" stroke="#FF0E00" strokeWidth={2.5} vectorEffect="non-scaling-stroke" />

                    {/* časové popisky na ose */}
                    {[0, 0.25, 0.5, 0.75, 1].map(r => (
                        <text key={r} x={Math.min(W - 24, Math.max(2, r * W))} y={H - 8}
                            fill="rgba(255,255,255,0.4)" fontSize={12}
                            textAnchor={r === 0 ? 'start' : r === 1 ? 'end' : 'middle'}>
                            {fmtTime(r * dur)}
                        </text>
                    ))}

                    {/* hover guide */}
                    {hoverPoint && (
                        <>
                            <line x1={x(hoverPoint.t, dur)} x2={x(hoverPoint.t, dur)} y1={PAD_TOP} y2={PAD_TOP + CHART_H}
                                stroke="rgba(255,255,255,0.5)" strokeWidth={1} />
                            <circle cx={x(hoverPoint.t, dur)} cy={y(hoverPoint.pct)} r={4} fill="#FF0E00" stroke="#fff" strokeWidth={1.5} />
                        </>
                    )}
                </svg>

                {hoverPoint && (
                    <div
                        className="absolute -top-1 px-2.5 py-1.5 rounded-lg bg-black/90 border border-white/15 text-xs whitespace-nowrap pointer-events-none -translate-x-1/2"
                        style={{ left: `${(hoverPoint.t / dur) * 100}%` }}
                    >
                        <span className="text-white font-bold">{fmtTime(hoverPoint.t)}</span>
                        <span className="text-gray-400"> · kouká </span>
                        <span className="text-brand-red font-bold">{Math.round(hoverPoint.pct)} %</span>
                        <span className="text-gray-500"> ({hoverPoint.count})</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const Stat = ({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) => (
    <div>
        <div className="text-[10px] uppercase tracking-wider text-gray-500">{label}</div>
        <div className={`text-lg font-bold leading-tight ${accent ? 'text-brand-red' : 'text-white'}`}>
            {value} {sub && <span className="text-xs font-medium text-gray-500">{sub}</span>}
        </div>
    </div>
);
