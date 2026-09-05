"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FadeUp } from '../FadeUp';
import { LedText } from './LedText';
import { WebinarForm } from './WebinarForm';
import { WEBINAR } from './webinarConfig';
import { REGISTRATION_ID } from './scroll';

const SectionTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <h2 className={`text-[30px] md:text-[56px] font-bold tracking-[-0.03em] leading-[1.1] md:leading-[1.05] ${className}`}>{children}</h2>
);

const LiveDot = () => (
    <span
        className="inline-block w-2 h-2 rounded-full bg-brand-red shrink-0 shadow-[0_0_6px_rgba(255,14,0,0.6),0_0_16px_rgba(255,14,0,0.35)] webinar-blink"
        aria-hidden="true"
    />
);

export const EventDetails = () => (
    <div className="flex items-start gap-7 md:gap-16">
        {[
            { label: 'Datum', value: WEBINAR.date },
            { label: 'Čas', value: WEBINAR.time },
            { label: 'Kde', value: WEBINAR.place, live: true },
        ].map(({ label, value, live }) => (
            <div key={label} className="flex flex-col gap-1 md:gap-1.5">
                <span className="text-[13px] md:text-sm font-bold text-white/45">{label}</span>
                <span className="text-[17px] md:text-xl font-bold text-white/95 flex items-center gap-2">
                    {live && <LiveDot />}
                    {value}
                </span>
            </div>
        ))}
    </div>
);

export const RegistrationSection = ({ id, showDescription }: { id?: string; showDescription: boolean }) => (
    <section id={id} className="relative z-10 px-5 md:px-[120px] pb-24 md:pb-40 flex flex-col items-center gap-7 md:gap-9 scroll-mt-6">
        <FadeUp><EventDetails /></FadeUp>
        <FadeUp delay={0.1} className="w-full flex justify-center">
            <WebinarForm showDescription={showDescription} />
        </FadeUp>
    </section>
);

export const AgendaSection = () => (
    <section className="relative z-10 px-5 md:px-[120px] pt-20 md:pt-[120px] pb-24 md:pb-40 flex flex-col items-center">
        <div className="w-full max-w-[1200px] flex flex-col gap-8 md:gap-12">
            <FadeUp><SectionTitle>{WEBINAR.agenda.title}</SectionTitle></FadeUp>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {WEBINAR.agenda.items.map((item, i) => (
                    <FadeUp key={item.title} delay={0.05 * i}>
                        <article className="h-full rounded-[20px] bg-white/[0.04] border border-white/[0.08] p-6 md:p-8 flex flex-col gap-3">
                            <span className="text-brand-red font-bold text-[15px] md:text-lg leading-none">{i + 1}</span>
                            <h3 className="text-xl md:text-[30px] font-bold tracking-[-0.02em] leading-[1.18] md:leading-[1.15]">{item.title}</h3>
                            <p className="text-white/55 font-bold text-[15px] md:text-lg leading-[1.4] md:leading-[1.45]">{item.text}</p>
                        </article>
                    </FadeUp>
                ))}
            </div>
        </div>
    </section>
);

export const TebeSection = () => (
    <section className="relative z-10 px-5 md:px-[120px] py-24 md:py-40 flex flex-col items-center text-center overflow-hidden">
        <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[420px] md:w-[1300px] md:h-[700px] rounded-full pointer-events-none blur-[80px] md:blur-[160px]"
            style={{ background: 'radial-gradient(closest-side, rgba(255,14,0,0.16), transparent 100%)' }}
            aria-hidden="true"
        />
        <FadeUp>
            <p className="relative text-white/70 font-bold text-lg md:text-[28px] leading-[1.4] md:leading-[1.35] tracking-[-0.015em] max-w-[320px] md:max-w-[720px]">
                {WEBINAR.tebe.intro}
            </p>
        </FadeUp>
        <FadeUp delay={0.1} className="relative my-6 md:my-10">
            <LedText
                as="p"
                color="red"
                text={WEBINAR.tebe.word}
                className="block font-bold leading-[0.9] tracking-[-0.05em] text-[clamp(110px,22vw,320px)]"
            />
        </FadeUp>
        <FadeUp delay={0.15}>
            <p className="relative text-white/65 font-bold text-base md:text-[22px] leading-[1.45] max-w-[330px] md:max-w-[760px]">
                {WEBINAR.tebe.explanation}
            </p>
        </FadeUp>
    </section>
);

export const AudienceSection = () => (
    <section className="relative z-10 px-5 md:px-[120px] pt-20 md:pt-[120px] pb-24 md:pb-40 flex flex-col items-center">
        <div className="w-full max-w-[1200px] flex flex-col gap-7 md:gap-12">
            <FadeUp><SectionTitle>{WEBINAR.audience.title}</SectionTitle></FadeUp>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
                {WEBINAR.audience.items.map((text, i) => (
                    <FadeUp key={text} delay={0.05 * i}>
                        <div className="h-full rounded-[20px] bg-white/[0.04] border border-white/[0.08] p-6 md:p-7 flex flex-col gap-3 md:gap-4">
                            <span className="text-brand-red font-bold text-[15px] md:text-lg leading-none">{i + 1}</span>
                            <p className="text-white/90 font-bold text-[17px] md:text-[22px] leading-[1.35] tracking-[-0.015em]">{text}</p>
                        </div>
                    </FadeUp>
                ))}
            </div>
            <FadeUp>
                <p className="text-white/40 font-bold text-[15px] md:text-lg leading-[1.4]">{WEBINAR.audience.not}</p>
            </FadeUp>
        </div>
    </section>
);

export const HostSection = () => (
    <section className="relative z-10 px-5 md:px-[120px] pt-20 md:pt-[120px] pb-28 md:pb-[200px] flex flex-col items-center">
        <div className="w-full max-w-[1200px] flex flex-col md:flex-row md:items-center gap-7 md:gap-20">
            <FadeUp className="md:hidden"><SectionTitle>{WEBINAR.host.title}</SectionTitle></FadeUp>
            <FadeUp className="w-full md:w-[480px] shrink-0">
                <div className="relative w-full aspect-[350/400] md:aspect-[480/560] rounded-3xl md:rounded-[28px] overflow-hidden bg-[#141414]">
                    <Image
                        src={WEBINAR.host.photo}
                        alt={WEBINAR.host.name}
                        fill
                        sizes="(min-width: 768px) 480px, 100vw"
                        className="object-cover"
                    />
                </div>
            </FadeUp>
            <FadeUp delay={0.1} className="flex flex-col gap-2.5 md:gap-4 md:max-w-[640px]">
                <span className="hidden md:block text-white/45 font-bold text-xl">{WEBINAR.host.title}</span>
                <h3 className="text-[26px] md:text-5xl font-bold tracking-[-0.03em] leading-[1.05]">{WEBINAR.host.name}</h3>
                <p className="text-brand-red font-bold text-base md:text-xl">{WEBINAR.host.role}</p>
                <p className="mt-1 md:mt-2 text-white/75 font-bold text-base md:text-[22px] leading-[1.45]">{WEBINAR.host.bio}</p>
            </FadeUp>
        </div>
    </section>
);

export const ClosingSection = () => (
    <section className="relative z-10 px-5 md:px-[120px] pt-24 md:pt-40 pb-24 md:pb-40 flex flex-col items-center text-center gap-8 md:gap-12 overflow-hidden">
        <FadeUp>
            <LedText
                as="h2"
                text={WEBINAR.closing.title}
                px={3}
                className="block font-bold leading-[0.95] tracking-[-0.045em] text-[clamp(52px,8.9vw,128px)] max-w-[350px] md:max-w-none mx-auto"
            />
        </FadeUp>
        <FadeUp delay={0.1}>
            <p className="text-white/65 font-bold text-base md:text-2xl leading-[1.45] max-w-[330px] md:max-w-[760px]">{WEBINAR.closing.promise}</p>
        </FadeUp>
        <FadeUp delay={0.15}><EventDetails /></FadeUp>
        <FadeUp delay={0.2} className="w-full flex justify-center">
            <WebinarForm showDescription />
        </FadeUp>
    </section>
);

export const WebinarFooter = () => (
    <footer className="relative z-10 border-t border-white/10">
        <div className="px-5 md:px-12 py-8 md:py-9 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <Link href="/" className="text-white text-[22px] md:text-2xl font-serif italic leading-none">Beyond</Link>
            <div className="flex flex-wrap gap-x-5 gap-y-2.5 text-[13px] font-bold text-white/50">
                <a href="https://growbeyond.cz" className="hover:text-white transition-colors">growbeyond.cz</a>
                <Link href="/obchodni-podminky" className="hover:text-white transition-colors">Obchodní podmínky</Link>
                <Link href="/ochrana-osobnich-udaju" className="hover:text-white transition-colors">Ochrana osobních údajů</Link>
            </div>
        </div>
    </footer>
);

export { REGISTRATION_ID };
