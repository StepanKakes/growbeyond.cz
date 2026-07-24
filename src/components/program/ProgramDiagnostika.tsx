"use client";

import React, { useState } from 'react';

// Diagnostika free programu — 4 otázky z podkladu (docs/free-program.md).
// Krokový wizard v rentgen designu (monitor skeneru jako kroky 1-4 na LP):
// jedna otázka na obrazovku, výběr možnosti posune dál, poslední krok odešle.
// Submit → /api/program/diagnostika (zapíše odpovědi + bucket, spustí Beo DM
// s prvním videem) → redirect na Den 1.

type Question = {
    key: 'q1' | 'q2' | 'q3' | 'q4';
    label: string;
    options: { value: string; text: string }[];
};

const QUESTIONS: Question[] = [
    {
        key: 'q1',
        label: 'Když se podíváš na svůj profil, kdo tě sleduje a reaguje?',
        options: [
            { value: 'A', text: 'NE ti, komu chci prodávat (lidi bez rozpočtu, jiná skupina)' },
            { value: 'B', text: 'Jsou to ti správní lidé, ale je jich málo' },
            { value: 'C', text: 'Jsou to správní lidé a nakupují' },
            { value: 'D', text: 'Téměř nikdo mě nevidí, nedokážu říct' },
        ],
    },
    {
        key: 'q2',
        label: 'Pozná cizí člověk do 10 sekund na profilu, komu a s čím pomáháš?',
        options: [
            { value: 'A', text: 'Ne, je to mix víc věcí' },
            { value: 'B', text: 'Pozná, kdo jsem, ale ne jak mu mohu pomoci' },
            { value: 'C', text: 'Pozná, komu pomáhám, ale nabídka ho nezaujme' },
            { value: 'D', text: 'Vidí to jasně a stejně se nic neděje' },
        ],
    },
    {
        key: 'q3',
        label: 'Máš jasnou cestu, jak se z náhodného diváka stane klient?',
        options: [
            { value: 'A', text: 'Ne, jen postuju a doufám, že se ozvou sami' },
            { value: 'B', text: 'Vedu lidi dál (lead magnet, DM, e-mail, call), ale lidé se ztrácí cestou' },
            { value: 'C', text: 'Cestu mám a lidé nakupují' },
            { value: 'D', text: 'Chci to popsat jinak' },
        ],
    },
    {
        key: 'q4',
        label: 'Co tě na tom všem nejvíc drží zpátky?',
        options: [
            { value: 'A', text: 'Mám čísla, ale ne ty správný lidi' },
            { value: 'B', text: 'Mám lidi, ale je z toho málo / žádný prodeje' },
            { value: 'C', text: 'Prodávám, ale narazil jsem na strop' },
        ],
    },
];

export const ProgramDiagnostika = ({ cid }: { cid: string }) => {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [q3jinak, setQ3jinak] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const q = QUESTIONS[step];
    const isLast = step === QUESTIONS.length - 1;
    // q3 s volbou D čeká na dopsání textu — nepřeskakuje hned dál
    const needsText = q.key === 'q3' && answers.q3 === 'D';

    const submit = async (finalAnswers: Record<string, string>) => {
        if (submitting) return;
        setSubmitting(true);
        setError('');
        try {
            const res = await fetch('/api/program/diagnostika', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cid, ...finalAnswers, q3jinak: finalAnswers.q3 === 'D' ? q3jinak : undefined }),
            });
            const data = await res.json().catch(() => null);
            if (data?.ok && data.next) {
                window.location.href = data.next;
                return;
            }
            setError('Něco se pokazilo, zkus to prosím znovu.');
        } catch {
            setError('Něco se pokazilo, zkus to prosím znovu.');
        }
        setSubmitting(false);
    };

    const pick = (value: string) => {
        const next = { ...answers, [q.key]: value };
        setAnswers(next);
        if (q.key === 'q3' && value === 'D') return; // počkat na text + Pokračovat
        if (isLast) { void submit(next); return; }
        setStep(s => s + 1);
    };

    const advance = () => {
        if (isLast) { void submit(answers); return; }
        setStep(s => s + 1);
    };

    return (
        <div className="relative rounded-xl border border-white/[0.08] bg-[#0C0C0C] overflow-hidden">
            {/* mřížka + vinětace, jazyk monitoru z LP (bez animované linky) */}
            <div
                aria-hidden
                className="absolute inset-0"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                }}
            />
            <div
                aria-hidden
                className="absolute inset-0"
                style={{ background: 'radial-gradient(130% 100% at 50% 0%, transparent 55%, rgba(0,0,0,0.6))' }}
            />

            <div className="relative px-5 md:px-8 py-7 md:py-9 flex flex-col gap-6">
                {/* progress: tenké pruhy per otázka */}
                <div className="flex gap-2 items-center">
                    {QUESTIONS.map((qq, i) => (
                        <span key={qq.key} className={`flex-1 h-[3px] rounded-full ${i <= step ? 'bg-brand-red' : 'bg-white/[0.14]'}`} />
                    ))}
                </div>

                {/* hlavička otázky s ghost číslem */}
                <div className="relative pr-14 md:pr-20">
                    <span
                        aria-hidden
                        className="absolute right-0 top-1/2 -translate-y-1/2 font-bold leading-none text-[44px] md:text-[64px] tracking-[-0.03em] select-none"
                        style={{ WebkitTextStroke: '1.5px rgba(255,255,255,0.09)', color: 'transparent' }}
                    >
                        0{step + 1}
                    </span>
                    <p className="m-0 text-white text-[18px] md:text-[21px] font-bold leading-[1.4]">{q.label}</p>
                </div>

                {/* možnosti */}
                <div className="flex flex-col gap-2.5">
                    {q.options.map(opt => {
                        const selected = answers[q.key] === opt.value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                disabled={submitting}
                                onClick={() => pick(opt.value)}
                                className={`text-left px-4 py-3.5 rounded-xl border text-[15px] md:text-[16px] leading-[1.5] transition-colors disabled:opacity-60 ${selected
                                    ? 'border-brand-red bg-brand-red/[0.12] text-white'
                                    : 'border-white/[0.12] bg-white/[0.03] text-white/80 hover:border-white/35'}`}
                            >
                                {opt.text}
                            </button>
                        );
                    })}
                    {needsText && (
                        <>
                            <textarea
                                value={q3jinak}
                                onChange={e => setQ3jinak(e.target.value)}
                                placeholder="Popiš to vlastními slovy"
                                rows={3}
                                className="mt-1 px-4 py-3.5 rounded-xl border border-white/[0.12] bg-white/[0.03] text-white placeholder-white/40 focus:border-brand-red outline-none"
                            />
                            <button
                                type="button"
                                onClick={advance}
                                disabled={!q3jinak.trim() || submitting}
                                className="self-start mt-1 bg-brand-red hover:bg-[#cc0b00] disabled:opacity-40 disabled:cursor-not-allowed text-white px-7 py-3 rounded-full text-[14px] font-bold tracking-[0.02em] uppercase transition-colors"
                            >
                                Pokračovat
                            </button>
                        </>
                    )}
                </div>

                {/* patička: zpět + stav */}
                <div className="flex items-center justify-between min-h-[24px]">
                    {step > 0 && !submitting ? (
                        <button
                            type="button"
                            onClick={() => setStep(s => s - 1)}
                            className="bg-transparent border-0 p-0 text-white/40 hover:text-white/70 text-[13px] font-semibold cursor-pointer transition-colors"
                        >
                            ← Zpět
                        </button>
                    ) : <span />}
                    {submitting && <span className="text-white/55 text-[13px] font-semibold">Vyhodnocuji…</span>}
                </div>

                {error && <p className="m-0 text-brand-red text-sm">{error}</p>}
            </div>
        </div>
    );
};
