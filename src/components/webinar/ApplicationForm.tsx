"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Přihláška na hovor po webináři, vedená po jedné otázce.
//
// Proč postupně a ne jeden dlouhý formulář: dlouhý formulář se očima vyhodnotí
// jako práce a člověk ho zavře. Jedna otázka na obrazovce drží tempo a dovolí
// se ptát i na nepříjemné věci, jako je rozpočet.
//
// Pořadí otázek jde od lehkých přes zajímavé k citlivým a kontakt je až na
// konci, kdy už člověk do odpovědí investoval čas. Na jméno se neptáme vůbec,
// u lidí z mailu ho známe a u ostatních ho zjistíme na hovoru.
//
// Ovládání je i z klávesnice, výběr písmenem a potvrzení Enterem.

type Choice = { value: string; label: string };

type Question =
    | { key: string; kind: 'choice'; question: string; hint?: string; options: Choice[] }
    | { key: string; kind: 'text'; question: string; hint?: string; placeholder: string; inputType: 'text' | 'email' }
    | { key: string; kind: 'longtext'; question: string; hint?: string; placeholder: string; optional: true };

const PROFESSION: Choice[] = [
    { value: 'expert', label: 'Kouč, konzultant nebo expert' },
    { value: 'firma', label: 'Majitel firmy se službami' },
    { value: 'produkt', label: 'Prodávám produkty nebo mám e-shop' },
    { value: 'tvurce', label: 'Tvůrce obsahu' },
    { value: 'zacinam', label: 'Teprve začínám' },
];

const REVENUE: Choice[] = [
    { value: 'do-50', label: 'Do 50 tisíc měsíčně' },
    { value: '50-150', label: '50 až 150 tisíc měsíčně' },
    { value: '150-500', label: '150 až 500 tisíc měsíčně' },
    { value: 'nad-500', label: 'Nad 500 tisíc měsíčně' },
];

// Distribuce a obsah, tedy přesně to, o čem webinář je. Do skóre skoro
// nevstupují, jejich hodnota je v kontextu pro hovor.
const LEADS: Choice[] = [
    { value: 'doporuceni', label: 'Z doporučení' },
    { value: 'reklama', label: 'Z placené reklamy' },
    { value: 'obsah', label: 'Z obsahu na sítích' },
    { value: 'oslovuju', label: 'Oslovuju si je sám' },
    { value: 'nemam', label: 'Nemám stabilní zdroj' },
];

const CONTENT: Choice[] = [
    { value: 'netvorim', label: 'Netvořím skoro nic' },
    { value: 'nepravidelne', label: 'Tvořím nepravidelně' },
    { value: 'bez-vysledku', label: 'Tvořím pravidelně, ale klienty to nenosí' },
    { value: 'funguje', label: 'Tvořím pravidelně a funguje mi to' },
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
    const questions = useMemo<Question[]>(() => {
        const list: Question[] = [
            { key: 'profession', kind: 'choice', question: 'Čím se živíš?', options: PROFESSION },
            { key: 'revenue', kind: 'choice', question: 'Kolik teď měsíčně děláš?', options: REVENUE },
            {
                key: 'leads',
                kind: 'choice',
                question: 'Odkud ti dnes chodí klienti?',
                hint: 'Vyber to, odkud jich přijde nejvíc',
                options: LEADS,
            },
            { key: 'content', kind: 'choice', question: 'Jak jsi na tom s obsahem?', options: CONTENT },
            {
                key: 'blocker',
                kind: 'longtext',
                question: 'Co tě teď nejvíc brzdí?',
                hint: 'Nepovinné, ale díky tomu se na hovoru nebudeme půl hodiny rozkoukávat',
                placeholder: 'Napiš to vlastními slovy',
                optional: true,
            },
            { key: 'budget', kind: 'choice', question: 'Kolik jsi připraven do růstu investovat?', options: BUDGET },
            { key: 'when', kind: 'choice', question: 'Kdy s tím chceš začít?', options: WHEN },
        ];
        // Email chceme až na konci a jen tehdy, když ho ještě neznáme.
        if (!defaultEmail) {
            list.push({
                key: 'email',
                kind: 'text',
                question: 'Kam ti mám poslat potvrzení?',
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

            if (e.key === 'Enter' && (!typing || current.kind !== 'longtext' || e.metaKey || e.ctrlKey)) {
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
                <h2 className="text-[26px] md:text-[38px] font-bold tracking-[-0.03em] leading-[1.12] max-w-[26ch]">
                    {current.question}
                </h2>
                {current.hint && (
                    <p className="mt-3 text-[15px] md:text-[17px] text-white/50 leading-[1.5] max-w-[52ch]">{current.hint}</p>
                )}

                <div className="mt-6 md:mt-8">
                    {current.kind === 'choice' && (
                        <div className="flex flex-col gap-2.5">
                            {current.options.map((o, i) => {
                                const active = value === o.value;
                                return (
                                    <button
                                        key={o.value}
                                        type="button"
                                        onClick={() => choose(current.key, o.value)}
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

                    {/* Jen zpět. Šipka dopředu by dělala to samé co tlačítko vedle. */}
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
