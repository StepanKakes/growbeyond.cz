"use client";

import React from 'react';
import { motion } from 'motion/react';
import { FadeUp } from '../FadeUp';
import { SocialProof } from '../SocialProof';

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

            <div className="max-w-[1200px] mx-auto w-full text-center relative z-20 flex flex-col items-center pt-8">
                {/* Statický callout — stejný styl jako homepage, bez rotující bubliny */}
                <FadeUp>
                    <h2 className="text-[22px] md:text-[32px] font-bold text-white mb-5 tracking-tight-custom leading-[1.2]">
                        Jsi <span className="text-brand-red">kouč</span>, <span className="text-brand-red">mentor</span> nebo <span className="text-brand-red">konzultant</span>?
                    </h2>
                </FadeUp>

                {/* Hlavní nadpis — červené-bar styl jako homepage */}
                <div className="flex flex-col items-center gap-2 md:gap-3 mb-8 w-full">
                    <div className="relative inline-block px-3 py-1 md:py-2">
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.2, duration: 0.8, ease: 'easeInOut' }}
                            className="absolute inset-0 bg-brand-red origin-left"
                        />
                        <h1 className="relative z-10 text-[32px] md:text-[56px] font-bold text-white tracking-tight-custom leading-none">
                            Dostaň svůj coaching na
                        </h1>
                    </div>
                    <div className="relative inline-block px-3 py-1 md:py-2">
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.6, duration: 0.8, ease: 'easeInOut' }}
                            className="absolute inset-0 bg-brand-red origin-left"
                        />
                        <h1 className="relative z-10 text-[32px] md:text-[56px] font-bold text-white tracking-tight-custom leading-none">
                            stabilních 300–500&nbsp;tis. Kč měsíčně
                        </h1>
                    </div>
                </div>

                {/* Zkrácený podnadpis */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1 }}
                >
                    <div className="mb-9 max-w-xl mx-auto px-2">
                        <p className="text-[19px] md:text-[26px] text-white font-medium leading-[1.5]">
                            Vyplň krátký dotazník a&nbsp;hned se ti odemkne video s&nbsp;přesným funnelem, který to dělá za tebe.
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
