"use client";

import React, { useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { LedText } from './LedText';
import { EventCard, GoogleLogo, WhatsAppLogo } from './EventCard';
import { QualifyForm } from './QualifyForm';

// Děkovačka po registraci má dva kroky. Nejdřív dotazník, teprve po něm
// potvrzení s termínem a kalendářem. Kdyby přišlo obojí naráz, dotazník
// by nikdo nevyplnil, protože odkaz na vysílání je zajímavější.
//
// Kdo dotazník vyplnil dřív a vrátí se na stránku, dostane rovnou
// potvrzení. Přeskočit jde taky, nemá cenu držet někoho násilím.

export type ThankYouData = {
    token: string | null;
    alreadyQualified: boolean;
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
    const [done, setDone] = useState(d.alreadyQualified || !d.token);
    const hello = d.firstName ? `${d.firstName}, ` : '';

    // Dotazník je delší než obrazovka, takže po odeslání zůstane stránka
    // odrolovaná dole a potvrzení by začalo někde uprostřed.
    const finish = () => {
        setDone(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <MotionConfig reducedMotion="user">
            <AnimatePresence mode="wait" initial={false}>
                {!done ? (
                    <motion.div key="dotaznik" variants={stepV} initial="hidden" animate="visible" exit="exit">
                        <motion.p variants={itemV} className="text-center text-sm text-white/45">
                            Krok 2 ze 2
                        </motion.p>
                        <motion.h1
                            variants={itemV}
                            className="mx-auto mt-4 max-w-[16ch] text-center text-[34px] md:text-[52px] font-bold tracking-[-0.035em] leading-[1.06]"
                        >
                            {hello}ještě <LedText soft color="red" text="dvě otázky" className="whitespace-nowrap" />
                        </motion.h1>
                        <motion.p
                            variants={itemV}
                            className="mx-auto mt-5 max-w-[46ch] text-center text-[17px] md:text-[19px] text-white/60 leading-[1.5]"
                        >
                            Podle odpovědí poskládám obsah tak, aby seděl lidem, co přijdou. Zabere to půl minuty
                        </motion.p>

                        <motion.div variants={itemV} className="mx-auto mt-12 w-full max-w-[560px] md:mt-14">
                            <QualifyForm token={d.token as string} onDone={finish} />
                            <button
                                type="button"
                                onClick={finish}
                                className="mt-8 min-h-10 text-sm text-white/40 underline underline-offset-4 transition-colors duration-200 hover:text-white"
                            >
                                Přeskočit a jít rovnou na termín
                            </button>
                        </motion.div>
                    </motion.div>
                ) : (
                    <motion.div key="potvrzeni" variants={stepV} initial="hidden" animate="visible">
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
                                    <p className="mx-auto mt-2 max-w-[46ch] text-[16px] md:text-[17px] text-white/55 leading-[1.55]">
                                        Budu tam dávat důležitá upozornění a věci, které se nikam jinam nedostanou. Píšeme tam jen já a tým, takže tě to nezavalí
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
                                        <GoogleLogo />
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
                )}
            </AnimatePresence>
        </MotionConfig>
    );
};
