"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { LedText } from './LedText';
import { WebinarVideo } from './WebinarVideo';
import { WEBINAR, webinarDate } from './webinarConfig';
import { openWebinarForm } from './formEvents';

const reveal = (delay: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

export const PrimaryButton = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <button
        type="button"
        onClick={openWebinarForm}
        className={`h-13 rounded-full bg-brand-red px-9 text-base font-bold text-white transition-colors hover:bg-[#d40c00] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${className}`}
    >
        {children}
    </button>
);

// Informace o termínu vedle videa: tři fakta velkým písmem pod sebou, pak akce.
const EventPanel = () => {
    const { display, weekday } = webinarDate();
    const facts: { label: string; value: string; accent?: boolean }[] = [
        { label: weekday, value: display },
        { label: 'Začátek', value: WEBINAR.time },
        { label: 'Online', value: WEBINAR.hero.live, accent: true },
    ];
    return (
        <div className="flex h-full flex-col justify-between rounded-xl border border-white/10 bg-[#111111] px-6 py-6 md:px-8 md:py-8 text-left">
            <dl>
                {facts.map((f, i) => (
                    <div key={f.label} className={`flex flex-col gap-1 py-4 md:py-5 ${i > 0 ? 'border-t border-white/10' : 'pt-0'}`}>
                        <dt className="text-sm text-white/50">{f.label}</dt>
                        <dd className={`text-[34px] md:text-[40px] font-bold tracking-[-0.03em] leading-none ${f.accent ? 'text-brand-red' : ''}`}>{f.value}</dd>
                    </div>
                ))}
            </dl>
            <div className="mt-6 md:mt-8">
                <PrimaryButton className="w-full">{WEBINAR.hero.cta}</PrimaryButton>
                <p className="mt-4 text-sm text-white/55 leading-[1.5]">{WEBINAR.hero.note}</p>
            </div>
        </div>
    );
};

export const WebinarHero = ({ videoSrc, videoPoster }: { videoSrc?: string; videoPoster?: string }) => {
    return (
        <header className="relative z-10 mx-auto w-full max-w-[1200px] px-5 md:px-12 pt-5 md:pt-7 pb-16 md:pb-28">
            <nav className="flex items-center justify-between" aria-label="Hlavní">
                <Link href="/" className="text-white text-[22px] md:text-[26px] font-serif italic leading-none">Beyond</Link>
            </nav>

            <div className="mx-auto mt-8 md:mt-6 flex w-full max-w-[960px] flex-col items-center text-center">
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
            </div>

            <motion.div {...reveal(0.9)} className="mt-10 md:mt-14 grid gap-4 md:grid-cols-12 md:gap-6 md:items-stretch">
                <div className="md:col-span-8">
                    <WebinarVideo src={videoSrc} poster={videoPoster} />
                </div>
                <div className="md:col-span-4">
                    <EventPanel />
                </div>
            </motion.div>
        </header>
    );
};
