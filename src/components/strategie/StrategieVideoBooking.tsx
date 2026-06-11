"use client";

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { initUtmTracking } from '@/lib/utm';
import { FadeUp } from '../FadeUp';

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
        // ulož cid (= lead id) pro případné návraty bez parametru
        try { localStorage.setItem('cid', leadId); } catch { /* ignore */ }
    }, [leadId]);

    return (
        <>
            {/* VSL video */}
            <div className="pt-8 pb-8 relative overflow-visible">
                <div className="w-full max-w-[95vw] md:max-w-[60vw] lg:max-w-[1100px] mx-auto px-4">
                    <FadeUp>
                        <MentorshipVideoSection vimeoId="1200135011" trackCid={leadId} trackEmail={email} />
                    </FadeUp>
                </div>
            </div>

            {/* Kvalifikace + rezervace */}
            <section className="pt-8 pb-2 px-4 relative z-20 text-center">
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
        </>
    );
};
