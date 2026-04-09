import React from 'react';
import { FadeUp } from './FadeUp';

const screenshots = [
    "AshenOne.png",
    "Thando Nzimande.png",
    "air4future-ig.png",
    "air4future-stripe.png",
    "anayoga-ig.png",
    "ionna-stripe.jpg",
    "ishanth.png",
    "johneez.png",
    "liam.png",
    "louiscpr.png",
    "manu33.png",
    "noah.png",
    "noah2.png",
    "yamini.png"
];

export const ScreenshotGallery = () => {
    return (
        <section className="py-24 px-4 relative z-20">
            <div className="max-w-[1200px] mx-auto w-full">
                <FadeUp>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-16 text-center tracking-tight-custom leading-[1.1]">
                        A <span className="font-serif italic font-normal text-brand-red">spousta</span> dalších...
                    </h2>
                </FadeUp>

                <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                    {screenshots.map((file, i) => (
                        <div key={i} className="break-inside-avoid shadow-lg mb-4 hover:scale-[1.02] transition-transform duration-300">
                            <FadeUp delay={i * 0.05}>
                                <div className="rounded-xl md:rounded-2xl overflow-hidden border border-white/5 hover:border-brand-red/50 transition-colors bg-[#151515]">
                                    <img
                                        src={`/images/testimonials/${file}`}
                                        alt={`Výsledek klienta ${i + 1}`}
                                        className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity"
                                        loading="lazy"
                                    />
                                </div>
                            </FadeUp>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
