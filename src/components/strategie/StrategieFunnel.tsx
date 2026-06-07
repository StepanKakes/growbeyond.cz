"use client";

import React from 'react';
import { FadeUp } from '../FadeUp';
import { openStrategieForm } from './strategieForm';

const reveals = [
    {
        tag: 'Odhalení #1',
        title: 'Positioning, který přitahuje platící klienty',
        desc: 'Jak nastavit profil tak, aby tě oslovovali jen lidé ochotní platit tvé ceny, a přestali ti psát „kolik to stojí?" ti, co stejně nekoupí.',
    },
    {
        tag: 'Odhalení #2',
        title: 'Funnel, který za tebe prodává',
        desc: 'Přesná cesta, kterou diváka „zahřeješ" a dovedeš k nákupu ve správný moment, i když máš teď jen pár stovek sledujících.',
    },
    {
        tag: 'Odhalení #3',
        title: 'Nabídka a systém, co šetří čas',
        desc: 'Jak postavit nabídku, která lidi zvedne ze židle, a procesy, díky kterým ti tvorba obsahu zabere polovinu času a přitom reálně vydělává.',
    },
];

const forYou = [
    'Jsi kouč, mentor nebo konzultant (nebo se jím chceš stát) a chceš z toho stabilní příjem.',
    'Máš co nabídnout a chceš to prodávat kvalitnějším klientům za vyšší ceny.',
    'Jsi ochotný/á do svého růstu reálně investovat čas i peníze.',
    'Chceš funnel, který funguje dlouhodobě, ne jednorázový hack.',
    'Jsi připravený/á jednat, ne jen sbírat další obsah „zdarma".',
];

const notForYou = [
    'Hledáš zázrak přes noc bez práce.',
    'Nechceš do sebe investovat ani korunu.',
    'Spokojíš se s náhodnými klienty a nepravidelným příjmem.',
    'Chceš „virální triky" místo funkčního systému.',
];

export const StrategieCta = ({ label = 'Chci video zdarma' }: { label?: string }) => (
    <div className="pt-2 flex justify-center relative z-20">
        <button
            type="button"
            onClick={openStrategieForm}
            className="bg-brand-red hover:bg-[#cc0b00] text-white px-10 py-5 rounded-full text-lg md:text-xl font-bold tracking-tight-custom transition-all inline-block uppercase hover:scale-105"
        >
            {label}
        </button>
    </div>
);

export const StrategieReveal = () => {
    return (
        <section className="py-16 px-4 relative z-20">
            <div className="max-w-[1100px] mx-auto w-full">
                <FadeUp>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight-custom leading-[1.1] text-center">
                        Co se ve videu <span className="font-serif italic font-normal text-brand-red">zdarma</span> dozvíš:
                    </h2>
                    <p className="text-gray-300 text-base md:text-lg text-center max-w-2xl mx-auto mb-14">
                        Žádná teorie navíc. Tři věci, které u koučů, mentorů a konzultantů rozhodují o tom, jestli z Instagramu budou peníze.
                    </p>
                </FadeUp>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {reveals.map((r, i) => (
                        <FadeUp key={i} delay={0.1 * i}>
                            <div className="h-full bg-[#131313] border border-white/10 rounded-xl p-7 md:p-8 flex flex-col gap-4">
                                <span className="self-start px-3 py-1 rounded-full bg-brand-red/15 text-brand-red text-xs font-bold uppercase tracking-wider">
                                    {r.tag}
                                </span>
                                <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight-custom leading-tight">
                                    {r.title}
                                </h3>
                                <p className="text-gray-300 text-[15px] md:text-base leading-relaxed">
                                    {r.desc}
                                </p>
                            </div>
                        </FadeUp>
                    ))}
                </div>
            </div>
        </section>
    );
};

export const StrategieForWho = () => {
    return (
        <section className="py-16 px-4 relative z-20">
            <div className="max-w-[1000px] mx-auto w-full">
                <FadeUp>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-14 tracking-tight-custom leading-[1.1] text-center">
                        Je tohle video pro tebe?
                    </h2>
                </FadeUp>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pro tebe */}
                    <FadeUp>
                        <div className="h-full bg-[#131313] border border-brand-red/30 rounded-xl p-7 md:p-8">
                            <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight-custom mb-6">
                                Je to pro tebe, pokud:
                            </h3>
                            <ul className="flex flex-col gap-4">
                                {forYou.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-gray-200 text-[15px] md:text-base leading-relaxed">
                                        <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-brand-red flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                                        </span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </FadeUp>

                    {/* Není pro tebe */}
                    <FadeUp delay={0.1}>
                        <div className="h-full bg-[#0F0F0F] border border-white/10 rounded-xl p-7 md:p-8">
                            <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight-custom mb-6">
                                Není to pro tebe, pokud:
                            </h3>
                            <ul className="flex flex-col gap-4">
                                {notForYou.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-gray-400 text-[15px] md:text-base leading-relaxed">
                                        <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                                            <svg className="w-3 h-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                        </span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </FadeUp>
                </div>
            </div>
        </section>
    );
};
