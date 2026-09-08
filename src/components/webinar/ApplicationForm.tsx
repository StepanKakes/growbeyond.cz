"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Přihláška na hovor po webináři, vedená po jedné otázce.
//
// Proč postupně a ne jeden dlouhý formulář: dlouhý formulář se očima vyhodnotí
// jako práce a člověk ho zavře. Jedna otázka na obrazovce drží tempo a dovolí
// se ptát i na nepříjemné věci, jako je rozpočet.
//
// Ovládání je i z klávesnice, výběr písmenem a potvrzení Enterem, protože kdo
// vyplňuje z počítače, projde to takhle výrazně rychleji.

type Choice = { value: string; label: string };

type Question =
    | { key: string; kind: 'choice'; question: string; hint?: string; options: Choice[] }
    | { key: string; kind: 'text'; question: string; hint?: string; placeholder: string; inputType: 'text' | 'email' }
    | { key: string; kind: 'longtext'; question: string; hint?: string; placeholder: string; optional: true };

const REVENUE: Choice[] = [
    { value: 'do-50', label: 'Do 50 tisíc měsíčně' },
    { value: '50-150', label: '50 až 150 tisíc měsíčně' },
    { value: '150-500', label: '150 až 500 tisíc měsíčně' },
    { value: 'nad-500', label: 'Nad 500 tisíc měsíčně' },
];

const TEAM: Choice[] = [
    { value: 'sam', label: 'Dělám na tom sám' },
    { value: '1-3', label: 'Jsme 1 až 3 lidi' },
    { value: 'vic', label: 'Máme víc než 3 lidi' },
];

const BUDGET: Choice[] = [
    { value: 'nic', label: 'Zatím nechci investovat nic' },
    { value: 'do-20', label: 'Do 20 tisíc' },
    { value: '20-50', label: '20 až 50 tisíc' },
    { value: 'nad-50', label: 'Nad 50 tisíc' },
];

const WHEN: Choice[] = [
    { value: 'hned', label: 'Chci začít hned' },
    { value: 'mesic', label: 'Během měsíce' },
    { value: 'ctvrtleti', label: 'Někdy do čtvrt roku' },
    { value: 'rozhlizim', label: 'Zatím se jen rozhlížím' },
];

const LETTERS = 'ABCDEFGH';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const ApplicationForm = ({
    token,
    defaultName,
    defaultEmail,
}: {
    token: string;
    defaultName?: string;
    defaultEmail?: string;
}) => {
    // Kdo přišel z mailu, má jméno i email známé, tak se na ně neptáme znovu.
    const questions = useMemo<Question[]>(() => {
        const identity: Question[] = [];
        if (!defaultName) {
            identity.push({ key: 'name', kind: 'text', question: 'Jak ti máme říkat?', placeholder: 'Jméno a příjmení', inputType: 'text' });
        }
        if (!defaultEmail) {
            identity.push({ key: 'email', kind: 'text', question: 'Kam ti máme poslat potvrzení?', placeholder: 'tvuj@email.cz', inputType: 'email' });
        }
        return [
            ...identity,
            {
                key: 'revenue',
                kind: 'choice',
                question: 'Kolik teď měsíčně děláš?',
                hint: 'Podle toho poznáme, jestli ti umíme pomoct, nebo bys nám jen platil za něco, co ještě nepotřebuješ',
                options: REVENUE,
            },
            { key: 'team', kind: 'choice', question: 'Jak jste na tom s týmem?', options: TEAM },
            {
                key: 'budget',
                kind: 'choice',
                question: 'Kolik jsi připraven do růstu investovat?',
                hint: 'Ptáme se rovnou, ať nikdo z nás nezjistí až na hovoru, že se míjíme',
                options: BUDGET,
            },
            { key: 'when', kind: 'choice', question: 'Kdy s tím chceš začít?', options: WHEN },
            {
                key: 'blocker',
                kind: 'longtext',
                question: 'Co tě teď nejvíc brzdí?',
                hint: 'Nepovinné, ale díky tomu se na hovoru nebudeme půl hodiny rozkoukávat',
                placeholder: 'Napiš to vlastními slovy',
                optional: true,
            },
        ];
    }, [defaultName, defaultEmail]);

    const [index, setIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({
        name: defaultName || '',
        email: defaultEmail || '',
    });
    const [error, setError] = useState('');
    const [status, setStatus] = useState<'idle' | 'submitting' | 'rejected' | 'error'>('idle');
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    const current = questions[index];
    const value = answers[current?.key] || '';
    const isLast = index === questions.length - 1;

    const answered = current
        ? current.kind === 'longtext'
            ? true
            : current.kind === 'text'
              ? current.inputType === 'email'
                  ? EMAIL_RE.test(value.trim())
                  : value.trim().length > 1
              : Boolean(value)
        : false;

    const submit = useCallback(
        async (all: Record<string, string>) => {
            setStatus('submitting');
            setError('');
            try {
                const res = await fetch('/api/webinar/prihlaska', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token, ...all }),
                });
                const data = (await res.json().catch(() => ({}))) as { ok?: boolean; qualified?: boolean; redirect?: string };
                if (!res.ok || !data.ok) {
                    setStatus('error');
                    return;
                }
                if (data.qualified && data.redirect) {
                    window.location.assign(data.redirect);
                    return;
                }
                setStatus('rejected');
            } catch {
                setStatus('error');
            }
        },
        [token],
    );

    const goNext = useCallback(() => {
        if (!current) return;
        if (!answered) {
            setError(
                current.kind === 'choice'
                    ? 'Vyber jednu z možností'
                    : current.kind === 'text' && current.inputType === 'email'
                      ? 'Zkontroluj prosím email'
                      : 'Doplň prosím odpověď',
            );
            return;
        }
        setError('');
        if (isLast) {
            void submit(answers);
            return;
        }
        setIndex(i => i + 1);
    }, [current, answered, isLast, answers, submit]);

    const goBack = useCallback(() => {
        setError('');
        setIndex(i => Math.max(0, i - 1));
    }, []);

    // Klávesnice: písmeno vybere možnost, Enter potvrdí, šipky listují.
    useEffect(() => {
        if (status === 'submitting' || status === 'rejected') return;
        const onKey = (e: KeyboardEvent) => {
            if (!current) return;
            const typing = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA';

            if (e.key === 'Enter' && (!typing || current.kind !== 'longtext' || e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                goNext();
                return;
            }
            if (current.kind === 'choice' && !typing) {
                const i = LETTERS.indexOf(e.key.toUpperCase());
                if (i >= 0 && i < current.options.length) {
                    e.preventDefault();
                    setAnswers(a => ({ ...a, [current.key]: current.options[i].value }));
                    setError('');
                    return;
                }
            }
            if (e.key === 'ArrowDown' && !typing) { e.preventDefault(); goNext(); }
            if (e.key === 'ArrowUp' && !typing) { e.preventDefault(); goBack(); }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [current, goNext, goBack, status]);

    // Po přechodu na textovou otázku rovnou kurzor do pole.
    useEffect(() => {
        if (current && current.kind !== 'choice') inputRef.current?.focus();
    }, [index, current]);

    if (status === 'rejected') {
        return (
            <div role="status">
                <h2 className="text-[28px] md:text-[40px] font-bold tracking-[-0.03em] leading-[1.1]">Díky za upřímnost</h2>
                <p className="mt-5 text-[18px] md:text-[21px] text-white/70 leading-[1.5] max-w-[46ch]">
                    Podle toho, co jsi vyplnil, by ti společná práce teď nedávala smysl a nechci ti brát čas ani peníze
                </p>
                <p className="mt-4 text-[18px] md:text-[21px] text-white/70 leading-[1.5] max-w-[46ch]">
                    Nechávám tě v mailech, posílám tam věci, které ti pomůžou i bez nás. Až se to změní, ozvi se
                </p>
            </div>
        );
    }

    if (!current) return null;

    return (
        <div className="w-full">
            {/* Postup, ať člověk ví, kolik toho zbývá */}
            <div className="flex items-center gap-4">
                <span className="text-sm text-white/50 tabular-nums">
                    Otázka {index + 1} ze {questions.length}
                </span>
                <span className="flex flex-1 gap-1" aria-hidden="true">
                    {questions.map((q, i) => (
                        <span
                            key={q.key}
                            className={`h-[3px] flex-1 rounded-full transition-colors ${i <= index ? 'bg-brand-red' : 'bg-white/15'}`}
                        />
                    ))}
                </span>
            </div>

            <div className="mt-10 md:mt-14">
                <h2 className="text-[28px] md:text-[44px] font-bold tracking-[-0.03em] leading-[1.1] max-w-[20ch]">
                    {current.question}
                </h2>
                {current.hint && (
                    <p className="mt-4 text-[16px] md:text-[18px] text-white/55 leading-[1.5] max-w-[52ch]">{current.hint}</p>
                )}

                <div className="mt-8 md:mt-10 max-w-[560px]">
                    {current.kind === 'choice' && (
                        <div className="flex flex-col gap-2.5">
                            {current.options.map((o, i) => {
                                const active = value === o.value;
                                return (
                                    <button
                                        key={o.value}
                                        type="button"
                                        onClick={() => {
                                            setAnswers(a => ({ ...a, [current.key]: o.value }));
                                            setError('');
                                        }}
                                        aria-pressed={active}
                                        className={`flex w-full items-center gap-4 rounded-xl border px-4 py-4 text-left text-[17px] md:text-[19px] transition-colors ${
                                            active
                                                ? 'border-brand-red text-white'
                                                : 'border-white/15 text-white/70 hover:border-white/40 hover:text-white'
                                        }`}
                                    >
                                        <span
                                            aria-hidden="true"
                                            className={`grid h-7 w-7 shrink-0 place-items-center rounded-md border text-[13px] font-bold transition-colors ${
                                                active ? 'border-brand-red bg-brand-red text-white' : 'border-white/25 text-white/55'
                                            }`}
                                        >
                                            {LETTERS[i]}
                                        </span>
                                        {o.label}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {current.kind === 'text' && (
                        <input
                            ref={inputRef as React.RefObject<HTMLInputElement>}
                            type={current.inputType}
                            inputMode={current.inputType === 'email' ? 'email' : undefined}
                            autoComplete={current.inputType === 'email' ? 'email' : 'name'}
                            placeholder={current.placeholder}
                            value={value}
                            onChange={e => {
                                setAnswers(a => ({ ...a, [current.key]: e.target.value }));
                                setError('');
                            }}
                            className="h-14 w-full rounded-xl border border-white/20 bg-transparent px-4 text-[19px] text-white placeholder:text-white/35 transition-colors hover:border-white/40 focus:outline-none focus-visible:border-white"
                        />
                    )}

                    {current.kind === 'longtext' && (
                        <textarea
                            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                            rows={4}
                            placeholder={current.placeholder}
                            value={value}
                            onChange={e => {
                                setAnswers(a => ({ ...a, [current.key]: e.target.value }));
                                setError('');
                            }}
                            className="w-full rounded-xl border border-white/20 bg-transparent p-4 text-[19px] text-white placeholder:text-white/35 transition-colors hover:border-white/40 focus:outline-none focus-visible:border-white"
                        />
                    )}
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-5">
                    <button
                        type="button"
                        onClick={goNext}
                        disabled={status === 'submitting'}
                        className="h-13 rounded-full bg-brand-red px-9 text-base font-bold text-white transition-colors hover:bg-[#d40c00] disabled:cursor-wait disabled:opacity-60"
                    >
                        {status === 'submitting' ? 'Odesílám' : isLast ? 'Odeslat přihlášku' : 'Pokračovat'}
                    </button>

                    <span className="hidden text-sm text-white/40 sm:inline">
                        {current.kind === 'choice' ? 'nebo stiskni písmeno a Enter' : 'nebo stiskni Enter'}
                    </span>

                    <span className="ml-auto flex gap-2">
                        <button
                            type="button"
                            onClick={goBack}
                            disabled={index === 0}
                            aria-label="Předchozí otázka"
                            className="grid h-10 w-10 place-items-center rounded-lg border border-white/20 text-white/70 transition-colors hover:border-white/50 hover:text-white disabled:opacity-25 disabled:hover:border-white/20"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M18 15l-6-6-6 6" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            onClick={goNext}
                            disabled={isLast}
                            aria-label="Další otázka"
                            className="grid h-10 w-10 place-items-center rounded-lg border border-white/20 text-white/70 transition-colors hover:border-white/50 hover:text-white disabled:opacity-25 disabled:hover:border-white/20"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M6 9l6 6 6-6" />
                            </svg>
                        </button>
                    </span>
                </div>

                {error && (
                    <p className="mt-4 text-sm text-brand-red" role="alert">
                        {error}
                    </p>
                )}
                {status === 'error' && (
                    <p className="mt-4 text-sm text-brand-red" role="alert">
                        Nepovedlo se to odeslat, zkus to prosím znovu
                    </p>
                )}
            </div>
        </div>
    );
};
