"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';

// Přihláška na hovor po webináři, vedená po jedné otázce.
//
// Proč postupně a ne jeden dlouhý formulář: dlouhý formulář se očima vyhodnotí
// jako práce a člověk ho zavře. Jedna otázka na obrazovce drží tempo a dovolí
// se ptát i na nepříjemné věci, jako je rozpočet.
//
// Pořadí jde od lehkých otázek přes diagnostické k citlivým. Na jméno se
// neptáme vůbec a email jen tehdy, když člověk přijde bez tokenu z mailu.
//
// Ovládání je i z klávesnice, výběr písmenem, potvrzení Enterem.
//
// Pohyb: otázka odchází ve směru, kterým jdeme, a nová přichází z opačné
// strany, takže je z něj poznat, jestli se postupuje nebo vrací. Odchod je
// kratší než příchod, aby nepřetahoval pozornost. Části otázky nenaskakují
// naráz, ale s malým odstupem. Pružiny mají nulový odraz, poskakování
// působí lacině. Kdo má v systému vypnuté animace, dostane přechody bez
// pohybu, o to se stará MotionConfig.

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
    { value: 'rozjezd', label: 'Ještě to nemám rozjeté' },
    { value: 'do-100', label: 'Do 100 tisíc měsíčně' },
    { value: '100-300', label: '100 až 300 tisíc měsíčně' },
    { value: '300-1m', label: '300 tisíc až milion měsíčně' },
    { value: 'nad-1m', label: 'Přes milion měsíčně' },
];

// Diagnostická otázka. Neskóruje, ale každá odpověď odpovídá jedné části
// webináře, takže je z ní vidět, co tomu člověku sedne a o čem bude hovor.
const STUCK: Choice[] = [
    { value: 'znamost', label: 'Jsem dobrý v tom, co dělám, ale ví o mně málo lidí' },
    { value: 'kapacita', label: 'Mám dost lidí, ale nestíhám to' },
    { value: 'obsah', label: 'Tvořím obsah, ale nepřitahuje správné lidi' },
    { value: 'nabidka', label: 'Mám co nabídnout, ale těžko se to prodává' },
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

// Směr drží prostorovou logiku: dopředu odchází nahoru, zpět dolů.
const blockV = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05, delayChildren: 0.03 } },
    exit: (dir: number) => ({
        opacity: 0,
        y: dir > 0 ? -12 : 12,
        filter: 'blur(4px)',
        transition: { duration: 0.15, ease: 'easeIn' as const },
    }),
};

const itemV = {
    hidden: (dir: number) => ({ opacity: 0, y: dir > 0 ? 12 : -12, filter: 'blur(4px)' }),
    visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { type: 'spring' as const, duration: 0.34, bounce: 0 },
    },
};

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
            { key: 'revenue', kind: 'choice', question: 'Kolik ti dnes byznys měsíčně vydělává?', options: REVENUE },
            {
                key: 'stuck',
                kind: 'choice',
                question: 'Kde teď nejvíc cítíš, že ses zasekl?',
                options: STUCK,
            },
            { key: 'leads', kind: 'choice', question: 'Odkud ti dnes chodí klienti?', hint: 'Vyber to, odkud jich přijde nejvíc', options: LEADS },
            { key: 'budget', kind: 'choice', question: 'Kolik jsi připraven do růstu investovat?', options: BUDGET },
            {
                key: 'when',
                kind: 'choice',
                question: 'Jak rychle bys to chtěl začít řešit?',
                hint: 'Kdybys na webináři zjistil, co tvůj růst dnes skutečně brzdí',
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
    const [dir, setDir] = useState(1);
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
        setDir(1);
        setIndex(i => i + 1);
    }, [current, answered, isLast, answers, submit]);

    const goBack = useCallback(() => {
        setError('');
        setDir(-1);
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
            // Krátká pauza, ať člověk stihne vidět, co vybral, než se posune.
            if (!isLast) {
                setDir(1);
                setTimeout(() => setIndex(i => i + 1), 220);
            }
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

    if (!current && status !== 'rejected') return null;

    const rejected = status === 'rejected';

    return (
        <MotionConfig reducedMotion="user">
            {/* Blok drží stejnou osu jako nadpis stránky nad ním, obsah uvnitř
                zůstává vlevo, protože možnosti se tak čtou rychleji. */}
            <div className="mx-auto w-full max-w-[560px]">
                {!rejected && (
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-white/50 tabular-nums">
                            Otázka {index + 1} ze {questions.length}
                        </span>
                        <span className="flex flex-1 gap-1" aria-hidden="true">
                            {questions.map((q, i) => (
                                <span key={q.key} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/15">
                                    <motion.span
                                        className="block h-full origin-left rounded-full bg-brand-red"
                                        initial={false}
                                        animate={{ scaleX: i <= index ? 1 : 0 }}
                                        transition={{ type: 'spring', duration: 0.4, bounce: 0 }}
                                    />
                                </span>
                            ))}
                        </span>
                    </div>
                )}

                <AnimatePresence mode="wait" initial={false} custom={dir}>
                    <motion.div
                        key={rejected ? 'rejected' : current.key}
                        custom={dir}
                        variants={blockV}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={rejected ? '' : 'mt-7 md:mt-9'}
                    >
                        {rejected ? (
                            <div role="status">
                                <motion.h2
                                    variants={itemV}
                                    className="text-[28px] md:text-[40px] font-bold tracking-[-0.03em] leading-[1.1] text-balance"
                                >
                                    Díky za upřímnost
                                </motion.h2>
                                <motion.p variants={itemV} className="mt-5 max-w-[46ch] text-[18px] md:text-[21px] text-white/70 leading-[1.5] text-pretty">
                                    Podle toho, co jsi vyplnil, by ti společná práce teď nedávala smysl a nechci ti brát čas ani peníze
                                </motion.p>
                                <motion.p variants={itemV} className="mt-4 max-w-[46ch] text-[18px] md:text-[21px] text-white/70 leading-[1.5] text-pretty">
                                    Nechávám tě v mailech, posílám tam věci, které ti pomůžou i bez nás. Až se to změní, ozvi se
                                </motion.p>
                            </div>
                        ) : (
                            <>
                                <motion.h2
                                    variants={itemV}
                                    className="max-w-[28ch] text-[24px] md:text-[34px] font-bold tracking-[-0.03em] leading-[1.14] text-balance"
                                >
                                    {current.question}
                                </motion.h2>
                                {current.hint && (
                                    <motion.p variants={itemV} className="mt-3 max-w-[52ch] text-[15px] md:text-[17px] text-white/50 leading-[1.5] text-pretty">
                                        {current.hint}
                                    </motion.p>
                                )}

                                <div className="mt-6 md:mt-7">
                                    {current.kind === 'choice' ? (
                                        <div className="flex flex-col gap-2">
                                            {current.options.map((o, i) => {
                                                const active = value === o.value;
                                                return (
                                                    <motion.button
                                                        key={o.value}
                                                        variants={itemV}
                                                        type="button"
                                                        onClick={() => choose(current.key, o.value)}
                                                        aria-pressed={active}
                                                        whileTap={{ scale: 0.985 }}
                                                        className={`flex w-full items-center gap-4 rounded-xl border px-4 py-3.5 text-left text-[16px] md:text-[18px] transition-[color,border-color] duration-200 ${
                                                            active
                                                                ? 'border-brand-red text-white'
                                                                : 'border-white/15 text-white/70 hover:border-white/40 hover:text-white'
                                                        }`}
                                                    >
                                                        <span
                                                            aria-hidden="true"
                                                            className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border text-[13px] font-bold transition-[color,border-color,background-color] duration-200 ${
                                                                active ? 'border-brand-red bg-brand-red text-white' : 'border-white/25 text-white/55'
                                                            }`}
                                                        >
                                                            {LETTERS[i]}
                                                        </span>
                                                        {o.label}
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <motion.input
                                            variants={itemV}
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
                                            className="h-14 w-full rounded-xl border border-white/20 bg-transparent px-4 text-[19px] text-white placeholder:text-white/35 transition-colors duration-200 hover:border-white/40 focus:outline-none focus-visible:border-white"
                                        />
                                    )}
                                </div>

                                <motion.div variants={itemV} className="mt-7 flex flex-wrap items-center gap-5">
                                    {(current.kind !== 'choice' || isLast) && (
                                        <motion.button
                                            type="button"
                                            onClick={goNext}
                                            disabled={status === 'submitting'}
                                            whileTap={{ scale: 0.96 }}
                                            className="relative h-13 overflow-hidden rounded-full bg-brand-red px-9 text-base font-bold text-white transition-colors duration-200 hover:bg-[#d40c00] disabled:cursor-wait disabled:opacity-70"
                                        >
                                            {/* Neviditelná kopie drží šířku, ať tlačítko při změně textu neposkočí */}
                                            <span className="invisible" aria-hidden="true">
                                                {isLast ? 'Odeslat přihlášku' : 'Pokračovat'}
                                            </span>
                                            <AnimatePresence mode="popLayout" initial={false}>
                                                <motion.span
                                                    key={status === 'submitting' ? 'sending' : 'idle'}
                                                    initial={{ opacity: 0, filter: 'blur(4px)' }}
                                                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                                                    exit={{ opacity: 0, filter: 'blur(4px)' }}
                                                    transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                                                    className="absolute inset-0 grid place-items-center"
                                                >
                                                    {status === 'submitting' ? 'Odesílám' : isLast ? 'Odeslat přihlášku' : 'Pokračovat'}
                                                </motion.span>
                                            </AnimatePresence>
                                        </motion.button>
                                    )}

                                    {index > 0 && (
                                        <button
                                            type="button"
                                            onClick={goBack}
                                            className="min-h-10 text-sm text-white/45 underline underline-offset-4 transition-colors duration-200 hover:text-white"
                                        >
                                            Zpět
                                        </button>
                                    )}
                                </motion.div>
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>

                <AnimatePresence>
                    {(error || status === 'error') && (
                        <motion.p
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                            className="mt-4 text-sm text-brand-red"
                            role="alert"
                        >
                            {error || 'Nepovedlo se to odeslat, zkus to prosím znovu'}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        </MotionConfig>
    );
};
