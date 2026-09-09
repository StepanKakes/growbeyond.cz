"use client";

import React, { useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';

// Dotazník na děkovačce, druhý ze dvou kroků registrace. Nepovinný, ale
// odpovědi řeknou, o čem s tím člověkem mluvit, a týmu, komu se vyplatí
// napsat osobně ještě před webinářem.
//
// Otázky drží stejný jazyk jako přihláška po webináři, aby na sebe
// odpovědi navazovaly a daly se porovnat před a po.

type Choice = { value: string; label: string };

// Každá odpověď odpovídá jedné části webináře, takže je z ní vidět,
// co tomu člověku sedne.
const STUCK: Choice[] = [
    { value: 'znamost', label: 'Jsem dobrý v tom, co dělám, ale ví o mně málo lidí' },
    { value: 'kapacita', label: 'Mám dost lidí, ale nestíhám to' },
    { value: 'obsah', label: 'Tvořím obsah, ale nepřitahuje správné lidi' },
    { value: 'nabidka', label: 'Mám co nabídnout, ale těžko se to prodává' },
    { value: 'nevim', label: 'Nevím, právě to chci zjistit' },
];

const REVENUE: Choice[] = [
    { value: 'rozjezd', label: 'Ještě to nemám rozjeté' },
    { value: 'do-100', label: 'Do 100 tisíc měsíčně' },
    { value: '100-300', label: '100 až 300 tisíc měsíčně' },
    { value: '300-1m', label: '300 tisíc až milion měsíčně' },
    { value: 'nad-1m', label: 'Přes milion měsíčně' },
];

const LETTERS = 'ABCDE';

const itemV = {
    hidden: { opacity: 0, y: 10, filter: 'blur(4px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring' as const, duration: 0.34, bounce: 0 } },
};

const groupV = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.045 } },
};

const Group = ({
    question,
    options,
    value,
    onChange,
}: {
    question: string;
    options: Choice[];
    value: string;
    onChange: (v: string) => void;
}) => (
    <motion.fieldset variants={groupV} className="m-0 border-0 p-0">
        <motion.legend variants={itemV} className="mb-4 text-[19px] md:text-[22px] font-bold tracking-[-0.02em] leading-[1.2]">
            {question}
        </motion.legend>
        <div className="flex flex-col gap-2">
            {options.map((o, i) => {
                const active = value === o.value;
                return (
                    <motion.button
                        key={o.value}
                        variants={itemV}
                        type="button"
                        onClick={() => onChange(o.value)}
                        aria-pressed={active}
                        whileTap={{ scale: 0.985 }}
                        className={`flex w-full items-center gap-4 rounded-xl border px-4 py-3.5 text-left text-[16px] md:text-[18px] transition-[color,border-color] duration-200 ${
                            active ? 'border-brand-red text-white' : 'border-white/15 text-white/70 hover:border-white/40 hover:text-white'
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
    </motion.fieldset>
);

export const QualifyForm = ({ token }: { token: string }) => {
    const [stuck, setStuck] = useState('');
    const [revenue, setRevenue] = useState('');
    const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');

    const ready = Boolean(stuck && revenue);

    const submit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        if (status === 'submitting' || !ready) return;
        setStatus('submitting');
        try {
            const res = await fetch('/api/webinar/kvalifikace', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, stuck, revenue }),
            });
            setStatus(res.ok ? 'done' : 'error');
        } catch {
            setStatus('error');
        }
    };

    return (
        <MotionConfig reducedMotion="user">
            <AnimatePresence mode="wait" initial={false}>
                {status === 'done' ? (
                    <motion.p
                        key="done"
                        initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        transition={{ type: 'spring', duration: 0.34, bounce: 0 }}
                        className="text-[18px] md:text-[21px] text-white/70 leading-[1.5]"
                        role="status"
                    >
                        Díky, mám to. Uvidíme se na webináři
                    </motion.p>
                ) : (
                    <motion.form
                        key="form"
                        onSubmit={submit}
                        variants={groupV}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, y: -12, filter: 'blur(4px)', transition: { duration: 0.15, ease: 'easeIn' } }}
                        className="flex flex-col gap-10"
                    >
                        <Group question="Kde teď nejvíc cítíš, že ses zasekl?" options={STUCK} value={stuck} onChange={setStuck} />
                        <Group question="Kolik ti dnes byznys měsíčně vydělává?" options={REVENUE} value={revenue} onChange={setRevenue} />

                        <motion.div variants={itemV} className="flex flex-wrap items-center gap-4">
                            <motion.button
                                type="submit"
                                disabled={!ready || status === 'submitting'}
                                whileTap={{ scale: 0.96 }}
                                className="relative h-13 overflow-hidden rounded-full bg-brand-red px-9 text-base font-bold text-white transition-colors duration-200 hover:bg-[#d40c00] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <span className="invisible" aria-hidden="true">Odeslat</span>
                                <AnimatePresence mode="popLayout" initial={false}>
                                    <motion.span
                                        key={status === 'submitting' ? 'sending' : 'idle'}
                                        initial={{ opacity: 0, filter: 'blur(4px)' }}
                                        animate={{ opacity: 1, filter: 'blur(0px)' }}
                                        exit={{ opacity: 0, filter: 'blur(4px)' }}
                                        transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                                        className="absolute inset-0 grid place-items-center"
                                    >
                                        {status === 'submitting' ? 'Ukládám' : 'Odeslat'}
                                    </motion.span>
                                </AnimatePresence>
                            </motion.button>
                            {status === 'error' && (
                                <p className="text-sm text-brand-red" role="alert">
                                    Nepovedlo se to uložit, zkus to prosím znovu
                                </p>
                            )}
                        </motion.div>
                    </motion.form>
                )}
            </AnimatePresence>
        </MotionConfig>
    );
};
