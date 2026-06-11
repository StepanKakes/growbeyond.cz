"use client";

import React from 'react';
import { motion } from 'motion/react';
import { FadeUp } from '../FadeUp';
import { SocialProof } from '../SocialProof';
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

export const StrategieHero = ({ ctaScrollTo, ctaLabel = 'Trénink zdarma', showVideoPreview = false, showSocialProof = true }: { ctaScrollTo?: string; ctaLabel?: string; showVideoPreview?: boolean; showSocialProof?: boolean }) => {
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
                                Abys svůj program prodával/a kvalitnějším klientům a&nbsp;každý měsíc stabilně dosahoval/a šestimístných příjmů
                            </span>
                        </p>
                    </div>
                </motion.div>

                {/* Náhled videa (nad CTA) — klik otevře opt-in popup */}
                {showVideoPreview && (
                    <FadeUp delay={0.25}>
                        <div
                            role="button"
                            tabIndex={0}
                            onClick={handleCta}
                            className="group w-[92vw] max-w-[560px] mx-auto mb-6 cursor-pointer"
                        >
                            <div className="relative rounded-xl overflow-hidden border border-white/15 aspect-video bg-[#151515] shadow-xl">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/images/vsl-nahled.png"
                                    alt="Náhled strategického videa"
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                />
                                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                    <span className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/15 border border-white/50 flex items-center justify-center transition-all group-hover:bg-white/25 group-hover:scale-110">
                                        <svg className="w-6 h-6 md:w-7 md:h-7 text-white relative left-0.5 drop-shadow" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </FadeUp>
                )}

                <button
                    type="button"
                    onClick={handleCta}
                    className="bg-brand-red hover:bg-[#cc0b00] text-white px-9 py-4 rounded-full text-sm md:text-lg font-bold tracking-tight-custom transition-colors inline-block uppercase"
                >
                    {ctaLabel}
                </button>

                {showSocialProof && (
                    <div className="mt-6 flex justify-center">
                        <SocialProof />
                    </div>
                )}
            </div>
        </section>
    );
};
