"use client";

import React from 'react';
import { FadeUp } from './FadeUp';

interface PackItem {
    title: string;
    description: string;
    image: string;
    isWide?: boolean;
}

const packItems: PackItem[] = [
    {
        title: "Brandová Analýza",
        description: "Kompletní rentgen tvé situace ještě před hovorem. Přicházíme připravení — žádné úvodní otázky, rovnou na věc.",
        image: "/images/starter-pack/brand_analysis.jpg"
    },
    {
        title: "Strategický Call",
        description: "60 minut na Miro Board. Positioning, obsah, monetizace, funnel. Odcházíš s přesným přehledem kde ztrácíš a proč.",
        image: "/images/starter-pack/diagnostic_call.png"
    },
    {
        title: "Creator Map™",
        description: "Písemný plán na míru po callu. Slabá místa, 3 prioritní změny a konkrétní kroky na příštích 4 týdny. Tvoje osobní mapa růstu.",
        image: "/images/starter-pack/creator_map.png"
    },
    {
        title: "Content Framework Pack™",
        description: "Storytelling Reels Framework, Viral Hook Library, Pre-Posting Checklist. Systémy které používáme denně — rovnou použitelné.",
        image: "/images/starter-pack/content_frameworks.png",
        isWide: true
    },
    {
        title: "Creator OS™",
        description: "Content Planner, Task Planner, Publish Tracker. Kompletní operační systém tvůrce — přesně to co potřebuješ aby Instagram přestal být chaos.",
        image: "/images/starter-pack/creator_os.png",
        isWide: true
    }
];

export const CreatorStarterPack = () => {
    return (
        <section className="py-24 px-4 relative z-50 bg-transparent">
            <div className="max-w-5xl mx-auto w-full">
                <FadeUp>
                    <div className="text-center mb-16">
                        <h2 className="text-[32px] md:text-[48px] font-bold text-white tracking-tight-custom leading-[0.9] mb-8">
                            Co dostaneš v <span className="text-brand-red">Creator Starter Pack</span>
                        </h2>

                        {/* Process Flow Visualization */}
                        <div className="flex flex-col md:flex-row items-center justify-center gap-y-4 md:gap-x-8 text-sm md:text-lg lg:text-xl font-bold tracking-tight md:tracking-[0.1em] uppercase whitespace-nowrap py-2 w-full">
                            {[
                                "Vyplníš dotazník",
                                "Strategický Call",
                                "Plán na míru",
                                "Implementuješ"
                            ].map((step, index, array) => (
                                <React.Fragment key={step}>
                                    <span className="text-gray-300 transition-colors shrink-0">{step}</span>
                                    {index < array.length - 1 && (
                                        <svg className="w-5 h-5 md:w-6 md:h-6 text-brand-red shrink-0 rotate-90 md:rotate-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M5 12h14m-7-7 7 7-7 7" />
                                        </svg>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </FadeUp>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                    {packItems.map((item, i) => (
                        <div
                            key={i}
                            className={`
                                ${i < 3 ? 'lg:col-span-2' : 'lg:col-span-3'} 
                                ${item.isWide ? 'md:col-span-2 lg:col-span-3' : ''}
                            `}
                        >
                            <FadeUp delay={i * 0.1} className="h-full">
                                <div
                                    className={`bg-[#151515] rounded-2xl border border-white/10 p-6 h-full flex flex-col items-center text-center group ${item.isWide ? 'lg:flex-row lg:text-left lg:items-center lg:gap-8 lg:py-4 lg:px-10' : ''}`}
                                >
                                    {/* Image Container */}
                                    <div className={`w-full mb-6 relative ${item.isWide ? 'lg:order-2 lg:mb-0 lg:flex-1' : ''}`}>
                                        <div
                                            className={`rounded-xl overflow-hidden relative ${item.isWide ? 'h-[200px] md:h-[280px]' : 'h-[160px] md:h-[200px]'}`}
                                            style={i < 3 ? {
                                                maskImage: 'linear-gradient(to bottom, black 20%, rgba(0,0,0,0.8) 50%, transparent 100%)',
                                                WebkitMaskImage: 'linear-gradient(to bottom, black 20%, rgba(0,0,0,0.8) 50%, transparent 100%)'
                                            } : undefined}
                                        >
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className={`w-full h-full object-contain ${item.isWide ? 'p-1' : 'p-2'}`}
                                            />
                                        </div>
                                    </div>

                                    <div className={`max-w-sm ${item.isWide ? 'lg:flex-1 lg:max-w-none' : ''}`}>
                                        <h3 className="text-lg md:text-xl font-bold text-white mb-2 tracking-tight leading-tight">
                                            {item.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm leading-relaxed font-sans">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            </FadeUp>
                        </div>
                    ))}
                </div>

                {/* Section CTA */}
                <div className="mt-16 flex justify-center">
                    <FadeUp delay={0.6}>
                        <a
                            href="#starterpackoffer"
                            className="bg-[#FF0E00] hover:bg-[#cc0b00] text-white px-10 md:px-14 py-4 rounded-full text-lg md:text-xl font-bold tracking-tight-custom transition-all inline-block shadow-lg shadow-brand-red/20"
                        >
                            Jdu do toho
                        </a>
                    </FadeUp>
                </div>

            </div>
        </section>
    );
};
