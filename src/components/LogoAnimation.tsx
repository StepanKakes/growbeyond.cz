"use client";

import React, { useState, useEffect, useRef } from 'react';

const SYMBOLS = "X*#%&@$!0123456789";

interface LogoAnimationProps {
    text: string;
    animationKey: number;
}

export const LogoAnimation: React.FC<LogoAnimationProps> = ({ text, animationKey }) => {
    const [displayText, setDisplayText] = useState(text);
    const timeouts = useRef<NodeJS.Timeout[]>([]);

    useEffect(() => {
        // Initial render is handled by default state
        if (animationKey === 0) return;

        // Reset timeouts
        timeouts.current.forEach(clearTimeout);
        timeouts.current = [];

        const chars = text.split("");

        chars.forEach((targetChar, i) => {
            // Stagger the start and end of each character's flicker
            const startDelay = i * 80;
            const flickerDuration = 400 + Math.random() * 300;
            const startTime = Date.now() + startDelay;
            const endTime = startTime + flickerDuration;

            const animateChar = () => {
                const now = Date.now();

                if (now < startTime) {
                    // Not started yet, wait
                    const t = setTimeout(animateChar, 40);
                    timeouts.current.push(t);
                } else if (now < endTime) {
                    // Flickering through symbols
                    setDisplayText(prev => {
                        const arr = prev.split("");
                        arr[i] = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
                        return arr.join("");
                    });
                    const t = setTimeout(animateChar, 40);
                    timeouts.current.push(t);
                } else {
                    // Resolve to final character
                    setDisplayText(prev => {
                        const arr = prev.split("");
                        arr[i] = targetChar;
                        return arr.join("");
                    });
                }
            };

            animateChar();
        });

        return () => timeouts.current.forEach(clearTimeout);
    }, [animationKey, text]);

    return <span className="inline-block min-w-[1.2ch]">{displayText}</span>;
};
