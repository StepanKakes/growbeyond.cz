"use client";

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { initUtmTracking } from '@/lib/utm';
import { Navbar } from '@/components/Navbar';
import { TextureOverlay } from '@/components/TextureOverlay';
import { StrategieHero } from '@/components/strategie/StrategieHero';
import { StrategieVideoTeaser } from '@/components/strategie/StrategieVideoTeaser';
import { StrategieReveal, StrategieForWho, StrategieCta } from '@/components/strategie/StrategieFunnel';
import { Testimonials } from '@/components/Testimonials';
import { ScreenshotGallery } from '@/components/mentorship/ScreenshotGallery';
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

                {/* 1 — Hero + opt-in (e-mail + IG) */}
                <StrategieHero />
                <StrategieOptin />

                {/* 2 — Uzamčený náhled videa */}
                <StrategieVideoTeaser />

                {/* 3 — Co se ve videu zdarma dozvíš */}
                <StrategieReveal />
                <StrategieCta />

                {/* 4 — Je to pro tebe / není to pro tebe */}
                <div className="pt-12">
                    <StrategieForWho />
                </div>
                <StrategieCta />

                {/* 5 — Sociální důkaz */}
                <Testimonials />
                <ScreenshotGallery />

                {/* 6 — Finální opt-in */}
                <div className="pt-12 pb-24">
                    <StrategieCta label="Chci video zdarma" />
                </div>

                <LegalFooter />
            </main>
        </SmoothScroll>
    );
}
