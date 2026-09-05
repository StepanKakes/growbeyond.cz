"use client";

import React from 'react';
import { WEBINAR } from './webinarConfig';

// Prostor pro VSL. Dokud není nastavené NEXT_PUBLIC_WEBINAR_VIDEO_URL,
// zobrazí se zástupný blok s play tlačítkem podle návrhu ve Figmě.
export const WebinarVideo = ({ src, poster }: { src?: string; poster?: string }) => {
    if (src) {
        return (
            <video
                className="w-full aspect-video rounded-2xl md:rounded-[20px] border border-white/10 bg-black"
                controls
                playsInline
                preload="metadata"
                poster={poster}
                src={src}
            />
        );
    }

    return (
        <div
            className="relative w-full aspect-video rounded-2xl md:rounded-[20px] border border-white/[0.12] overflow-hidden flex flex-col items-center justify-center gap-3 md:gap-4"
            style={{ background: 'linear-gradient(180deg, #1c1c1c 0%, #0d0d0d 100%)' }}
            aria-label="Video připravujeme"
        >
            <span className="w-16 h-16 md:w-[88px] md:h-[88px] rounded-full bg-brand-red flex items-center justify-center shadow-[0_0_24px_rgba(255,14,0,0.55),0_0_64px_rgba(255,14,0,0.35)]">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-white relative left-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                </svg>
            </span>
            <span className="text-white/60 text-sm md:text-base font-bold">{WEBINAR.hero.videoLabel}</span>
        </div>
    );
};
