"use client";

import React from 'react';
import { motion } from 'motion/react';
import { FadeUp } from '../FadeUp';
import { SocialProof } from '../SocialProof';
import { StrategieVideoTeaser } from './StrategieVideoTeaser';
import { openStrategieForm } from './strategieForm';

const wavyUnderline = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 12' fill='none' preserveAspectRatio='none'%3E%3Cpath d='M2 9C100 3 300 3 398 9' stroke='%23FF0E00' stroke-width='4' stroke-linecap='round' /%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat' as const,
    backgroundPosition: 'left bottom' as const,
    backgroundSize: '100% 10px',
    WebkitBoxDecorationBreak: 'clone' as const,
    boxDecorationBreak: 'clone' as React.CSSProperties['boxDecorationBreak'],
    paddingBottom: '8px',
};

export const StrategieHero = ({ ctaScrollTo, ctaLabel = 'Trénink zdarma', showVideoPreview = false }: { ctaScrollTo?: string; ctaLabel?: string; showVideoPreview?: boolean }) => {
    const handleCta = () => {
        if (ctaScrollTo) {
            document.getElementById(ctaScrollTo)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            openStrategieForm();
        }
    };
    return (
        <section className="relative pt-20 pb-4 px-4 z-10 flex flex-col items-center overflow-hidden">
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

            <div className="max-w-[1200px] mx-auto w-full text-center relative z-20 flex flex-col items-center pt-3">
                {/* Callout */}
                <FadeUp>
                    <h2 className="text-[22px] md:text-[32px] font-bold text-white mb-3 tracking-tight-custom leading-[1.5]">
                        Jsi <span className="bg-brand-red text-white px-1.5 md:px-2.5">kouč</span>, <span className="bg-brand-red text-white px-1.5 md:px-2.5">mentor</span> nebo <span className="bg-brand-red text-white px-1.5 md:px-2.5">konzultant</span>?
                    </h2>
                </FadeUp>

                {/* Hlavní nadpis */}
                <FadeUp delay={0.1}>
                    <h1 className="text-[30px] md:text-[54px] font-bold text-white tracking-tight-custom leading-[1.5] max-w-[22ch] md:max-w-[34ch] mx-auto mb-4">
                        <span style={{ backgroundColor: '#FF0E00', WebkitBoxDecorationBreak: 'clone', boxDecorationBreak: 'clone', padding: '0.06em 0.28em' }}>
                            Dostaň svůj coaching na stabilních 500+&nbsp;tisíc měsíčně
                        </span>
                    </h1>
                </FadeUp>

                {/* Podnadpis z growbeyond.cz */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }}>
                    <div className="mb-5 max-w-2xl mx-auto px-2">
                        <p className="text-[19px] md:text-[26px] text-white font-medium leading-[1.6]">
                            <span style={wavyUnderline}>
                                Abys svůj program, koučink nebo konzultace prodával/a kvalitnějším klientům a&nbsp;každý měsíc stabilně dosahoval/a šestimístných příjmů
                            </span>
                        </p>
                    </div>
                </motion.div>

                {/* Náhled videa (nad CTA) */}
                {showVideoPreview && (
                    <FadeUp delay={0.25}>
                        <div className="w-full">
                            <StrategieVideoTeaser />
                        </div>
                    </FadeUp>
                )}

                <FadeUp delay={0.3}>
                    <button
                        type="button"
                        onClick={handleCta}
                        className="bg-brand-red hover:bg-[#cc0b00] text-white px-9 py-4 rounded-full text-sm md:text-lg font-bold tracking-tight-custom transition-all inline-block uppercase hover:scale-105"
                    >
                        {ctaLabel}
                    </button>
                </FadeUp>

                <FadeUp delay={0.45}>
                    <div className="mt-6 flex justify-center">
                        <SocialProof />
                    </div>
                </FadeUp>
            </div>
        </section>
    );
};
