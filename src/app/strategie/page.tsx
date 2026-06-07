"use client";

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { initUtmTracking } from '@/lib/utm';
import { Navbar } from '@/components/Navbar';
import { TextureOverlay } from '@/components/TextureOverlay';
import { StrategieHero } from '@/components/strategie/StrategieHero';
import { StrategieVideoTeaser } from '@/components/strategie/StrategieVideoTeaser';
import { StrategieReveal, StrategieForWho, StrategieCta } from '@/components/strategie/StrategieFunnel';
import { StrategieFormModal } from '@/components/strategie/StrategieFormModal';
import { openStrategieForm } from '@/components/strategie/strategieForm';
import { FadeUp } from '@/components/FadeUp';
import { Testimonials } from '@/components/Testimonials';
import { ScreenshotGallery } from '@/components/mentorship/ScreenshotGallery';
import { LegalFooter } from '@/components/LegalFooter';

const SmoothScroll = dynamic(() => import('@/components/SmoothScroll').then(mod => mod.SmoothScroll), { ssr: false });

export default function StrategiePage() {
    useEffect(() => {
        initUtmTracking();
    }, []);

    return (
        <SmoothScroll>
            <main className="min-h-screen relative bg-brand-dark text-white font-sans selection:bg-brand-red selection:text-white">
                <Navbar minimal />
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

                {/* 6 — Finální CTA — formulář se otevře v popupu */}
                <section className="pt-20 pb-24 px-4 relative z-20 text-center">
                    <FadeUp>
                        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight-custom leading-[1.15] max-w-2xl mx-auto">
                            Vyplň dotazník a&nbsp;odemkni si strategické video
                        </h2>
                        <p className="text-gray-300 text-sm md:text-base mt-3 max-w-xl mx-auto mb-8">
                            Pár otázek, ať víme, kde teď jsi. Hned poté se ti odemkne video a&nbsp;možnost rezervovat hovor.
                        </p>
                        <button
                            type="button"
                            onClick={openStrategieForm}
                            className="bg-brand-red hover:bg-[#cc0b00] text-white px-10 py-5 rounded-full text-lg md:text-xl font-bold tracking-tight-custom transition-all inline-block uppercase hover:scale-105"
                        >
                            Chci video zdarma
                        </button>
                    </FadeUp>
                </section>

                <LegalFooter />
            </main>

            {/* Formulářový popup */}
            <StrategieFormModal />
        </SmoothScroll>
    );
}
