"use client";

import React, { useState, useRef, useEffect } from 'react';
import { FadeUp } from './FadeUp';
import { Plyr } from 'plyr-react';
import "plyr-react/plyr.css";

export const VideoSection = () => {
    const [showContent, setShowContent] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (!sectionRef.current) return;
            const rect = sectionRef.current.getBoundingClientRect();
            // Show when the top of the element hits the middle of the screen
            if (rect.top <= window.innerHeight / 2) {
                setShowContent(true);
            }
        };
        window.addEventListener('scroll', handleScroll);
        // Initial check in case it's already in view on load
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <section ref={sectionRef} className="-mt-[60dvh] md:-mt-[50dvh] flex items-center justify-center pb-24 px-4 relative z-20 bg-transparent transition-opacity duration-1000 ease-in-out" style={{ opacity: showContent ? 1 : 0, pointerEvents: showContent ? 'auto' : 'none' }}>
            <div className="max-w-[1400px] mx-auto w-full">
                <div className="max-w-5xl mx-auto relative">
                    <div className="relative rounded-lg md:rounded-xl overflow-hidden border border-white/10 bg-[#151515] shadow-2xl">
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
                        {showContent && (
                            <Plyr
                                source={{
                                    type: 'video' as const,
                                    sources: [
                                        {
                                            src: 'https://www.youtube.com/embed/OwzIIBkiQYM?origin=https://plyr.io&amp;iv_load_policy=3&amp;modestbranding=1&amp;playsinline=1&amp;showinfo=0&amp;rel=0&amp;enablejsapi=1&amp;cc_load_policy=1&amp;hl=cs',
                                            provider: 'youtube' as const,
                                        },
                                    ],
                                }}
                                options={{
                                    controls: [
                                        'play-large',
                                        'play',
                                        'progress',
                                        'current-time',
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
                                        controls: 0
                                    }
                                }}
                            />
                        )}
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
