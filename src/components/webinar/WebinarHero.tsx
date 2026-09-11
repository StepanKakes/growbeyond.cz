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
/**
 * Termín a výzva pod videem jako displej, stejným jazykem jako svítící 2030
 * nad ním. Dřív to byl úzký sloupec vedle videa, který se roztahoval na jeho
 * výšku, takže mezi třemi údaji zůstaly velké prázdné díry.
 */
const EventStrip = () => {
    const { weekday, numeric } = webinarDate();
    return (
        <div className="screen mt-6 px-5 py-5 md:mt-8 md:px-7 md:py-6">
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-6">
                <div className="flex flex-wrap items-end gap-x-9 gap-y-5 text-left">
                    <div>
                        <div className="text-[11px] md:text-[12px] uppercase tracking-[0.18em] text-white/45">{weekday}</div>
                        <LedText
                            soft
                            color="red"
                            text={numeric}
                            className="mt-1.5 block text-[34px] md:text-[46px] font-bold leading-[0.95] tracking-[-0.03em] tabular-nums"
                        />
                    </div>
                    <div>
                        <div className="text-[11px] md:text-[12px] uppercase tracking-[0.18em] text-white/45">Začátek</div>
                        <LedText
                            soft
                            color="red"
                            text={WEBINAR.time}
                            className="mt-1.5 block text-[34px] md:text-[46px] font-bold leading-[0.95] tracking-[-0.03em] tabular-nums"
                        />
                    </div>
                    <div className="pb-1.5">
                        <div className="text-[11px] md:text-[12px] uppercase tracking-[0.18em] text-white/45">Kde</div>
                        <div className="mt-1.5 text-[17px] md:text-[19px] font-bold leading-none">
                            Online, <span className="text-brand-red">{WEBINAR.hero.live}</span>
                        </div>
                    </div>
                </div>

                <PrimaryButton className="w-full sm:w-auto">{WEBINAR.hero.cta}</PrimaryButton>
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
                    className="mt-6 md:mt-8 max-w-[20ch] md:max-w-[30ch] text-[24px] md:text-[40px] font-bold uppercase tracking-[-0.01em] leading-[1.2] md:leading-[1.15]"
                >
                    {WEBINAR.hero.headline}
                    <br />
                    <LedText soft color="red" text={WEBINAR.hero.headlineAccent} className="inline-block" />
                </motion.p>

                <motion.p
                    {...reveal(0.7)}
                    className="mt-5 md:mt-6 max-w-[38ch] md:max-w-[52ch] text-[17px] md:text-[21px] text-white/85 leading-[1.5]"
                >
                    {WEBINAR.hero.subline}
                </motion.p>
            </div>

            <motion.div {...reveal(0.9)} className="mt-10 md:mt-14">
                <WebinarVideo src={videoSrc} poster={videoPoster} />
                <EventStrip />
            </motion.div>
        </header>
    );
};
