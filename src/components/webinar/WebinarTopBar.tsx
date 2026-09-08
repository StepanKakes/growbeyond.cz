"use client";

import React, { useEffect, useState } from 'react';
import { WEBINAR, webinarStart } from './webinarConfig';

// Horní pruh s odpočtem do uzavření registrace, jedna ku jedné podle banneru
// z event.monetise.com: průsvitný červený přechod s vnitřní září, rozmazané
// pozadí, pulzující tečka, tučný verzálkový popisek a odpočet DD:HH:MM:SS.
// Na mobilu je odpočet pod popiskem, od tabletu v jednom řádku. Drží nahoře.

const pad = (n: number) => String(n).padStart(2, '0');

function formatCountdown(ms: number) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const d = Math.floor(total / 86400);
    const h = Math.floor((total % 86400) / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${pad(d)}:${pad(h)}:${pad(m)}:${pad(s)}`;
}

export const WebinarTopBar = () => {
    const [countdown, setCountdown] = useState('00:00:00:00');

    useEffect(() => {
        const start = webinarStart().getTime();
        const tick = () => setCountdown(formatCountdown(start - Date.now()));
        tick();
        const id = window.setInterval(tick, 1000);
        return () => window.clearInterval(id);
    }, []);

    return (
        <div className="countdown-bar sticky top-0 z-40 w-full text-white">
            <div className="flex flex-col items-center justify-center gap-2 px-5 py-3 md:flex-row md:gap-4">
                <div className="flex items-center gap-2.5">
                    <span className="countdown-bar__pulse" aria-hidden="true">
                        <span className="countdown-bar__pulse-ring" />
                        <span className="countdown-bar__pulse-dot" />
                    </span>
                    <p className="text-[12px] md:text-[13px] font-bold uppercase leading-none">{WEBINAR.topBar.label}</p>
                </div>
                <p className="text-[14px] md:text-[15px] font-bold leading-none tabular-nums whitespace-nowrap">{countdown}</p>
            </div>
        </div>
    );
};
