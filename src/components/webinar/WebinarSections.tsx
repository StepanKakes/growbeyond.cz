"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LedText } from './LedText';
import { WebinarForm } from './WebinarForm';
import { WEBINAR } from './webinarConfig';
import { REGISTRATION_ID } from './scroll';
import { LEGAL } from '@/lib/legal';

// Společná kostra sekcí: linka nahoře, nadpis vlevo, obsah vpravo.
// Hierarchii dělá velikost písma a prostor, ne kontejnery.
const Section = ({ id, title, children, className = '' }: { id?: string; title: string; children: React.ReactNode; className?: string }) => (
    <section id={id} className={`relative z-10 border-t border-white/10 scroll-mt-4 ${className}`}>
        <div className="mx-auto w-full max-w-[1200px] px-5 md:px-12 py-14 md:py-24 grid gap-8 md:gap-12 md:grid-cols-12">
            <h2 className="md:col-span-4 text-2xl md:text-[32px] font-bold tracking-[-0.02em] leading-[1.15]">{title}</h2>
            <div className="md:col-span-8 md:col-start-5 max-w-[640px]">{children}</div>
        </div>
    </section>
);

const Row = ({ children }: { children: React.ReactNode }) => (
    <li className="border-t border-white/10 py-5 md:py-6 first:border-t-0 first:pt-0 last:pb-0">{children}</li>
);

export const EventDetails = () => (
    <dl className="mt-8 md:mt-10">
        {[
            ['Datum', WEBINAR.date],
            ['Čas', WEBINAR.time],
            ['Kde', WEBINAR.place],
            ['Délka', `${WEBINAR.durationMinutes} minut`],
            ['Cena', 'Zdarma'],
        ].map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-6 border-t border-white/10 py-3 text-[17px] md:text-lg">
                <dt className="text-white/50">{k}</dt>
                <dd className="text-right">{v}</dd>
            </div>
        ))}
    </dl>
);

export const RegistrationSection = ({ id, closing = false }: { id?: string; closing?: boolean }) => (
    <section id={id} className="relative z-10 border-t border-white/10 scroll-mt-4">
        <div className="mx-auto w-full max-w-[1200px] px-5 md:px-12 py-14 md:py-24 grid gap-10 md:gap-12 md:grid-cols-12">
            <div className="md:col-span-5">
                <h2 className="text-2xl md:text-[32px] font-bold tracking-[-0.02em] leading-[1.15]">{WEBINAR.form.title}</h2>
                <p className="mt-4 text-[17px] md:text-lg text-white/70 leading-[1.55]">
                    {closing ? WEBINAR.closing.promise : WEBINAR.form.description}
                </p>
                <div className="hidden md:block"><EventDetails /></div>
            </div>
            <div className="md:col-span-6 md:col-start-7">
                <WebinarForm />
                <div className="md:hidden"><EventDetails /></div>
            </div>
        </div>
    </section>
);

export const AgendaSection = () => (
    <Section title={WEBINAR.agenda.title}>
        <ul>
            {WEBINAR.agenda.items.map(item => (
                <Row key={item.title}>
                    <h3 className="text-xl md:text-2xl font-bold tracking-[-0.015em] leading-[1.25]">{item.title}</h3>
                    <p className="mt-2 text-[17px] md:text-lg text-white/70 leading-[1.55]">{item.text}</p>
                </Row>
            ))}
        </ul>
    </Section>
);

export const TebeSection = () => (
    <section className="relative z-10 border-t border-white/10">
        <div className="mx-auto w-full max-w-[1200px] px-5 md:px-12 py-20 md:py-36 flex flex-col items-center text-center">
            <p className="max-w-[30ch] md:max-w-[38ch] text-xl md:text-[28px] font-bold tracking-[-0.015em] leading-[1.3]">
                {WEBINAR.tebe.intro}
            </p>
            <LedText
                as="p"
                color="red"
                text={WEBINAR.tebe.word}
                className="my-8 md:my-12 block font-bold leading-[0.9] tracking-[-0.04em] text-[clamp(104px,20vw,300px)]"
            />
            <p className="max-w-[36ch] md:max-w-[56ch] text-[17px] md:text-[21px] text-white/70 leading-[1.55]">
                {WEBINAR.tebe.explanation}
            </p>
        </div>
    </section>
);

export const AudienceSection = () => (
    <Section title={WEBINAR.audience.title}>
        <ul>
            {WEBINAR.audience.items.map(text => (
                <Row key={text}>
                    <p className="text-[17px] md:text-xl leading-[1.5]">{text}</p>
                </Row>
            ))}
        </ul>
        <p className="mt-8 text-[17px] md:text-lg text-white/50 leading-[1.55]">{WEBINAR.audience.not}</p>
    </Section>
);

export const HostSection = () => (
    <Section title={WEBINAR.host.title}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
            <div className="relative w-[160px] aspect-[4/5] shrink-0 overflow-hidden rounded-lg bg-[#141414] sm:w-[200px]">
                <Image
                    src={WEBINAR.host.photo}
                    alt={WEBINAR.host.name}
                    fill
                    sizes="200px"
                    className="object-cover"
                />
            </div>
            <div>
                <h3 className="text-xl md:text-2xl font-bold tracking-[-0.015em] leading-[1.25]">{WEBINAR.host.name}</h3>
                <p className="mt-1 text-[17px] md:text-lg text-white/50">{WEBINAR.host.role}</p>
                <p className="mt-4 text-[17px] md:text-lg text-white/70 leading-[1.55]">{WEBINAR.host.bio}</p>
            </div>
        </div>
    </Section>
);

export const ClosingSection = () => (
    <section className="relative z-10 border-t border-white/10 overflow-hidden">
        <div className="mx-auto w-full max-w-[1200px] px-5 md:px-12 pt-20 md:pt-36 pb-6 md:pb-10 flex flex-col items-center text-center">
            <LedText
                as="h2"
                text={WEBINAR.closing.title}
                px={3}
                className="block font-bold leading-[0.95] tracking-[-0.04em] text-[clamp(52px,8.5vw,120px)] max-w-[8ch] md:max-w-none"
            />
        </div>
    </section>
);

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
                {LEGAL.name}, IČO {LEGAL.ico}, {LEGAL.address}. {LEGAL.registration}{' '}
                <a href={`mailto:${LEGAL.email}`} className="underline underline-offset-[3px] hover:text-white transition-colors">{LEGAL.email}</a>
            </p>
        </div>
    </footer>
);

export { REGISTRATION_ID };
