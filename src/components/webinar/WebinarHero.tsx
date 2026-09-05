"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { LedText } from './LedText';
import { WebinarVideo } from './WebinarVideo';
import { WEBINAR } from './webinarConfig';
import { scrollToRegistration } from './scroll';

export const WebinarHero = ({ videoSrc, videoPoster }: { videoSrc?: string; videoPoster?: string }) => {
    return (
        <section className="relative z-10 px-5 md:px-12 pt-5 md:pt-7 pb-14 md:pb-28 flex flex-col items-center overflow-hidden">
            {/* Záře za číslem */}
            <div
                className="absolute left-1/2 -translate-x-1/2 top-[40px] md:top-[20px] w-[560px] h-[320px] md:w-[1400px] md:h-[640px] rounded-full pointer-events-none blur-[90px] md:blur-[200px]"
                style={{ background: 'radial-gradient(closest-side, rgba(255,255,255,0.16), rgba(255,255,255,0.04) 55%, transparent 100%)' }}
                aria-hidden="true"
            />

            {/* Navigace */}
            <nav className="relative z-20 w-full max-w-[1344px] flex items-center justify-between">
                <Link href="/" className="text-white text-[22px] md:text-[28px] font-serif italic leading-none">Beyond</Link>
                <button
                    type="button"
                    onClick={scrollToRegistration}
                    className="rounded-full border border-white/[0.18] px-3.5 py-2 md:px-[18px] md:py-2.5 text-[13px] md:text-sm font-bold text-white/85 hover:text-white hover:border-white/40 transition-colors"
                >
                    <span className="md:hidden">{WEBINAR.hero.navCta}</span>
                    <span className="hidden md:inline">Rezervovat místo</span>
                </button>
            </nav>

            {/* Střed */}
            <div className="relative z-20 w-full max-w-[960px] flex flex-col items-center text-center pt-6 md:pt-4">
                {/* Zapnutí obrazovky řeší CSS animace led-turn-on */}
                <div className="leading-none">
                    <LedText
                        as="h1"
                        text={WEBINAR.hero.year}
                        className="led--turn-on block font-bold leading-[0.88] tracking-[-0.06em] text-[clamp(160px,27.5vw,400px)]"
                    />
                </div>

                <motion.h2
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="mt-5 md:mt-7 text-[26px] md:text-[44px] font-bold tracking-[-0.025em] leading-[1.15] md:leading-[1.12] max-w-[350px] md:max-w-[900px]"
                >
                    {WEBINAR.hero.headline} <span className="text-brand-red">{WEBINAR.hero.headlineAccent}</span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.75 }}
                    className="mt-4 md:mt-6 text-white/65 font-bold text-base md:text-[22px] leading-[1.4] max-w-[320px] md:max-w-[720px]"
                >
                    {WEBINAR.hero.subline}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.95 }}
                    className="mt-7 md:mt-12 w-full max-w-[960px]"
                >
                    <WebinarVideo src={videoSrc} poster={videoPoster} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.15 }}
                    className="mt-7 md:mt-10 w-full md:w-auto"
                >
                    <button
                        type="button"
                        onClick={scrollToRegistration}
                        className="w-full md:w-auto bg-brand-red hover:bg-[#cc0b00] text-white px-8 md:px-[34px] py-[18px] rounded-full text-base font-bold tracking-tight-custom transition-colors"
                    >
                        {WEBINAR.hero.cta}
                    </button>
                </motion.div>
            </div>
        </section>
    );
};
