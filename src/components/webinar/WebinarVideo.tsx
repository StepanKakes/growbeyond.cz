"use client";

import React from 'react';

// Prostor pro VSL. Dokud není nastavené NEXT_PUBLIC_WEBINAR_VIDEO_URL,
// zobrazí se tichý zástupný rámeček s play tlačítkem v poměru 16:9.
export const WebinarVideo = ({ src, poster }: { src?: string; poster?: string }) => {
    if (src) {
        return (
            <video
                className="w-full aspect-video rounded-xl border border-white/10 bg-black"
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
            className="relative w-full aspect-video rounded-xl border border-white/10 bg-[#141414] flex items-center justify-center"
            role="img"
            aria-label="Video k webináři připravujeme"
        >
            <span className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-brand-red flex items-center justify-center">
                <svg className="w-6 h-6 md:w-7 md:h-7 text-white relative left-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                </svg>
            </span>
        </div>
    );
};
