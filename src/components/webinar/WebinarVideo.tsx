"use client";

import React, { useRef, useState } from 'react';
import { WEBINAR } from './webinarConfig';

/**
 * VSL v hero. Než se pustí, leží přes poster jen červené tlačítko a nativní
 * ovládání je schované — poster je klidný záběr, přes který by lišta s
 * časem a hlasitostí působila jako rozbitá grafika. Po spuštění přebírá
 * ovládání prohlížeč.
 */
export const WebinarVideo = ({
    src = WEBINAR.video.src,
    poster = WEBINAR.video.poster,
}: {
    src?: string;
    poster?: string;
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [started, setStarted] = useState(false);

    return (
        <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black">
            <video
                ref={videoRef}
                className="block w-full aspect-video"
                controls={started}
                playsInline
                preload="metadata"
                poster={poster}
                src={src}
                onPlay={() => setStarted(true)}
            />

            {!started && (
                <button
                    type="button"
                    aria-label="Přehrát video"
                    onClick={() => {
                        // Když prohlížeč přehrání odmítne, aspoň odkryj nativní
                        // ovládání, ať se divák nedívá na mrtvé tlačítko.
                        videoRef.current?.play().catch(() => setStarted(true));
                    }}
                    className="absolute inset-0 flex items-center justify-center focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white"
                >
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-red transition-colors hover:bg-[#d40c00] md:h-20 md:w-20">
                        <svg className="relative left-0.5 h-6 w-6 text-white md:h-7 md:w-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </span>
                </button>
            )}
        </div>
    );
};
