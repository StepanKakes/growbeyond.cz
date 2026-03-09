import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { LogoAnimation } from './LogoAnimation';

const springTransition = {
    type: "spring" as const,
    stiffness: 100,
    damping: 20,
    mass: 1,
};

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [animationKey, setAnimationKey] = useState(0);
    const [scrolled, setScrolled] = useState(false);

    // Periodic logo animation trigger
    useEffect(() => {
        const timer = setInterval(() => {
            setAnimationKey(prev => prev + 1);
        }, 10000);
        return () => clearInterval(timer);
    }, []);

    // Track scroll position — trigger after 400px
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        setScrolled(latest > 400);
    });

    return (
        <motion.nav
            className="fixed left-0 w-full z-[100] px-4"
            animate={{
                paddingTop: scrolled ? 22 : 16,
                paddingBottom: scrolled ? 22 : 16,
                top: scrolled ? 12 : 0,
            }}
            transition={springTransition}
        >
            {/* Animated background pill */}
            <motion.div
                className="absolute left-1/2 -translate-x-1/2 -z-10"
                animate={{
                    width: scrolled ? "min(1140px, calc(100% - 32px))" : "100.2vw",
                    borderRadius: scrolled ? 9999 : 0,
                    backgroundColor: scrolled ? "rgba(20, 20, 20, 0.4)" : "rgba(0, 0, 0, 0)",
                    backdropFilter: scrolled ? "blur(24px)" : "blur(0px)",
                    WebkitBackdropFilter: scrolled ? "blur(24px)" : "blur(0px)",
                    borderWidth: 1,
                    borderColor: scrolled ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0)",
                }}
                transition={springTransition}
                style={{
                    top: 0,
                    bottom: 0,
                    position: 'absolute',
                    borderStyle: 'solid',
                }}
            />

            {/* Content container — animates width */}
            <motion.div
                className="mx-auto flex justify-between items-center relative"
                animate={{
                    maxWidth: scrolled ? 1100 : 10000,
                    paddingLeft: scrolled ? 16 : 0,
                    paddingRight: scrolled ? 16 : 0,
                }}
                transition={springTransition}
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
                <div className="hidden md:flex items-center gap-5 flex-1 justify-end">
                    <a
                        href="https://www.growbeyond.cz/resources/7dni-email-program"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/80 hover:text-white transition-colors text-sm font-medium tracking-tight"
                    >
                        7denní program zdarma
                    </a>
                    <a
                        href="#footer"
                        className="bg-[#FF0E00] hover:bg-[#cc0b00] text-white px-6 py-2 rounded-full text-sm font-bold tracking-tight-custom transition-all"
                    >
                        spolupracovat 1:1
                    </a>
                </div>

                {/* Mobile Hamburger Button */}
                <div className="md:hidden flex flex-1 justify-end z-50">
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
            </motion.div>

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
                        <a
                            href="#footer"
                            onClick={() => setIsOpen(false)}
                            className="bg-[#FF0E00] hover:bg-[#cc0b00] text-white px-8 py-4 rounded-full text-lg font-bold tracking-tight-custom transition-all"
                        >
                            spolupracovat 1:1
                        </a>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};
