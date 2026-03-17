"use client";

import React, { useEffect } from 'react';
import Lenis from 'lenis';

interface SmoothScrollProps {
    children: React.ReactNode;
}

export const SmoothScroll = ({ children }: SmoothScrollProps) => {
    useEffect(() => {
        // Disable smooth scroll on mobile devices
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            return;
        }

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            infinite: false,
        });

        // Expose lenis globally so components can use lenis.scrollTo() for snap effects
        (window as any).__lenis = lenis;

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        // Handle anchor links manually for even smoother results if needed,
        // but Lenis handles them pretty well by default if they are on the same page.

        return () => {
            lenis.destroy();
        };
    }, []);

    return <>{children}</>;
};
