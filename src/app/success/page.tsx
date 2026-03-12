import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { TextureOverlay } from '@/components/TextureOverlay';
import { FadeUp } from '@/components/FadeUp';

export default function SuccessPage() {
    return (
        <main className="min-h-screen relative bg-brand-dark text-white font-sans selection:bg-brand-red selection:text-white flex flex-col">
            <Navbar />
            <TextureOverlay />

            <div className="flex-1 flex items-center justify-center relative z-20 px-4 pt-24 pb-12">
                <div className="max-w-2xl mx-auto w-full">
                    <FadeUp>
                        <div className="bg-[#111111] border border-white/10 rounded-[32px] p-8 md:p-14 text-center relative overflow-hidden shadow-2xl">
                            {/* Success Icon */}
                            <div className="w-20 h-20 bg-brand-red/10 border border-brand-red/20 rounded-full flex items-center justify-center mx-auto mb-8">
                                <svg className="w-10 h-10 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight-custom mb-6">
                                Platba proběhla úspěšně!
                            </h1>

                            <p className="text-gray-400 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
                                Děkujeme za důvěru. Do e-mailu ti brzy dorazí všechny potřebné materiály a odkaz pro rezervaci naší první konzultace.
                            </p>

                            <Link
                                href="/"
                                className="inline-block px-10 py-4 bg-white hover:bg-gray-100 text-brand-dark rounded-full font-bold text-lg transition-all"
                            >
                                Zpět na domovskou stránku
                            </Link>
                        </div>
                    </FadeUp>
                </div>
            </div>

            <Footer />
        </main>
    );
}
