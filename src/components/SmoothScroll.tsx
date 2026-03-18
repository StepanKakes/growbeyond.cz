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

        // Intercept anchor link clicks for smooth scrolling via Lenis
        const handleAnchorClick = (e: MouseEvent) => {
            const target = (e.target as HTMLElement).closest('a[href^="#"]');
            if (!target) return;
            const href = target.getAttribute('href');
            if (!href || href === '#') return;
            const el = document.querySelector(href);
            if (el) {
                e.preventDefault();
                // Per-section offset: #vsl needs extra because of its negative margin-top
                const scrollOffset = href === '#vsl' ? -150 : 0;
                // Signal to other scroll handlers (e.g. video snap) to not interfere
                (window as any).__anchorScrolling = true;
                lenis.scrollTo(el as HTMLElement, {
                    duration: 1.8,
                    offset: scrollOffset,
                    onComplete: () => { (window as any).__anchorScrolling = false; }
                });
            }
        };
        document.addEventListener('click', handleAnchorClick);

        return () => {
            document.removeEventListener('click', handleAnchorClick);
            lenis.destroy();
        };
    }, []);

    return <>{children}</>;
};
