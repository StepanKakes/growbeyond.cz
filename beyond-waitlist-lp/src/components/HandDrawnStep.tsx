import React from 'react';
import { FadeUp } from './FadeUp';

interface HandDrawnStepProps {
    text: string;
    delay?: number;
    className?: string;
}

export const HandDrawnStep = ({ text, delay = 0, className = "" }: HandDrawnStepProps) => {
    return (
        <section className={`px-4 py-12 relative z-20 ${className}`}>
            <div className="w-full max-w-[95vw] md:max-w-[65vw] lg:max-w-[1200px] mx-auto flex flex-col items-center">
                <FadeUp delay={delay}>
                    <div className="flex flex-col items-center">
                        {/* Hand-drawn Marker Arrow SVG */}
                        <svg 
                            width="100" 
                            height="90" 
                            viewBox="0 0 100 90" 
                            fill="none" 
                            className="text-brand-red mb-1 drop-shadow-sm"
                        >
                            <path 
                                d="M20 5C20 5 80 5 80 50C80 65 65 75 60 78M60 78L72 75M60 78L62 65" 
                                stroke="currentColor" 
                                strokeWidth="5" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            />
                        </svg>
                        
                        {/* Helvetica label at the end of arrow */}
                        <h2 className="text-xl md:text-2xl font-bold text-brand-red tracking-tight leading-none rotate-[1.5deg]" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
                            {text}
                        </h2>
                    </div>
                </FadeUp>
            </div>
        </section>
    );
};
