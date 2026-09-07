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
        <ol className="mt-10 md:mt-14 border-t border-white/10">
            {WEBINAR.agenda.items.map((title, i) => (
                <li key={title} className="grid gap-3 border-b border-white/10 py-8 md:grid-cols-12 md:gap-8 md:py-12 md:items-center">
                    <div className="md:col-span-2">
                        <LedText soft color="red" text={String(i + 1).padStart(2, '0')} className="text-[72px] md:text-[128px] font-bold tracking-[-0.04em] leading-[0.85]" />
                    </div>
                    <h3 className="md:col-span-10 text-[24px] md:text-[40px] font-bold tracking-[-0.02em] leading-[1.15] max-w-[26ch]">{title}</h3>
                </li>
            ))}
        </ol>
    </Shell>
);

export const StatementSection = () => (
    <Shell>
        <div className="flex flex-col items-center text-center gap-8 md:gap-10">
            <LedText soft color="red" as="p" text={WEBINAR.statement.label} className="text-[24px] md:text-[32px] font-bold tracking-[-0.02em] leading-none" />
            <div className="flex flex-col gap-6 md:gap-8 max-w-[34ch] md:max-w-[46ch]">
                {WEBINAR.statement.paragraphs.map(p => (
                    <p key={p} className="text-[18px] md:text-[26px] leading-[1.5] md:leading-[1.45]">{p}</p>
                ))}
            </div>
            <LedText soft as="p" text={WEBINAR.statement.closing} className="text-[24px] md:text-[36px] font-bold tracking-[-0.02em] leading-none" />
        </div>
    </Shell>
);

export const AudienceSection = () => (
    <Shell>
        <Title>{WEBINAR.audience.title}</Title>
        <ol className="mt-10 md:mt-14 border-t border-white/10">
            {WEBINAR.audience.items.map(item => (
                <li key={item.lead} className="grid gap-3 border-b border-white/10 py-8 md:grid-cols-12 md:gap-8 md:py-12 md:items-start">
                    <div className="md:col-span-4">
                        <LedText soft color="red" text={item.lead} className="text-[34px] md:text-[48px] font-bold tracking-[-0.03em] leading-[0.95]" />
                    </div>
                    <p className="md:col-span-8 text-[24px] md:text-[36px] font-bold tracking-[-0.02em] leading-[1.15] max-w-[26ch]">{item.text}</p>
                </li>
            ))}
        </ol>
        <p className="mt-8 md:mt-10 text-[18px] md:text-[21px] text-white/50 leading-[1.5]">{WEBINAR.audience.not}</p>
    </Shell>
);

export const HostSection = () => (
    <Shell>
        <Title>{WEBINAR.host.title}</Title>
        <div className="mt-10 md:mt-14 grid gap-8 md:grid-cols-12 md:gap-12 md:items-end">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[#141414] md:col-span-5">
                <Image
                    src={WEBINAR.host.photo}
                    alt={WEBINAR.host.name}
                    fill
                    sizes="(min-width: 768px) 480px, 100vw"
                    className="object-cover"
                />
            </div>
            <div className="md:col-span-6 md:col-start-7 md:pb-4">
                <LedText soft color="red" as="p" text={WEBINAR.host.role} className="block text-[22px] md:text-[28px] font-bold tracking-[-0.02em] leading-none" />
                <h3 className="mt-4 text-[36px] md:text-[56px] font-bold tracking-[-0.03em] leading-[1.02]">{WEBINAR.host.name}</h3>
                <p className="mt-6 text-[18px] md:text-[21px] text-white/75 leading-[1.5]">{WEBINAR.host.bio}</p>
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
                <p className="mt-8 md:mt-10 max-w-[38ch] md:max-w-[56ch] text-[18px] md:text-[22px] text-white/85 leading-[1.5]">{WEBINAR.closing.promise}</p>
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
