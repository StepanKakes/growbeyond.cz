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
    autoplay: true,
    muted: true,
    ratio: '16:9',
    vimeo: {
        autoplay: true,
        muted: true,
        responsive: true
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

    // Custom progress bar tracking - Using requestAnimationFrame for ultimate smoothness
    useEffect(() => {
        let requestRef: number;

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

                    const time = player.currentTime || 0;
                    const duration = player.duration || 1;
                    let width = 0;

                    // Goal: Reach 50% width at 20% of total duration
                    const midpointTime = duration * 0.2;

                    if (time < midpointTime) {
                        // First 20% of time: 0 -> 50% width
                        // Ease-out curve: starts fast, slows down towards the 50% mark
                        const t = time / midpointTime;
                        const easeOut = 1 - Math.pow(1 - t, 2.5); // 2.5 power for aggressive start and smooth slow down
                        width = easeOut * 50;
                    } else {
                        // Remaining 80% of time: 50% -> 100% width (linear "normal" speed)
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
                        `}</style>
                        <div className="relative">
                            {/* Smart Autoplay Overlay */}
                            {showOverlay && (
                                <div
                                    onClick={handleOverlayClick}
                                    className="absolute inset-0 z-[10] bg-black/40 flex items-center justify-center cursor-pointer transition-opacity duration-300"
                                >
                                    <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-black/60 border border-white/10 hover:bg-black/80 transition-colors shadow-2xl">
                                        <div className="w-16 h-16 rounded-full bg-[#FF0E00] flex items-center justify-center animate-pulse shadow-[0_0_30px_rgba(255,14,0,0.5)]">
                                            <svg className="w-8 h-8 text-white relative right-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                {/* Speaker off icon */}
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                            </svg>
                                        </div>
                                        <span className="text-white font-bold text-xl tracking-tight-custom">
                                            Klikni pro přehrání
                                        </span>
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
                                    className="absolute top-0 left-0 h-full bg-[#FF0E00] transition-all duration-[16ms] ease-linear"
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
