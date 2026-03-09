"use client";

import React, { useState } from 'react';
import { FadeUp } from './FadeUp';
import { SocialProof } from './SocialProof';
import { motion, AnimatePresence } from 'framer-motion';

interface Review {
    author: string;
    handle: string;
    result: string;
    image?: string;
}

const reviews: Review[] = [
    {
        author: "Ishanth",
        handle: "@ishanth",
        result: "42M přehrání",
        image: "/images/testimonials/ishanth.png"
    },
    {
        author: "Liam",
        handle: "@liam",
        result: "133k sledujících",
        image: "/images/testimonials/liam.png"
    },
    {
        author: "Noah",
        handle: "@noah",
        result: "359k shlédnutí",
        image: "/images/testimonials/noah.png"
    },
    {
        author: "Thando",
        handle: "@thando",
        result: "100k+ dosah",
        image: "/images/testimonials/Thando Nzimande.png"
    },
    {
        author: "Air4future",
        handle: "@air4future",
        result: "$7,000+ launch"
    },
    {
        author: "louiscpr",
        handle: "@louiscpr",
        result: "21k přehrání",
        image: "/images/testimonials/louiscpr.png"
    },
    {
        author: "Johneez",
        handle: "@johneez",
        result: "5k shlédnutí (20 dní)",
        image: "/images/testimonials/johneez.png"
    },
    {
        author: "Yamini",
        handle: "@yamini",
        result: "6k shlédnutí (2 dny)",
        image: "/images/testimonials/yamini.png"
    },
    {
        author: "AshenOne",
        handle: "@ashenone",
        result: "2k shlédnutí",
        image: "/images/testimonials/AshenOne.png"
    },
    {
        author: "Manu33",
        handle: "@manu33",
        result: "8k views na reelech",
        image: "/images/testimonials/manu33.png"
    },
    {
        author: "Julia",
        handle: "@julia",
        result: "57k shlédnutí"
    },
    {
        author: "Atharv Kaizen",
        handle: "@atharv",
        result: "$380+ výdělek"
    },
    {
        author: "Sean Kgole",
        handle: "@seankgole",
        result: "Nejlepší investice"
    }
];

const getAvatarColor = (name: string) => {
    const colors = [
        'bg-[#FF0E00]', // brand red
        'bg-blue-600',
        'bg-purple-600',
        'bg-emerald-600',
        'bg-orange-600',
        'bg-pink-600',
        'bg-indigo-600',
        'bg-yellow-600'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

// Helper to chunk reviews into rows
const chunk = (arr: Review[], size: number) =>
    Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
        arr.slice(i * size, i * size + size)
    );

export const ReviewWall = () => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const rows = chunk(reviews, 5);

    return (
        <section className="pb-32 pt-16 px-4 relative z-20 bg-transparent overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-center mb-24 scale-110 md:scale-150 origin-center">
                    <SocialProof />
                </div>

                <div className="flex flex-col gap-6 items-center">
                    {rows.map((rowItems, rowIndex) => (
                        <div
                            key={rowIndex}
                            className="flex flex-wrap justify-center gap-4 w-full"
                        >
                            {rowItems.map((review, i) => (
                                <div key={`${rowIndex}-${i}`}>
                                    <FadeUp
                                        delay={(rowIndex * 5 + i) * 0.05}
                                    >
                                        <div
                                            onClick={() => review.image && setSelectedImage(review.image)}
                                            className={`
                                                flex items-center gap-3 bg-[#111111] border border-white/10 
                                                rounded-full py-2 pl-2 pr-6 hover:border-white/30 
                                                transition-all duration-300 group
                                                ${review.image ? 'cursor-zoom-in hover:bg-white/5 active:scale-95' : 'cursor-default'}
                                            `}
                                        >
                                            <div className={`w-10 h-10 rounded-full ${getAvatarColor(review.author)} flex items-center justify-center flex-shrink-0 border border-white/10 shadow-inner`}>
                                                <span className="text-white font-bold text-sm uppercase">
                                                    {review.author[0]}
                                                </span>
                                            </div>
                                            <div className="flex flex-col text-left">
                                                <span className="text-white font-bold text-sm leading-tight">
                                                    {review.author}
                                                </span>
                                                <span className="text-white/50 text-[10px] uppercase tracking-wider font-semibold">
                                                    {review.result}
                                                </span>
                                            </div>
                                        </div>
                                    </FadeUp>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Image Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                        className="fixed inset-0 z-[999] bg-black/95 flex items-center justify-center p-8 md:p-24 cursor-zoom-out"
                    >
                        <motion.button
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="absolute top-6 right-6 text-white hover:text-brand-red transition-colors z-[110]"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </motion.button>
                        <motion.img
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            src={selectedImage}
                            alt="Proof detail"
                            className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-2xl"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};
