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
export const GoogleLogo = () => (
    <svg viewBox="0 0 48 48" className="h-[19px] w-[19px] shrink-0" aria-hidden="true">
        <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
        />
        <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
        />
        <path
            fill="#FBBC05"
            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
        />
        <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
        />
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
