
"use client";

import React, { useEffect } from 'react';
import { motion, useTransform, useTime, useMotionValue, useSpring, MotionValue } from 'framer-motion';

// Helper: Calculates vertical movement based on X-proximity to a target column
// - targetX: The horizontal center of the blob (-1 to 1)
// - mouseX, mouseY: The current mouse position (-1 to 1)
// - strength: How much the blob moves vertically when active
// Helper: Calculates movement based on proximity
// - targetX: The horizontal center of the blob (-1 to 1)
// - mouseX, mouseY: The current mouse position (-1 to 1)
// - strength: How much the blob moves when active
function useBlobMotion(
    mouseX: MotionValue<number>,
    mouseY: MotionValue<number>,
    targetX: number,
    strength: number,
    time: MotionValue<number>,
    phaseOffset: number
) {
    // 1. Proximity Weight: How close is mouseX to this blob?
    const influence = useTransform(mouseX, (x) => {
        const dist = Math.abs(x - targetX);
        return Math.max(0, 1 - dist / 0.8);
    });

    // 2. Interactive Y: Move up/down based on mouseY * influence
    const interactiveY = useTransform([mouseY, influence], ([y, inf]) => {
        return (y as number) * (inf as number) * strength;
    });

    // 3. Interactive X: Move left/right based on mouseX * influence
    // We dampen X slightly compared to Y for a balanced feel
    const interactiveX = useTransform([mouseX, influence], ([x, inf]) => {
        return (x as number) * (inf as number) * (strength * 0.8);
    });

    // 4. Automatic Float: Gentle idle animation
    const autoY = useTransform(time, (t) => Math.sin((t + phaseOffset) / 2500) * 15);
    const autoX = useTransform(time, (t) => Math.cos((t + phaseOffset) / 3000) * 10);

    // Combine both
    const x = useTransform([interactiveX, autoX], ([i, a]) => `calc(-50% + ${i}px + ${a}px)`);
    const y = useTransform([interactiveY, autoY], ([i, a]) => `calc(${i}px + ${a}px)`);

    return { x, y };
}

export const FractalCanvas: React.FC = () => {
    const time = useTime();

    // --- Mouse Tracking ---
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Normalize to -1 ... 1
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            const y = (e.clientY / window.innerHeight) * 2 - 1;
            mouseX.set(x);
            mouseY.set(y);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    // Smooth out the raw mouse values
    const smoothX = useSpring(mouseX, { stiffness: 50, damping: 25 });
    const smoothY = useSpring(mouseY, { stiffness: 50, damping: 25 });

    // --- Independent Blob Logic ---

    // 1. Red Blob (Center) - Main Focus
    const redMotion = useBlobMotion(smoothX, smoothY, 0, 40, time, 0);

    // 2. Gray Blob (Left)
    const grayLeftMotion = useBlobMotion(smoothX, smoothY, -0.7, 30, time, 5000);

    // 3. Gray Blob (Right)
    const grayRightMotion = useBlobMotion(smoothX, smoothY, 0.7, 30, time, 2500);

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#111111]">

            {/* --- The Blobs (The "Fractals") --- */}

            {/* Left Gray Blob */}
            <motion.div
                className="absolute rounded-full"
                style={{
                    width: '50vw',
                    height: '50vw',
                    left: '10%',
                    top: '60%',
                    x: grayLeftMotion.x,
                    y: grayLeftMotion.y,
                    // Gradient: Light Gray top -> Mid Gray -> Dark Gray (Less White)
                    background: 'linear-gradient(180deg, #6B7280 0%, #4B5563 40%, #1F2937 100%)',
                    filter: 'blur(60px)',
                    willChange: 'transform',
                    backfaceVisibility: 'hidden',
                    transform: 'translateZ(0)',
                    opacity: 0.6
                }}
            />

            {/* Right Gray Blob */}
            <motion.div
                className="absolute rounded-full"
                style={{
                    width: '55vw',
                    height: '55vw',
                    left: '85%',
                    top: '40%',
                    x: grayRightMotion.x,
                    y: grayRightMotion.y,
                    // Gradient: Light Gray top -> Mid Gray -> Dark Gray (Less White)
                    background: 'linear-gradient(180deg, #6B7280 0%, #4B5563 40%, #1F2937 100%)',
                    filter: 'blur(70px)',
                    willChange: 'transform',
                    backfaceVisibility: 'hidden',
                    transform: 'translateZ(0)',
                    opacity: 0.6
                }}
            />

            {/* Center Red Blob (Main Focus) */}
            <motion.div
                className="absolute rounded-full"
                style={{
                    // Even wider oval shape
                    width: '150vw',
                    height: '90vw',
                    left: '50%',
                    // Positioned so only the top portion is visible
                    top: '65%',
                    x: redMotion.x,
                    y: redMotion.y,
                    // Gradient: Light Gray (instead of White) -> Light Red -> Pure Red (No Yellow/Orange)
                    background: 'linear-gradient(180deg, #9CA3AF 0%, #FF4444 20%, #FF0E00 50%, #2a2a2a 100%)',
                    filter: 'blur(60px)', // Reduced blur slightly for perf
                    opacity: 0.9,
                    willChange: 'transform',
                    backfaceVisibility: 'hidden',
                    transform: 'translateZ(0)',
                    boxShadow: '0px -20px 80px -10px rgba(255, 14, 0, 0.4)'
                }}
            />

            {/* Texture Overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: `url('/texture.png')`,
                    backgroundSize: '200px',
                    backgroundRepeat: 'repeat',
                    mixBlendMode: 'overlay',
                    opacity: 1,
                    zIndex: 20,
                }}
            />

            {/* The Fractal Glass / Blender Layer 
          This applies the refraction/banding effect over the colored blobs 
      */}
            <div
                className="blender absolute inset-0 w-full h-full pointer-events-none"
                style={{
                    maskImage: 'linear-gradient(to bottom, transparent 0%, black 60%, black 80%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 60%, black 80%, transparent 100%)'
                }}
            />

            {/* Vignette */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#000000] via-transparent to-transparent pointer-events-none mix-blend-multiply opacity-80" />
        </div>
    );
};
