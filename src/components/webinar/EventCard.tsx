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

export const EventCard = ({ weekday, dayMonth, time, minutes }: EventCardProps) => (
    <div className="screen px-5 py-6 md:px-7 md:py-7">
        {/* Datum a čas jako dominanta */}
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
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

/** Loga služeb, ať je na první pohled jasné, kam odkaz vede. */
export const GoogleCalendarLogo = () => (
    <svg viewBox="0 0 24 24" className="h-[20px] w-[20px] shrink-0" aria-hidden="true">
        {/* Barevný rám kolem bílého listu s číslem, jak vypadá logo Kalendáře */}
        <rect width="24" height="24" rx="3.2" fill="#4285F4" />
        <path d="M24 5v13.8A3.2 3.2 0 0 1 20.8 22H19V5z" fill="#FBBC04" />
        <path d="M5 24h15.8a3.2 3.2 0 0 0 3.2-3.2V19H5z" fill="#34A853" />
        <path d="M3.2 0h17.6A3.2 3.2 0 0 1 24 3.2V5H0V3.2A3.2 3.2 0 0 1 3.2 0z" fill="#EA4335" />
        <rect x="5" y="5" width="14" height="14" fill="#fff" />
        <text
            x="12"
            y="16.4"
            textAnchor="middle"
            fontFamily="Helvetica, Arial, sans-serif"
            fontSize="10"
            fontWeight="700"
            fill="#4285F4"
        >
            31
        </text>
    </svg>
);

export const WhatsAppLogo = () => (
    <svg viewBox="0 0 24 24" className="h-[20px] w-[20px] shrink-0" aria-hidden="true">
        <path
            fill="#25D366"
            d="M20.52 3.48A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.69 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.48-8.42M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.89 9.89-9.89 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.43 9.89-9.88 9.89m5.42-7.41c-.3-.15-1.76-.87-2.03-.97s-.47-.15-.67.15c-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.47-2.39-1.48-.89-.79-1.48-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52s.2-.3.3-.5c.1-.2.05-.37-.03-.52s-.67-1.61-.92-2.21c-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37s-1.04 1.02-1.04 2.48 1.07 2.87 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35"
        />
    </svg>
);
