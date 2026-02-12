import React from 'react';
import { instrumentSerif } from "@/app/fonts";

interface CssBookProps {
    title?: string;
    coverTitle?: string;
    coverSubtitle?: string;
}

export function CssBook({ title, coverTitle, coverSubtitle }: CssBookProps) {
    const displayTitle = coverTitle || title || "Beyond";
    const displaySubtitle = coverSubtitle || " ";

    return (
        <div className="relative group w-full max-w-[180px] sm:max-w-[260px] mx-auto perspective-1000">
            {/* Kontejner - poměr stran 3:4 */}
            <div className="relative w-full aspect-[3/4]">

                {/* --- 3. VRSTVA (Nejspodnější) --- */}
                {/* START: Natočená o -6deg a posunutá. HOVER: Srovná se na 0 (shrne se). */}
                <div
                    className="absolute inset-0 bg-white rounded-2xl border border-gray-100 shadow-md 
                     origin-bottom-right z-0
                     transform -rotate-6 -translate-x-4 translate-y-2
                     group-hover:rotate-0 group-hover:translate-x-0 group-hover:translate-y-0
                     transition-all duration-500 ease-out"
                ></div>

                {/* --- 2. VRSTVA (Prostřední) --- */}
                {/* START: Natočená o -3deg (přesně mezi spodní a horní). HOVER: Srovná se na 0. */}
                <div
                    className="absolute inset-0 bg-white rounded-2xl border border-gray-100 shadow-md 
                     origin-bottom-right z-10
                     transform -rotate-3 -translate-x-2 translate-y-1
                     group-hover:rotate-0 group-hover:translate-x-0 group-hover:translate-y-0
                     transition-all duration-500 ease-out"
                ></div>

                {/* --- 1. VRSTVA (Hlavní karta) --- */}
                {/* START: Rovně. HOVER: Lehce se nadzvedne, zatímco ostatní se schovají pod ni. */}
                <div
                    className="absolute inset-0 bg-white rounded-2xl shadow-xl border border-gray-50 z-20 
                     flex flex-col p-6 sm:p-8 justify-between
                     transition-all duration-500 ease-out transform group-hover:-translate-y-1"
                >
                    {/* Horní část */}
                    <div className="flex flex-col gap-4 mt-2">
                        {/* NADPIS */}
                        <h3
                            className="text-[#FF0E00] font-bold text-3xl sm:text-4xl leading-none tracking-[-0.05em]"
                            style={{ fontFamily: 'Helvetica, Inter, sans-serif' }}
                        >
                            {displayTitle}
                        </h3>

                        {/* Divider */}
                        <div className="w-full h-px bg-gray-200"></div>

                        {/* PODNADPIS */}
                        <p className="text-[#B5B5B5] text-lg sm:text-xl font-bold leading-tight tracking-tight">
                            {displaySubtitle}
                        </p>
                    </div>

                    {/* Logo dole */}
                    <div className="mt-auto text-center pb-1">
                        <span className={`${instrumentSerif.className} italic text-black text-xl`}>
                            Beyond
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
}