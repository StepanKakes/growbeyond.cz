"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { LogoAnimation } from './LogoAnimation';

const springTransition = {
    type: "spring" as const,
    stiffness: 100,
    damping: 20,
    mass: 1,
};

export const Navbar = ({ minimal = false }: { minimal?: boolean }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [animationKey, setAnimationKey] = useState(0);
    const pathname = usePathname();

    const isCSP = pathname === '/csp';
    const mainButtonHref = isCSP ? '/' : '/csp';
    const mainButtonText = isCSP ? 'spolupracovat 1:1' : 'Creator Starter Pack';
    const mainButtonStyle = isCSP 
        ? "bg-[#FF0E00] hover:bg-[#cc0b00] text-white px-6 py-2 rounded-full text-sm font-bold tracking-tight-custom transition-all"
        : "text-white/80 hover:text-white transition-colors text-sm font-medium tracking-tight";

    // Periodic logo animation trigger
    useEffect(() => {
        const timer = setInterval(() => {
            setAnimationKey(prev => prev + 1);
        }, 10000);
        return () => clearInterval(timer);
    }, []);

    return (
        <nav
            className="absolute top-0 left-0 w-full z-[100] px-4 py-4"
        >
            {/* Content container */}
            <div
                className="mx-auto flex justify-between items-center relative max-w-[1200px]"
            >

                {/* Left Side (Empty for balance) */}
                <div className="flex-1 md:flex hidden"></div>

                {/* Center: Beyond (Instrument Serif, Italic) */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="text-white text-2xl md:text-3xl font-serif italic tracking-wide">
                        <LogoAnimation
                            key={animationKey}
                            text="Beyond"
                            animationKey={animationKey}
                        />
                    </span>
                </div>

                {/* Right side: Desktop Buttons */}
                <div className={`${minimal ? 'hidden' : 'hidden md:flex'} items-center gap-5 flex-1 justify-end`}>
                    <a
                        href="https://www.growbeyond.cz/resources/7dni-email-program"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/80 hover:text-white transition-colors text-sm font-medium tracking-tight"
                    >
                        7denní program zdarma
                    </a>
                    {isCSP && (
                        <a
                            href={mainButtonHref}
                            className={mainButtonStyle}
                        >
                            {mainButtonText}
                        </a>
                    )}
                </div>

                {/* Mobile Hamburger Button */}
                <div className={`${minimal ? 'hidden' : 'md:hidden flex'} flex-1 justify-end z-50`}>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-white p-2"
                    >
                        <div className="w-6 h-5 relative flex flex-col justify-between">
                            <motion.span
                                animate={isOpen ? { rotate: 45, y: 9 } : { rotate: 0, y: 0 }}
                                className="w-full h-0.5 bg-white block rounded-full origin-center"
                            />
                            <motion.span
                                animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
                                className="w-full h-0.5 bg-white block rounded-full"
                            />
                            <motion.span
                                animate={isOpen ? { rotate: -45, y: -9 } : { rotate: 0, y: 0 }}
                                className="w-full h-0.5 bg-white block rounded-full origin-center"
                            />
                        </div>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={springTransition}
                        className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[40] flex flex-col items-center justify-center gap-8 md:hidden"
                    >
                        <a
                            href="https://www.growbeyond.cz/resources/7dni-email-program"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white transition-colors text-xl font-medium tracking-tight"
                        >
                            7denní program zdarma
                        </a>
                        {isCSP && (
                            <a
                                href={mainButtonHref}
                                onClick={() => setIsOpen(false)}
                                className="bg-[#FF0E00] hover:bg-[#cc0b00] text-white px-8 py-4 rounded-full text-lg font-bold tracking-tight-custom transition-all"
                            >
                                {mainButtonText}
                            </a>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};
