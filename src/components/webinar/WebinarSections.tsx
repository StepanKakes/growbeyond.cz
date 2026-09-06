"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LedText } from './LedText';
import { PrimaryButton } from './WebinarHero';
import { WEBINAR, webinarDate } from './webinarConfig';
import { LEGAL } from '@/lib/legal';

// Společný jazyk sekcí: linka nahoře, velký nadpis, obsah v mřížce oddělené
// linkami. Hierarchii dělá velikost písma a prostor, ne kontejnery ani ikony.
const Shell = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <section className={`relative z-10 border-t border-white/10 ${className}`}>
        <div className="mx-auto w-full max-w-[1200px] px-5 md:px-12 py-16 md:py-28">{children}</div>
    </section>
);

const Title = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-[32px] md:text-[52px] font-bold tracking-[-0.03em] leading-[1.05] max-w-[18ch]">{children}</h2>
);

export const AgendaSection = () => (
    <Shell>
        <Title>{WEBINAR.agenda.title}</Title>
        <ul className="mt-10 md:mt-14 grid border-t border-white/10 md:grid-cols-2">
            {WEBINAR.agenda.items.map((item, i) => (
                <li
                    key={item.title}
                    className={`border-b border-white/10 py-7 md:py-10 ${i % 2 === 1 ? 'md:border-l md:pl-12' : 'md:pr-12'}`}
                >
                    <h3 className="text-[22px] md:text-[30px] font-bold tracking-[-0.02em] leading-[1.2] max-w-[22ch]">{item.title}</h3>
                    <p className="mt-3 md:mt-4 text-[17px] md:text-[19px] text-white/70 leading-[1.55] max-w-[48ch]">{item.text}</p>
                </li>
            ))}
        </ul>
    </Shell>
);

export const TebeSection = () => (
    <Shell>
        <div className="flex flex-col items-center text-center">
            <p className="max-w-[26ch] md:max-w-[34ch] text-[24px] md:text-[36px] font-bold tracking-[-0.02em] leading-[1.2]">
                {WEBINAR.tebe.intro}
            </p>
            <LedText
                as="p"
                color="red"
                text={WEBINAR.tebe.word}
                className="my-8 md:my-12 block font-bold leading-[0.9] tracking-[-0.04em] text-[clamp(104px,20vw,300px)]"
            />
            <p className="max-w-[36ch] md:max-w-[58ch] text-[18px] md:text-[22px] text-white/70 leading-[1.5]">
                {WEBINAR.tebe.explanation}
            </p>
        </div>
    </Shell>
);

export const AudienceSection = () => (
    <Shell>
        <Title>{WEBINAR.audience.title}</Title>
        <ul className="mt-10 md:mt-14 grid border-t border-white/10 md:grid-cols-3">
            {WEBINAR.audience.items.map((text, i) => (
                <li key={text} className={`border-b border-white/10 py-7 md:py-10 ${i > 0 ? 'md:border-l md:pl-10' : ''} ${i < 2 ? 'md:pr-10' : ''}`}>
                    <p className="text-[20px] md:text-[24px] font-bold tracking-[-0.015em] leading-[1.3]">{text}</p>
                </li>
            ))}
        </ul>
        <p className="mt-8 md:mt-10 text-[17px] md:text-[19px] text-white/50 leading-[1.55]">{WEBINAR.audience.not}</p>
    </Shell>
);

export const HostSection = () => (
    <Shell>
        <Title>{WEBINAR.host.title}</Title>
        <div className="mt-10 md:mt-14 grid gap-8 md:grid-cols-12 md:gap-12 md:items-end">
            <div className="relative aspect-[4/5] w-full max-w-[420px] overflow-hidden rounded-xl bg-[#141414] md:col-span-5 md:max-w-none">
                <Image
                    src={WEBINAR.host.photo}
                    alt={WEBINAR.host.name}
                    fill
                    sizes="(min-width: 768px) 480px, 100vw"
                    className="object-cover"
                />
            </div>
            <div className="md:col-span-6 md:col-start-7 md:pb-4">
                <h3 className="text-[32px] md:text-[44px] font-bold tracking-[-0.03em] leading-[1.05]">{WEBINAR.host.name}</h3>
                <p className="mt-2 text-[18px] md:text-[20px] text-white/50">{WEBINAR.host.role}</p>
                <p className="mt-6 text-[18px] md:text-[21px] text-white/70 leading-[1.5]">{WEBINAR.host.bio}</p>
            </div>
        </div>
    </Shell>
);

export const ClosingSection = () => {
    const { display, weekday } = webinarDate();
    return (
        <Shell className="overflow-hidden">
            <div className="flex flex-col items-center text-center">
                <LedText
                    as="h2"
                    text={WEBINAR.closing.title}
                    className="block font-bold leading-[0.95] tracking-[-0.04em] text-[clamp(52px,8.5vw,120px)] max-w-[8ch] md:max-w-none"
                />
                <p className="mt-8 md:mt-10 max-w-[36ch] md:max-w-[56ch] text-[18px] md:text-[22px] text-white/70 leading-[1.5]">{WEBINAR.closing.promise}</p>
                <p className="mt-8 md:mt-10 text-[20px] md:text-[24px] font-bold tracking-[-0.015em]">
                    {weekday} {display}, {WEBINAR.time}, <span className="text-brand-red">{WEBINAR.hero.live}</span>
                </p>
                <PrimaryButton className="mt-6 md:mt-8 w-full sm:w-auto">{WEBINAR.hero.cta}</PrimaryButton>
            </div>
        </Shell>
    );
};

export const WebinarFooter = () => (
    <footer className="relative z-10 border-t border-white/10">
        <div className="mx-auto w-full max-w-[1200px] px-5 md:px-12 py-10 md:py-12 flex flex-col gap-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <Link href="/" className="text-white text-[22px] font-serif italic leading-none">Beyond</Link>
                <nav aria-label="Patička" className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/60">
                    <Link href="/" className="hover:text-white transition-colors">growbeyond.cz</Link>
                    <Link href="/obchodni-podminky" className="hover:text-white transition-colors">Obchodní podmínky</Link>
                    <Link href="/ochrana-osobnich-udaju" className="hover:text-white transition-colors">Ochrana osobních údajů</Link>
                </nav>
            </div>
            <p className="text-sm text-white/45 leading-[1.6] max-w-[70ch]">
                {LEGAL.name}, IČO {LEGAL.ico}, {LEGAL.address}, {LEGAL.registration.replace(/\.$/, '')},{' '}
                <a href={`mailto:${LEGAL.email}`} className="underline underline-offset-[3px] hover:text-white transition-colors">{LEGAL.email}</a>
            </p>
        </div>
    </footer>
);
