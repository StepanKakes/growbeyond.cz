"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Plyr } from 'plyr-react';
import "plyr-react/plyr.css";

const plyrSource = {
    type: 'video' as const,
    sources: [
        {
            src: '1181936415',
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

export const MentorshipVideoSection = () => {
    const [showContent, setShowContent] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const videoContainerRef = useRef<HTMLDivElement>(null);
    const hasAutoPlayed = useRef(false);

    const [showOverlay, setShowOverlay] = useState(true);

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

    useEffect(() => {
        const interval = setInterval(() => {
            const player = playerRef.current?.plyr;
            if (player && player.ready) {
                try {
                    if (!hasAutoPlayed.current && showContent) {
                        hasAutoPlayed.current = true;
                        player.muted = true;
                        player.play().catch(() => { });
                    }

                    const time = player.currentTime || 0;
                    const duration = player.duration || 1;
                    let width = 0;

                    if (time < 35) {
                        const t = time / 35;
                        width = (1 - Math.pow(1 - t, 2)) * 50;
                    } else {
                        const remainingTime = time - 35;
                        const remainingDuration = Math.max(duration - 35, 1);
                        width = 50 + (remainingTime / remainingDuration) * 50;
                    }
                    if (progressBarRef.current) {
                        progressBarRef.current.style.width = `${Math.min(width, 100)}%`;
                    }
                } catch (e) {
                    // Not ready yet
                }
            }
        }, 100);

        return () => clearInterval(interval);
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
                `}</style>
                <div className="relative">
                    {showOverlay && (
                        <div
                            onClick={handleOverlayClick}
                            className="absolute inset-0 z-[10] bg-black/40 flex items-center justify-center cursor-pointer transition-opacity duration-300"
                        >
                            <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-black/60 border border-white/10 hover:bg-black/80 transition-colors shadow-2xl">
                                <div className="w-16 h-16 rounded-full bg-[#FF0E00] flex items-center justify-center">
                                    <svg className="w-8 h-8 text-white relative right-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

                    <div className="w-full h-1.5 bg-white/10 relative overflow-hidden group">
                        <div
                            ref={progressBarRef}
                            className="absolute top-0 left-0 h-full bg-[#FF0E00] transition-all duration-100 ease-linear"
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
