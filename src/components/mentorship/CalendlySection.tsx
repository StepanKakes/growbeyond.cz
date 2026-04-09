"use client";

import React, { useEffect } from 'react';
import { FadeUp } from '../FadeUp';

export const CalendlySection = ({ prefillEmail }: { prefillEmail?: string }) => {
    useEffect(() => {
        const head = document.querySelector('head');
        const script = document.createElement('script');
        script.setAttribute('src', 'https://assets.calendly.com/assets/external/widget.js');
        head?.appendChild(script);

        return () => {
            head?.removeChild(script);
        };
    }, []);

    const calendlyUrl = prefillEmail
        ? `https://calendly.com/tim-creationwithtim/strategicky-call-s-timem?hide_gdpr_banner=1&email=${encodeURIComponent(prefillEmail)}`
        : `https://calendly.com/tim-creationwithtim/strategicky-call-s-timem?hide_gdpr_banner=1`;

    return (
        <section id="calendly" className="pt-6 md:pt-8 pb-32 px-4 relative z-20 bg-transparent">
            <div className="max-w-[1000px] mx-auto w-full flex flex-col gap-12 lg:gap-16">
                
                {/* Embedded Calendly */}
                <div className="w-full">
                    <FadeUp>
                        <div 
                            className="calendly-inline-widget" 
                            data-url={calendlyUrl} 
                            style={{ minWidth: '320px', height: '700px' }}
                        />
                    </FadeUp>
                </div>
            </div>
        </section>
    );
};
