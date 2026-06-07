"use client";

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { initUtmTracking } from '@/lib/utm';
import { Navbar } from '@/components/Navbar';
import { TextureOverlay } from '@/components/TextureOverlay';
import { StrategieHero } from '@/components/strategie/StrategieHero';
import { StrategieVideoTeaser } from '@/components/strategie/StrategieVideoTeaser';
import { StrategieReveal, StrategieForWho, StrategieCta } from '@/components/strategie/StrategieFunnel';
import { FadeUp } from '@/components/FadeUp';
import { Testimonials } from '@/components/Testimonials';
import { ScreenshotGallery } from '@/components/mentorship/ScreenshotGallery';
import { LegalFooter } from '@/components/LegalFooter';

const SmoothScroll = dynamic(() => import('@/components/SmoothScroll').then(mod => mod.SmoothScroll), { ssr: false });
const ApplicationForm = dynamic(() => import('@/components/mentorship/ApplicationForm').then(mod => mod.ApplicationForm), { ssr: false });

export default function StrategiePage() {
    useEffect(() => {
        initUtmTracking();
    }, []);

    return (
        <SmoothScroll>
            <main className="min-h-screen relative bg-brand-dark text-white font-sans selection:bg-brand-red selection:text-white">
                <Navbar />
                <TextureOverlay />

                {/* 1 — Callout hero + qualifier + social proof */}
                <StrategieHero />

                {/* 1b — Uzamčený náhled videa */}
                <StrategieVideoTeaser />

                {/* 2 — Co ve videu zdarma odhalíme */}
                <StrategieReveal />
                <StrategieCta />

                {/* 3 — Je to pro tebe / není to pro tebe */}
                <div className="pt-12">
                    <StrategieForWho />
                </div>
                <StrategieCta />

                {/* 5 — Sociální důkaz */}
                <Testimonials />
                <ScreenshotGallery />

                {/* 6 — Formulář jako brána před videem (kvalifikační dotazník) */}
                <section className="pt-20 pb-2 px-4 relative z-20 text-center">
                    <FadeUp>
                        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight-custom leading-[1.15] max-w-2xl mx-auto">
                            Vyplň dotazník a&nbsp;odemkni si strategické video
                        </h2>
                        <p className="text-gray-300 text-sm md:text-base mt-3 max-w-xl mx-auto">
                            Pár otázek, ať víme, kde teď jsi. Hned poté se ti odemkne video a&nbsp;možnost rezervovat hovor.
                        </p>
                    </FadeUp>
                </section>

                <div id="apply" className="pt-6 pb-24 relative overflow-visible">
                    <div className="w-full max-w-[95vw] md:max-w-[70vw] lg:max-w-[1000px] mx-auto relative px-4">
                        <ApplicationForm redirectMode />
                    </div>
                </div>

                <LegalFooter />
            </main>
        </SmoothScroll>
    );
}
