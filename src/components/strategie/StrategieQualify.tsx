"use client";

import React, { useState, useRef, useEffect } from 'react';
import { FadeUp } from '../FadeUp';
import { CalendlySection } from '../mentorship/CalendlySection';
import { trackVslEvent } from '@/lib/vslTrack';

// Přepracovaná otázka na problém + zbytek kvalifikace (bez otevřené otázky).
const problemOptions = [
    "Stagnace: Zasekl/a jsem se a nedaří se mi posunout dál.",
    "Nekonzistentní příjem: Jeden měsíc dobrý, druhý slabý.",
    "Plná kapacita: Časově to nestíhám odbavit, ale chci růst dál.",
    "Málo klientů: Nechodí dost poptávek.",
    "Začínám: Zatím (skoro) nevydělávám a chci to rozjet.",
];
const monetizationOptions = ["1:1 koučink nebo konzultace", "Skupinový program nebo mastermind", "Online kurz nebo digitální produkt", "Zatím neprodávám / teprve začínám"];
const budgetOptions = ["0 - 25 tisíc Kč", "25 - 50 tisíc Kč", "50 - 90 tisíc Kč", "90 - 150 tisíc Kč"];
const LOWEST_BUDGET = "0 - 25 tisíc Kč";

const STEPS = 3;

export const StrategieQualify = ({ leadId, email }: { leadId: string; email?: string }) => {
    const [step, setStep] = useState(1);
    const [data, setData] = useState({ q3: '', q4: '', q5: '', q6: '' });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const formRef = useRef<HTMLElement>(null);
    const startedRef = useRef(false);

    // form_viewed — formulář se dostal do viewportu
    useEffect(() => {
        const el = formRef.current;
        if (!el || !leadId) return;
        const obs = new IntersectionObserver((entries) => {
            if (entries.some(e => e.isIntersecting)) {
                trackVslEvent(leadId, 'form_viewed', email);
                obs.disconnect();
            }
        }, { threshold: 0.3 });
        obs.observe(el);
        return () => obs.disconnect();
    }, [leadId, email]);

    const submit = async (finalData: typeof data) => {
        setSubmitting(true);
        try {
            await fetch('/api/mentorship-qualify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: leadId, ...finalData }),
            });
        } catch { /* nezdar nesmí shodit rezervaci */ }
        setSubmitted(true);
        setSubmitting(false);
        setTimeout(() => document.getElementById('cal-booking')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
    };

    const choose = (field: keyof typeof data, value: string, options: number) => {
        if (!startedRef.current) {
            startedRef.current = true;
            trackVslEvent(leadId, 'form_started', email);
        }
        const next = { ...data, [field]: value };
        setData(next);
        setTimeout(() => {
            if (step < STEPS) setStep(step + 1);
            else submit(next);
        }, 150);
        void options;
    };

    if (submitted) {
        // Low budget → přímá diskvalifikace, bez druhé šance.
        if (data.q6 === LOWEST_BUDGET) {
            return (
                <Card>
                    <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight-custom mb-4">Díky za tvé odpovědi!</h3>
                    <p className="text-white text-base md:text-lg leading-relaxed max-w-xl mx-auto mb-4">
                        V dotazníku jsi uvedl/a rozpočet na růst 0–25 tisíc Kč. Buďme na rovinu, naše 1:1 spolupráce vyžaduje vyšší počáteční investici.
                    </p>
                    <p className="text-white text-base md:text-lg leading-relaxed max-w-xl mx-auto">
                        Vzhledem k tvému rozpočtu tahle 1:1 spolupráce pro tebe teď nejspíš není ta správná volba. Díky za tvůj čas a přejeme ti hodně úspěchů na cestě dál.
                    </p>
                </Card>
            );
        }
        return (
            <div className="w-full animate-[fadeIn_1s_ease-out]">
                <CalendlySection prefillEmail={email} followupEligible={data.q6 !== LOWEST_BUDGET} />
            </div>
        );
    }

    const stepData: { title: string; field: keyof typeof data; options: string[]; split: boolean }[] = [
        { title: 'Co tě teď nejvíc brzdí?', field: 'q3', options: problemOptions, split: true },
        { title: 'Jak aktuálně prodáváš?', field: 'q5', options: monetizationOptions, split: false },
        { title: 'Kolik jsi teď schopný/á jednorázově investovat do růstu? (ne měsíční platba)', field: 'q6', options: budgetOptions, split: false },
    ];
    const cur = stepData[step - 1];

    return (
        <section ref={formRef} className="pt-4 pb-12 px-4 relative z-20 w-full">
            <FadeUp>
                <div className="max-w-3xl mx-auto bg-[#131313] border border-white/10 rounded-xl p-6 md:p-10 min-h-[420px] flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 md:h-2 bg-white/5">
                        <div className="h-full bg-brand-red transition-all duration-500 ease-out" style={{ width: `${(step / STEPS) * 100}%` }} />
                    </div>

                    <div className="flex-1 flex flex-col mt-6">
                        <div className="flex items-center gap-3 mb-6">
                            {step > 1 && (
                                <button onClick={() => setStep(step - 1)} className="px-5 py-2 rounded-full border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-colors">Zpět</button>
                            )}
                            <span className="text-gray-500 text-sm">Krok {step} / {STEPS}</span>
                        </div>

                        <h3 className="text-xl md:text-2xl font-bold text-white mb-6">{step}. {cur.title}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                            {cur.options.map((opt, i) => {
                                const [t, desc] = cur.split
                                    ? [opt.split(':')[0], opt.split(':').slice(1).join(':').trim()]
                                    : [opt, ''];
                                const selected = data[cur.field] === opt;
                                return (
                                    <div key={i} onClick={() => choose(cur.field, opt, cur.options.length)}
                                        className={`p-5 rounded-xl border h-full cursor-pointer transition-colors flex flex-col items-center justify-center text-center gap-1.5 ${selected ? 'border-brand-red bg-brand-red text-white' : 'border-white/10 bg-[#1A1A1A] hover:bg-[#252525]'}`}>
                                        <span className="text-base md:text-lg font-bold leading-tight text-white">{t}</span>
                                        {desc && <span className={`text-xs md:text-sm leading-relaxed ${selected ? 'text-white/80' : 'text-white/70'}`}>{desc}</span>}
                                    </div>
                                );
                            })}
                        </div>
                        {submitting && (
                            <div className="flex items-center justify-center gap-2 mt-6 text-gray-400 text-sm">
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Připravuju rezervaci…
                            </div>
                        )}
                    </div>
                </div>
            </FadeUp>
        </section>
    );
};

const Card = ({ children }: { children: React.ReactNode }) => (
    <div className="w-full animate-[fadeIn_1s_ease-out]">
        <div className="max-w-3xl mx-auto bg-[#131313] border border-white/10 rounded-xl p-8 md:p-12 text-center">{children}</div>
    </div>
);
