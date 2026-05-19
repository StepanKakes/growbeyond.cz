"use client";

import React, { Suspense, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { TextureOverlay } from '@/components/TextureOverlay';
import { FadeUp } from '@/components/FadeUp';
import { firstNameFrom, toVokativ } from '@/lib/vokativ';

const SmoothScroll = dynamic(() => import('@/components/SmoothScroll').then(mod => mod.SmoothScroll), { ssr: false });
const VideoPlayer = dynamic(() => import('./VideoPlayer'), { ssr: false });

const TALLY_FORM_ID = 'KYP9NA';

function buildTallyUrl(params: {
    notion_page_id: string;
    email: string;
    jmeno: string;
}): string {
    const q = new URLSearchParams();
    if (params.notion_page_id) q.set('notion_page_id', params.notion_page_id);
    if (params.email) q.set('email', params.email);
    if (params.jmeno) q.set('jmeno', params.jmeno);
    return `https://tally.so/r/${TALLY_FORM_ID}${q.toString() ? `?${q}` : ''}`;
}

// Brand-colored "let's go" celebration. Initial burst + two side cannons +
// a delayed finale, then stops. ~3s total, non-disruptive.
function launchCelebration() {
    if (typeof window === 'undefined') return;
    void import('canvas-confetti').then(({ default: confetti }) => {
        const colors = ['#FF0E00', '#FFFFFF', '#FFD700', '#FFB347'];
        const defaults = { ticks: 200, gravity: 0.9, decay: 0.94, colors };

        // Initial center burst
        confetti({ ...defaults, particleCount: 120, spread: 90, startVelocity: 50, origin: { y: 0.6 } });
        confetti({ ...defaults, particleCount: 60, spread: 140, startVelocity: 35, scalar: 1.2, origin: { y: 0.6 } });

        // Side cannons
        setTimeout(() => {
            confetti({ ...defaults, particleCount: 80, angle: 60, spread: 70, startVelocity: 55, origin: { x: 0, y: 0.7 } });
            confetti({ ...defaults, particleCount: 80, angle: 120, spread: 70, startVelocity: 55, origin: { x: 1, y: 0.7 } });
        }, 350);

        // Finale — big spread, slow drift
        setTimeout(() => {
            confetti({ ...defaults, particleCount: 150, spread: 180, startVelocity: 45, scalar: 1.1, origin: { y: 0.5 } });
        }, 900);

        // Side cannons round 2
        setTimeout(() => {
            confetti({ ...defaults, particleCount: 60, angle: 60, spread: 90, startVelocity: 45, origin: { x: 0, y: 0.8 } });
            confetti({ ...defaults, particleCount: 60, angle: 120, spread: 90, startVelocity: 45, origin: { x: 1, y: 0.8 } });
        }, 1600);
    });
}

function OnboardingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const notion_page_id = searchParams.get('notion_page_id') ?? '';
    const email = searchParams.get('email') ?? '';
    const jmeno = (searchParams.get('jmeno') ?? '').trim();
    const vokativParam = searchParams.get('jmeno_vokativ');
    const fired = useRef(false);

    // Guard: only legit visitors from the welcome e-mail (which always carries
    // notion_page_id + email + jmeno) see this page. Anyone else → homepage.
    const hasRequiredParams = !!(notion_page_id && email && jmeno);

    useEffect(() => {
        if (!hasRequiredParams) {
            router.replace('/');
            return;
        }
        if (fired.current) return;
        fired.current = true;
        launchCelebration();
    }, [hasRequiredParams, router]);

    if (!hasRequiredParams) {
        return (
            <main className="min-h-screen bg-brand-dark flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
            </main>
        );
    }

    const firstName = firstNameFrom(jmeno);
    const oslovení = (vokativParam && vokativParam.trim()) || toVokativ(firstName) || firstName;
    const tallyUrl = buildTallyUrl({ notion_page_id, email, jmeno });

    return (
        <SmoothScroll>
            <main className="min-h-screen relative bg-brand-dark text-white font-sans selection:bg-brand-red selection:text-white">
                <TextureOverlay />

                {/* Hero */}
                <section className="relative pt-20 pb-8 px-4 z-10 flex flex-col items-center overflow-hidden">
                    <div
                        className="absolute inset-0 z-0 pointer-events-none"
                        style={{
                            backgroundImage: `url('/images/hero/onboarding-hero.jpg')`,
                            backgroundPosition: 'center center',
                            backgroundSize: 'cover',
                            backgroundRepeat: 'no-repeat',
                            maskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
                            opacity: 0.85,
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
                                    Vítej v rodině Beyond, {oslovení}
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
                                    Pusť si video a pak udělej 2 kroky, ať můžeme začít
                                </span>
                            </p>
                        </div>
                    </div>
                </section>

                {/* Welcome video */}
                <div className="pt-2 pb-8 relative z-20 overflow-visible">
                    <div className="w-full max-w-[95vw] md:max-w-[55vw] lg:max-w-[1100px] mx-auto px-4">
                        <FadeUp>
                            <VideoPlayer />
                        </FadeUp>
                    </div>
                </div>

                {/* Krok 1 — Tally */}
                <section className="pt-12 pb-6 px-4 relative z-20">
                    <div className="max-w-3xl mx-auto text-center">
                        <FadeUp>
                            <p className="text-brand-red font-bold uppercase tracking-widest text-sm md:text-base mb-3">
                                Krok 1
                            </p>
                            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight-custom leading-[1.1] mb-6">
                                Vyplň vstupní audit
                            </h2>
                            <a
                                href={tallyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block bg-brand-red hover:bg-brand-red/90 text-white font-bold px-8 py-4 rounded-lg text-base md:text-lg transition-colors shadow-xl shadow-brand-red/20"
                            >
                                Otevřít audit →
                            </a>
                        </FadeUp>
                    </div>
                </section>

                {/* Krok 2 — info */}
                <section className="pt-16 pb-24 px-4 relative z-20">
                    <div className="max-w-3xl mx-auto text-center">
                        <FadeUp>
                            <p className="text-brand-red font-bold uppercase tracking-widest text-sm md:text-base mb-3">
                                Krok 2
                            </p>
                            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight-custom leading-[1.1] mb-6">
                                Rezervuj si první session
                            </h2>
                            <p className="text-gray-300 text-[15px] md:text-lg leading-relaxed max-w-xl mx-auto">
                                Po vyplnění dotazníku ti přijde e-mail s rezervačním linkem na tvou první 1:1 session
                            </p>
                        </FadeUp>
                    </div>
                </section>

            </main>
        </SmoothScroll>
    );
}

export default function OnboardingPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen bg-brand-dark flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
            </main>
        }>
            <OnboardingContent />
        </Suspense>
    );
}
