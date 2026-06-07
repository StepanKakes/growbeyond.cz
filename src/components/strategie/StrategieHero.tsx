"use client";

import React from 'react';
import { motion } from 'motion/react';
import { FadeUp } from '../FadeUp';

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
        <section className="relative pt-24 pb-6 px-4 z-10 flex flex-col items-center overflow-hidden">
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

            <div className="max-w-[1100px] mx-auto w-full text-center relative z-20 flex flex-col items-center pt-8">
                <FadeUp>
                    <span className="inline-block mb-6 px-4 py-1.5 rounded-full border border-brand-red/40 bg-brand-red/10 text-white text-[11px] md:text-sm font-bold uppercase tracking-wider">
                        Zdarma · Pro kouče, mentory a konzultanty
                    </span>
                </FadeUp>

                {/* Callout headline — dvouřádkový s červeným zvýrazněním */}
                <div className="flex flex-col items-center gap-2 md:gap-3 mb-8 w-full">
                    <div className="relative inline-block px-3 py-1 md:py-2">
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.2, duration: 0.8, ease: 'easeInOut' }}
                            className="absolute inset-0 bg-brand-red origin-left"
                        />
                        <h1 className="relative z-10 text-[30px] md:text-[56px] font-bold text-white tracking-tight-custom leading-none">
                            Statisícový funnel,
                        </h1>
                    </div>
                    <div className="relative inline-block px-3 py-1 md:py-2">
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.6, duration: 0.8, ease: 'easeInOut' }}
                            className="absolute inset-0 bg-brand-red origin-left"
                        />
                        <h1 className="relative z-10 text-[30px] md:text-[56px] font-bold text-white tracking-tight-custom leading-none">
                            krok za krokem na videu
                        </h1>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1 }}
                >
                    <div className="mb-9 max-w-2xl mx-auto px-2">
                        <p className="text-[19px] md:text-[26px] text-white font-medium leading-[1.6]">
                            Vyplň krátký dotazník níže a&nbsp;hned se ti{' '}
                            <span style={redUnderline}>odemkne strategické video</span>, kde ti ukážeme přesný funnel, kterým prodáváš svůj program kvalitnějším klientům a&nbsp;děláš stabilně šestimístné měsíce.
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
                        Zabere ti to 2 minuty · video se odemkne okamžitě
                    </p>
                </FadeUp>
            </div>
        </section>
    );
};
