"use client";

import React from 'react';

const FeatureCard = ({
  title,
  description,
  image,
  orientation = 'portrait',
  textPosition = 'right',
  className = '',
  width,
  height,
  textClassName = ''
}: {
  title: React.ReactNode,
  description: string,
  image: string,
  orientation?: 'portrait' | 'landscape',
  textPosition?: 'left' | 'right' | 'top' | 'bottom',
  className?: string,
  width?: string,
  height?: string,
  textClassName?: string
}) => {
  const isPortrait = orientation === 'portrait';
  const defaultWidth = isPortrait ? '180px' : '225px';
  const defaultHeight = isPortrait ? '270px' : '150px';

  const isVertical = textPosition === 'top' || textPosition === 'bottom';
  const flexClass = textPosition === 'left' ? 'md:flex-row-reverse' :
    textPosition === 'top' ? 'flex-col-reverse' :
      textPosition === 'bottom' ? 'flex-col' : '';

  return (
    <div className={`flex ${isVertical ? 'flex-col items-center' : 'flex-col md:flex-row items-center md:items-start'} gap-2 lg:gap-4 ${flexClass} ${className} text-center md:text-left`}>
      {/* Image Container */}
      <div
        className="relative group flex-shrink-0 overflow-hidden"
        style={{ width: width || defaultWidth, height: height || defaultHeight }}
      >
        <div className="absolute inset-0 bg-gray-800">
          <img
            src={image}
            alt="Feature"
            className="w-full h-full object-cover transition-opacity duration-500"
            referrerPolicy="no-referrer"
          />
          {/* Overlay Text */}
          <div className="absolute inset-0 flex items-center justify-center p-3 bg-black/40">
            <h3 className="text-white font-bold text-[14px] lg:text-[18px] text-center uppercase leading-tight tracking-tight drop-shadow-lg">
              {title}
            </h3>
          </div>
        </div>
      </div>

      {/* Description Text */}
      <div className={`text-white text-[11px] lg:text-xs leading-relaxed w-full max-w-[200px] md:max-w-[140px] lg:max-w-[160px] pt-1 ${textPosition === 'left' ? 'md:text-right' : 'md:text-left'} ${textClassName}`}>
        {description}
      </div>
    </div>
  );
};

export const HowWeTeach = () => {
  return (
    <section className="pt-10 pb-32 px-4 relative z-20 overflow-hidden -mt-[200px]">
      <div className="max-w-[1400px] mx-auto relative">

        {/* Mobile Layout (< 768px) - Stylized scattered approach */}
        {/* Mobile Layout (< 768px) - Horizontal Alignment */}
        <div className="md:hidden flex flex-col items-center gap-10 py-10 relative px-2">

          {/* Top Row: Osobní značka & Budování publika */}
          <div className="flex w-full justify-between items-start gap-2">

            {/* Left Item */}
            <div className="w-[48%] flex justify-start">
              <FeatureCard
                title={<>Osobní<br />značka a<br />positioning</>}
                description="Definujeme tvoji osobní značku, cílové publikum a jasné sdělení. Víš přesně kdo jsi, pro koho tvoříš a proč."
                image="/images/Frame 66.avif"
                orientation="portrait"
                textPosition="bottom"
                width="140px"
                height="210px"
                className="max-w-[140px]"
              />
            </div>

            {/* Right Item */}
            <div className="w-[48%] flex justify-end">
              <FeatureCard
                title={<>Budování publika<br />a komunity</>}
                description="Ukážeme ti jak přeměnit sledující v komunitu lidí, kteří ti věří a chtějí od tebe nakupovat."
                image="/images/Frame 73.avif"
                orientation="landscape"
                textPosition="bottom"
                width="160px"
                height="106px"
                className="max-w-[160px]"
                textClassName="text-right"
              />
            </div>
          </div>

          {/* Central Headline */}
          <div className="text-center my-2 z-10 px-4">
            <h2 className="text-[38px] font-bold text-white tracking-tight-custom leading-[0.9] mb-4">
              Ale jak přesně<br />tě to učíme?
            </h2>
            <p className="text-white text-xs leading-relaxed max-w-[240px] mx-auto opacity-70">
              Nepředáváme teorii. Pracujeme s tebou 1 na 1 a provázíme tě celým procesem — od prvního hovoru až po první platící klienty.
            </p>
          </div>

          {/* Bottom Row: Strategie & Dlouhodobý růst */}
          <div className="flex w-full justify-between items-start gap-2">

            {/* Left Item */}
            <div className="w-[48%] flex justify-start">
              <FeatureCard
                title={<>Strategie<br />a systém<br />tvorby</>}
                description="Naučíme tě systém tvorby obsahu který buduje důvěru a přitahuje správné lidi."
                image="/images/Frame 67.avif"
                orientation="portrait"
                textPosition="top"
                width="140px"
                height="210px"
                className="max-w-[140px]"
              />
            </div>

            {/* Right Item */}
            <div className="w-[48%] flex justify-end">
              <FeatureCard
                title={<>Dlouhodobý<br />růst</>}
                description="Postavíme spolu systém který s tebou roste — měsíc po měsíci, rok po roku."
                image="/images/Frame 71.avif"
                orientation="landscape"
                textPosition="top"
                width="160px"
                height="106px"
                className="max-w-[160px]"
                textClassName="text-right"
              />
            </div>
          </div>
        </div>

        {/* Tablet Layout (768px - 1023px) - 4 images approach */}
        <div className="hidden md:max-lg:block relative h-[650px] w-full mt-10">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10 w-full max-w-sm px-4">
            <h2 className="text-[42px] font-bold text-white tracking-tight-custom mb-4 leading-[0.9]">
              Ale jak přesně<br />tě to učíme?
            </h2>
            <p className="text-white text-xs leading-relaxed max-w-[240px] mx-auto">
              Nepředáváme teorii. Pracujeme s tebou 1 na 1 a provázíme tě celým procesem — od prvního hovoru až po první platící klienty.
            </p>
          </div>

          {/* Top Left */}
          <div className="absolute top-[0%] left-[5%]">
            <FeatureCard
              title={<>Osobní<br />značka a<br />positioning</>}
              description="Definujeme tvoji osobní značku, cílové publikum a jasné sdělení. Víš přesně kdo jsi, pro koho tvoříš a proč."
              image="/images/Frame 66.avif"
              orientation="portrait"
              width="150px"
              height="225px"
            />
          </div>

          {/* Top Right */}
          <div className="absolute top-[0%] right-[0%]">
            <FeatureCard
              title={<>Budování publika<br />a komunity</>}
              description="Ukážeme ti jak přeměnit sledující v komunitu lidí, kteří ti věří, soucítí s tebou a chtějí od tebe nakupovat."
              image="/images/Frame 73.avif"
              orientation="landscape"
              textPosition="left"
              width="200px"
              height="133px"
            />
          </div>

          {/* Bottom Left */}
          <div className="absolute bottom-[5%] left-[0%]">
            <FeatureCard
              title={<>Strategie<br />a systém<br />tvorby</>}
              description="Naučíme tě systém tvorby obsahu který buduje důvěru a přitahuje správné lidi."
              image="/images/Frame 67.avif"
              orientation="portrait"
              textPosition="right"
              width="150px"
              height="225px"
            />
          </div>

          {/* Bottom Right */}
          <div className="absolute bottom-[5%] right-[5%]">
            <FeatureCard
              title={<>Dlouhodobý<br />růst</>}
              description="Postavíme spolu systém který s tebou roste — měsíc po měsíci, rok po roku."
              image="/images/Frame 71.avif"
              orientation="landscape"
              textPosition="left"
              width="200px"
              height="133px"
            />
          </div>
        </div>

        {/* Small Desktop / Laptop Layout (1024px - 1279px) */}
        <div className="hidden lg:max-xl:block relative h-[700px] w-full mt-10">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10 w-full max-w-lg px-4">
            <h2 className="text-[48px] font-bold text-white tracking-tight-custom mb-4 leading-[0.9]">
              Ale jak přesně<br />tě to učíme?
            </h2>
            <p className="text-white text-xs leading-relaxed max-w-[280px] mx-auto">
              Nepředáváme teorii. Pracujeme s tebou 1 na 1 a provázíme tě celým procesem — od prvního hovoru až po první platící klienty.
            </p>
          </div>

          <div className="absolute top-[0%] left-[32%]">
            <FeatureCard
              title={<>Osobní<br />značka a<br />positioning</>}
              description="Definujeme tvoji osobní značku, cílové publikum a jasné sdělení. Víš přesně kdo jsi, pro koho tvoříš a proč."
              image="/images/Frame 66.avif"
              orientation="portrait"
              width="160px"
              height="240px"
            />
          </div>

          <div className="absolute top-[15%] right-[0%]">
            <FeatureCard
              title={<>Budování publika<br />a komunity</>}
              description="Ukážeme ti jak přeměnit sledující v komunitu lidí, kteří ti věří, soucítí s tebou a chtějí od tebe nakupovat."
              image="/images/Frame 73.avif"
              orientation="landscape"
              textPosition="left"
              width="210px"
              height="140px"
            />
          </div>

          <div className="absolute top-[40%] left-[0%]">
            <FeatureCard
              title={<>Strategie<br />a systém<br />tvorby</>}
              description="Naučíme tě systém tvorby obsahu který buduje důvěru a přitahuje správné lidi."
              image="/images/Frame 67.avif"
              orientation="portrait"
              textPosition="left"
              width="160px"
              height="240px"
            />
          </div>

          <div className="absolute bottom-[10%] right-[0%]">
            <FeatureCard
              title={<>Architektura<br />funnelu</>}
              description="Naučíme tě jak zachytit pozornost sledujících mimo Instagram a vybudovat systém který prodává i když netočíš."
              image="/images/Frame 67-1.avif"
              orientation="portrait"
              textPosition="right"
              width="160px"
              height="240px"
            />
          </div>

          <div className="absolute bottom-[0%] left-[35%]">
            <FeatureCard
              title={<>Dlouhodobý<br />růst</>}
              description="Postavíme spolu systém který s tebou roste — měsíc po měsíci, rok po roku."
              image="/images/Frame 71.avif"
              orientation="landscape"
              textPosition="right"
              width="210px"
              height="140px"
            />
          </div>
        </div>

        {/* Ideal Desktop Layout (>= 1280px) */}
        <div className="hidden xl:block relative h-[750px]">

          {/* Center: Headline */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10 w-full max-w-2xl">
            <h2 className="text-[54px] font-bold text-white tracking-tight-custom mb-4 leading-[0.9]">
              Ale jak přesně<br />tě to učíme?
            </h2>
            <p className="text-white text-xs leading-relaxed max-w-sm mx-auto">
              Nepředáváme teorii. Pracujeme s tebou 1 na 1 a provázíme tě celým procesem — od prvního hovoru až po první platící klienty.
            </p>
          </div>

          {/* Top Center: Osobní značka */}
          <div className="absolute top-[0%] left-[32%]">
            <FeatureCard
              title={<>Osobní<br />značka a<br />positioning</>}
              description="Definujeme tvoji osobní značku, cílové publikum a jasné sdělení. Víš přesně kdo jsi, pro koho tvoříš a proč."
              image="/images/Frame 66.avif"
              orientation="portrait"
              textPosition="right"
            />
          </div>

          {/* Top Right: Budování publika */}
          <div className="absolute top-[18%] left-[60%]">
            <FeatureCard
              title={<>Budování publika<br />a komunity</>}
              description="Ukážeme ti jak přeměnit sledující v komunitu lidí, kteří ti věří, soucítí s tebou a chtějí od tebe nakupovat."
              image="/images/Frame 73.avif"
              orientation="landscape"
              textPosition="left"
              width="240px"
              height="160px"
            />
          </div>

          {/* Middle Left: Strategie */}
          <div className="absolute top-[40%] left-[8%]">
            <FeatureCard
              title={<>Strategie<br />a systém<br />tvorby</>}
              description="Naučíme tě systém tvorby obsahu který buduje důvěru a přitahuje správné lidi."
              image="/images/Frame 67.avif"
              orientation="portrait"
              textPosition="left"
            />
          </div>

          {/* Middle Right: Architektura */}
          <div className="absolute top-[55%] right-[10%]">
            <FeatureCard
              title={<>Architektura<br />funnelu</>}
              description="Naučíme tě jak zachytit pozornost sledujících mimo Instagram a vybudovat systém který prodává i když netočíš."
              image="/images/Frame 67-1.avif"
              orientation="portrait"
              textPosition="right"
            />
          </div>

          {/* Bottom Center: Dlouhodobý růst */}
          <div className="absolute bottom-[0%] left-[35%]">
            <FeatureCard
              title={<>Dlouhodobý<br />růst</>}
              description="Postavíme spolu systém který s tebou roste — měsíc po měsíci, rok po roku."
              image="/images/Frame 71.avif"
              orientation="landscape"
              textPosition="right"
              width="240px"
              height="160px"
            />
          </div>
        </div>

        <div className="flex justify-center mt-32">
          <button className="bg-[#FF0E00] hover:bg-[#cc0b00] text-white px-8 py-3 rounded-full text-base font-bold tracking-tight-custom transition-all">
            Chci nezávaznou konzultaci
          </button>
        </div>
      </div>
    </section>
  );
};
