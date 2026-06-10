"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Plyr } from 'plyr-react';
import "plyr-react/plyr.css";

const DEFAULT_VIMEO_ID = '1181936415';

const plyrOptions = {
    muted: true,
    loop: { active: true },
    ratio: '16:9',
    vimeo: {
        autoplay: true,
        muted: true,
        responsive: true,
        byline: false,
        portrait: false,
        title: false,
        transparent: false
    },
    controls: [
        'play-large',
        'play',
        'mute',
        'volume',
        'fullscreen'
    ]
};

export const MentorshipVideoSection = ({ vimeoId = DEFAULT_VIMEO_ID }: { vimeoId?: string }) => {
    const plyrSource = useMemo(() => ({
        type: 'video' as const,
        sources: [{ src: vimeoId, provider: 'vimeo' as const }],
    }), [vimeoId]);

    const [showContent, setShowContent] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const videoContainerRef = useRef<HTMLDivElement>(null);
    const hasAutoPlayed = useRef(false);

    const [showOverlay, setShowOverlay] = useState(true);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (!sectionRef.current) return;
            const rect = sectionRef.current.getBoundingClientRect();
            if (rect.top <= window.innerHeight / 2) {
                setShowContent(true);
            }


        };
        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Custom progress bar tracking - Using requestAnimationFrame + Predictive Interpolation for ultimate smoothness
    useEffect(() => {
        let requestRef: number;
        let lastKnownTime = 0;
        let lastSyncTimestamp = performance.now();

        const updateProgress = () => {
            const player = playerRef.current?.plyr;
            if (player && player.ready) {
                try {
                    if (!hasAutoPlayed.current && showContent) {
                        hasAutoPlayed.current = true;
                        player.muted = true;
                        player.play().catch(() => { });
                    }

                    const playerTime = player.currentTime || 0;
                    const duration = player.duration || 1;
                    const isPlaying = player.playing;

                    // Track paused state for pause-overlay
                    if (!showOverlay) {
                        setIsPaused(!isPlaying);
                    }

                    if (playerTime !== lastKnownTime) {
                        lastKnownTime = playerTime;
                        lastSyncTimestamp = performance.now();
                    }

                    let interpolatedTime = lastKnownTime;
                    if (isPlaying) {
                        interpolatedTime += (performance.now() - lastSyncTimestamp) / 1000;
                    }

                    const time = Math.min(interpolatedTime * 1.5, duration);

                    // Detect end of video to reset and loop (preventing recommended videos)
                    if (playerTime >= duration - 0.5 && duration > 5) {
                        try {
                            player.currentTime = 0;
                            player.play().catch(() => { });
                        } catch (e) { }
                    }

                    let width = 0;
                    const midpointTime = duration * 0.3;

                    if (time < midpointTime) {
                        const t = time / midpointTime;
                        const easeOut = 1 - Math.pow(1 - t, 4.0);
                        width = easeOut * 50;
                    } else {
                        const remainingTime = time - midpointTime;
                        const remainingDuration = Math.max(duration - midpointTime, 0.1);
                        width = 50 + (remainingTime / remainingDuration) * 50;
                    }

                    if (progressBarRef.current) {
                        progressBarRef.current.style.width = `${Math.min(width, 100)}%`;
                    }
                } catch (e) {
                    // Not ready yet
                }
            }
            requestRef = requestAnimationFrame(updateProgress);
        };

        requestRef = requestAnimationFrame(updateProgress);
        return () => cancelAnimationFrame(requestRef);
    }, [showContent]);

    const handleOverlayClick = () => {
        const player = playerRef.current?.plyr;
        if (player && player.ready) {
            try {
                player.muted = false;
                player.currentTime = 0;
                player.play().catch(() => { });
            } catch (e) {
                console.error("Plyr interaction error:", e);
            }
        }
        setShowOverlay(false);
    };

    return (
        <div ref={sectionRef} id="vsl" className="w-full">
            <div ref={videoContainerRef} className="relative rounded-lg md:rounded-xl overflow-hidden border border-white/10 bg-[#151515] z-20">
                <style>{`
                    .plyr {
                        --plyr-color-main: #FF0E00;
                        --plyr-video-background: #111111;
                        --plyr-menu-background: #151515;
                        --plyr-menu-color: #ffffff;
                    }
                    .plyr .plyr__video-embed iframe {
                        pointer-events: none;
                    }
                    .plyr.plyr--paused .plyr__video-embed iframe {
                        pointer-events: auto;
                    }
                    .plyr__video-embed .plyr__poster {
                        z-index: 2;
                    }
                    .plyr .plyr__video-embed::after {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: 80px;
                        z-index: 1;
                        pointer-events: none;
                    }
                    @keyframes box-shadow-pulse {
                        0% { box-shadow: 0 0 0 0px rgba(255, 255, 255, 0.5); }
                        100% { box-shadow: 0 0 0 40px rgba(255, 255, 255, 0); }
                    }
                    @keyframes wave-pulse {
                        0%, 20% { opacity: 0; }
                        40%, 100% { opacity: 1; }
                    }
                    .animate-box-shadow-pulse {
                        animation: box-shadow-pulse 2s infinite;
                    }
                    .animate-wave-1 {
                        animation: wave-pulse 2s infinite;
                    }
                    .animate-wave-2 {
                        animation: wave-pulse 2s infinite 0.4s;
                    }
                `}</style>
                <div className="relative">
                    {/* Smart Autoplay Overlay - muted video playing */}
                    {showOverlay && (
                        <div
                            onClick={handleOverlayClick}
                            className="absolute inset-0 z-[10] flex items-center justify-center cursor-pointer"
                        >
                        <div className="relative flex flex-col items-center gap-4 px-12 py-8 rounded-2xl border-2 border-white/40 animate-box-shadow-pulse"
                            style={{ background: 'rgba(255, 14, 0, 0.88)' }}
                        >
                                <svg className="w-14 h-14 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 18.25l-4-4H5a1 1 0 01-1-1v-4a1 1 0 011-1h3l4-4v14z" />
                                    <path className="animate-wave-1" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.536 8.464a5 5 0 010 7.072" />
                                    <path className="animate-wave-2" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18.364 5.636a9 9 0 010 12.728" />
                                </svg>
                                <div className="text-center">
                                    <p className="text-white font-bold text-base md:text-lg tracking-wide uppercase leading-tight">
                                        VIDEO SE PŘEHRÁVÁ
                                    </p>
                                    <p className="text-white/80 font-medium text-sm md:text-base mt-1">
                                        Klikni pro zapnutí zvuku
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pause overlay - pulsing play button when paused after overlay dismissed */}
                    {!showOverlay && isPaused && (
                        <div
                            onClick={() => {
                                const player = playerRef.current?.plyr;
                                if (player && player.ready) {
                                    try { player.play().catch(() => {}); } catch (e) {}
                                }
                            }}
                            className="absolute inset-0 z-[10] bg-black/30 flex items-center justify-center cursor-pointer"
                        >
                            <div className="w-20 h-20 rounded-full bg-white/25 backdrop-blur-sm border border-white/40 flex items-center justify-center animate-box-shadow-pulse">
                                <svg className="w-9 h-9 text-white relative left-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                        </div>
                    )}

                    {/* 16:9 Aspect Ratio Wrapper */}
                    <div className="w-full relative pb-[56.25%]">
                        <div className="absolute inset-0">
                            <Plyr
                                ref={playerRef}
                                source={plyrSource}
                                options={plyrOptions}
                            />
                        </div>
                    </div>

                    <div className="w-full h-1.5 bg-white/10 relative overflow-hidden group">
                        <div
                            ref={progressBarRef}
                            className="absolute top-0 left-0 h-full bg-[#FF0E00]"
                            style={{ width: '0%' }}
                        >
                            <div className="absolute top-0 right-0 w-4 h-full bg-white/30 blur-[2px]" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
