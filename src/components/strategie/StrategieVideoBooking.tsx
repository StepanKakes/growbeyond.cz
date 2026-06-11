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

            {/* VSL video + popisek Krok 1 */}
            <div className="pt-12 sm:pt-16 pb-8 relative overflow-visible">
                <div className="w-full max-w-[95vw] md:max-w-[60vw] lg:max-w-[1100px] mx-auto relative px-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/images/krok1.svg"
                        alt="Krok 1: Podívej se na video"
                        className="absolute -top-8 sm:-top-12 md:-top-16 left-[-10px] sm:left-[2%] md:left-[5%] w-[220px] sm:w-[280px] md:w-[380px] z-30 pointer-events-none"
                    />
                    <div className="relative z-20">
                        <FadeUp>
                            <MentorshipVideoSection vimeoId="1200135011" trackCid={leadId} trackEmail={email} />
                        </FadeUp>
                    </div>
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

            {/* Kvalifikační formulář + popisek Krok 2 */}
            <div className="pt-6 relative z-20 overflow-visible">
                <div className="w-full max-w-[95vw] md:max-w-[70vw] lg:max-w-[1000px] mx-auto relative px-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/images/krok2.svg"
                        alt="Krok 2"
                        className="absolute -top-4 sm:-top-6 md:-top-10 right-[-10px] sm:right-0 md:right-8 w-[300px] sm:w-[380px] md:w-[530px] z-30 pointer-events-none"
                    />
                    <StrategieQualify leadId={leadId} email={email} />
                </div>
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
