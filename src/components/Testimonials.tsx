"use client";

import React, { useState } from 'react';
import { FadeUp } from './FadeUp';

const TestimonialCard: React.FC<{
    hook?: string,
    quote: string,
    author: string,
    role: string,
    image?: string,
    proofImages?: string[]
}> = ({ hook, quote, author, role, image, proofImages }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const maxLength = 150;
    const isLong = quote.length > maxLength;
    const displayQuote = isExpanded ? quote : (isLong ? `${quote.substring(0, maxLength)}...` : quote);

    const getAvatarColor = (name: string) => {
        const colors = [
            'bg-[#FF0E00]', // brand red
            'bg-blue-600',
            'bg-purple-600',
            'bg-emerald-600',
            'bg-orange-600',
            'bg-pink-600',
            'bg-indigo-600',
            'bg-yellow-600'
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <div className="bg-[#151515] rounded-2xl border border-white/10 p-6 flex flex-col gap-4 h-full">
            {/* Stars */}
            <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-500 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>

            <div className="flex-grow">
                {hook && (
                    <h5 className="text-white text-[15px] font-bold mb-3 leading-snug tracking-tight uppercase">
                        {hook}
                    </h5>
                )}
                <p className="text-gray-300 text-[13px] leading-relaxed font-sans tracking-wide">
                    {displayQuote}
                </p>
                {isLong && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-brand-red text-[13px] font-bold mt-2 hover:underline focus:outline-none"
                    >
                        {isExpanded ? "Zobrazit méně" : "Přečíst více"}
                    </button>
                )}

                {/* Proof Images */}
                {isExpanded && proofImages && proofImages.length > 0 && (
                    <div className="mt-6 grid grid-cols-1 gap-4">
                        {proofImages.map((img, idx) => (
                            <div key={idx} className="rounded-xl overflow-hidden border border-white/5 bg-black/20">
                                <img
                                    src={img}
                                    alt={`Proof ${idx + 1}`}
                                    className="w-full h-auto object-contain"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex items-center gap-3 pt-2">
                <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-gray-700 flex-shrink-0 flex items-center justify-center">
                    {image ? (
                        <img src={image} alt={author} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                        <div className={`w-full h-full flex items-center justify-center ${getAvatarColor(author)}`}>
                            <span className="text-white font-bold text-sm uppercase">
                                {author.charAt(0)}
                            </span>
                        </div>
                    )}
                </div>
                <div>
                    <h4 className="text-white text-base font-serif">{author}</h4>
                    <p className="text-gray-500 text-[10px] font-sans tracking-wide uppercase">{role}</p>
                </div>
            </div>
        </div>
    );
};

const testimonials = [
    {
        hook: "Z 50k na 80k sledujících a launch za $7,000 USD – během 5 týdnů.",
        quote: "Když jsem se připojil do Beyond, už jsem měl nějaké publikum, ale nedokázal jsem to monetizovat. Během pěti týdnů co jsem implementoval strategii, kterou jsme s klukama nastavili jsem dostal můj profil z 50k sledujících na 80k. Obsah začal oslovovat cílené publikum a hned na to jsme nastavili můj první launch produktu. Za dva týdny jsem vydělal přes $7k USD. Mají to postavené fakt dobře, všechno je praktické a přesně jsem věděl co dělat. Pokud chcete mít funkční Instagram, kluci ví co dělají. Díkyy",
        author: "Air4future",
        role: "Drone Pilot",
        image: "/images/users/air4future.jpg",
        proofImages: [
            "/images/testimonials/air4future-ig.png",
            "/images/testimonials/air4future-stripe.png"
        ]
    },
    {
        hook: "Z mrtvého profilu na 8k sledujících a příval klientů.",
        quote: "Než jsem začala spolupracovat s klukama, můj profil byl v podstatě mrtvý. Vůbec jsem si nebyla jistá, jestli do toho jít. Bála jsem se, že to časově nebudu zvládat a že tvorba obsahu mi sežere všechen čas. Ale nastavili jsme fakt jednoduchý systém, který mi do života zapadl úplně přirozeně. Během dvou měsíců jsme se dostali na 8 000 sledujících a ta změna je neskutečná. Mám plné Dms klientů. Pokud váháte, jestli na to máte čas, kluci to mají fakt dobře vymyšlené. Všechno je plně individuální a to jsem ocenila nejvíc, děkuju vám.",
        author: "Ana Yoga",
        role: "Yoga Instructor",
        image: "/images/users/ashramana.jpg",
        proofImages: ["/images/testimonials/anayoga-ig.png"]
    },
    {
        hook: "Míň views, ale rekordní měsíc: Téměř 125 000 Kč díky správným lidem.",
        quote: "Jsem ve třetím týdnu spolupráce a děje se přesně to, co jsem chtěla. Sice mám míň views než na svých starších reels, ale poprvé v životě mi chodí fakt kvalitní sledující. Předtím se to u těch virálů vůbec nedělo. Teď přitahuju to správné publikum a vidím, že ty lidi reálně zajímá, co dělám. Zároveň jsem měla rekordní měsíc ve své komunitě, téměř 5 000 €. Stačilo k tomu jen pár správných lidí, přesně jak jsme řešili. Díky Time za veškerý guidance.",
        author: "Ioanna",
        role: "Volleyball player",
        image: "/images/users/ioanna.jpg",
        proofImages: ["/images/testimonials/ionna-stripe.jpg"]
    },
    {
        quote: "Mít tě za mentora je neskutečný nakopávač. Konečně mám pocit, že ty myšlenky z hlavy fakt dostanu ven a udělám z nich silný obsah. Tvůj feedback je naprosto přesný, tuhle hru chápeš jako málokdo. Díky, že mě učíš, jak ty věci zjednodušit a jít k jádru. Fakt se od tebe učím hromadu věcí!",
        author: "Chris Jeske",
        role: "Content Creator",
        image: "/images/users/chris.jpg"
    },
    {
        quote: "Mega mi to pomohlo si konečně utřídit myšlenky, super tipy a hlavně inspirace pro tvorbu. Udělal jsem podle toho první video a hned se to chytlo mnohem líp, to je crazy. Takže fakt mega dobrá práce a díky!",
        author: "Patrick",
        role: "Flowlance founder",
        image: "/images/users/patrick.jpg"
    },
    {
        quote: "Prošel jsem spoustu programů, které slibovaly hory doly a skončil jsem jen s větším zmatkem. Beyond je úplně jiný. Tim tě provede celým procesem krok za krokem — žádná nudná teorie, jen čistá praxe. Nikdy jsem si nebyl tak jistý tím, co buduju. Pokud chceš vybudovat vlastní značku, tohle ti skutečně pomůže.",
        author: "Chris Nolan",
        role: "Content Creator"
    }
];

export const Testimonials = () => {
    return (
        <section className="py-24 md:py-32 px-4 relative z-20 bg-transparent">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <FadeUp>
                        <h3 className="text-[36px] md:text-[46px] font-bold text-white tracking-tight-custom leading-[0.9]">
                            Co říkají naši <span className="relative inline-block pb-2">
                                <span className="font-serif italic font-normal text-gray-400">studenti...</span>
                                <svg className="absolute left-0 bottom-0 w-full h-3 text-brand-red z-0" viewBox="0 0 400 12" fill="none" preserveAspectRatio="none">
                                    <path d="M2 9C100 3 300 3 398 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                </svg>
                            </span>
                        </h3>
                    </FadeUp>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                    {testimonials.map((t, i) => (
                        <div key={i} className="h-full">
                            <FadeUp delay={i * 0.1}>
                                <TestimonialCard
                                    hook={t.hook}
                                    quote={t.quote}
                                    author={t.author}
                                    role={t.role}
                                    image={t.image}
                                    proofImages={t.proofImages}
                                />
                            </FadeUp>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
