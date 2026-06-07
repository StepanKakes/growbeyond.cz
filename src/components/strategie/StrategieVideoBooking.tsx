"use client";

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { initUtmTracking } from '@/lib/utm';
import { FadeUp } from '../FadeUp';

const MentorshipVideoSection = dynamic(
    () => import('@/components/mentorship/MentorshipVideoSection').then(m => m.MentorshipVideoSection),
    { ssr: false }
);
const CalendlySection = dynamic(
    () => import('@/components/mentorship/CalendlySection').then(m => m.CalendlySection),
    { ssr: false }
);

export const StrategieVideoBooking = ({
    email,
    followupEligible = true,
}: {
    email?: string;
    followupEligible?: boolean;
}) => {
    useEffect(() => {
        initUtmTracking();
    }, []);

    return (
        <>
            {/* VSL video */}
            <div className="pt-8 pb-8 relative overflow-visible">
                <div className="w-full max-w-[95vw] md:max-w-[60vw] lg:max-w-[1100px] mx-auto px-4">
                    <FadeUp>
                        <MentorshipVideoSection />
                    </FadeUp>
                </div>
            </div>

            {/* Rezervace */}
            <section className="pt-8 pb-2 px-4 relative z-20 text-center">
                <FadeUp>
                    <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight-custom leading-[1.1] max-w-3xl mx-auto">
                        Rezervuj si svůj strategický hovor
                    </h2>
                    <p className="text-gray-300 text-base md:text-lg mt-4 max-w-xl mx-auto">
                        Vyber si termín, který ti vyhovuje. Hovor je zdarma a&nbsp;nezávazný — projdeme spolu tvou situaci a&nbsp;ukážeme ti další kroky.
                    </p>
                </FadeUp>
            </section>

            <CalendlySection prefillEmail={email} followupEligible={followupEligible} />
        </>
    );
};
