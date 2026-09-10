"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

// Pole na telefon s výběrem předvolby. Předvolba se odhadne z časové zóny
// prohlížeče, takže Čech ani Slovák nemusí nic přepínat. Bez toho lidé
// píšou číslo bez předvolby a WhatsApp jim pak nedoručí zprávu.

type Country = { code: string; dial: string; flag: string; name: string };

// Pořadí není abecední schválně, nahoře je to, co u nás lidé vyplní nejčastěji.
const COUNTRIES: Country[] = [
    { code: 'CZ', dial: '+420', flag: '🇨🇿', name: 'Česko' },
    { code: 'SK', dial: '+421', flag: '🇸🇰', name: 'Slovensko' },
    { code: 'PL', dial: '+48', flag: '🇵🇱', name: 'Polsko' },
    { code: 'DE', dial: '+49', flag: '🇩🇪', name: 'Německo' },
    { code: 'AT', dial: '+43', flag: '🇦🇹', name: 'Rakousko' },
    { code: 'GB', dial: '+44', flag: '🇬🇧', name: 'Spojené království' },
    { code: 'IE', dial: '+353', flag: '🇮🇪', name: 'Irsko' },
    { code: 'US', dial: '+1', flag: '🇺🇸', name: 'Spojené státy' },
    { code: 'CA', dial: '+1', flag: '🇨🇦', name: 'Kanada' },
    { code: 'NL', dial: '+31', flag: '🇳🇱', name: 'Nizozemsko' },
    { code: 'BE', dial: '+32', flag: '🇧🇪', name: 'Belgie' },
    { code: 'FR', dial: '+33', flag: '🇫🇷', name: 'Francie' },
    { code: 'ES', dial: '+34', flag: '🇪🇸', name: 'Španělsko' },
    { code: 'PT', dial: '+351', flag: '🇵🇹', name: 'Portugalsko' },
    { code: 'IT', dial: '+39', flag: '🇮🇹', name: 'Itálie' },
    { code: 'CH', dial: '+41', flag: '🇨🇭', name: 'Švýcarsko' },
    { code: 'HU', dial: '+36', flag: '🇭🇺', name: 'Maďarsko' },
    { code: 'SI', dial: '+386', flag: '🇸🇮', name: 'Slovinsko' },
    { code: 'HR', dial: '+385', flag: '🇭🇷', name: 'Chorvatsko' },
    { code: 'RO', dial: '+40', flag: '🇷🇴', name: 'Rumunsko' },
    { code: 'BG', dial: '+359', flag: '🇧🇬', name: 'Bulharsko' },
    { code: 'GR', dial: '+30', flag: '🇬🇷', name: 'Řecko' },
    { code: 'SE', dial: '+46', flag: '🇸🇪', name: 'Švédsko' },
    { code: 'NO', dial: '+47', flag: '🇳🇴', name: 'Norsko' },
    { code: 'DK', dial: '+45', flag: '🇩🇰', name: 'Dánsko' },
    { code: 'FI', dial: '+358', flag: '🇫🇮', name: 'Finsko' },
    { code: 'UA', dial: '+380', flag: '🇺🇦', name: 'Ukrajina' },
    { code: 'AE', dial: '+971', flag: '🇦🇪', name: 'Spojené arabské emiráty' },
    { code: 'AU', dial: '+61', flag: '🇦🇺', name: 'Austrálie' },
];

/** Odhad podle časové zóny prohlížeče, ať se předvolba nastaví sama. */
const TZ_TO_CODE: Record<string, string> = {
    'Europe/Prague': 'CZ',
    'Europe/Bratislava': 'SK',
    'Europe/Warsaw': 'PL',
    'Europe/Berlin': 'DE',
    'Europe/Vienna': 'AT',
    'Europe/London': 'GB',
    'Europe/Dublin': 'IE',
    'Europe/Amsterdam': 'NL',
    'Europe/Brussels': 'BE',
    'Europe/Paris': 'FR',
    'Europe/Madrid': 'ES',
    'Europe/Lisbon': 'PT',
    'Europe/Rome': 'IT',
    'Europe/Zurich': 'CH',
    'Europe/Budapest': 'HU',
    'Europe/Ljubljana': 'SI',
    'Europe/Zagreb': 'HR',
    'Europe/Bucharest': 'RO',
    'Europe/Sofia': 'BG',
    'Europe/Athens': 'GR',
    'Europe/Stockholm': 'SE',
    'Europe/Oslo': 'NO',
    'Europe/Copenhagen': 'DK',
    'Europe/Helsinki': 'FI',
    'Europe/Kyiv': 'UA',
    'Asia/Dubai': 'AE',
};

export const PhoneField = ({
    id,
    value,
    onChange,
    invalid,
    describedBy,
}: {
    id: string;
    /** Celé číslo i s předvolbou, tedy to, co jde na server. */
    value: string;
    onChange: (full: string) => void;
    invalid?: boolean;
    describedBy?: string;
}) => {
    const [country, setCountry] = useState<Country>(COUNTRIES[0]);
    const [local, setLocal] = useState('');
    const [open, setOpen] = useState(false);
    const wrapRef = useRef<HTMLDivElement>(null);

    // Předvolbu odhadneme jednou při načtení, dál si ji řídí člověk sám.
    useEffect(() => {
        try {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const code = TZ_TO_CODE[tz];
            const found = code && COUNTRIES.find(c => c.code === code);
            if (found) setCountry(found);
        } catch { /* prohlížeč bez Intl, zůstane Česko */ }
    }, []);

    // Zavření kliknutím mimo a Escapem
    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('mousedown', onDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    const push = (c: Country, l: string) => onChange(l.trim() ? `${c.dial}${l.replace(/\s+/g, '')}` : '');

    // Když přijde hodnota zvenčí (předvyplnění), rozdělíme ji zpět na části.
    useEffect(() => {
        if (!value || local) return;
        const match = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length).find(c => value.startsWith(c.dial));
        if (match) {
            setCountry(match);
            setLocal(value.slice(match.dial.length));
        }
        // záměrně jen při první hodnotě
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const list = useMemo(() => COUNTRIES, []);

    return (
        <div ref={wrapRef} className="relative">
            <div
                className={`flex h-12 w-full items-stretch overflow-hidden rounded-lg border transition-colors ${
                    invalid ? 'border-brand-red' : 'border-white/20 hover:border-white/35 focus-within:border-white'
                }`}
            >
                <button
                    type="button"
                    onClick={() => setOpen(o => !o)}
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    aria-label={`Předvolba ${country.name}`}
                    className="flex shrink-0 items-center gap-2 border-r border-white/15 px-3 text-[17px] text-white transition-colors hover:bg-white/5"
                >
                    <span aria-hidden="true" className="text-[19px] leading-none">{country.flag}</span>
                    <span className="tabular-nums">{country.dial}</span>
                    <svg className="h-3 w-3 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M6 9l6 6 6-6" />
                    </svg>
                </button>

                <input
                    id={id}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    placeholder="777 123 456"
                    value={local}
                    aria-invalid={invalid || undefined}
                    aria-describedby={describedBy}
                    onChange={e => {
                        const v = e.target.value.replace(/[^\d\s]/g, '');
                        setLocal(v);
                        push(country, v);
                    }}
                    className="min-w-0 flex-1 bg-transparent px-4 text-[17px] text-white placeholder:text-white/45 focus:outline-none"
                />
            </div>

            <AnimatePresence>
                {open && (
                    <motion.ul
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ type: 'spring', duration: 0.25, bounce: 0 }}
                        role="listbox"
                        className="absolute left-0 top-[calc(100%+6px)] z-20 max-h-[280px] w-full overflow-y-auto rounded-xl border border-white/15 bg-[#141414] py-1.5 shadow-2xl"
                    >
                        {list.map(c => (
                            <li key={c.code}>
                                <button
                                    type="button"
                                    role="option"
                                    aria-selected={c.code === country.code}
                                    onClick={() => {
                                        setCountry(c);
                                        push(c, local);
                                        setOpen(false);
                                    }}
                                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-[15px] transition-colors hover:bg-white/8 ${
                                        c.code === country.code ? 'text-white' : 'text-white/70'
                                    }`}
                                >
                                    <span aria-hidden="true" className="text-[18px] leading-none">{c.flag}</span>
                                    <span className="flex-1">{c.name}</span>
                                    <span className="text-white/45 tabular-nums">{c.dial}</span>
                                </button>
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
};
