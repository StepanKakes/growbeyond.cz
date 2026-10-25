"use client";

import { useEffect, useState } from 'react';
import { initUtmTracking } from '@/lib/utm';
import { Navbar } from '@/components/Navbar';
import { LegalFooter } from '@/components/LegalFooter';

// Rozcestník: člověk si jen vybere, kam patří. Prodej je až na /kouci a /podnikatele.
const CESTY = [
    { href: '/kouci', label: 'Kouč nebo mentor' },
    { href: '/podnikatele', label: 'Zakladatel nebo podnikatel' },
];

export default function HomePage() {
    const [query, setQuery] = useState('');

    useEffect(() => {
        initUtmTracking();

        // Staré odkazy na growbeyond.cz/#apply a podobné vedly na funnel pro kouče
        if (window.location.hash) {
            window.location.replace(`/kouci${window.location.search}${window.location.hash}`);
            return;
        }
        setQuery(window.location.search);
    }, []);

    return (
        <main className="min-h-screen flex flex-col bg-brand-dark text-white selection:bg-brand-red selection:text-white">
            <Navbar minimal />

            <section className="flex-1 flex flex-col items-center justify-center px-4 py-32 text-center">
                <h1 className="text-[44px] md:text-[80px] font-bold tracking-tight-custom leading-none">
                    Kdo jsi?
                </h1>

                <div className="mt-10 md:mt-12 flex flex-col md:flex-row gap-3 w-full max-w-[320px] md:max-w-none md:w-auto">
                    {CESTY.map(cesta => (
                        <a
                            key={cesta.href}
                            href={`${cesta.href}${query}`}
                            className="md:min-w-[300px] px-7 py-[18px] rounded-full border border-white/20 text-lg font-bold tracking-tight transition-colors duration-150 hover:bg-brand-red hover:border-brand-red active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                        >
                            {cesta.label}
                        </a>
                    ))}
                </div>
            </section>

            <LegalFooter />
        </main>
    );
}
