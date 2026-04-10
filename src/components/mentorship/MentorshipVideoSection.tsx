"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plyr } from 'plyr-react';
import "plyr-react/plyr.css";

const plyrSource = {
    type: 'video' as const,
    sources: [
        {
            src: 'https://www.youtube.com/embed/ga19nCZiN6Y?origin=https://plyr.io&amp;iv_load_policy=3&amp;modestbranding=1&amp;playsinline=1&amp;showinfo=0&amp;rel=0&amp;enablejsapi=1&amp;cc_load_policy=1&amp;hl=cs',
            provider: 'youtube' as const,
        },
    ],
};

const plyrOptions = {
    autoplay: true,
    muted: true,
    controls: [
        'play-large',
        'play',
        'mute',
        'volume',
        'fullscreen'
    ],
    youtube: {
        noCookie: true,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        controls: 0,
        autoplay: 1,
        mute: 1
    }
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
            if (player && player.currentTime !== undefined) {
                if (!hasAutoPlayed.current && showContent) {
                    hasAutoPlayed.current = true;
                    player.muted = true;
                    try { player.play(); } catch (_) { }
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
            }
        }, 100);

        return () => clearInterval(interval);
    }, [showContent]);

    const handleOverlayClick = () => {
        const player = playerRef.current?.plyr;
        if (player) {
            player.muted = false;
            player.currentTime = 0;
            player.play();
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
                                <motion.div 
                                    animate={{ 
                                        scale: [1, 1.1, 1],
                                        boxShadow: ["0 0 0 0px rgba(255,14,0,0.4)", "0 0 0 20px rgba(255,14,0,0)", "0 0 0 0px rgba(255,14,0,0)"]
                                    }}
                                    transition={{ 
                                        repeat: Infinity, 
                                        duration: 2,
                                        ease: "easeInOut"
                                    }}
                                    className="w-24 h-24 rounded-full bg-[#FF0E00] flex items-center justify-center mb-4"
                                >
                                    <svg className="w-12 h-12 text-white relative right-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                    </svg>
                                </motion.div>
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-white/70 text-sm md:text-base font-bold tracking-widest uppercase mb-1">
                                        Video se přehrává
                                    </span>
                                    <span className="text-white font-bold text-2xl md:text-3xl tracking-tight-custom text-center drop-shadow-lg">
                                        KLIKNI PRO ZAPNUTÍ ZVUKU
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <Plyr
                        ref={playerRef}
                        source={plyrSource}
                        options={plyrOptions}
                    />

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
