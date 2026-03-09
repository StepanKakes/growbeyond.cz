"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { GlowDivider } from './GlowDivider';

export const AnimatedGlowSection = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    // 2. SCROLL LOGIC
    // Create a container div and attach a ref to it to act as the scroll target.
    // Use the useScroll hook tracking the target: ref with an offset like ["start end", "end start"]
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["0.6 end", "end start"]
    });

    // Use useTransform to map the scrollYProgress to a scaleY value. 
    // It should start at 1 (normal size) and scale up significantly (e.g., to 8, 10, or 15)
    const scaleY = useTransform(scrollYProgress, [0, 1], [1, 15]);

    return (
        <div
            ref={containerRef}
            className="relative w-full"
        >
            {/* 3. STYLING & ANIMATION WRAPPER */}
            {/* Wrap the <GlowDivider /> inside a <motion.div>. */}
            <motion.div
                style={{
                    scaleY,
                    transformOrigin: "bottom center", // Absolutely crucial
                }}
                className="w-full relative z-20"
            >
                <GlowDivider />
            </motion.div>

            {/* Background fill to bridge the gap during scaling */}
            <div className="h-32 md:h-64 w-full bg-brand-dark relative z-10 -mt-[1px]"></div>
        </div>
    );
};
