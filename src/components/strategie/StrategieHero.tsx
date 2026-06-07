"use client";

import React from 'react';
import { motion } from 'motion/react';
import { FadeUp } from '../FadeUp';
import { SocialProof } from '../SocialProof';

const redUnderline = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 12' fill='none' preserveAspectRatio='none'%3E%3Cpath d='M2 9C100 3 300 3 398 9' stroke='%23FF0E00' stroke-width='4' stroke-linecap='round' /%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat' as const,
    backgroundPosition: 'left bottom' as const,
    backgroundSize: '100% 10px',
    WebkitBoxDecorationBreak: 'clone' as const,
    boxDecorationBreak: 'clone' as React.CSSProperties['boxDecorationBreak'],
    paddingBottom: '8px',
};

export const StrategieHero = () => {
    return (
        <section className="relative pt-24 pb-8 px-4 z-10 flex flex-col items-center overflow-hidden">
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: `url('/images/hero/Still%202026-03-12%20235253.jpg')`,
                    backgroundPosition: 'center top',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    maskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
                    opacity: 0.8,
                }}
            />

            <div className="max-w-[1100px] mx-auto w-full text-center relative z-20 flex flex-col items-center pt-6">
                {/* Qualifier badge */}
                <FadeUp>
                    <span className="inline-flex items-center gap-2 mb-7 px-4 py-2 rounded-full border border-brand-red/50 bg-brand-red/10 text-white text-[11px] md:text-sm font-bold uppercase tracking-wider">
                        🎯 Jen pro kouče, mentory a&nbsp;konzultanty, co to s&nbsp;růstem myslí vážně
                    </span>
                </FadeUp>

                {/* Hero headline — formát „Jak [vyřešit pain] a [dosáhnout výsledku]" */}
                <FadeUp delay={0.1}>
                    <h1 className="text-[30px] md:text-[56px] font-bold text-white tracking-tight-custom leading-[1.1] max-w-[18ch] md:max-w-[20ch] mx-auto mb-7">
                        Jak proměnit svůj Instagram v&nbsp;podnikání, které ti každý měsíc{' '}
                        <span style={redUnderline}>stabilně vydělává šestimístně</span>
                    </h1>
                </FadeUp>

                {/* Subhead — „aniž bys" negativy */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                >
                    <div className="mb-8 max-w-2xl mx-auto px-2">
                        <p className="text-[18px] md:text-[25px] text-white font-medium leading-[1.6]">
                            Vyplň krátký dotazník a&nbsp;hned se ti odemkne video, kde ti krok za krokem ukážeme přesný funnel, kterým prodáváš svůj program kvalitnějším klientům — bez tlačení na&nbsp;sílu, bez vypalování tisíců do&nbsp;reklam a&nbsp;bez hodin nad obsahem, který stejně neprodává.
                        </p>
                    </div>
                </motion.div>

                <FadeUp delay={0.3}>
                    <a
                        href="#apply"
                        className="bg-brand-red hover:bg-[#cc0b00] text-white px-9 py-4 rounded-full text-sm md:text-lg font-bold tracking-tight-custom transition-all inline-block uppercase hover:scale-105"
                    >
                        Chci video zdarma
                    </a>
                    <p className="text-gray-400 text-xs md:text-sm mt-4">
                        Zabere ti to 2&nbsp;minuty · video se odemkne okamžitě
                    </p>
                </FadeUp>

                <FadeUp delay={0.45}>
                    <div className="mt-10 flex justify-center">
                        <SocialProof />
                    </div>
                </FadeUp>
            </div>
        </section>
    );
};
