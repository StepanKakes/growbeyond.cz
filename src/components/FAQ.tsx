"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeUp } from './FadeUp';

interface FAQItem {
    question: string;
    answer: React.ReactNode;
}

const faqData: FAQItem[] = [
    {
        question: "Co když s brandem teprve začínám?",
        answer: "To je v pohodě. Creator Starter Pack je postavený jak pro lidi kteří začínají, tak pro lidi co tvoří obsah bez jasného systému. Projdeme tvou situaci od základů a nastavíme kroky které dávají smysl právě pro tebe."
    },
    {
        question: "S čím přesně odejdu?",
        answer: "S písemným dokumentem — Creator Map™. Analýza tvé aktuální situace, 3 prioritní změny a přesný plán na příštích 4 týdny. Plus přístup k Content Framework Pack™ a Creator OS™ — šablony a systémy které používáme denně."
    },
    {
        question: "Co se přesně stane na callu?",
        answer: "60 minut živé práce. Projdeme tvůj positioning, obsah, monetizaci a funnel. Ukážu ti přesně kde ztrácíš sledující, pozornost a peníze — a nastavíme konkrétní kroky co dělat dál."
    },
    {
        question: "Musím mít připravené nějaké materiály?",
        answer: "Před hovorem vyplníš krátký dotazník — Brandovou Analýzu. To je vše. Na call přicházíme připravení my, ne ty."
    },
    {
        question: "Jak rychle uvidím výsledky?",
        answer: "Většina klientů vidí první posun během 3–5 týdnů od callu. Výsledky závisí na tvé situaci a jak rychle implementuješ — nejsou garantované."
    },
    {
        question: "Co když chci intenzivnější spolupráci?",
        answer: (
            <span>
                Creator Starter Pack je skvělý první krok — ale pokud víš že chceš víc než jednorázovou konzultaci, máme i možnost dlouhodobé 1:1 spolupráce.{" "}
                <a
                    href="https://calendly.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-red font-bold hover:underline"
                >
                    Domluv si call zde.
                </a>
            </span>
        )
    }
];

export const FAQ = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section className="py-24 md:py-32 px-4 relative z-20 bg-transparent">
            <div className="max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
                    {/* Left Column: Signature Typography Heading */}
                    <div className="lg:col-span-12 xl:col-span-5">
                        <FadeUp>
                            <h2 className="text-[48px] sm:text-[64px] lg:text-[100px] font-bold text-white tracking-tight-custom leading-[0.95]">
                                Máš ještě <br />
                                <span className="text-brand-red italic font-serif font-normal block mt-2">otázky?</span>
                            </h2>
                        </FadeUp>
                    </div>

                    {/* Right Column: Accordion List with Line Dividers */}
                    <div className="lg:col-span-12 xl:col-span-7">
                        <div className="border-t border-white/10">
                            {faqData.map((item, index) => (
                                <div key={index} className="border-b border-white/10">
                                    <FadeUp delay={index * 0.1}>
                                        <button
                                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                            className="w-full py-6 md:py-8 text-left flex items-center justify-between transition-colors outline-none group"
                                        >
                                            <span className="text-lg md:text-xl font-bold text-white pr-8 group-hover:text-white/80 transition-colors">
                                                {item.question}
                                            </span>
                                            <svg
                                                className={`w-5 h-5 md:w-6 md:h-6 text-white/40 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth="2.5"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        <AnimatePresence initial={false}>
                                            {openIndex === index && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
                                                >
                                                    <div className="pb-8 text-gray-400 font-sans text-base md:text-lg leading-relaxed max-w-[90%]">
                                                        {item.answer}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </FadeUp>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
