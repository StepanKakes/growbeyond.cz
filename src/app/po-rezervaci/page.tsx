"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'motion/react';
import { Navbar } from '@/components/Navbar';
import { TextureOverlay } from '@/components/TextureOverlay';
import { FadeUp } from '@/components/FadeUp';

const SmoothScroll = dynamic(() => import('@/components/SmoothScroll').then(mod => mod.SmoothScroll), { ssr: false });
const VideoPlayer = dynamic(() => import('./VideoPlayer'), { ssr: false });

const checklistItems = [
    {
        title: 'Pusť si video výše',
        description: 'Pochop náš proces a jak funguje celá spolupráce — ušetříme čas a rovnou půjdeme k věci.',
    },
    {
        title: 'Najdi si klidné místo',
        description: 'Hovor vezmi tam, kde si můžeš zapnout kameru a v klidu se bavit.',
    },
    {
        title: 'Přijď připravený se rozhodnout',
        description: 'Přiveď s sebou všechny, kdo mají slovo v rozhodování — partnera, společníka, kohokoli. A přijď ready říct jasné ano nebo ne. Ušetříme si zbytečné kolečko navíc a rovnou půjdeme k věci.',
    },
    {
        title: 'Podívej se, jak spolupráce reálně vypadá',
        description: 'Než přijdeš na hovor, pusť si část konzultace ať víš jak pracujeme.',
    },
];

export default function PoRezervaci() {
    return (
        <SmoothScroll>
            <main className="min-h-screen relative bg-brand-dark text-white font-sans selection:bg-brand-red selection:text-white">
                <Navbar />
                <TextureOverlay />

                {/* Hero */}
                <section className="relative pt-20 pb-8 px-4 z-10 flex flex-col items-center overflow-hidden">
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
                        <div className="flex flex-col items-center gap-2 md:gap-3 mb-8 w-full">
                            <div className="relative inline-block px-3 py-1 md:py-2">
                                <motion.div
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ delay: 0.2, duration: 0.8, ease: 'easeInOut' }}
                                    className="absolute inset-0 bg-brand-red origin-left"
                                />
                                <h1 className="relative z-10 text-[28px] md:text-[52px] font-bold text-white tracking-tight-custom leading-none">
                                    Tvůj hovor zatím není potvrzený...
                                </h1>
                            </div>
                        </div>

                        <div className="mb-8 max-w-2xl mx-auto px-2">
                            <p className="text-[20px] md:text-[27px] text-white font-medium leading-[1.6]">
                                <span
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 12' fill='none' preserveAspectRatio='none'%3E%3Cpath d='M2 9C100 3 300 3 398 9' stroke='%23FF0E00' stroke-width='4' stroke-linecap='round' /%3E%3C/svg%3E")`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'left bottom',
                                        backgroundSize: '100% 10px',
                                        WebkitBoxDecorationBreak: 'clone',
                                        boxDecorationBreak: 'clone' as React.CSSProperties['boxDecorationBreak'],
                                        paddingBottom: '8px',
                                    }}
                                >
                                    Udělej tyto 2 kroky, aby byl hovor skutečně rezervovaný
                                </span>
                            </p>
                        </div>
                    </div>
                </section>

                {/* Krok 1 — heading */}
                <section className="pt-8 pb-6 px-4 relative z-20">
                    <div className="max-w-3xl mx-auto">
                        <FadeUp>

                            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight-custom leading-[1.1] text-center">
                                Pusť si toto krátké video a připrav se na hovor
                            </h2>
                        </FadeUp>
                    </div>
                </section>

                {/* Video — Plyr, stejná šířka jako na hlavní stránce */}
                <div className="pt-6 pb-8 relative z-20 overflow-visible">
                    <div className="w-full max-w-[95vw] md:max-w-[55vw] lg:max-w-[1100px] mx-auto px-4">
                        <FadeUp>
                            <VideoPlayer />
                        </FadeUp>
                    </div>
                </div>

                {/* Checklist */}
                <section className="py-16 px-4 relative z-20">
                    <div className="max-w-2xl mx-auto text-center">
                        <FadeUp>
                            <h3 className="text-3xl md:text-5xl font-bold text-white tracking-tight-custom leading-[1.1] mb-14">
                                Jak se na hovor připravit:
                            </h3>

                            <div className="flex flex-col gap-10">
                                {checklistItems.map((item, i) => (
                                    <div key={i}>
                                        <p className="text-lg md:text-xl font-bold text-white mb-2">
                                            {item.title}:
                                        </p>
                                        <p className="text-gray-300 text-[15px] md:text-base leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </FadeUp>
                    </div>
                </section>

                {/* Mohlo by tě zajímat */}
                <section className="pt-8 pb-6 px-4 relative z-20">
                    <div className="max-w-3xl mx-auto text-center">
                        <FadeUp>
                            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight-custom leading-[1.1]">
                                Mohlo by tě zajímat
                            </h2>
                        </FadeUp>
                    </div>
                </section>

                <div className="pt-6 pb-24 relative z-20 overflow-visible">
                    <div className="w-full max-w-[95vw] md:max-w-[55vw] lg:max-w-[1100px] mx-auto px-4">
                        <FadeUp>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {['gLnRxa2cXJE', 'O6hQdQgIBT4'].map((id) => (
                                    <div key={id} className="relative rounded-lg md:rounded-xl overflow-hidden border border-white/10 bg-[#151515]">
                                        <div className="w-full relative pb-[56.25%]">
                                            <iframe
                                                className="absolute inset-0 w-full h-full"
                                                src={`https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`}
                                                title="Mohlo by tě zajímat"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                allowFullScreen
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </FadeUp>
                    </div>
                </div>

            </main>
        </SmoothScroll>
    );
}
