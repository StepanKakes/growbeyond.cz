"use client";

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { initUtmTracking } from '@/lib/utm';
import { FadeUp } from '../FadeUp';
import { StrategieHero } from './StrategieHero';
import { CallBenefits } from '../mentorship/CallBenefits';
import { Testimonials } from '../Testimonials';
import { ScreenshotGallery } from '../mentorship/ScreenshotGallery';

const MentorshipVideoSection = dynamic(
    () => import('@/components/mentorship/MentorshipVideoSection').then(m => m.MentorshipVideoSection),
    { ssr: false }
);
const StrategieQualify = dynamic(
    () => import('@/components/strategie/StrategieQualify').then(m => m.StrategieQualify),
    { ssr: false }
);

export const StrategieVideoBooking = ({ leadId, email }: { leadId: string; email?: string }) => {
    useEffect(() => {
        initUtmTracking();
        try { localStorage.setItem('cid', leadId); } catch { /* ignore */ }
    }, [leadId]);

    const scrollToForm = () => document.getElementById('qualify')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    return (
        <>
            {/* Hero — 3 headlines ze strategy page, CTA scrolluje na formulář */}
            <StrategieHero ctaScrollTo="qualify" ctaLabel="Rezervovat hovor" />

            {/* VSL video */}
            <div className="pt-8 pb-8 relative overflow-visible">
                <div className="w-full max-w-[95vw] md:max-w-[60vw] lg:max-w-[1100px] mx-auto px-4">
                    <FadeUp>
                        <MentorshipVideoSection vimeoId="1200135011" trackCid={leadId} trackEmail={email} />
                    </FadeUp>
                </div>
            </div>

            {/* Kvalifikace + rezervace */}
            <section id="qualify" className="pt-8 pb-2 px-4 relative z-20 text-center">
                <FadeUp>
                    <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight-custom leading-[1.1] max-w-3xl mx-auto">
                        Odpověz na pár otázek a&nbsp;rezervuj si hovor
                    </h2>
                    <p className="text-gray-300 text-base md:text-lg mt-4 max-w-xl mx-auto">
                        Ať na hovor přijdeme připravení a&nbsp;rovnou půjdeme k&nbsp;věci.
                    </p>
                </FadeUp>
            </section>

            <div className="pt-6 relative z-20">
                <StrategieQualify leadId={leadId} email={email} />
            </div>

            {/* Proof — 1:1 jako homepage */}
            <CallBenefits />

            <div className="pt-4 flex flex-col items-center relative z-20 pb-16">
                <button
                    type="button"
                    onClick={scrollToForm}
                    className="bg-brand-red hover:bg-[#cc0b00] text-white px-10 py-5 rounded-full text-lg md:text-xl font-bold tracking-tight-custom transition-all inline-block uppercase hover:scale-105"
                >
                    Jsem ready růst
                </button>
            </div>

            <Testimonials />

            <ScreenshotGallery />
        </>
    );
};
