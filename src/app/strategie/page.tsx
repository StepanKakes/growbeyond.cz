"use client";

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { initUtmTracking } from '@/lib/utm';
import { Navbar } from '@/components/Navbar';
import { TextureOverlay } from '@/components/TextureOverlay';
import { StrategieHero } from '@/components/strategie/StrategieHero';
import { FadeUp } from '@/components/FadeUp';
import { CallBenefits } from '@/components/mentorship/CallBenefits';
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

                <StrategieHero />

                {/* Krok 1 — kvalifikační dotazník, po odeslání přesměruje na video */}
                <section className="pt-2 pb-2 px-4 relative z-20 text-center">
                    <FadeUp>
                        <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tight-custom leading-[1.15] max-w-2xl mx-auto">
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

                <CallBenefits />

                <div className="pt-4 flex flex-col items-center relative z-20 pb-16">
                    <a
                        href="#apply"
                        className="bg-brand-red hover:bg-[#cc0b00] text-white px-10 py-5 rounded-full text-lg md:text-xl font-bold tracking-tight-custom transition-all inline-block uppercase hover:scale-105"
                    >
                        Chci video zdarma
                    </a>
                </div>

                <Testimonials />

                <ScreenshotGallery />

                <LegalFooter />
            </main>
        </SmoothScroll>
    );
}
