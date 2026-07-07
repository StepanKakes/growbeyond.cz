import React from 'react';

// Sdílené UI primitivy free programu — design jazyk z redesignu LP (landing-redesign):
// karty #1A1A1A / border white-8 / radius 16, červené zvýrazněné spany,
// Instrument Serif čísla kroků, pill CTA.

// Červeně podbarvený úsek textu (box-decoration-break kvůli zalomení přes řádky)
export const Mark = ({ children }: { children: React.ReactNode }) => (
    <span
        className="bg-brand-red px-[0.24em] py-[0.04em] text-white"
        style={{ WebkitBoxDecorationBreak: 'clone', boxDecorationBreak: 'clone' }}
    >
        {children}
    </span>
);

// Velké serifové číslo kroku (01, 02, ...)
export const StepNum = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <span className={`font-serif text-brand-red text-[40px] leading-none ${className}`}>{children}</span>
);

// Karta v jazyce redesignu
export const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-[#1A1A1A] border border-white/[0.08] rounded-2xl ${className}`}>{children}</div>
);

// Pill CTA tlačítko (odkaz)
export const PillLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a
        href={href}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
        className="inline-block bg-brand-red hover:bg-[#cc0b00] text-white px-10 py-[18px] rounded-full text-[17px] font-bold tracking-[0.02em] uppercase transition-colors"
    >
        {children}
    </a>
);

// Podtržení červenou linkou (SVG squiggle z redesignu)
export const Underlined = ({ children }: { children: React.ReactNode }) => (
    <span
        className="pb-2"
        style={{
            backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 12' fill='none' preserveAspectRatio='none'%3E%3Cpath d='M2 9C100 3 300 3 398 9' stroke='%23FF0E00' stroke-width='4' stroke-linecap='round' /%3E%3C/svg%3E\")",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'left bottom',
            backgroundSize: '100% 10px',
        }}
    >
        {children}
    </span>
);

export const CheckIcon = () => (
    <span className="text-brand-red shrink-0 relative top-[2px] inline-flex">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
    </span>
);

// Indikátor postupu dny 1-3 (hotový = check, aktuální = červená, budoucí = ztlumený)
export const DayProgress = ({ current, watched }: { current: 1 | 2 | 3; watched: Record<1 | 2 | 3, string> }) => (
    <div className="flex items-center justify-center gap-6">
        {([1, 2, 3] as const).map(d => {
            const done = !!watched[d];
            const active = d === current;
            return (
                <span
                    key={d}
                    className={`font-serif text-[32px] leading-none flex items-center gap-1.5 ${active ? 'text-brand-red' : done ? 'text-white/80' : 'text-white/25'}`}
                >
                    0{d}
                    {done && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-red"><path d="M20 6L9 17l-5-5" /></svg>
                    )}
                </span>
            );
        })}
    </div>
);
