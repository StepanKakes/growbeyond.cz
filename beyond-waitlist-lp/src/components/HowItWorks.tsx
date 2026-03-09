import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';

const TimelineItem: React.FC<{
  title: string;
  description: string;
  isLast?: boolean;
}> = ({
  title,
  description,
  isLast = false
}) => {
    const itemRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(itemRef, { once: false, margin: "0px 0px -25% 0px" });

    return (
      <div
        ref={itemRef}
        className="relative h-[200px]" // Fixed equal height for all timeline segments
      >
        {/* Top Dot of this segment */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
          className="absolute left-0 top-0 w-4 h-4 rounded-full border-2 bg-brand-red border-brand-red shadow-[0_0_12px_rgba(255,0,0,0.6)] z-10"
        />

        {/* Content - Staggered fade and slide for title and description */}
        <div className="pl-10 h-[200px] flex flex-col justify-center">
          <div className="-mt-4"> {/* Slight visual nudge up to perfectly balance between dots */}
            <motion.h3
              initial={{ opacity: 0, x: -10 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl font-bold text-white mb-2 tracking-tight"
            >
              {title}
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-gray-300 text-[15px] leading-relaxed max-w-lg pr-4"
            >
              {description}
            </motion.p>
          </div>
        </div>
      </div>
    );
  };

export const HowItWorks = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll progress within this specific section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end 80%"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Map the scroll progress to the height of the line
  const lineHeight = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  const steps = [
    {
      title: "Zarezervuj si osobní hovor",
      description: "Nezávazně si rezervuj hovor přímo se mnou. Projdeme tvoji situaci a zjistíme, jestli a jak ti můžu pomoct."
    },
    {
      title: "Poznáme se",
      description: "Na prvním hovoru probereme kde jsi teď, kam chceš jít a co ti v tom stojí v cestě."
    },
    {
      title: "Plán přímo pro tebe",
      description: "Společně postavíme konkrétní strategii — ne obecné rady, ale kroky přímo na míru tvému byznysu a profilu."
    },
    {
      title: "Jdeme do toho",
      description: "Začínáme pracovat. 1 na 1, krok za krokem."
    }
  ];

  // Ref for the very last dot
  const lastDotRef = useRef<HTMLDivElement>(null);
  const isLastDotInView = useInView(lastDotRef, { once: false, margin: "0px 0px -25% 0px" });

  return (
    <section ref={containerRef} className="py-32 px-4 relative z-20">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-[46px] font-bold text-white tracking-tight-custom text-center mb-20 leading-[0.9]">
          Jak to probíhá?
        </h2>

        {/* Global wrapper for dot and line alignment to center them */}
        <div className="relative ml-4 md:ml-12">

          {/* Background Line (Faded) */}
          <div className="absolute left-[7px] top-0 bottom-[200px] md:bottom-[0px] w-[2px] bg-white/10 z-0 h-[calc(100%-16px)]"></div>

          {/* Animated red line tracking scroll progress */}
          <motion.div
            style={{ height: lineHeight, originY: 0 }}
            className="absolute left-[7px] top-0 w-[2px] bg-brand-red z-0 max-h-[calc(100%-16px)]"
          />

          <div className="space-y-0 relative z-10 w-full">
            {steps.map((step, index) => (
              <TimelineItem
                key={index}
                title={step.title}
                description={step.description}
                isLast={index === steps.length - 1}
              />
            ))}
          </div>

          {/* Finally, cap it with a last dot precisely at the bottom of the last segment (i.e., at 100% height minus dot dimension) */}
          <div className="relative h-4 w-full">
            <motion.div
              ref={lastDotRef}
              initial={{ scale: 0, opacity: 0 }}
              animate={isLastDotInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
              transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
              className="absolute left-0 top-0 w-4 h-4 rounded-full border-2 bg-brand-red border-brand-red shadow-[0_0_12px_rgba(255,0,0,0.6)] z-10"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
