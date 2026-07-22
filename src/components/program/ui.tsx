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

// Logo programu „3denní rentgen" — skenovací rámeček se serifovou 3 a červenou
// skenovací linkou, wordmark s červeně podbarveným „rentgen" (jazyk Mark).
// Škáluje se přes font-size rodiče (mark i mezery jsou v em).
export const ProgramLogo = ({ className = '' }: { className?: string }) => (
    <span className={`inline-flex items-center gap-[0.55em] leading-none select-none ${className}`}>
        <svg viewBox="0 0 44 44" fill="none" className="h-[1.9em] w-auto shrink-0" aria-hidden>
            <path d="M2 12V6a4 4 0 0 1 4-4h6" stroke="white" strokeOpacity="0.85" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M32 2h6a4 4 0 0 1 4 4v6" stroke="white" strokeOpacity="0.85" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M42 32v6a4 4 0 0 1-4 4h-6" stroke="white" strokeOpacity="0.85" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M12 42H6a4 4 0 0 1-4-4v-6" stroke="white" strokeOpacity="0.85" strokeWidth="2.5" strokeLinecap="round" />
            <text
                x="22"
                y="24"
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="var(--font-serif)"
                fontSize="31"
                fill="white"
            >
                3
            </text>
            <line x1="1" y1="22" x2="43" y2="22" stroke="#FF0E00" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <span className="font-bold uppercase tracking-[0.08em] text-[0.72em] whitespace-nowrap">
            denní{' '}
            <span
                className="bg-brand-red px-[0.28em] py-[0.1em] text-white"
                style={{ WebkitBoxDecorationBreak: 'clone', boxDecorationBreak: 'clone' }}
            >
                rentgen
            </span>
        </span>
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
