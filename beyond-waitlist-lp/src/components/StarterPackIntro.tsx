"use client";

import React from 'react';
import { FadeUp } from './FadeUp';

export const StarterPackIntro = () => {
    return (
        <section id="starterpackintro" className="py-16 md:py-24 px-4 relative z-20 bg-transparent">
            <div className="max-w-3xl mx-auto w-full text-center">
                <FadeUp>
                    <h2 className="flex flex-col gap-2 mb-12">
                        <span className="text-[50px] md:text-[80px] lg:text-[100px] font-serif italic text-white tracking-tight-custom leading-[1] font-normal">
                            Co přesně je
                        </span>
                        <span className="text-brand-red font-sans font-bold not-italic text-[32px] md:text-[48px] lg:text-[56px] tracking-tight-custom leading-[1]">
                            Creator Starter Pack?
                        </span>
                    </h2>

                    <div className="space-y-6 text-white text-[16px] md:text-[18px] leading-relaxed font-sans tracking-wide text-left md:text-center">
                        <p>
                            Je to kompletní balíček pro tvůrce, kteří chtějí přestat hádat a začít stavět výdělečný osobní brand.
                        </p>
                        <p>
                            Získáš 1:1 konzultaci, kde projdeme tvůj brand do hloubky. Odejdeš s písemným plánem na míru — přesnými kroky co dělat jako první a systémy které používáme každý den. Vše na jednom místě, připravené k okamžitému použití.
                        </p>
                    </div>
                </FadeUp>
            </div>
        </section>
    );
};
