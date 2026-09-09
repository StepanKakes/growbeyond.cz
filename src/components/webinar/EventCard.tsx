import React from 'react';
import { LedText } from './LedText';

// Karta s termínem jako displej. Čtyři řádky tabulky nikoho nezaujmou,
// tohle drží stejný jazyk jako svítící 2030 na landing page: tmavé sklo,
// řádky obrazovky a hodnoty, které svítí.
//
// Struktura je odkoukaná z účtenky, popisek vlevo, vodicí tečky, hodnota
// vpravo. Datum a čas jsou nad tím jako dominanta, protože to je jediné,
// co si má člověk zapamatovat.

export type EventCardProps = {
    /** Den v týdnu, například "Pondělí". */
    weekday: string;
    /** Datum bez roku, například "21. 09.". */
    dayMonth: string;
    /** Rok, například "2026". */
    year: string;
    /** Čas začátku, například "17:00". */
    time: string;
    minutes: number;
};

const Line = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-baseline gap-3">
        <span className="text-[12px] uppercase tracking-[0.16em] text-white/45">{label}</span>
        <span className="screen-leader" aria-hidden="true" />
        <span className="text-[14px] md:text-[15px] font-bold uppercase tracking-[0.1em] text-white/85 tabular-nums">
            {value}
        </span>
    </div>
);

export const EventCard = ({ weekday, dayMonth, year, time, minutes }: EventCardProps) => (
    <div className="screen px-5 py-5 md:px-7 md:py-7">
        {/* Hlavička displeje */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <span className="text-[11px] uppercase tracking-[0.22em] text-white/40">Webinář 2030</span>
            <span className="text-[11px] uppercase tracking-[0.22em] text-white/40 tabular-nums">{year}</span>
        </div>

        {/* Datum a čas jako dominanta */}
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 pt-6">
            <div>
                <div className="text-[12px] uppercase tracking-[0.16em] text-white/45">{weekday}</div>
                <LedText
                    soft
                    color="red"
                    text={dayMonth}
                    className="mt-1.5 block text-[38px] md:text-[52px] font-bold leading-[0.95] tracking-[-0.03em] tabular-nums"
                />
            </div>
            <div className="text-right">
                <div className="text-[12px] uppercase tracking-[0.16em] text-white/45">Začátek</div>
                <LedText
                    soft
                    color="red"
                    text={time}
                    className="mt-1.5 block text-[38px] md:text-[52px] font-bold leading-[0.95] tracking-[-0.03em] tabular-nums"
                />
            </div>
        </div>

        <div className="mt-7 flex flex-col gap-3.5">
            <Line label="Délka" value={`${minutes} minut`} />
            <Line label="Kde" value="Online, živě" />
            <Line label="Cena" value="Zdarma" />
        </div>
    </div>
);

/** Barevná ikona kalendáře, ať je na první pohled jasné, kam odkaz vede. */
export const GoogleCalendarIcon = () => (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" aria-hidden="true">
        <rect x="3" y="4" width="18" height="17" rx="2.5" fill="#fff" />
        <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5V9H3z" fill="#4285F4" />
        <rect x="6.5" y="1.6" width="2" height="4.4" rx="1" fill="#34A853" />
        <rect x="15.5" y="1.6" width="2" height="4.4" rx="1" fill="#EA4335" />
        <rect x="6" y="11.5" width="4" height="1.6" rx="0.6" fill="#5F6368" />
        <rect x="11.5" y="11.5" width="6.5" height="1.6" rx="0.6" fill="#FBBC04" />
        <rect x="6" y="15" width="6.5" height="1.6" rx="0.6" fill="#5F6368" />
        <rect x="14" y="15" width="4" height="1.6" rx="0.6" fill="#5F6368" />
    </svg>
);
