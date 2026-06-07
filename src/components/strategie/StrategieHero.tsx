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

                {/* Hlavní nadpis — červené zvýraznění obepíná jen text (per řádek) */}
                <FadeUp delay={0.1}>
                    <h1 className="text-[30px] md:text-[54px] font-bold text-white tracking-tight-custom leading-[1.5] max-w-[16ch] md:max-w-[18ch] mx-auto mb-8">
                        <span
                            style={{
                                backgroundColor: '#FF0E00',
                                WebkitBoxDecorationBreak: 'clone',
                                boxDecorationBreak: 'clone',
                                padding: '0.06em 0.28em',
                            }}
                        >
                            Dostaň svůj coaching na stabilních 500+&nbsp;tisíc měsíčně
                        </span>
                    </h1>
                </FadeUp>

                {/* Zkrácený podnadpis — bez tečky na konci */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                >
                    <div className="mb-9 max-w-xl mx-auto px-2">
                        <p className="text-[19px] md:text-[26px] text-white font-medium leading-[1.5]">
                            Získej kompletní video strategii, díky které prodáváš svůj coaching kvalitnějším klientům za vyšší ceny
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
