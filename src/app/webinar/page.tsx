"use client";

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { initUtmTracking } from '@/lib/utm';
import { TextureOverlay } from '@/components/TextureOverlay';
import { WebinarTopBar } from '@/components/webinar/WebinarTopBar';
import { WebinarHero } from '@/components/webinar/WebinarHero';
import {
    AgendaSection,
    TebeSection,
    AudienceSection,
    HostSection,
    ClosingSection,
    WebinarFooter,
} from '@/components/webinar/WebinarSections';

const SmoothScroll = dynamic(() => import('@/components/SmoothScroll').then(mod => mod.SmoothScroll), { ssr: false });
const WebinarFormModal = dynamic(() => import('@/components/webinar/WebinarFormModal').then(mod => mod.WebinarFormModal), { ssr: false });

// VSL se doplní přes env NEXT_PUBLIC_WEBINAR_VIDEO_URL (a volitelně poster),
// do té doby je v hero zástupný rámeček.
const VIDEO_SRC = process.env.NEXT_PUBLIC_WEBINAR_VIDEO_URL;
const VIDEO_POSTER = process.env.NEXT_PUBLIC_WEBINAR_VIDEO_POSTER;

export default function WebinarPage() {
    useEffect(() => {
        initUtmTracking();
    }, []);

    return (
        <SmoothScroll>
            <main className="min-h-screen relative bg-[#0A0A0A] text-white selection:bg-brand-red selection:text-white overflow-x-hidden">
                <WebinarTopBar />
                <TextureOverlay />

                <WebinarHero videoSrc={VIDEO_SRC} videoPoster={VIDEO_POSTER} />
                <AgendaSection />
                <TebeSection />
                <AudienceSection />
                <HostSection />
                <ClosingSection />
                <WebinarFooter />
            </main>

            <WebinarFormModal />
        </SmoothScroll>
    );
}
