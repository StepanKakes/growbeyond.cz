"use client";

import React, { useEffect, useState } from 'react';
import { WEBINAR, webinarDate, webinarStart } from './webinarConfig';
import { openWebinarForm } from './formEvents';

// Tenký červený pruh nahoře s termínem, odpočtem do začátku a rezervací.
// Odpočet je odvozený z termínu v konfiguraci, po začátku se přepne na "Právě běží".

function formatCountdown(ms: number) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const d = Math.floor(total / 86400);
    const h = Math.floor((total % 86400) / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (d > 0) return `${d} ${d === 1 ? 'den' : d < 5 ? 'dny' : 'dní'} ${h} h ${m} min`;
    if (h > 0) return `${h} h ${m} min ${s} s`;
    return `${m} min ${s} s`;
}

export const WebinarTopBar = () => {
    const { display } = webinarDate();
    const [remaining, setRemaining] = useState<number | null>(null);

    useEffect(() => {
        const start = webinarStart().getTime();
        const tick = () => setRemaining(start - Date.now());
        tick();
        const id = window.setInterval(tick, 1000);
        return () => window.clearInterval(id);
    }, []);

    const countdown = remaining === null ? null : remaining > 0 ? `Začíná za ${formatCountdown(remaining)}` : 'Právě běží';

    return (
        <div className="sticky top-0 z-40 bg-brand-red text-white">
            <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-5 md:px-12 h-11 md:h-12 text-sm md:text-[15px]">
                <p className="min-w-0 truncate font-bold">
                    <span className="hidden sm:inline">Živý webinář </span>{display} v {WEBINAR.time}
                    {countdown && <span className="hidden md:inline font-normal text-white/85">, {countdown}</span>}
                </p>
                <button
                    type="button"
                    onClick={openWebinarForm}
                    className="shrink-0 font-bold underline-offset-[4px] hover:underline focus:outline-none focus-visible:underline"
                >
                    {WEBINAR.hero.navCta}
                </button>
            </div>
        </div>
    );
};
