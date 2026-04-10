"use client";

import React, { useState, useEffect } from 'react';

export const CountdownBanner = () => {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [expired, setExpired] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const target = new Date();
            target.setHours(20, 0, 0, 0);

            // If it's already past 20:00 today, the deadline has passed
            if (now >= target) {
                setExpired(true);
                return { hours: 0, minutes: 0, seconds: 0 };
            }

            const diff = target.getTime() - now.getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            return { hours, minutes, seconds };
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    if (expired) return null;

    const pad = (n: number) => n.toString().padStart(2, '0');

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[200]">
            <div className="bg-[#FF0E00] py-3 px-4">
                <div className="max-w-[1200px] mx-auto flex items-center justify-center gap-3 md:gap-6 flex-wrap">
                    <span className="text-white text-sm md:text-base font-bold tracking-tight-custom">
                        Zvýšení ceny za:
                    </span>

                    <div className="flex items-center gap-1.5">
                        <div className="bg-black/30 rounded-md px-2.5 py-1.5 min-w-[44px] text-center">
                            <span className="text-white font-bold text-lg md:text-xl tabular-nums font-mono">
                                {pad(timeLeft.hours)}
                            </span>
                        </div>
                        <span className="text-white/80 font-bold text-lg">:</span>
                        <div className="bg-black/30 rounded-md px-2.5 py-1.5 min-w-[44px] text-center">
                            <span className="text-white font-bold text-lg md:text-xl tabular-nums font-mono">
                                {pad(timeLeft.minutes)}
                            </span>
                        </div>
                        <span className="text-white/80 font-bold text-lg">:</span>
                        <div className="bg-black/30 rounded-md px-2.5 py-1.5 min-w-[44px] text-center">
                            <span className="text-white font-bold text-lg md:text-xl tabular-nums font-mono">
                                {pad(timeLeft.seconds)}
                            </span>
                        </div>
                    </div>

                    <a
                        href="#starterpackoffer"
                        className="bg-white text-[#FF0E00] px-5 py-2 rounded-full text-sm font-bold tracking-tight-custom hover:bg-white/90 transition-all"
                    >
                        Koupit teď
                    </a>
                </div>
            </div>
        </div>
    );
};
