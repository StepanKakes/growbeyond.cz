"use client";

import React, { useState } from 'react';

// Diagnostika free programu — 4 otázky z podkladu (docs/free-program.md).
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
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [q3jinak, setQ3jinak] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const complete = QUESTIONS.every(q => answers[q.key]);

    const submit = async () => {
        if (!complete || submitting) return;
        setSubmitting(true);
        setError('');
        try {
            const res = await fetch('/api/program/diagnostika', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cid, ...answers, q3jinak: answers.q3 === 'D' ? q3jinak : undefined }),
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

    return (
        <div className="w-full flex flex-col gap-9">
            {QUESTIONS.map((q, qi) => (
                <fieldset key={q.key} className="bg-[#1A1A1A] border border-white/[0.08] rounded-2xl p-7 px-6">
                    <legend className="sr-only">{q.label}</legend>
                    <p className="m-0 mb-5 flex items-baseline gap-3">
                        <span className="font-serif text-brand-red text-[26px] leading-none shrink-0">{qi + 1}</span>
                        <span className="text-white text-lg font-semibold leading-[1.45]">{q.label}</span>
                    </p>
                    <div className="flex flex-col gap-2.5">
                        {q.options.map(opt => {
                            const selected = answers[q.key] === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setAnswers(a => ({ ...a, [q.key]: opt.value }))}
                                    className={`text-left px-4 py-3.5 rounded-xl border text-[16px] leading-[1.5] transition-colors ${selected
                                        ? 'border-brand-red bg-brand-red/[0.12] text-white'
                                        : 'border-white/[0.12] bg-white/[0.03] text-white/80 hover:border-white/35'}`}
                                >
                                    {opt.text}
                                </button>
                            );
                        })}
                        {q.key === 'q3' && answers.q3 === 'D' && (
                            <textarea
                                value={q3jinak}
                                onChange={e => setQ3jinak(e.target.value)}
                                placeholder="Popiš to vlastními slovy"
                                rows={3}
                                className="mt-1 px-4 py-3.5 rounded-xl border border-white/[0.12] bg-white/[0.03] text-white placeholder-white/40 focus:border-brand-red outline-none"
                            />
                        )}
                    </div>
                </fieldset>
            ))}

            {error && <p className="text-brand-red text-sm text-center">{error}</p>}

            <button
                type="button"
                onClick={submit}
                disabled={!complete || submitting}
                className="self-center bg-brand-red hover:bg-[#cc0b00] disabled:opacity-40 disabled:cursor-not-allowed text-white px-11 py-[18px] rounded-full text-[17px] font-bold tracking-[0.02em] uppercase transition-colors"
            >
                {submitting ? 'Odesílám…' : 'Odeslat a otevřít Den 1'}
            </button>
        </div>
    );
};
