"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { LedText } from './LedText';
import { WebinarVideo } from './WebinarVideo';
import { WEBINAR } from './webinarConfig';
import { scrollToRegistration } from './scroll';

const reveal = (delay: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

export const WebinarHero = ({ videoSrc, videoPoster }: { videoSrc?: string; videoPoster?: string }) => {
    return (
        <header className="relative z-10 mx-auto w-full max-w-[1200px] px-5 md:px-12 pt-5 md:pt-7 pb-16 md:pb-28">
            <nav className="flex items-center justify-between" aria-label="Hlavní">
                <Link href="/" className="text-white text-[22px] md:text-[26px] font-serif italic leading-none">Beyond</Link>
                <button
                    type="button"
                    onClick={scrollToRegistration}
                    className="text-sm md:text-[15px] text-white/80 underline-offset-[5px] transition-colors hover:text-white hover:underline focus:outline-none focus-visible:underline"
                >
                    Rezervovat místo
                </button>
            </nav>

            <div className="mx-auto mt-10 md:mt-8 flex w-full max-w-[960px] flex-col items-center text-center">
                <h1 className="leading-none">
                    <LedText
                        text={WEBINAR.hero.year}
                        className="led--turn-on block font-bold leading-[0.88] tracking-[-0.04em] text-[clamp(160px,26vw,380px)]"
                    />
                </h1>

                <motion.p
                    {...reveal(0.5)}
                    className="mt-6 md:mt-8 max-w-[22ch] md:max-w-[26ch] text-[26px] md:text-[44px] font-bold tracking-[-0.02em] leading-[1.15] md:leading-[1.1]"
                >
                    {WEBINAR.hero.headline} <span className="text-brand-red">{WEBINAR.hero.headlineAccent}</span>
                </motion.p>

                <motion.p
                    {...reveal(0.7)}
                    className="mt-4 md:mt-5 max-w-[34ch] md:max-w-[44ch] text-[17px] md:text-[21px] text-white/70 leading-[1.5]"
                >
                    {WEBINAR.hero.subline}
                </motion.p>

                <motion.div {...reveal(0.9)} className="mt-10 md:mt-14 w-full">
                    <WebinarVideo src={videoSrc} poster={videoPoster} />
                </motion.div>

                <motion.div {...reveal(1.05)} className="mt-8 md:mt-10 w-full md:w-auto">
                    <button
                        type="button"
                        onClick={scrollToRegistration}
                        className="h-13 w-full md:w-auto rounded-full bg-brand-red px-9 text-base font-bold text-white transition-colors hover:bg-[#d40c00] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                        {WEBINAR.hero.cta}
                    </button>
                </motion.div>
            </div>
        </header>
    );
};
