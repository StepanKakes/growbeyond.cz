"use client";

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { initUtmTracking } from '@/lib/utm';
import { Navbar } from '@/components/Navbar';
import { TextureOverlay } from '@/components/TextureOverlay';
import { StrategieHero } from '@/components/strategie/StrategieHero';
import { LegalFooter } from '@/components/LegalFooter';

const SmoothScroll = dynamic(() => import('@/components/SmoothScroll').then(mod => mod.SmoothScroll), { ssr: false });
const StrategieOptin = dynamic(() => import('@/components/strategie/StrategieOptin').then(mod => mod.StrategieOptin), { ssr: false });

export default function StrategiePage() {
    useEffect(() => {
        initUtmTracking();
    }, []);

    return (
        <SmoothScroll>
            <main className="min-h-screen relative bg-brand-dark text-white font-sans selection:bg-brand-red selection:text-white">
                <Navbar minimal />
                <TextureOverlay />

                {/* Minimalistický opt-in — hero + formulář */}
                <StrategieHero />
                <StrategieOptin />

                <LegalFooter />
            </main>
        </SmoothScroll>
    );
}
