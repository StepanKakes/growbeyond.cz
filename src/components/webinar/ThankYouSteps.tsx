"use client";

import React from 'react';
import { motion, MotionConfig } from 'motion/react';
import { LedText } from './LedText';
import { EventCard, GoogleCalendarLogo, WhatsAppLogo } from './EventCard';
import { czVocative } from '@/lib/vokativ';

// Potvrzení registrace: skupina a termín. Otázky se ptají o krok dřív na
// /webinar/prihlaska, sem se člověk dostane až za nimi.
//
// Skupina stojí první schválně, je to jediné místo, kde se dá s lidmi mluvit
// průběžně. Odkaz na vysílání tu není, chodí mailem a WhatsAppem.

export type ThankYouData = {
    firstName: string | null;
    dayLabel: string;
    weekday: string;
    dayMonth: string;
    timeLabel: string;
    minutes: number;
    joinUrl: string;
    groupUrl: string;
    googleUrl: string;
    icsUrl: string | null;
};

const itemV = {
    hidden: { opacity: 0, y: 12, filter: 'blur(4px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring' as const, duration: 0.34, bounce: 0 } },
};

const stepV = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05, delayChildren: 0.03 } },
    exit: { opacity: 0, y: -12, filter: 'blur(4px)', transition: { duration: 0.15, ease: 'easeIn' as const } },
};

const BlockTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-[19px] md:text-[22px] font-bold tracking-[-0.02em] leading-[1.2]">{children}</h2>
);

export const ThankYouSteps = (d: ThankYouData) => {
    // Oslovení musí být v pátém pádu, jinak stránka volá "Pavel, máš místo".
    const vocative = czVocative(d.firstName);
    const hello = vocative ? `${vocative}, ` : '';

    return (
        <MotionConfig reducedMotion="user">
            <motion.div initial="hidden" animate="visible" variants={stepV}>
                <motion.h1
                    variants={itemV}
                    className="mx-auto max-w-[14ch] text-center text-[34px] md:text-[56px] font-bold tracking-[-0.035em] leading-[1.04]"
                        >
                            {hello}máš <LedText soft color="red" text="místo" className="whitespace-nowrap" />
                        </motion.h1>
                        <div className="mx-auto mt-12 w-full max-w-[560px] text-center md:mt-14">
                            {/* Skupina je priorita, proto stojí první. Odkaz na
                                vysílání tu není schválně, chodí mailem i WhatsAppem
                                a na téhle stránce by lidi odvedl od skupiny. */}
                            {d.groupUrl && (
                                <motion.section variants={itemV}>
                                    <BlockTitle>Přidej se do skupiny</BlockTitle>
                                    <p className="mx-auto mt-3 max-w-[48ch] text-[17px] md:text-[19px] text-white/70 leading-[1.5]">
                                        Budu tam dávat důležitá upozornění a věci, které se nikam jinam nedostanou
                                    </p>
                                    <a
                                        href={d.groupUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mx-auto mt-6 inline-flex h-13 items-center gap-3 rounded-full bg-white px-7 text-[15px] font-bold text-[#1f1f1f] transition-colors duration-200 hover:bg-white/90"
                                    >
                                        <WhatsAppLogo />
                                        Vstoupit do skupiny
                                    </a>
                                </motion.section>
                            )}

                            <motion.section variants={itemV} className={d.groupUrl ? 'mt-14 border-t border-white/10 pt-10' : ''}>
                                <BlockTitle>Ulož si termín</BlockTitle>

                                <div className="mt-5 text-left">
                                    <EventCard
                                        weekday={d.weekday}
                                        dayMonth={d.dayMonth}
                                        time={d.timeLabel}
                                        minutes={d.minutes}
                                    />
                                </div>

                                <div className="mt-6 flex flex-wrap justify-center gap-3">
                                    <a
                                        href={d.googleUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex h-13 items-center gap-3 rounded-full bg-white px-7 text-[15px] font-bold text-[#1f1f1f] transition-colors duration-200 hover:bg-white/90"
                                    >
                                        <GoogleCalendarLogo />
                                        Přidat do Google kalendáře
                                    </a>
                                    {d.icsUrl && (
                                        <a
                                            href={d.icsUrl}
                                            className="inline-flex h-13 items-center rounded-full border border-white/25 px-7 text-[15px] font-bold text-white transition-colors duration-200 hover:border-white"
                                        >
                                            Stáhnout do kalendáře
                                        </a>
                                    )}
                                </div>
                    </motion.section>
                </div>
            </motion.div>
        </MotionConfig>
    );
};
