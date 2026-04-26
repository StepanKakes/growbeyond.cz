"use client";

import React, { useState, useEffect } from 'react';
import { FadeUp } from './FadeUp';
import { motion, AnimatePresence } from 'motion/react';

export const CoachingHero = () => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (step >= 3) return;

        const timer = setTimeout(() => {
            setStep(s => s + 1);
        }, 450);

        return () => clearTimeout(timer);
    }, [step]);

    const words = ["kouč", "podnikatel", "tvůrce"];
    const rotations = [-1.8, 1.4, -1.1];

    return (
        <section className="relative pt-24 pb-8 px-4 z-10 selection:bg-brand-red selection:text-white flex flex-col items-center top-0 overflow-hidden">
            {/* Background elements removed for pure noise/gray overlay from global app styles */}

            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: `url('/images/hero/Still%202026-03-12%20235253.jpg')`,
                    backgroundPosition: 'center top',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    maskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
                    opacity: 0.8
                }}
            />

            <div className="max-w-[1200px] mx-auto w-full text-center relative z-20 flex flex-col items-center pt-8">
                <div className="mb-4 flex items-center justify-center min-h-[80px] md:min-h-[80px]">
                    <h2 className="text-[22px] md:text-[32px] font-bold text-white mb-4 tracking-tight-custom leading-[1.3] md:leading-[1.1] flex flex-wrap items-center justify-center gap-x-[0.3em] gap-y-[0.4em]">
                        <motion.span layout transition={{ duration: 0.3 }}>Jsi</motion.span>

                        <AnimatePresence mode="wait">
                            {step < 3 ? (
                                <motion.span
                                    key={`word-${step}`}
                                    initial={{ opacity: 0, scale: 0.95, rotate: rotations[step] * 1.2 }}
                                    animate={{ opacity: 1, scale: 1, rotate: rotations[step] }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    className="bg-brand-red px-2 md:px-2.5 text-white inline-block"
                                >
                                    {words[step]}
                                </motion.span>
                            ) : (
                                <motion.div
                                    key="final"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.4 }}
                                    className="flex flex-wrap items-center justify-center gap-x-[0.3em] gap-y-[0.4em]"
                                >
                                    <motion.span
                                        initial={{ opacity: 0, x: -10, rotate: 0 }}
                                        animate={{ opacity: 1, x: 0, rotate: rotations[0] }}
                                        transition={{ delay: 0.05 }}
                                        className="bg-brand-red px-2 md:px-2.5 text-white inline-block"
                                    >
                                        kouč
                                    </motion.span>
                                    <span className="text-white">,</span>
                                    <motion.span
                                        initial={{ opacity: 0, scale: 0.98, rotate: 0 }}
                                        animate={{ opacity: 1, scale: 1, rotate: rotations[1] }}
                                        transition={{ delay: 0.1 }}
                                        className="bg-brand-red px-2 md:px-2.5 text-white inline-block"
                                    >
                                        podnikatel
                                    </motion.span>
                                    <span className="text-white">nebo</span>
                                    <motion.span
                                        initial={{ opacity: 0, x: 10, rotate: 0 }}
                                        animate={{ opacity: 1, x: 0, rotate: rotations[2] }}
                                        transition={{ delay: 0.15 }}
                                        className="bg-brand-red px-2 md:px-2.5 text-white inline-block"
                                    >
                                        tvůrce
                                    </motion.span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.span layout transition={{ duration: 0.3 }}>?</motion.span>
                    </h2>
                </div>



                <div className="flex flex-col items-center gap-2 md:gap-3 mb-10 w-full">
                    {/* Line 1 */}
                    <div className="relative inline-block px-3 py-1 md:py-2">
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={step >= 3 ? { scaleX: 1 } : { scaleX: 0 }}
                            transition={{ delay: 0.6, duration: 0.8, ease: "easeInOut" }}
                            className="absolute inset-0 bg-brand-red origin-left"
                        />
                        <h1 className="relative z-10 text-[32px] md:text-[56px] font-bold text-white tracking-tight-custom leading-none">
                            Pomůžeme ti implementovat náš
                        </h1>
                    </div>

                    {/* Line 2 */}
                    <div className="relative inline-block px-3 py-1 md:py-2">
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={step >= 3 ? { scaleX: 1 } : { scaleX: 0 }}
                            transition={{ delay: 1, duration: 0.8, ease: "easeInOut" }}
                            className="absolute inset-0 bg-brand-red origin-left"
                        />
                        <h1 className="relative z-10 text-[32px] md:text-[56px] font-bold text-white tracking-tight-custom leading-none">
                            statisícový funnel
                        </h1>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={step >= 3 ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.8, delay: 1.4 }}
                >
                    <div className="mb-10 max-w-2xl mx-auto px-2">
                        <p className="text-[20px] md:text-[27px] text-white font-medium leading-[1.6]">
                            <span
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 12' fill='none' preserveAspectRatio='none'%3E%3Cpath d='M2 9C100 3 300 3 398 9' stroke='%23FF0E00' stroke-width='4' stroke-linecap='round' /%3E%3C/svg%3E")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'left bottom',
                                    backgroundSize: '100% 10px',
                                    WebkitBoxDecorationBreak: 'clone',
                                    boxDecorationBreak: 'clone',
                                    paddingBottom: '8px'
                                }}
                            >
                                Abys získal/a kvalitnější klienty a dosahoval/a každý měsíc stabilně šestimístných příjmů
                            </span>
                        </p>
                    </div>
                </motion.div>

                <FadeUp delay={0.3}>
                    <a
                        href="#apply"
                        className="bg-brand-red hover:bg-[#cc0b00] text-white px-8 py-3 rounded-full text-sm md:text-base font-bold tracking-tight-custom transition-all inline-block uppercase"
                    >
                        JSEM READY RŮST
                    </a>
                </FadeUp>
            </div>
        </section>
    );
};
