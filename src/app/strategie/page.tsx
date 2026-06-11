"use client";

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { initUtmTracking } from '@/lib/utm';
import { Navbar } from '@/components/Navbar';
import { TextureOverlay } from '@/components/TextureOverlay';
import { StrategieHero } from '@/components/strategie/StrategieHero';
import { LegalFooter } from '@/components/LegalFooter';

const SmoothScroll = dynamic(() => import('@/components/SmoothScroll').then(mod => mod.SmoothScroll), { ssr: false });
const StrategieFormModal = dynamic(() => import('@/components/strategie/StrategieFormModal').then(mod => mod.StrategieFormModal), { ssr: false });

export default function StrategiePage() {
    useEffect(() => {
        initUtmTracking();
    }, []);

    return (
        <SmoothScroll>
            <main className="min-h-screen relative bg-brand-dark text-white font-sans selection:bg-brand-red selection:text-white">
                <Navbar minimal />
                <TextureOverlay />

                {/* Hero s náhledem videa; formulář je v popupu */}
                <StrategieHero showVideoPreview />

                {/* Disqualifier */}
                <section className="px-4 pt-2 pb-20 text-center">
                    <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto uppercase tracking-wider font-bold leading-relaxed">
                        Pokud neprovozuješ koučink, mentoring nebo konzultace, které to s&nbsp;růstem myslí vážně, tahle stránka pro tebe není. V&nbsp;klidu ji zavři.
                    </p>
                </section>

                <LegalFooter />
            </main>

            {/* Opt-in popup */}
            <StrategieFormModal />
        </SmoothScroll>
    );
}
