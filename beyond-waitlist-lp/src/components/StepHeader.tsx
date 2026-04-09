import React from 'react';
import { FadeUp } from './FadeUp';

interface StepHeaderProps {
    text: string;
}

export const StepHeader = ({ text }: StepHeaderProps) => {
    return (
        <section className="px-4 py-2 relative z-20">
            <div className="w-full max-w-[95vw] md:max-w-[65vw] lg:max-w-[1200px] mx-auto">
                <FadeUp>
                    <div className="bg-brand-red py-2 md:py-3 rounded-md text-center relative overflow-hidden flex items-center justify-center shadow-none drop-shadow-none border border-transparent">
                        <h2 className="text-lg md:text-xl font-bold text-white tracking-[0.05em] uppercase drop-shadow-none shadow-none">
                            {text}
                        </h2>
                    </div>
                </FadeUp>
            </div>
        </section>
    );
};
