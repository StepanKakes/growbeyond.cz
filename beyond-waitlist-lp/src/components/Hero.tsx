"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { GlowDivider } from './GlowDivider';
import { SocialProof } from './SocialProof';

export const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Track scroll progress of the total hero height (300vh track)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Apply spring smoothing to the scroll progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Map the smoothed scroll progress to scale transformations
  // On mobile: Higher start (0.8), faster completion (ends at 0.7 instead of 0.95), and 2x final size (40 instead of 20)
  const scaleY = useTransform(
    smoothProgress,
    isMobile ? [0, 0.7] : [0, 0.95],
    isMobile ? [0.8, 40] : [0.6, 20]
  );

  // On mobile: Faster start and 2x final width (8 instead of 4)
  const scaleX = useTransform(
    smoothProgress,
    isMobile ? [0, 0.2, 0.45, 0.6, 0.7] : [0, 0.5, 0.65, 0.8, 0.95],
    isMobile ? [1, 1, 3.6, 5.6, 8] : [1, 1, 1.8, 2.8, 4]
  );

  // We remove the opacity fade since the user wants the glow to cover the text using z-index
  // This creates a more dramatic "curtain rising" effect over the content
  const contentOpacity = 1;

  return (
    <div ref={containerRef} className="relative h-[180vh]">
      {/* Sticky Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center bg-brand-dark z-[20]">

        {/* Background Video */}
        <motion.div
          className="absolute inset-0 z-[10] bg-transparent pointer-events-none"
          style={{ opacity: useTransform(smoothProgress, [0.4, 0.8], [1, 0]) }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/images/BGWebVideo.mp4" type="video/mp4" />
          </video>
        </motion.div>

        {/* Content */}
        <motion.div
          style={{ opacity: contentOpacity }}
          className="relative z-30 text-center px-4"
        >
          <div className="mb-8 flex justify-center">
            <SocialProof />
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight-custom max-w-[90%] md:max-w-4xl mx-auto">
            Proměň svůj Instagram<br className="hidden md:block" />
            na podnikání, které <span className="font-serif italic font-normal text-brand-red">vydělává</span>
          </h1>

          <div className="mt-12">
            <a
              href="#starterpackintro"
              className="bg-[#FF0E00] hover:bg-[#cc0b00] text-white px-8 py-3 rounded-full text-base font-bold tracking-tight-custom transition-all inline-block"
            >
              Zjistit jak to funguje
            </a>
          </div>
        </motion.div>

        {/* Bottom Divider Container - Positioned to align perfectly and overlap text */}
        <div className="absolute bottom-0 left-0 w-full z-50">
          <motion.div
            style={{
              scaleY,
              scaleX,
              transformOrigin: "bottom center"
            }}
            className="w-full relative z-10"
          >
            <GlowDivider />
          </motion.div>

          {/* Grain texture layer masked to GlowDivider shape */}
          <motion.div
            style={{
              scaleY,
              scaleX,
              transformOrigin: "bottom center",
              WebkitMaskImage: 'url(/glowdivider.avif)',
              WebkitMaskSize: '100% 100%',
              maskImage: 'url(/glowdivider.avif)',
              maskSize: '100% 100%'
            }}
            className="w-full absolute inset-x-0 bottom-0 top-0 z-20 pointer-events-none mix-blend-overlay"
          >
            {/* Inverse the scale so the texture doesn't stretch */}
            <motion.div
              style={{
                scaleY: useTransform(scaleY, (v) => 1 / v),
                scaleX: useTransform(scaleX, (v) => 1 / v),
                transformOrigin: "bottom center"
              }}
              className="w-[100vw] h-[100vh] absolute bottom-0 left-1/2 -translate-x-1/2"
            >
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: 'url(/texture.png)',
                  backgroundRepeat: 'repeat',
                  backgroundSize: '1200px 1200px'
                }}
              />
            </motion.div>
          </motion.div>

          {/* Background fill - overlapping by 2px to ensure no gap exists */}
          <div className="absolute top-[calc(100%-2px)] left-0 h-screen w-full bg-brand-dark z-[2]"></div>
        </div>
      </div>
    </div>
  );
};
