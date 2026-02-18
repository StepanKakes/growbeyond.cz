"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { instrumentSerif, helvetica } from "@/app/fonts";

const WORDS = [
    "INSTAGRAM",
    "FOUNDATIONS",
    "AUTHENTICITY",
    "SCRIPTWRITING",
    "GPT",
    "MVP"
];

export function RotatingText() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % WORDS.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex items-center w-full h-10 overflow-hidden pointer-events-none">
            {/* Left side: "Beyond" - right aligned to the center */}
            <div className="flex-1 text-right pr-1">
                <span className={`${instrumentSerif.className} italic text-white text-lg md:text-xl tracking-wide`}>
                    Beyond
                </span>
            </div>

            {/* Right side: Changing words - left aligned to the center */}
            <div className="flex-1 text-left pl-1 relative h-full flex items-center">
                <AnimatePresence mode="wait">
                    <motion.span
                        key={WORDS[index]}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 5 }}
                        transition={{
                            duration: 0.4,
                            ease: [0.2, 0.8, 0.2, 1]
                        }}
                        className={`${helvetica.className} text-lg md:text-xl font-bold tracking-tight text-white uppercase whitespace-nowrap`}
                    >
                        {WORDS[index]}
                    </motion.span>
                </AnimatePresence>
            </div>
        </div>
    );
}
