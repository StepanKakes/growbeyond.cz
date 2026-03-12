"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { GlowDivider } from './GlowDivider';
import { SocialProof } from './SocialProof';

export const Footer = () => {
  const containerRef = useRef<HTMLElement>(null);

  // We track the scroll progress when the footer is entering into view
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // The GlowDivider at the top is rotated 180deg.
  // We want the exact SAME easing stages as Hero, but running physically in reverse as the user scrolls further down (progress 0 -> 1).
  // Hero (forward) map:
  // Progress: 0    0.5  0.65  0.8  0.95
  // X scale : 1    1    1.8   2.8  4
  // Y scale : 0.6  --   --    --   20
  //
  // Reverse map for Footer (progress 0.05 -> 1.0) equates to Hero (progress 0.95 -> 0.0)
  // Progress: 0.05  0.2   0.35  0.5   1.0
  // X scale : 4     2.8   1.8   1     1
  // Y scale : 20    ------------>     0.6

  // Delayed start for the reverse animation so it begins scaling down later in the scroll
  const scaleY = useTransform(smoothProgress, [0.4, 1], [20, 0.6]);
  const scaleX = useTransform(smoothProgress, [0.4, 0.55, 0.7, 0.85, 1], [4, 2.8, 1.8, 1, 1]);

  return (
    // z-[6] and bg-[#0c0c0c] ensures the footer completely covers the global z-[5] TextureOverlay grain
    <footer id="footer" ref={containerRef} className="relative z-[6] bg-[#0c0c0c] min-h-screen flex flex-col items-center justify-center overflow-hidden pt-48 pb-20">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/footer-img"
          alt="Backstage"
          className="w-full h-full object-cover"
        />
        {/* Dark overlay to ensure text readability if needed, though the design looks fairly clean */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Top Curve Overlay - Animated inversely */}
      <div className="absolute top-0 left-0 w-full z-30 leading-none transform rotate-180 -translate-y-1 pointer-events-none">
        <motion.div
          style={{
            scaleY,
            scaleX,
            transformOrigin: "bottom center"
          }}
          className="w-full relative z-30 pointer-events-none"
        >
          <div className="relative pointer-events-none">
            <GlowDivider />
            {/* Masked exact grain applied only to the GlowDivider */}
            <div
              className="absolute inset-x-0 bottom-0 top-0 opacity-100 mix-blend-overlay pointer-events-none"
              style={{
                maskImage: 'url(/glowdivider.avif)',
                maskSize: '100% 100%',
                maskRepeat: 'no-repeat',
                WebkitMaskImage: 'url(/glowdivider.avif)',
                WebkitMaskSize: '100% 100%',
                WebkitMaskRepeat: 'no-repeat',
              }}
            >
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
            </div>
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-20 w-full max-w-4xl mx-auto px-4 text-center flex flex-col items-center">
        <h2 className="text-[46px] font-bold text-white tracking-tight-custom mb-6 drop-shadow-2xl leading-[0.9]">
          Chceš víc než jednorázový call?
        </h2>

        <p className="text-white text-lg md:text-xl leading-relaxed max-w-xl mx-auto mb-12 drop-shadow-lg font-medium">
          Pojď spolupracovat 1:1 — od strategie až po implementaci. Počet míst je ale omezený. Zarezervuj si hovor a pojďme to rozjet naplno.
        </p>

        {/* Social Proof mapped to the new component */}
        <div className="flex justify-center mb-12">
          <SocialProof />
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <a
            href="https://calendly.com/tim-creationwithtim/strategicky-call-s-timem"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#FF0E00] hover:bg-[#cc0b00] text-white px-8 py-3 rounded-full text-base font-bold tracking-tight-custom transition-all inline-block"
          >
            Zarezervovat konzultaci
          </a>
        </div>
      </div>
    </footer>
  );
};
