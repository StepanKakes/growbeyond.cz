import React from 'react';

const GridItem = ({ title, image, className }: { title: React.ReactNode, image: string, className?: string }) => (
  <div className={`relative group overflow-hidden ${className}`}>
    <div className="absolute inset-0 bg-black/40 z-10 transition-opacity group-hover:bg-black/20"></div>
    <img src={image} alt="" className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
    <div className="absolute inset-0 z-20 flex items-center justify-center p-4 text-center">
      <h3 className="text-white font-bold text-xl md:text-2xl uppercase tracking-tighter leading-tight">
        {title}
      </h3>
    </div>
  </div>
);

export const HowExactly = () => {
  return (
    <section className="py-32 px-4 relative z-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight-custom">
            Ale jak přesně<br />
            <span className="font-serif italic font-normal text-white">tě to učíme?</span>
          </h2>
          <p className="text-gray-400 mt-6 max-w-2xl mx-auto text-sm">
            Nepředáváme teorii. Pracujeme s tebou 1 na 1 a provázíme tě celým procesem — od prvního hovoru až po první platící klienty.
          </p>
        </div>

        {/* Masonry-style grid layout simulation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px] md:auto-rows-[250px]">

          <div className="col-span-1 row-span-1 flex items-center justify-center p-4">
            <p className="text-xs text-gray-500 text-right w-full">Naučíme tě systém tvorby<br />obsahu který buduje důvěru<br />a přitahuje správné lidi.</p>
          </div>

          <GridItem
            title={<>Osobní<br />značka a<br />positioning</>}
            image="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=500&auto=format&fit=crop"
            className="col-span-1 row-span-1"
          />

          <div className="col-span-1 md:col-span-2 row-span-1 flex items-center justify-center p-4">
            <p className="text-xs text-gray-500 text-left w-full max-w-xs">Ukážeme ti jak přeměnit<br />sledující v komunitu lidí, kteří<br />ti věří, souzní s tebou a chtějí<br />od tebe nakupovat.</p>
          </div>

          <GridItem
            title={<>Strategie<br />a systém<br />tvorby</>}
            image="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=500&auto=format&fit=crop"
            className="col-span-1 row-span-1"
          />

          <GridItem
            title={<>Budování publika<br />a komunity</>}
            image="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=500&auto=format&fit=crop"
            className="col-span-1 md:col-span-2 row-span-1"
          />

          <GridItem
            title={<>Dlouhodobý<br />růst</>}
            image="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=500&auto=format&fit=crop"
            className="col-span-1 md:col-span-2 row-span-1"
          />

          <GridItem
            title={<>Architektura<br />funnelu</>}
            image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=500&auto=format&fit=crop"
            className="col-span-1 row-span-1"
          />

          <div className="col-span-1 row-span-1 flex items-center justify-center p-4">
            <p className="text-xs text-gray-500 text-left w-full">Naučíme tě jak zachytit<br />pozornost sledujících mimo<br />Instagram a vybudovat<br />systém který prodává i když<br />netočíš.</p>
          </div>

        </div>

        <div className="flex justify-center mt-12">
          <p className="text-xs text-gray-500 text-center max-w-xs">
            Postavíme spolu systém,<br />který s tebou roste — měsíc<br />po měsíci, rok po roku.
          </p>
        </div>

        <div className="flex justify-center mt-12">
          <button className="bg-[#FF0E00] hover:bg-[#cc0b00] text-white px-8 py-3 rounded-full text-base font-bold tracking-tight-custom transition-all">
            Chci nezávaznou konzultaci
          </button>
        </div>
      </div>
    </section>
  );
};
