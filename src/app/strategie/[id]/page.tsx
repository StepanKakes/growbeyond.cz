import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/Navbar';
import { TextureOverlay } from '@/components/TextureOverlay';
import { StrategieVideoBooking } from '@/components/strategie/StrategieVideoBooking';
import { getLeadById } from '@/lib/mentorship-lead';

export const metadata: Metadata = {
    title: 'Tvé strategické video | Growbeyond',
    robots: { index: false, follow: false },
};

const redUnderline = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 12' fill='none' preserveAspectRatio='none'%3E%3Cpath d='M2 9C100 3 300 3 398 9' stroke='%23FF0E00' stroke-width='4' stroke-linecap='round' /%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat' as const,
    backgroundPosition: 'left bottom' as const,
    backgroundSize: '100% 10px',
    WebkitBoxDecorationBreak: 'clone' as const,
    boxDecorationBreak: 'clone' as React.CSSProperties['boxDecorationBreak'],
    paddingBottom: '8px',
};

export default async function StrategieVideoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const lead = await getLeadById(id);

    return (
        <main className="min-h-screen relative bg-brand-dark text-white font-sans selection:bg-brand-red selection:text-white">
            <Navbar minimal />
            <TextureOverlay />

            {/* Hero */}
            <section className="relative pt-24 pb-2 px-4 z-10 flex flex-col items-center overflow-hidden">
                <div
                    className="absolute inset-0 z-0 pointer-events-none"
                    style={{
                        backgroundImage: `url('/images/hero/Still%202026-03-12%20235253.jpg')`,
                        backgroundPosition: 'center top',
                        backgroundSize: 'cover',
                        backgroundRepeat: 'no-repeat',
                        maskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
                        opacity: 0.8,
                    }}
                />
                <div className="max-w-[1100px] mx-auto w-full text-center relative z-20 flex flex-col items-center pt-8">
                    <span className="inline-block mb-6 px-4 py-1.5 rounded-full border border-brand-red/40 bg-brand-red/10 text-white text-[11px] md:text-sm font-bold uppercase tracking-wider">
                        Odemčeno · Tvoje strategie
                    </span>
                    <h1 className="text-[30px] md:text-[52px] font-bold text-white tracking-tight-custom leading-[1.1] max-w-3xl">
                        Tady je tvoje{' '}
                        <span style={redUnderline}>strategické video</span>
                    </h1>
                    <p className="text-[18px] md:text-[24px] text-white font-medium leading-[1.6] mt-6 max-w-2xl mx-auto">
                        Pusť si ho celé až do konce — pak si níže rovnou rezervuj svůj strategický hovor.
                    </p>
                </div>
            </section>

            <StrategieVideoBooking leadId={id} email={lead?.email} />
        </main>
    );
}
