"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Přihláška na hovor po webináři, vedená po jedné otázce.
//
// Proč postupně a ne jeden dlouhý formulář: dlouhý formulář se očima vyhodnotí
// jako práce a člověk ho zavře. Jedna otázka na obrazovce drží tempo a dovolí
// se ptát i na nepříjemné věci, jako je rozpočet nebo kdo rozhoduje o penězích.
//
// Pořadí jde od lehkých otázek přes diagnostické k citlivým. Na jméno se
// neptáme vůbec a email jen tehdy, když člověk přijde bez tokenu z mailu.
//
// Ovládání je i z klávesnice, výběr písmenem, potvrzení Enterem.

type Choice = { value: string; label: string };

type Question =
    | { key: string; kind: 'choice'; question: string; hint?: string; options: Choice[] }
    | { key: string; kind: 'text'; question: string; hint?: string; placeholder: string; inputType: 'text' | 'email' };

const YEARS: Choice[] = [
    { value: 'do-1', label: 'Méně než rok' },
    { value: '1-3', label: '1 až 3 roky' },
    { value: '3-5', label: '3 až 5 let' },
    { value: 'nad-5', label: 'Víc než 5 let' },
];

const REVENUE: Choice[] = [
    { value: 'do-100', label: 'Méně než 100 tisíc' },
    { value: '100-300', label: '100 až 300 tisíc' },
    { value: '300-1m', label: '300 tisíc až 1 milion' },
    { value: '1-3m', label: '1 až 3 miliony' },
    { value: 'nad-3m', label: 'Víc než 3 miliony' },
];

const TEAM: Choice[] = [
    { value: 'sam', label: 'Jsem na to sám' },
    { value: '2-5', label: '2 až 5 lidí' },
    { value: '6-10', label: '6 až 10 lidí' },
    { value: 'nad-10', label: 'Víc než 10 lidí' },
];

// Diagnostická otázka. Neskóruje, ale Timovi řekne, o čem hovor bude.
const STUCK: Choice[] = [
    { value: 'marketing', label: 'Marketing a získávání klientů' },
    { value: 'obchod', label: 'Obchod a uzavírání' },
    { value: 'tym', label: 'Tým a lidi' },
    { value: 'ja', label: 'Já sám a moje role ve firmě' },
    { value: 'nevim', label: 'Nevím, právě to chci zjistit' },
];

// Distribuce, tedy přesně to, o čem webinář je. Taky jen kontext.
const LEADS: Choice[] = [
    { value: 'doporuceni', label: 'Z doporučení' },
    { value: 'reklama', label: 'Z placené reklamy' },
    { value: 'obsah', label: 'Z obsahu na sítích' },
    { value: 'oslovuju', label: 'Oslovuju si je sám' },
    { value: 'nemam', label: 'Nemám stabilní zdroj' },
];

// Nejtvrdší kvalifikátor. Kdo o penězích nerozhoduje, nemá hovor smysl.
const DECISION: Choice[] = [
    { value: 'ja', label: 'Já' },
    { value: 'ja-partner', label: 'Já společně s partnerem nebo společníkem' },
    { value: 'nekdo-jiny', label: 'Někdo jiný' },
];

const BUDGET: Choice[] = [
    { value: 'nic', label: 'Zatím nechci investovat nic' },
    { value: 'do-20', label: 'Do 20 tisíc' },
    { value: '20-50', label: '20 až 50 tisíc' },
    { value: 'nad-50', label: 'Nad 50 tisíc' },
];

const WHEN: Choice[] = [
    { value: 'hned', label: 'Hned' },
    { value: 'mesic', label: 'Během následujícího měsíce' },
    { value: 'ctvrtleti', label: 'Během tří měsíců' },
    { value: 'pozdeji', label: 'Někdy později' },
    { value: 'ujasnit', label: 'Nejdřív si to chci ujasnit' },
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
    const questions = useMemo<Question[]>(() => {
        const list: Question[] = [
            { key: 'years', kind: 'choice', question: 'Jak dlouho už podnikáš?', options: YEARS },
            { key: 'revenue', kind: 'choice', question: 'Jaký zhruba děláš měsíční obrat?', options: REVENUE },
            { key: 'team', kind: 'choice', question: 'Kolik lidí dnes pracuje v tvém týmu?', options: TEAM },
            {
                key: 'stuck',
                kind: 'choice',
                question: 'Kde teď nejvíc cítíš, že ses zasekl?',
                options: STUCK,
            },
            { key: 'leads', kind: 'choice', question: 'Odkud ti dnes chodí klienti?', hint: 'Vyber to, odkud jich přijde nejvíc', options: LEADS },
            { key: 'decision', kind: 'choice', question: 'Kdo u vás rozhoduje o větších investicích do růstu?', options: DECISION },
            { key: 'budget', kind: 'choice', question: 'Kolik jsi připraven do růstu investovat?', options: BUDGET },
            {
                key: 'when',
                kind: 'choice',
                question: 'Kdybys věděl, co tě dnes skutečně brzdí, jak rychle bys to chtěl začít řešit?',
                options: WHEN,
            },
        ];
        // Email chceme jen tehdy, když ho neznáme z registrace.
        if (!defaultEmail) {
            list.push({
                key: 'email',
                kind: 'text',
                question: 'Na jaký email ses registroval?',
                hint: 'Ať tvoje odpovědi umíme spojit s registrací na webinář',
                placeholder: 'tvuj@email.cz',
                inputType: 'email',
            });
        }
        return list;
    }, [defaultEmail]);

    const [index, setIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({
        name: defaultName || '',
        email: defaultEmail || '',
    });
    const [error, setError] = useState('');
    const [status, setStatus] = useState<'idle' | 'submitting' | 'rejected' | 'error'>('idle');
    const inputRef = useRef<HTMLInputElement>(null);

    const current = questions[index];
    const value = answers[current?.key] || '';
    const isLast = index === questions.length - 1;

    const answered = current
        ? current.kind === 'text'
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
            setError(current.kind === 'choice' ? 'Vyber jednu z možností' : 'Zkontroluj prosím email');
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

    /**
     * Výběr možnosti rovnou posune na další otázku. Bez toho by u otázek
     * s pěti možnostmi zůstalo tlačítko pod ohybem a člověk by musel
     * scrollovat. U poslední otázky se neposouvá, odeslání musí být vědomé.
     */
    const choose = useCallback(
        (key: string, val: string) => {
            setAnswers(a => ({ ...a, [key]: val }));
            setError('');
            if (!isLast) setTimeout(() => setIndex(i => i + 1), 260);
        },
        [isLast],
    );

    // Klávesnice: písmeno vybere možnost, Enter potvrdí, šipky listují.
    useEffect(() => {
        if (status === 'submitting' || status === 'rejected') return;
        const onKey = (e: KeyboardEvent) => {
            if (!current) return;
            const typing = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA';

            if (e.key === 'Enter') {
                e.preventDefault();
                goNext();
                return;
            }
            if (current.kind === 'choice' && !typing) {
                const i = LETTERS.indexOf(e.key.toUpperCase());
                if (i >= 0 && i < current.options.length) {
                    e.preventDefault();
                    choose(current.key, current.options[i].value);
                    return;
                }
            }
            if (e.key === 'ArrowDown' && !typing) { e.preventDefault(); goNext(); }
            if (e.key === 'ArrowUp' && !typing) { e.preventDefault(); goBack(); }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [current, goNext, goBack, choose, status]);

    // Po přechodu na textovou otázku rovnou kurzor do pole.
    useEffect(() => {
        if (current && current.kind === 'text') inputRef.current?.focus();
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
        // Blok drží stejnou osu jako nadpis stránky nad ním, obsah uvnitř
        // zůstává vlevo, protože možnosti se tak čtou rychleji.
        <div className="mx-auto w-full max-w-[560px]">
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

            <div className="mt-7 md:mt-9">
                <h2 className="text-[24px] md:text-[34px] font-bold tracking-[-0.03em] leading-[1.14] max-w-[28ch]">
                    {current.question}
                </h2>
                {current.hint && (
                    <p className="mt-3 text-[15px] md:text-[17px] text-white/50 leading-[1.5] max-w-[52ch]">{current.hint}</p>
                )}

                <div className="mt-6 md:mt-7">
                    {current.kind === 'choice' ? (
                        <div className="flex flex-col gap-2">
                            {current.options.map((o, i) => {
                                const active = value === o.value;
                                return (
                                    <button
                                        key={o.value}
                                        type="button"
                                        onClick={() => choose(current.key, o.value)}
                                        aria-pressed={active}
                                        className={`flex w-full items-center gap-4 rounded-xl border px-4 py-3.5 text-left text-[16px] md:text-[18px] transition-colors ${
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
                    ) : (
                        <input
                            ref={inputRef}
                            type={current.inputType}
                            inputMode="email"
                            autoComplete="email"
                            placeholder={current.placeholder}
                            value={value}
                            onChange={e => {
                                setAnswers(a => ({ ...a, [current.key]: e.target.value }));
                                setError('');
                            }}
                            className="h-14 w-full rounded-xl border border-white/20 bg-transparent px-4 text-[19px] text-white placeholder:text-white/35 transition-colors hover:border-white/40 focus:outline-none focus-visible:border-white"
                        />
                    )}
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-5">
                    {(current.kind !== 'choice' || isLast) && (
                        <button
                            type="button"
                            onClick={goNext}
                            disabled={status === 'submitting'}
                            className="h-13 rounded-full bg-brand-red px-9 text-base font-bold text-white transition-colors hover:bg-[#d40c00] disabled:cursor-wait disabled:opacity-60"
                        >
                            {status === 'submitting' ? 'Odesílám' : isLast ? 'Odeslat přihlášku' : 'Pokračovat'}
                        </button>
                    )}

                    {index > 0 && (
                        <button
                            type="button"
                            onClick={goBack}
                            className="text-sm text-white/45 underline underline-offset-4 transition-colors hover:text-white"
                        >
                            Zpět
                        </button>
                    )}
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
