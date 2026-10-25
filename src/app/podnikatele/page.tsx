"use client";

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { initUtmTracking } from '@/lib/utm';
import { Navbar } from '@/components/Navbar';
import { CoachingHero } from '@/components/CoachingHero';
import { TextureOverlay } from '@/components/TextureOverlay';
import { CallBenefits } from '@/components/mentorship/CallBenefits';
import { LegalFooter } from '@/components/LegalFooter';

const SmoothScroll = dynamic(() => import('@/components/SmoothScroll').then(mod => mod.SmoothScroll), { ssr: false });
const ApplicationForm = dynamic(() => import('@/components/mentorship/ApplicationForm').then(mod => mod.ApplicationForm), { ssr: false });

export default function PodnikatelePage() {
    useEffect(() => {
        initUtmTracking();

        if (!window.location.hash) return;
        const id = window.location.hash.slice(1);
        const scrollToTarget = () => {
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: 'auto', block: 'start' });
        };
        scrollToTarget();
        const timeouts = [100, 300, 600, 1000, 1500, 2500].map(delay =>
            window.setTimeout(scrollToTarget, delay)
        );
        return () => timeouts.forEach(window.clearTimeout);
    }, []);

    return (
        <SmoothScroll>
            <main className="min-h-screen relative bg-brand-dark text-white font-sans selection:bg-brand-red selection:text-white">
                <Navbar />
                <TextureOverlay />

                <CoachingHero
                    words={["zakladatel", "podnikatel", "majitel firmy"]}
                    line1="Tvoje firma je skvělá."
                    line2="Ví o ní ti správní lidé?"
                    sub="Postavíme ti osobní značku, se kterou se tvoje odbornost dostane k lidem, kteří nakupují, a z jejich pozornosti uděláme poptávky a schůzky"
                    cta="CHCI RŮST DÍKY ZNAČCE"
                />

                <div id="apply" className="pt-12 pb-24 relative overflow-visible">
                    <div className="w-full max-w-[95vw] md:max-w-[70vw] lg:max-w-[1000px] mx-auto relative px-4">
                        <ApplicationForm vetev="podnikatele" />
                    </div>
                </div>

                <CallBenefits />

                <div className="pt-12 flex flex-col items-center relative z-20 pb-16">
                    <a
                        href="#apply"
                        className="bg-brand-red hover:bg-[#cc0b00] text-white px-10 py-5 rounded-full text-lg md:text-xl font-bold tracking-tight-custom transition-all inline-block uppercase hover:scale-105"
                    >
                        CHCI RŮST DÍKY ZNAČCE
                    </a>
                </div>

                <LegalFooter />

            </main>
        </SmoothScroll>
    );
}
