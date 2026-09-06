"use client";

import React from 'react';
import { LedText } from '../LedText';
import { WEBINAR, webinarDate } from '../webinarConfig';

// Návrhy sekce "Co se na webináři dozvíš" pro výběr. Obsah bere z konfigurace,
// klíčová slova a časy jsou zatím jen pro návrh (doladí se u vybrané varianty).

const ITEMS = WEBINAR.agenda.items.map((item, i) => ({
    ...item,
    keyword: ['Jméno', 'Důvěra', 'Distribuce', 'Start'][i],
    time: ['19:00', '19:15', '19:35', '19:55'][i],
    minutes: [15, 20, 20, 20][i],
    // slovo z názvu, které svítí ve variantě 5
    glow: ['2030', 'AI', 'distribuční kanál', 'už dnes'][i],
}));

const Wrap = ({ children }: { children: React.ReactNode }) => (
    <div className="mx-auto w-full max-w-[1200px] px-5 md:px-12">{children}</div>
);

const Title = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <h2 className={`text-[32px] md:text-[52px] font-bold tracking-[-0.03em] leading-[1.05] max-w-[18ch] ${className}`}>{children}</h2>
);

/* 1 · Program večera: časová osa jako televizní program, časy svítí */
export const VariantSchedule = () => {
    const { display, weekday } = webinarDate();
    return (
        <Wrap>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <Title>{WEBINAR.agenda.title}</Title>
                <p className="text-[17px] md:text-[19px] text-white/60">{weekday} {display}, začátek {WEBINAR.time}, {WEBINAR.durationMinutes} minut</p>
            </div>
            <ol className="mt-10 md:mt-14 border-t border-white/10">
                {ITEMS.map((item, i) => (
                    <li key={item.title} className="grid gap-3 border-b border-white/10 py-7 md:grid-cols-12 md:gap-8 md:py-9">
                        <div className="md:col-span-3 flex items-baseline gap-3 md:flex-col md:gap-2">
                            <LedText soft color={i === 0 ? 'red' : 'white'} text={item.time} className="text-[36px] md:text-[56px] font-bold tracking-[-0.03em] leading-none" />
                            <span className="text-sm md:text-[15px] text-white/50">{i === 0 ? 'začátek, živě' : `${item.minutes} minut`}</span>
                        </div>
                        <div className="md:col-span-9">
                            <h3 className="text-[24px] md:text-[32px] font-bold tracking-[-0.02em] leading-[1.15] max-w-[26ch]">{item.title}</h3>
                            <p className="mt-3 text-[17px] md:text-[19px] text-white/70 leading-[1.55] max-w-[56ch]">{item.text}</p>
                        </div>
                    </li>
                ))}
            </ol>
        </Wrap>
    );
};

/* 2 · Displej: celý program v jednom panelu obrazovky se scanlines a svítícími klíčovými slovy */
export const VariantScreen = () => {
    const { display } = webinarDate();
    return (
        <Wrap>
            <Title>{WEBINAR.agenda.title}</Title>
            <div className="screen mt-10 md:mt-14 px-6 py-6 md:px-12 md:py-10">
                <div className="flex items-center justify-between text-sm text-white/50 pb-5 border-b border-white/10">
                    <span>Program webináře</span>
                    <span>{display}, {WEBINAR.time}</span>
                </div>
                <ol>
                    {ITEMS.map((item, i) => (
                        <li key={item.title} className={`grid gap-3 py-7 md:grid-cols-12 md:gap-8 md:py-9 ${i < ITEMS.length - 1 ? 'border-b border-white/10' : 'pb-2 md:pb-4'}`}>
                            <div className="md:col-span-4">
                                <LedText soft text={item.keyword} className="text-[36px] md:text-[48px] font-bold tracking-[-0.03em] leading-none" />
                            </div>
                            <div className="md:col-span-8">
                                <h3 className="text-[22px] md:text-[28px] font-bold tracking-[-0.02em] leading-[1.2] max-w-[26ch]">{item.title}</h3>
                                <p className="mt-3 text-[17px] md:text-[18px] text-white/70 leading-[1.55] max-w-[56ch]">{item.text}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </Wrap>
    );
};

/* 3 · Obrazovky: každý bod jako vlastní malý displej s velkým svítícím slovem */
export const VariantTiles = () => (
    <Wrap>
        <Title>{WEBINAR.agenda.title}</Title>
        <ol className="mt-10 md:mt-14 grid gap-4 md:grid-cols-2 md:gap-6">
            {ITEMS.map(item => (
                <li key={item.title} className="screen px-6 py-8 md:px-10 md:py-12 min-h-[300px] md:min-h-[360px] flex flex-col justify-between">
                    <LedText text={item.keyword} px={2} className="block font-bold tracking-[-0.04em] leading-[0.9] text-[64px] md:text-[88px]" />
                    <div className="mt-10">
                        <h3 className="text-[22px] md:text-[26px] font-bold tracking-[-0.02em] leading-[1.2]">{item.title}</h3>
                        <p className="mt-3 text-[17px] text-white/70 leading-[1.55]">{item.text}</p>
                    </div>
                </li>
            ))}
        </ol>
    </Wrap>
);

/* 4 · Číslovaný LED: velké červené svítící číslice a velké názvy */
export const VariantNumbers = () => (
    <Wrap>
        <Title>{WEBINAR.agenda.title}</Title>
        <ol className="mt-10 md:mt-14 border-t border-white/10">
            {ITEMS.map((item, i) => (
                <li key={item.title} className="grid gap-2 border-b border-white/10 py-8 md:grid-cols-12 md:gap-8 md:py-12 md:items-start">
                    <div className="md:col-span-2">
                        <LedText soft color="red" text={String(i + 1)} className="text-[72px] md:text-[128px] font-bold tracking-[-0.05em] leading-[0.85]" />
                    </div>
                    <div className="md:col-span-10 md:pt-2">
                        <h3 className="text-[28px] md:text-[44px] font-bold tracking-[-0.03em] leading-[1.08] max-w-[22ch]">{item.title}</h3>
                        <p className="mt-4 text-[18px] md:text-[21px] text-white/70 leading-[1.5] max-w-[52ch]">{item.text}</p>
                    </div>
                </li>
            ))}
        </ol>
    </Wrap>
);

/* 5 · Typografická stěna: názvy na displejové velikosti, jedno slovo v každém svítí */
const GlowTitle = ({ title, glow }: { title: string; glow: string }) => {
    const idx = title.indexOf(glow);
    if (idx < 0) return <>{title}</>;
    return (
        <>
            {title.slice(0, idx)}
            <LedText soft text={glow} />
            {title.slice(idx + glow.length)}
        </>
    );
};

export const VariantTypeWall = () => (
    <Wrap>
        <p className="text-[17px] md:text-[19px] text-white/60">{WEBINAR.agenda.title}</p>
        <ol className="mt-8 md:mt-12 flex flex-col gap-14 md:gap-24">
            {ITEMS.map(item => (
                <li key={item.title} className="grid gap-5 md:grid-cols-12 md:gap-10">
                    <span className="mt-4 block h-[2px] w-12 bg-brand-red md:col-span-1" aria-hidden="true" />
                    <div className="md:col-span-11">
                        <h3 className="text-[36px] md:text-[64px] font-bold tracking-[-0.035em] leading-[1.0] max-w-[16ch]">
                            <GlowTitle title={item.title} glow={item.glow} />
                        </h3>
                        <p className="mt-5 md:mt-7 text-[18px] md:text-[22px] text-white/65 leading-[1.5] max-w-[46ch]">{item.text}</p>
                    </div>
                </li>
            ))}
        </ol>
    </Wrap>
);
