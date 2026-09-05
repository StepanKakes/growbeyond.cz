"use client";

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { initUtmTracking } from '@/lib/utm';
import { TextureOverlay } from '@/components/TextureOverlay';
import { LegalFooter } from '@/components/LegalFooter';
import { WebinarHero } from '@/components/webinar/WebinarHero';
import {
    RegistrationSection,
    AgendaSection,
    TebeSection,
    AudienceSection,
    HostSection,
    ClosingSection,
    WebinarFooter,
    REGISTRATION_ID,
} from '@/components/webinar/WebinarSections';

const SmoothScroll = dynamic(() => import('@/components/SmoothScroll').then(mod => mod.SmoothScroll), { ssr: false });

// VSL se doplní přes env NEXT_PUBLIC_WEBINAR_VIDEO_URL (a volitelně poster),
// do té doby je v hero zástupný blok podle Figmy.
const VIDEO_SRC = process.env.NEXT_PUBLIC_WEBINAR_VIDEO_URL;
const VIDEO_POSTER = process.env.NEXT_PUBLIC_WEBINAR_VIDEO_POSTER;

export default function WebinarPage() {
    useEffect(() => {
        initUtmTracking();
    }, []);

    return (
        <SmoothScroll>
            <main className="min-h-screen relative bg-[#0A0A0A] text-white font-sans selection:bg-brand-red selection:text-white overflow-x-hidden">
                <TextureOverlay />

                <WebinarHero videoSrc={VIDEO_SRC} videoPoster={VIDEO_POSTER} />
                <RegistrationSection id={REGISTRATION_ID} showDescription={false} />
                <AgendaSection />
                <TebeSection />
                <AudienceSection />
                <HostSection />
                <ClosingSection />
                <WebinarFooter />
                <LegalFooter />
            </main>
        </SmoothScroll>
    );
}
