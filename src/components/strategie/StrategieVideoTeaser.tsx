"use client";

import React from 'react';
import { FadeUp } from '../FadeUp';
import { openStrategieForm } from './strategieForm';

// Uzamčený náhled VSL videa. Skutečné video se odemkne až po vyplnění
// dotazníku (na unikátní stránce leadu), proto teaser otevře formulářový popup.
export const StrategieVideoTeaser = () => {
    return (
        <div className="pt-2 pb-10 relative z-20 overflow-visible">
            <div className="w-full max-w-[95vw] md:max-w-[60vw] lg:max-w-[920px] mx-auto px-4">
                <FadeUp>
                    <button
                        type="button"
                        onClick={openStrategieForm}
                        aria-label="Vyplň dotazník a odemkni si celé video"
                        className="group block w-full text-left relative rounded-lg md:rounded-xl overflow-hidden border border-white/10 bg-[#151515] cursor-pointer"
                    >
                        <style>{`
                            @keyframes teaser-pulse {
                                0% { box-shadow: 0 0 0 0px rgba(255, 14, 0, 0.45); }
                                100% { box-shadow: 0 0 0 28px rgba(255, 14, 0, 0); }
                            }
                            .teaser-pulse { animation: teaser-pulse 2s infinite; }
                        `}</style>

                        {/* Poster 16:9 */}
                        <div className="w-full relative pb-[56.25%]">
                            <img
                                src="/images/vsl-nahled.jpg"
                                alt="Náhled strategického videa"
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                            />
                            {/* Jemné ztmavení jen kvůli kontrastu play tlačítka */}
                            <div className="absolute inset-0 bg-black/25" />

                            {/* Play tlačítko */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 text-center px-6">
                                <div className="teaser-pulse w-[72px] h-[72px] md:w-20 md:h-20 rounded-full bg-brand-red flex items-center justify-center transition-transform group-hover:scale-105">
                                    <svg className="w-8 h-8 md:w-9 md:h-9 text-white relative left-0.5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 border border-white/15">
                                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0110 0v4" />
                                    </svg>
                                    <span className="text-white text-xs md:text-sm font-bold uppercase tracking-wider">
                                        Vyplň dotazník a odemkni celé video
                                    </span>
                                </div>
                            </div>
                        </div>
                    </button>
                </FadeUp>
            </div>
        </div>
    );
};
