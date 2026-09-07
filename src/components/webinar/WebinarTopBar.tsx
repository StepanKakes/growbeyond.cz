"use client";

import React, { useEffect, useState } from 'react';
import { WEBINAR, webinarStart } from './webinarConfig';
import { openWebinarForm } from './formEvents';

// Červený pruh nahoře: odpočet do uzavření registrace (= začátek webináře)
// a bílé tlačítko rezervace. Drží při scrollování.

function formatCountdown(ms: number) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const d = Math.floor(total / 86400);
    const h = Math.floor((total % 86400) / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (d > 0) return `${d} d ${h} h ${m} min`;
    if (h > 0) return `${h} h ${m} min ${s} s`;
    return `${m} min ${s} s`;
}

export const WebinarTopBar = () => {
    const [remaining, setRemaining] = useState<number | null>(null);

    useEffect(() => {
        const start = webinarStart().getTime();
        const tick = () => setRemaining(start - Date.now());
        tick();
        const id = window.setInterval(tick, 1000);
        return () => window.clearInterval(id);
    }, []);

    const countdown = remaining === null ? '' : remaining > 0 ? formatCountdown(remaining) : 'právě běží';

    return (
        <div className="sticky top-0 z-40 bg-brand-red text-white">
            <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-3 px-5 md:px-12 h-12 md:h-14 text-[12px] md:text-[15px]">
                <p className="min-w-0 font-bold uppercase leading-[1.2] tracking-[0.02em]">
                    {WEBINAR.topBar.label} <span className="whitespace-nowrap normal-case">{countdown}</span>
                </p>
                <button
                    type="button"
                    onClick={openWebinarForm}
                    className="shrink-0 h-8 md:h-9 rounded-full bg-white px-4 md:px-5 text-[13px] md:text-sm font-bold text-brand-red transition-colors hover:bg-white/90 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                    <span className="sm:hidden">Rezervovat</span>
                    <span className="hidden sm:inline">{WEBINAR.topBar.cta}</span>
                </button>
            </div>
        </div>
    );
};
