import React from 'react';
import { FadeUp } from './FadeUp';

export const CallBenefits = () => {
    return (
        <section className="pb-24 px-4 relative z-20 bg-transparent">
            <div className="max-w-[1100px] mx-auto w-full">
                <FadeUp delay={0.2}>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-16 tracking-tight-custom leading-[1.1] text-center">
                        Co na tomhle <span className="font-serif italic font-normal text-brand-red">strategickém hovoru</span> získáš:
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Benefit 1 */}
                        <div className="flex flex-col items-center text-center gap-6">
                            <div className="w-full h-[220px] md:h-[260px] flex items-end justify-center pb-2">
                                <img 
                                    src="/images/starter-pack/diagnostic_call.png" 
                                    alt="Rozbor" 
                                    className="w-[90%] max-h-full object-contain rounded-lg shadow-xl"
                                />
                            </div>
                            <p className="text-lg md:text-xl text-white font-bold leading-relaxed tracking-tight max-w-[300px]">
                                Personalizovaný <span className="text-brand-red">rozbor a audit</span> tvé aktuální situace a společně najdeme <span className="text-brand-red">překážky</span> v tvém podnikání
                            </p>
                        </div>

                        {/* Benefit 2 */}
                        <div className="flex flex-col items-center text-center gap-6">
                            <div className="w-full h-[220px] md:h-[260px] flex items-end justify-center pb-2">
                                <img 
                                    src="/images/starter-pack/creator_os.png" 
                                    alt="Systémy" 
                                    className="w-[90%] max-h-full object-contain rounded-lg shadow-xl"
                                />
                            </div>
                            <p className="text-lg md:text-xl text-white font-bold leading-relaxed tracking-tight max-w-[300px]">
                                Kompletní představení našich <span className="text-brand-red">systémů a strategií</span> které denně používáme k <span className="text-brand-red">prodeji</span> na instagramu
                            </p>
                        </div>

                        {/* Benefit 3 */}
                        <div className="flex flex-col items-center text-center gap-6">
                            <div className="w-full h-[220px] md:h-[260px] flex items-end justify-center pb-2">
                                <img 
                                    src="/images/starter-pack/creator_map.png" 
                                    alt="Plán" 
                                    className="w-[90%] max-h-full object-contain rounded-lg shadow-xl"
                                />
                            </div>
                            <p className="text-lg md:text-xl text-white font-bold leading-relaxed tracking-tight max-w-[300px]">
                                <span className="text-brand-red">Jasný akční plán</span>, konkrétní kroky, které ti pomůžou <span className="text-brand-red">dosáhnout tvých cílů</span>
                            </p>
                        </div>
                    </div>
                </FadeUp>
            </div>
        </section>
    );
};
