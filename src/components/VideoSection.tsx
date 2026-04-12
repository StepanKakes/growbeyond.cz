"use client";

import React, { useState, useRef, useEffect } from 'react';
import { FadeUp } from './FadeUp';
import { Plyr } from 'plyr-react';
import "plyr-react/plyr.css";

const plyrSource = {
    type: 'video' as const,
    sources: [
        {
            src: '1181937797',
            provider: 'vimeo' as const,
        },
    ],
};

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

export const VideoSection = () => {
    const [showContent, setShowContent] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);
    const playerRef = useRef<any>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const videoContainerRef = useRef<HTMLDivElement>(null);
    const hasAutoPlayed = useRef(false);
    const hasSnapped = useRef(false);
    const [showOverlay, setShowOverlay] = useState(true);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (!sectionRef.current) return;
            const rect = sectionRef.current.getBoundingClientRect();
            // Show when the top of the element hits the middle of the screen
            if (rect.top <= window.innerHeight / 2) {
                setShowContent(true);
            }

            // Scroll snap: when video section enters viewport zone, snap to center video
            // Skip if an anchor link smooth-scroll is already in progress
            if (!hasSnapped.current && !((window as any).__anchorScrolling) && rect.top <= window.innerHeight * 0.8 && rect.top > 0) {
                hasSnapped.current = true;
                const lenis = (window as any).__lenis;
                if (lenis && videoContainerRef.current) {
                    const videoEl = videoContainerRef.current;
                    const videoH = videoEl.offsetHeight;
                    const offset = -(window.innerHeight - videoH) / 2;
                    lenis.scrollTo(videoEl, {
                        offset,
                        duration: 1.5
                    });
                }
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
                    // One-shot autoplay trigger
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

                    // If player reports a new time, sync our interpolation base
                    if (playerTime !== lastKnownTime) {
                        lastKnownTime = playerTime;
                        lastSyncTimestamp = performance.now();
                    }

                    // Predictive time calculation:
                    // interpolatedTime = baseTime + (time elapsed since last sync)
                    // We only advance if the player is actually playing
                    let interpolatedTime = lastKnownTime;
                    if (isPlaying) {
                        interpolatedTime += (performance.now() - lastSyncTimestamp) / 1000;
                    }

                    // Clamp to duration
                    // Apply 1.5x speed multiplier to visual progress as requested
                    const time = Math.min(interpolatedTime * 1.5, duration);

                    // Detect end of video to reset and loop (preventing recommended videos)
                    if (playerTime >= duration - 0.5 && duration > 5) {
                        try {
                            player.currentTime = 0;
                            player.play().catch(() => { });
                        } catch (e) { }
                    }

                    let width = 0;
                    // Goal: Reach 50% width at 10% of total duration
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
                        // Direct style update for best performance with rAF
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
        <section ref={sectionRef} id="vsl" className="-mt-[60dvh] md:-mt-[50dvh] flex items-center justify-center pb-24 px-4 relative z-20 bg-transparent transition-opacity duration-1000 ease-in-out" style={{ opacity: showContent ? 1 : 0 }}>
            <div className="max-w-[1400px] mx-auto w-full">
                <div className="max-w-5xl mx-auto relative">
                    <div className="text-center mb-8 md:mb-12">
                        <h2 className="text-[32px] md:text-[48px] lg:text-[56px] font-bold text-white tracking-tight-custom leading-[1]">
                            Tohle <span className="font-serif italic font-normal text-brand-red">potřebuješ</span> slyšet...
                        </h2>
                    </div>
                    <div ref={videoContainerRef} className="relative rounded-lg md:rounded-xl overflow-hidden border border-white/10 bg-[#151515] shadow-2xl">
                        <style>{`
                            .plyr {
                                --plyr-color-main: #FF0E00;
                                --plyr-video-background: #111111;
                                --plyr-menu-background: #151515;
                                --plyr-menu-color: #ffffff;
                            }
                            /* Hide YouTube branding and controls overlay */
                            .plyr .plyr__video-embed iframe {
                                pointer-events: none;
                            }
                            .plyr.plyr--paused .plyr__video-embed iframe {
                                pointer-events: auto;
                            }
                            .plyr__video-embed .plyr__poster {
                                z-index: 2;
                            }
                            /* Hide YouTube top bar gradient and info */
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
                                            try { player.play().catch(() => { }); } catch (e) { }
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

                            {/* Smart Progress Bar */}
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

                    {/* Video CTA */}
                    <div className="mt-12 flex justify-center">
                        <FadeUp translateY={20}>
                            <a
                                href="#starterpackoffer"
                                className="bg-[#FF0E00] hover:bg-[#cc0b00] text-white px-10 md:px-14 py-4 rounded-full text-lg md:text-xl font-bold tracking-tight-custom transition-all inline-block shadow-lg shadow-brand-red/20"
                            >
                                Jdu do toho
                            </a>
                        </FadeUp>
                    </div>
                </div>
            </div>
        </section>
    );
};
