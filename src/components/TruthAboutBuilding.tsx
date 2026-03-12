"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent, useInView } from 'framer-motion';
import { ScrambleText } from './ScrambleText';

const features = [
  {
    title: ["Nepotřebuješ víc", "sledujících"],
    image: "/images/img1.avif",
    content: [
      "Jmenuji se Tim, je mi 20 let.",
      "Existuje jednoduchý, osvědčený systém, který koučové, konzultanti a tvůrci používají k tomu, aby z Instagramu vybudovali skutečný byznys — bez honění trendů, bez náhodného postování a bez toho, aby vyhořeli v procesu.",
      "Je to stejný systém, který jsem použil k tomu, abych vybudoval publikum přes 170 000 lidí, dosáhl desítek milionů zhlédnutí, spolupracoval s mezinárodními firmami a dnes vydělával přes 125 000 Kč měsíčně jen díky Instagramu.",
      "Po letech náhodného postování, honění trendů a sbírání tipů, které nikam nevedly se všechno změnilo ve chvíli, kdy jsem přestal přemýšlet jako tvůrce a začal budovat jako podnikatel. Přestal jsem se ptát \"kolik lidí mě vidí\" a začal jsem se ptát \"kolik lidí mi důvěřuje natolik, že ode mě nakoupí — a jak toto číslo zvýšit.\"",
      "To změnilo všechno.",
      "Tohle je systém, který dnes předáváme studentům v Beyond."
    ]
  },
  {
    title: ["Byl jsem přesně", "tam, kde jsi teď ty"],
    image: "/images/img2.avif",
    content: [
      "Každé ráno stejná otázka: co dnes natočit? Scrollování profilů ostatních, kopírování trendů, čekání že se jedno video chytí a všechno se změní. Měsíce náhodného postování, stovky hodin tvorby a nulová představa odkud přijdou peníze příští měsíc.",
      "Skutečný zlom přišel ve chvíli, kdy jsem přestal přemýšlet jako tvůrce a začal budovat jako podnikatel.",
      "To změnilo všechno.",
      "Jasnost. Systém. Příjem.",
      "Tento systém ti pomůže vybudovat osobní značku, která skutečně roste a prodává — bez honění virality, bez postování každý den, bez krátkodobých hacků které nikam nevedou a ponechají tě na stejném místě."
    ]
  },
  {
    title: ["Máš na to. Jen ti", "chybí správný", "systém"],
    image: "/images/img3.avif",
    content: [
      "Zamysli se nad tím.",
      "Kolikrát jsi postoval konzistentně bez výsledku? Kolikrát jsi měl skvělý nápad, natočil video, dal do toho hodiny a výsledek neodpovídal ani zlomku vložené energie?",
      "Máš znalosti, zkušenosti, produkt. Jen ti nikdo nikdy neukázal jak to skutečně proměnit v podnikání.",
      "Možná jsi tvůrce, podnikatel nebo kouč a víš že Instagram by pro tebe mohl dělat víc. Jen nevíš jak.",
      "Většina kurzů tě naučila laciné hacky a \"návod na viralitu\". Sami přitom prodávají přes DMs a emaily.",
      "Sám jsem byl tvůrce s hezkým profilem a spoustou virálního obsahu, ale bez systému, důvěry a bez reálného příjmu.",
      "Beyond tohle řeší. Spojujeme reálnou strategii s autentickou osobní značkou, aby tvůj obsah skutečně konvertoval, aniž by sis musel na cokoli hrát."
    ]
  }
];

export const TruthAboutBuilding = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // 350vh track provides plenty of scroll space for smooth timings
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Extreme smooth spring for the progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    restDelta: 0.001
  });

  const isInView = useInView(containerRef, { once: true, margin: "0px 0px -50% 0px" });

  const [activeIndex, setActiveIndex] = React.useState(0);

  // Track the scroll to decide which card is currently active (0, 1, or 2)
  useMotionValueEvent(smoothProgress, "change", (latest) => {
    if (latest < 0.45) {
      if (activeIndex !== 0) setActiveIndex(0);
    } else if (latest < 0.85) {
      if (activeIndex !== 1) setActiveIndex(1);
    } else {
      if (activeIndex !== 2) setActiveIndex(2);
    }
  });

  const activeFeature = features[activeIndex];

  return (
    <section ref={containerRef} className="relative z-20 md:h-[180vh] bg-transparent pt-[5vh] md:pt-[10vh]">
      {/* --- DESKTOP VIEW (Sticky Scroll) --- */}
      <div className="hidden md:flex sticky top-[5vh] h-[95vh] w-full overflow-hidden flex-col justify-center px-4 max-w-[1400px] mx-auto py-24 pointer-events-none">

        <h2 className="text-[46px] font-bold text-white tracking-tight-custom text-center leading-[1] relative mb-12 w-full z-50 pointer-events-auto shrink-0">
          Pravda o budování <span className="font-serif italic font-normal text-gray-400">osobní značky</span>
        </h2>

        <div className="relative w-full h-[55vh] mt-4">

          {/* STATIC TEXT LAYER (Left & Right columns) that scrambles */}
          <div className="absolute inset-0 flex flex-col md:grid md:grid-cols-12 md:gap-8 items-center z-[100] md:-translate-y-[10%]">
            {/* Left Column: Headline */}
            <div className="w-[calc(100%+2rem)] -left-4 md:left-0 md:w-full absolute md:relative top-0 h-[22vh] md:h-auto flex justify-center items-center md:items-start md:justify-end md:col-span-4 md:col-start-1 z-50 pointer-events-none">
              <h3
                className="text-[26px] xs:text-[30px] md:text-[42px] font-bold text-white tracking-tight-custom leading-[1] z-50 pointer-events-auto w-[90%] md:w-fit text-center md:text-right flex flex-col justify-center items-center md:items-end"
                style={{ textShadow: "0px 4px 20px rgba(0,0,0,0.8)" }}
              >
                <div className="flex flex-col items-center md:items-end w-full gap-0 justify-center">
                  {activeFeature.title.map((line, i) => {
                    const charsBefore = activeFeature.title.slice(0, i).join("").length;
                    const charsPerMs = 45;
                    const calculatedDelay = charsBefore * charsPerMs;
                    const calculatedDuration = line.length * charsPerMs;

                    return (
                      <ScrambleText
                        key={`title-${i}`}
                        text={line}
                        duration={calculatedDuration}
                        delay={calculatedDelay}
                        trigger={isInView}
                        className="block w-full text-center md:text-right"
                      />
                    );
                  })}
                </div>
              </h3>
            </div>

            {/* Middle Column space reserved for images */}
            <div className="hidden md:block md:col-span-3"></div>

            {/* Right Column: Text Content */}
            <div className="w-[95%] md:w-full md:col-span-5 md:col-start-8 text-[#e0e0e0] md:text-white font-sans text-left md:text-justify pointer-events-auto mt-[calc(22vh+0.5rem)] md:mt-0 xl:pr-10 mx-auto md:mx-0"
              style={{
                fontSize: "clamp(11px, 1.8vh, 15px)",
                lineHeight: "clamp(1.2, 2.2vh, 1.6)"
              }}>
              <div
                className="flex flex-col"
                style={{ gap: "clamp(4px, 1.2vh, 16px)" }}
              >
                {activeFeature.content.map((paragraph, i) => (
                  <ScrambleText
                    key={`content-${i}`}
                    text={paragraph}
                    duration={1000 + i * 200}
                    className={i === 0 && activeIndex !== 1 ? "text-white mb-1 md:mb-2 block w-full" : "block w-full text-white/90 md:text-white"}
                    trigger={isInView}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ANIMATED IMAGE LAYER */}
          {features.map((feature, index) => {
            const isFirst = index === 0;
            const arriveEnd = index * 0.45;
            const startingYPercent = index * 187.5;
            const startingScale = 1 - (index * 0.15);
            const safeEnd = arriveEnd > 0 ? arriveEnd : 0.001;

            const imgY = useTransform(smoothProgress, [0, safeEnd], [`${startingYPercent}%`, "-15%"]);
            const imgScale = useTransform(smoothProgress, [0, safeEnd], [startingScale, 1]);

            const finalImgY = isFirst ? "-15%" : imgY;
            const finalImgScale = isFirst ? 1 : imgScale;

            return (
              <div key={`img-${index}`} className="absolute inset-0 flex flex-col md:grid md:grid-cols-12 md:gap-8 items-center pointer-events-none" style={{ zIndex: index * 10 }}>
                {/* Empty left */}
                <div className="hidden md:block md:col-span-4"></div>

                {/* Middle Column: Portrait Image */}
                <div className="w-[calc(100%+2rem)] -left-4 md:left-0 md:w-full absolute md:relative top-0 h-[22vh] md:h-full md:col-span-3 flex justify-center items-center overflow-hidden md:overflow-visible">
                  <motion.div
                    className="w-full h-full md:h-auto md:max-w-[340px] md:aspect-[3/4] relative overflow-hidden flex-shrink-0"
                    style={{ y: finalImgY, scale: finalImgScale, willChange: "transform" }}
                  >
                    <img
                      src={feature.image}
                      alt="Feature"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                </div>

                {/* Empty right */}
                <div className="hidden md:block md:col-span-5"></div>
              </div>
            );
          })}

        </div>
      </div>

      {/* --- MOBILE VIEW (Normal Stacking) --- */}
      <div className="flex md:hidden flex-col px-6 gap-16 w-full max-w-[1400px] mx-auto z-50 pb-20 pt-8">
        <h2 className="text-[32px] font-bold text-white tracking-tight-custom text-center leading-[1.1] mb-2 pointer-events-auto">
          Pravda o budování <br /><span className="font-serif italic font-normal text-gray-400">osobní značky</span>
        </h2>

        {features.map((feature, idx) => (
          <MobileFeature key={idx} feature={feature} index={idx} />
        ))}
      </div>
    </section>
  );
};

// Extracted inner component for mobile to handle scroll triggered scramble independently
const MobileFeature = ({ feature, index }: { feature: typeof features[0], index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -20% 0px" });

  return (
    <div ref={ref} className="flex flex-col gap-6 w-full items-center pointer-events-auto">
      <h3
        className="text-[28px] font-bold text-white tracking-tight-custom leading-[1.1] text-center flex flex-col items-center w-full"
        style={{ textShadow: "0px 4px 20px rgba(0,0,0,0.8)" }}
      >
        {feature.title.map((line, i) => {
          const charsBefore = feature.title.slice(0, i).join("").length;
          const charsPerMs = 45;
          const calculatedDelay = charsBefore * charsPerMs;
          const calculatedDuration = line.length * charsPerMs;

          return (
            <ScrambleText
              key={i}
              text={line}
              duration={calculatedDuration}
              delay={calculatedDelay}
              trigger={isInView}
              className="block w-full text-center"
            />
          );
        })}
      </h3>

      <div className="w-full max-w-[340px] relative rounded-xl overflow-hidden flex-shrink-0 mx-auto" style={{ aspectRatio: "3/4" }}>
        <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none" />
        <img
          src={feature.image}
          alt={feature.title.join(" ")}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="text-[#e0e0e0] font-sans text-left text-[15px] leading-[1.6] flex flex-col gap-4 w-full pt-2">
        {feature.content.map((paragraph, i) => (
          <ScrambleText
            key={i}
            text={paragraph}
            duration={1000 + i * 200}
            className={i === 0 && index !== 1 ? "text-white font-medium block w-full" : "block w-full text-white/90"}
            trigger={isInView}
          />
        ))}
      </div>
    </div>
  );
};
