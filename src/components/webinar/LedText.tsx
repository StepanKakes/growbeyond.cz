import React from 'react';

// Svítící text s efektem LED / LCD displeje: záře, chromatická aberace
// (červený a modrý posun okrajů) a tečková mřížka přes glyfy. Styly jsou
// v globals.css pod ".led". Vrstvy jsou jen vizuální, čtečky vidí jediný text.

type LedTextProps = {
    text: string;
    color?: 'white' | 'red';
    /** Velikost LED tečky v px (u menších textů zmenšit). */
    px?: number;
    className?: string;
    as?: 'span' | 'h1' | 'h2' | 'h3' | 'p' | 'div';
    /** Jen měkká záře bez aberace a mřížky, vhodné pro menší text a použití v řádku. */
    soft?: boolean;
};

export const LedText = ({ text, color = 'white', px, className = '', as = 'span', soft = false }: LedTextProps) => {
    const Tag = as;
    const style = px ? ({ ['--led-px' as string]: `${px}px` } as React.CSSProperties) : undefined;
    if (soft) {
        return (
            <Tag className={`led led--soft ${color === 'red' ? 'led--red' : ''} ${className}`} style={style}>
                {text}
                <span className="led__layer led__grid" aria-hidden="true">{text}</span>
            </Tag>
        );
    }
    return (
        <Tag className={`led ${color === 'red' ? 'led--red' : ''} ${className}`} style={style}>
            {text}
            <span className="led__layer led__ab led__ab--a" aria-hidden="true">{text}</span>
            <span className="led__layer led__ab led__ab--b" aria-hidden="true">{text}</span>
            <span className="led__layer led__grid" aria-hidden="true">{text}</span>
        </Tag>
    );
};
