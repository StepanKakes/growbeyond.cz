"use client";

import { useState } from "react";
import Link from "next/link";
import { IsoWheel } from "@/components/IsoWheel";
import { TextureOverlay } from "@/components/TextureOverlay";
import { instrumentSerif } from "./fonts";

export default function NotFound() {
    const [progress, setProgress] = useState(0); // default is index 0 / 10 = 0
    
    // The text starts with 0 opacity and goes up to 1 as ISO maxes out
    const textOpacity = progress;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden bg-[#111111]">
            {/* Global Grain Texture used identically to main page */}
            <TextureOverlay />

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center w-full max-w-5xl mt-12 md:mt-20">
                
                {/* Visual 404 block */}
                <div 
                   className="flex items-center justify-center select-none w-full gap-4 md:gap-8 lg:gap-12" 
                   aria-hidden="true"
                >
                    {/* First 4 */}
                    <span 
                       className={`${instrumentSerif.className} italic tracking-[-0.05em] text-[#FF0E00] leading-none z-10 drop-shadow-sm pointer-events-none`} 
                       style={{ fontSize: 'clamp(7rem, 25vw, 18rem)' }}
                    >
                        4
                    </span>
                    
                    {/* The ISO Wheel acting as the 0 */}
                    {/* Sized perfectly to act as the middle character. Full circle visible! */}
                    <div className="relative z-20 w-[clamp(9rem,25vw,16rem)] h-[clamp(9rem,25vw,16rem)] flex-shrink-0 drop-shadow-2xl">
                        <IsoWheel onValueChange={(p) => setProgress(p)} />
                    </div>
                    
                    {/* Second 4 */}
                    <span 
                       className={`${instrumentSerif.className} italic tracking-[-0.05em] text-[#FF0E00] leading-none z-10 drop-shadow-sm pointer-events-none`} 
                       style={{ fontSize: 'clamp(7rem, 25vw, 18rem)' }}
                    >
                        4
                    </span>
                </div>

                {/* Text Block */}
                <div className="mt-12 md:mt-16 flex flex-col items-center text-center gap-3 max-w-md text-white">
                    <h1 className="text-2xl md:text-4xl font-bold tracking-[-0.04em] uppercase">
                        Stránka neexistuje
                    </h1>
                    <p 
                        className="text-lg md:text-xl font-bold leading-snug transition-opacity duration-200 text-white"
                        style={{ opacity: textOpacity }}
                    >
                        Podobně jako můj příjem, když jsem měl 80&nbsp;000 sledujících...
                    </p>
                </div>

                {/* CTA Link */}
                <div className="mt-8 md:mt-12 mb-10">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-200 group text-sm md:text-base"
                    >
                        <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span className="underline decoration-white/30 underline-offset-4 group-hover:decoration-white transition-colors duration-200">
                            Zpět na hlavní stránku
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
