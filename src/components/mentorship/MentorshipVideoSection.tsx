"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Plyr } from 'plyr-react';
import "plyr-react/plyr.css";
import { VSL_MILESTONES, trackVslEvent, sendVslProgress } from '@/lib/vslTrack';

const DEFAULT_VIMEO_ID = '1181936415';

export const MentorshipVideoSection = ({ vimeoId = DEFAULT_VIMEO_ID, videoUrl, posterUrl, trackCid, trackEmail }: { vimeoId?: string; videoUrl?: string; posterUrl?: string; trackCid?: string; trackEmail?: string }) => {
    // VSL mód (s trackingem): bez loopu, ať se watchtime počítá čistě.
    const vslMode = !!trackCid;

    // videoUrl = self-hosted MP4 (<video> → nativní iOS fullscreen); jinak Vimeo
    const plyrSource = useMemo(() => (
        videoUrl
            ? { type: 'video' as const, sources: [{ src: videoUrl, type: 'video/mp4' }], ...(posterUrl ? { poster: posterUrl } : {}) }
            : { type: 'video' as const, sources: [{ src: vimeoId, provider: 'vimeo' as const }] }
    ), [videoUrl, vimeoId, posterUrl]);

    const plyrOptions = useMemo(() => ({
        muted: true,
        loop: { active: !vslMode },
        ratio: '16:9',
        // Nativní iOS fullscreen funguje jen pro reálný <video> (MP4), ne iframe Vimeo
        fullscreen: { enabled: true, iosNative: true },
        vimeo: {
            autoplay: true,
            muted: true,
            responsive: true,
            byline: false,
            portrait: false,
            title: false,
            transparent: false
        },
        controls: ['play-large', 'play', 'mute', 'volume', 'fullscreen'],
    }), [vslMode]);

    // Tracking se aktivuje až po zapnutí zvuku (reálná pozornost), milníky dedup
    const trackingActiveRef = useRef(false);
    const sentMilestonesRef = useRef<Set<string>>(new Set());

    const [showContent, setShowContent] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const videoContainerRef = useRef<HTMLDivElement>(null);
    const hasAutoPlayed = useRef(false);
    const fsAttached = useRef(false);
    // No-skip: nejvyšší reálně přehraná pozice; přeskok dopředu se vrátí zpět
    const maxAllowedRef = useRef(0);
    const seekGuardAttached = useRef(false);
    // Persistence max watched vteřiny k leadovi (Notion) — dedup, ať neposíláme stejné číslo
    const lastProgressSentRef = useRef(-1);
    const flushProgressRef = useRef<() => void>(() => { });
    flushProgressRef.current = () => {
        if (!vslMode || !trackCid || !trackingActiveRef.current) return;
        const sec = Math.floor(maxAllowedRef.current);
        if (sec <= lastProgressSentRef.current) return;
        lastProgressSentRef.current = sec;
        const dur = playerRef.current?.plyr?.duration;
        sendVslProgress(trackCid, sec, dur, trackEmail);
    };

    const [showOverlay, setShowOverlay] = useState(true);
    const [isPaused, setIsPaused] = useState(false);

    // Na iOS jde Plyr u Vimeo do CSS-fallback fullscreenu → okolní prvky (SVG
    // popisky, headline) prosvítají. Při fullscreenu přidáme html.vsl-fs a
    // CSS schová prvky s .vsl-fs-hide. Cleanup při odchodu ze stránky.
    useEffect(() => {
        return () => { document.documentElement.classList.remove('vsl-fs'); };
    }, []);

    // Odchod ze stránky / přepnutí tabu / unmount → pošli nejdál dosaženou vteřinu.
    // sendBeacon přežije i zavření tabu, takže o dokoukání nepřijdeme.
    useEffect(() => {
        if (!vslMode) return;
        const flush = () => flushProgressRef.current();
        const onVisibility = () => { if (document.visibilityState === 'hidden') flush(); };
        window.addEventListener('pagehide', flush);
        document.addEventListener('visibilitychange', onVisibility);
        return () => {
            window.removeEventListener('pagehide', flush);
            document.removeEventListener('visibilitychange', onVisibility);
            flush();
        };
    }, [vslMode]);

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
                    if (!fsAttached.current) {
                        fsAttached.current = true;
                        player.on('enterfullscreen', () => document.documentElement.classList.add('vsl-fs'));
                        player.on('exitfullscreen', () => document.documentElement.classList.remove('vsl-fs'));
                    }

                    // No-skip: zákaz přeskočení dopředu (i v nativním fullscreenu) +
                    // persistence max watched vteřiny při pauze / konci videa
                    if (vslMode && !seekGuardAttached.current) {
                        seekGuardAttached.current = true;
                        player.on('seeking', () => {
                            if (trackingActiveRef.current && player.currentTime > maxAllowedRef.current + 1) {
                                player.currentTime = maxAllowedRef.current;
                            }
                        });
                        player.on('pause', () => flushProgressRef.current());
                        player.on('ended', () => flushProgressRef.current());
                    }

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

                    // No-skip: posouvej max dosaženou pozici jen při reálném přehrávání
                    if (vslMode && trackingActiveRef.current && isPlaying && playerTime <= maxAllowedRef.current + 1.5) {
                        if (playerTime > maxAllowedRef.current) maxAllowedRef.current = playerTime;
                    }

                    // VSL watchtime milníky — reálné přehrávání (po zapnutí zvuku), dedup
                    if (vslMode && trackingActiveRef.current && duration > 1) {
                        const percent = playerTime / duration;
                        for (const m of VSL_MILESTONES) {
                            if (percent >= m.p && !sentMilestonesRef.current.has(m.name)) {
                                sentMilestonesRef.current.add(m.name);
                                trackVslEvent(trackCid as string, m.name, trackEmail);
                            }
                        }
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
                    // V VSL módu necháme video skončit (kvůli čistému watchtime).
                    if (!vslMode && playerTime >= duration - 0.5 && duration > 5) {
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
        // Od teď je divák reálně zapojený → spusť watchtime tracking, no-skip od nuly
        maxAllowedRef.current = 0;
        trackingActiveRef.current = true;
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
                    /* iOS fullscreen fallback: schovat prvky prosvítající přes video */
                    html.vsl-fs .vsl-fs-hide { visibility: hidden !important; }
                    html.vsl-fs .plyr--fullscreen-fallback { z-index: 2147483647 !important; }`}</style>
                <style>{`
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
                        <div className="relative flex flex-col items-center gap-2 md:gap-4 px-5 py-3.5 md:px-12 md:py-8 rounded-xl md:rounded-2xl border md:border-2 border-white/40 animate-box-shadow-pulse"
                            style={{ background: 'rgba(255, 14, 0, 0.88)' }}
                        >
                                <svg className="w-8 h-8 md:w-14 md:h-14 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 18.25l-4-4H5a1 1 0 01-1-1v-4a1 1 0 011-1h3l4-4v14z" />
                                    <path className="animate-wave-1" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.536 8.464a5 5 0 010 7.072" />
                                    <path className="animate-wave-2" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18.364 5.636a9 9 0 010 12.728" />
                                </svg>
                                <div className="text-center">
                                    <p className="text-white font-bold text-xs md:text-lg tracking-wide uppercase leading-tight">
                                        VIDEO SE PŘEHRÁVÁ
                                    </p>
                                    <p className="text-white/80 font-medium text-[11px] md:text-base mt-0.5 md:mt-1">
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
