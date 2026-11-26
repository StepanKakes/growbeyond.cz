import React from 'react';

const VYSLEDKY = [
    { castka: '118 802 Kč', co: 'za jeden týden', kdo: 'Fit Na Cestách, online kouči', img: ['/images/reference/fnc-118802.png'] },
    { castka: '446 000 Kč', co: 'rekordní měsíc s novou high ticket nabídkou', kdo: 'Lukáš Rusek, konzultant', img: ['/images/reference/lukas-446k.png'] },
    { castka: '227 740 Kč', co: 'za září, 22 platících klientů', kdo: 'Fit Na Cestách, online kouči', img: ['/images/reference/fnc-dashboard.jpg', '/images/reference/fnc-227k.png'] },
    { castka: '3 měsíce 1:1', co: '', kdo: 'Pavel Sedláček, filmař a mentor', img: ['/images/reference/pavel-deal.png'] },
    { castka: '123 000 Kč', co: 'za týden', kdo: 'Fit Na Cestách, online kouči', img: ['/images/reference/fnc-123000.png'] },
    { castka: '90 000 Kč', co: 'jeden klient na 6 měsíců', kdo: 'Lukáš Rusek, konzultant', img: ['/images/reference/lukas-90k.png'] },
];

// Ručně vyrovnané sloupce podle výšky screenshotů
const SLOUPCE = [[0, 2], [1, 3, 4], [5]];

export const VysledkyKlientu = () => {
    return (
        <section className="py-24 px-4 relative z-20">
            <div className="max-w-[1100px] mx-auto w-full">
                <h2 className="text-3xl md:text-5xl font-bold text-white text-center tracking-tight-custom leading-[1.1]">
                    Výsledky, které nám klienti <span className="font-serif italic font-normal text-brand-red">sami posílají</span>
                </h2>
                <p className="text-center text-white/60 text-base md:text-lg leading-relaxed max-w-[560px] mx-auto mt-5 mb-14">
                    Screenshoty z WhatsApp skupin, které máme s každým klientem. Zakrytá jsou jen telefonní čísla.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    {SLOUPCE.map((sloupec, i) => (
                        <div key={i} className="flex flex-col gap-6 min-w-0">
                            {sloupec.map((idx) => {
                                const v = VYSLEDKY[idx];
                                return (
                                    <figure key={v.img[0]} className="rounded-2xl bg-[#171717] border border-white/10 p-3 md:p-4">
                                        <figcaption className="px-1 pt-1 pb-3 md:pb-4">
                                            <p className="text-white text-lg font-bold tracking-tight-custom leading-snug">
                                                <span className="text-brand-red">{v.castka}</span> {v.co}
                                            </p>
                                            <p className="text-white/45 text-sm mt-1">{v.kdo}</p>
                                        </figcaption>
                                        <div className="flex flex-col gap-2">
                                            {v.img.map((src) => (
                                                <img
                                                    key={src}
                                                    src={src}
                                                    alt={`${v.kdo}: ${v.castka} ${v.co}`}
                                                    loading="lazy"
                                                    className="block w-full h-auto rounded-lg"
                                                />
                                            ))}
                                        </div>
                                    </figure>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
