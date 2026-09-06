"use client";

import React from 'react';
import Link from 'next/link';
import { TextureOverlay } from '@/components/TextureOverlay';
import {
    VariantSchedule,
    VariantScreen,
    VariantTiles,
    VariantNumbers,
    VariantTypeWall,
} from '@/components/webinar/proposals/AgendaVariants';

// Interní stránka s návrhy sekce programu. Není v navigaci, dědí noindex z /webinar.
const VARIANTS: { id: string; name: string; note: string; Component: React.ComponentType }[] = [
    { id: 'program', name: 'Program večera', note: 'Časová osa jako televizní program, časy svítí, první červeně jako start živého přenosu', Component: VariantSchedule },
    { id: 'displej', name: 'Displej', note: 'Celý program v jednom panelu obrazovky s rámem, scanlines a svítícími klíčovými slovy', Component: VariantScreen },
    { id: 'obrazovky', name: 'Obrazovky', note: 'Každý bod jako vlastní malý displej s velkým svítícím slovem v plném LCD efektu', Component: VariantTiles },
    { id: 'cislice', name: 'Číslované LED', note: 'Velké červené svítící číslice a názvy bodů na velikosti nadpisů', Component: VariantNumbers },
    { id: 'stena', name: 'Typografická stěna', note: 'Názvy na displejové velikosti, v každém svítí jedno klíčové slovo, krátká červená linka jako značka', Component: VariantTypeWall },
];

export default function WebinarProposalsPage() {
    return (
        <main className="min-h-screen relative bg-[#0A0A0A] text-white selection:bg-brand-red selection:text-white overflow-x-hidden">
            <TextureOverlay />
            <header className="relative z-10 mx-auto w-full max-w-[1200px] px-5 md:px-12 pt-6 md:pt-8 pb-10 md:pb-14">
                <div className="flex items-center justify-between">
                    <Link href="/webinar" className="text-white text-[22px] md:text-[26px] font-serif italic leading-none">Beyond</Link>
                    <span className="text-sm text-white/50">Interní návrhy</span>
                </div>
                <h1 className="mt-12 md:mt-16 text-[32px] md:text-[52px] font-bold tracking-[-0.03em] leading-[1.05] max-w-[20ch]">
                    Pět návrhů sekce Co se na webináři dozvíš
                </h1>
                <p className="mt-5 text-[17px] md:text-[20px] text-white/70 leading-[1.5] max-w-[60ch]">
                    Stejný obsah, pět zpracování. Klíčová slova a časy u bodů jsou zatím jen pro návrh. Vyber variantu, doladím ji a propíšu do stránky, stejný jazyk pak dostanou i ostatní sekce
                </p>
                <nav aria-label="Varianty" className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[15px] text-white/60">
                    {VARIANTS.map((v, i) => (
                        <a key={v.id} href={`#${v.id}`} className="hover:text-white transition-colors underline-offset-[4px] hover:underline">
                            {i + 1}. {v.name}
                        </a>
                    ))}
                </nav>
            </header>

            {VARIANTS.map((v, i) => (
                <section key={v.id} id={v.id} className="relative z-10 border-t border-white/10 py-16 md:py-28 scroll-mt-6">
                    <div className="mx-auto w-full max-w-[1200px] px-5 md:px-12 mb-10 md:mb-14 flex flex-col gap-2 md:flex-row md:items-baseline md:gap-6">
                        <p className="text-[15px] font-bold text-brand-red">Varianta {i + 1}</p>
                        <p className="text-[15px] text-white/60"><span className="text-white">{v.name}</span>, {v.note}</p>
                    </div>
                    <v.Component />
                </section>
            ))}

            <footer className="relative z-10 border-t border-white/10">
                <div className="mx-auto w-full max-w-[1200px] px-5 md:px-12 py-10 text-sm text-white/50">
                    <Link href="/webinar" className="hover:text-white transition-colors underline underline-offset-[3px]">Zpět na stránku webináře</Link>
                </div>
            </footer>
        </main>
    );
}
