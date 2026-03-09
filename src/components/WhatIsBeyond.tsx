"use client";

import React, { useState, useEffect } from 'react';
import { FadeUp } from './FadeUp';

const TestimonialCard: React.FC<{ hook?: string, quote: string, author: string, role: string, image: string }> = ({ hook, quote, author, role, image }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 150;
  const isLong = quote.length > maxLength;
  const displayQuote = isExpanded ? quote : (isLong ? `${quote.substring(0, maxLength)}...` : quote);

  return (
    <div className="bg-gradient-to-b from-[#2A2A2A] to-[#1C1C1C] rounded-2xl border border-white/5 shadow-[0_8px_20px_0_rgba(0,0,0,0.4),inset_0_1px_2px_0_rgba(255,255,255,0.06)] p-6 flex flex-col gap-4 h-full relative group">
      {/* Stars */}
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className="w-5 h-5 text-yellow-500 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      <div className="flex-grow">
        {hook && (
          <h5 className="text-white text-[15px] font-bold mb-3 leading-snug tracking-tight uppercase">
            {hook}
          </h5>
        )}
        <p className="text-gray-300 text-[13px] leading-relaxed font-sans tracking-wide">
          {displayQuote}
        </p>
        {isLong && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-brand-red text-[13px] font-bold mt-2 hover:underline focus:outline-none"
          >
            {isExpanded ? "Zobrazit méně" : "Přečíst více"}
          </button>
        )}
      </div>
      <div className="flex items-center gap-3 pt-2">
        <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-gray-700 flex-shrink-0">
          <img src={image} alt={author} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
        <div>
          <h4 className="text-white text-base font-serif">{author}</h4>
          <p className="text-gray-500 text-[10px] font-sans tracking-wide uppercase">{role}</p>
        </div>
      </div>
    </div>
  );
};

export const WhatIsBeyond = () => {
  const [showContent, setShowContent] = useState(false);
  const sectionRef = React.useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      // Get the element's position relative to the viewport
      const rect = sectionRef.current.getBoundingClientRect();

      // Check if the top of the element has reached the vertical center of the viewport
      if (rect.top <= window.innerHeight / 2) {
        setShowContent(true);
      } else {
        setShowContent(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const testimonials = [
    {
      hook: "Z 50k na 80k sledujících a launch za $7,000 USD – během 5 týdnů.",
      quote: "Když jsem se připojil do Beyond, už jsem měl nějaké publikum, ale nedokázal jsem to monetizovat. Během pěti týdnů co jsem implementoval strategii, kterou jsme s klukama nastavili jsem dostal můj profil z 50k sledujících na 80k. Obsah začal oslovovat cílené publikum a hned na to jsme nastavili můj první launch produktu. Za dva týdny jsem vydělal přes $7k USD. Mají to postavené fakt dobře, všechno je praktické a přesně jsem věděl co dělat. Pokud chcete mít funkční Instagram, kluci ví co dělají. Díkyy",
      author: "Air4future",
      role: "Drone Pilot",
      image: "/images/users/air4future.jpg"
    },
    {
      hook: "Z mrtvého profilu na 8k sledujících a příval klientů.",
      quote: "Než jsem začala spolupracovat s klukama, můj profil byl v podstatě mrtvý. Vůbec jsem si nebyla jistá, jestli do toho jít. Bála jsem se, že to časově nebudu zvládat a že tvorba obsahu mi sežere všechen čas. Ale nastavili jsme fakt jednoduchý systém, který mi do života zapadl úplně přirozeně. Během dvou měsíců jsme se dostali na 8 000 sledujících a ta změna je neskutečná. Mám plné Dms klientů. Pokud váháte, jestli na to máte čas, kluci to mají fakt dobře vymyšlené. Všechno je plně individuální a to jsem ocenila nejvíc, děkuju vám.",
      author: "Ana Yoga",
      role: "Yoga Instructor",
      image: "/images/users/ashramana.jpg"
    },
    {
      hook: "Míň views, ale rekordní měsíc: Téměř 140 000 Kč díky správným lidem.",
      quote: "„Jsem ve třetím týdnu a děje se přesně to, co jsem chtěla. Sice mám míň views než na svých starších reels, ale poprvé v životě mi chodí fakt kvalitní sledující. Předtím se to u těch virálů vůbec nedělo. Teď přitahuju to správné publikum a vidím, že ty lidi reálně zajímá, co dělám. Zároveň jsem měla rekordní měsíc ve své komunitě, téměř $5k. Stačilo k tomu jen pár správných lidí, přesně jak jsme řešili. Díky Time za veškerý guidance.",
      author: "Ioanna",
      role: "Volleyball player",
      image: "/images/users/ioanna.jpg"
    },
    {
      quote: "Mít tě za mentora je neskutečný nakopávač. Konečně mám pocit, že ty myšlenky z hlavy fakt dostanu ven a udělám z nich silný obsah. Tvůj feedback je naprosto přesný, tuhle hru chápeš jako málokdo. Díky, že mě učíš, jak ty věci zjednodušit a jít k jádru. Fakt se od tebe učím hromadu věcí!",
      author: "Chris Jeske",
      role: "Content Creator",
      image: "/images/users/chris.jpg"
    },
    {
      quote: "Mega mi to pomohlo si konečně utřídit myšlenky, super tipy a hlavně inspirace pro tvorbu. Udělal jsem podle toho první video a hned se to chytlo mnohem líp, to je crazy. Takže fakt mega dobrá práce a díky!",
      author: "Patrick",
      role: "Flowlance founder",
      image: "/images/users/patrick.jpg"
    }
  ];

  return (
    <section ref={sectionRef} className="py-24 px-4 relative z-50 bg-transparent min-h-screen flex flex-col justify-center pt-32 -mt-[calc(50vh+300px)] pointer-events-none">
      <div className="max-w-7xl mx-auto w-full pointer-events-auto">
        {showContent && (
          <>
            <div className="text-center mb-64">

              <FadeUp>
                <h2 className="text-[60px] md:text-[110px] font-bold text-white tracking-[-0.08em] mb-12 leading-[0.9]">
                  Co je <span className="relative inline-block pb-2 md:pb-4">
                    <span className="font-serif italic font-normal text-gray-400 tracking-normal">Beyond?</span>
                    <svg className="absolute left-0 bottom-0 w-full h-3 md:h-5 text-brand-red" viewBox="0 0 300 12" fill="none" preserveAspectRatio="none">
                      <path d="M2 9C50 3 150 3 298 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  </span>
                </h2>
              </FadeUp>

              <FadeUp delay={0.2}>
                <div className="max-w-xl mx-auto space-y-8 text-white text-[16px] leading-relaxed font-normal text-left tracking-[-0.05em]">
                  <p>
                    Beyond je tu pro tvůrce, kouče, podnikatele a všechny, kteří chtějí z
                    Instagramu vybudovat skutečný byznys.
                  </p>
                  <p>
                    Pracujeme s tebou 1 na 1. Stavíme strategii přímo na tvoji situaci, tvoje
                    publikum a tvoje cíle. První platící klient. Jasný systém tvorby. Podnikání které
                    neroste díky algoritmu, ale díky důvěře.
                  </p>
                  <p>
                    Tvůj příběh a tvoje autenticita jsou tvůj největší byznys asset. My ti ukážeme
                    jak je přeměnit ve stabilní příjem.
                  </p>
                </div>
              </FadeUp>
            </div>

            <div className="mb-20">
              <div className="text-center mb-16 relative inline-block w-full">
                <h3 className="text-[46px] font-bold text-white tracking-tight-custom relative z-10 inline-block leading-[0.9]">
                  Co říkají naši <span className="relative inline-block pb-2">
                    <span className="font-serif italic font-normal text-gray-400">studenti...</span>
                    <svg className="absolute left-0 bottom-0 w-full h-3 text-brand-red z-0" viewBox="0 0 400 12" fill="none" preserveAspectRatio="none">
                      <path d="M2 9C100 3 300 3 398 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  </span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                {testimonials.map((t, i) => (
                  <div key={i} className="h-full">
                    <TestimonialCard
                      hook={t.hook}
                      quote={t.quote}
                      author={t.author}
                      role={t.role}
                      image={t.image}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <button className="bg-[#FF0E00] hover:bg-[#cc0b00] text-white px-8 py-3 rounded-full text-base font-bold tracking-tight-custom transition-all">
                Chci nezávaznou konzultaci
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
