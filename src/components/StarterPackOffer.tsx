"use client";

import React, { useState } from 'react';
import { FadeUp } from './FadeUp';
import { motion } from 'framer-motion';

const offerBenefits = [
    { name: "Brandová Analýza", value: "990 Kč" },
    { name: "60min Strategický Call", value: "4 990 Kč" },
    { name: "Creator Map™", value: "1 990 Kč" },
    { name: "Content Framework Pack™", value: "1 290 Kč" },
    { name: "Creator OS™", value: "730 Kč" }
];

export const StarterPackOffer = () => {
    const [isLoading, setIsLoading] = useState(false);

    const handleCheckout = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                console.error('Network response was not ok');
                setIsLoading(false);
                return;
            }

            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error('No URL returned from checkout API');
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Error initiating checkout:', error);
            setIsLoading(false);
        }
    };

    return (
        <section id="starterpackoffer" className="py-20 px-4 relative z-50 bg-transparent overflow-hidden">
            <div className="max-w-2xl mx-auto">
                <FadeUp>
                    <div className="bg-[#111111] border border-white/10 rounded-[32px] p-6 md:p-10 text-center relative overflow-hidden">
                        <h2 className="text-[32px] md:text-[42px] font-bold text-white tracking-tight-custom leading-tight mb-4">
                            Creator Starter Pack
                        </h2>

                        <div className="flex flex-col items-center justify-center gap-1 mb-10">
                            <div className="text-white font-serif italic text-6xl md:text-7xl leading-none">
                                3 990 Kč
                            </div>
                            <div className="mt-6 flex flex-col items-center gap-2">
                                <span className="text-white/40 text-xs md:text-sm font-bold tracking-tight-custom uppercase">
                                    Brzy za
                                </span>
                                <div>
                                    <span className="font-serif italic text-4xl md:text-5xl text-[#FF0E00] line-through decoration-[3px] decoration-white/60">
                                        9 990 Kč
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Benefits List */}
                        <div className="border-t border-white/5 mb-10">
                            {offerBenefits.map((benefit, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 py-3 border-b border-white/5 text-left px-1"
                                >
                                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-white text-sm md:text-base font-bold tracking-tight font-sans">
                                            {benefit.name}
                                        </span>
                                        <span className="text-white text-[11px] md:text-xs font-sans font-medium">
                                            — hodnota {benefit.value}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* CTA */}
                        <div>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleCheckout}
                                disabled={isLoading}
                                className={`w-full md:w-auto px-10 md:px-14 py-4 rounded-full font-bold text-base md:text-lg transition-all ${isLoading
                                        ? 'bg-brand-red/70 text-white/70 cursor-wait'
                                        : 'bg-brand-red hover:bg-[#FF1F14] text-white'
                                    }`}
                            >
                                {isLoading ? 'Připravuji pokladnu...' : 'Chci Creator Starter Pack'}
                            </motion.button>
                        </div>
                    </div>
                </FadeUp>
            </div>
        </section>
    );
};
