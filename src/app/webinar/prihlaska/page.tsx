import type { Metadata } from 'next';
import Link from 'next/link';
import { ApplicationForm } from '@/components/webinar/ApplicationForm';
import { LedText } from '@/components/webinar/LedText';
import { TextureOverlay } from '@/components/TextureOverlay';
import { dbConfigured, getRegistrationByToken } from '@/lib/webinar/db';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Přihláška na hovor | Beyond',
    robots: { index: false, follow: false },
};

// Druhá část landing page, ne odtržený formulář. Proto logo, velký nadpis
// na střed a stejný vizuální jazyk jako /webinar.
export default async function ApplicationPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
    const { t } = await searchParams;
    const reg = dbConfigured() && t ? await getRegistrationByToken(t).catch(() => null) : null;
    const firstName = reg?.name?.trim().split(/\s+/)[0];

    return (
        <main className="min-h-screen relative bg-[#0A0A0A] text-white selection:bg-brand-red selection:text-white overflow-x-hidden">
            <TextureOverlay />

            <div className="relative z-10 mx-auto w-full max-w-[820px] px-5 md:px-8">
                <header className="pt-10 md:pt-14 text-center">
                    <Link href="/webinar" className="inline-block text-white text-[26px] md:text-[30px] font-serif italic leading-none">
                        Beyond
                    </Link>
                </header>

                <div className="pt-14 md:pt-20 text-center">
                    <h1 className="mx-auto max-w-[14ch] text-[34px] md:text-[56px] font-bold tracking-[-0.035em] leading-[1.04]">
                        {firstName ? `${firstName}, řekni mi, kde ` : 'Řekni mi, kde '}
                        <LedText soft color="red" text="právě teď" className="whitespace-nowrap" /> jsi
                    </h1>
                    <p className="mx-auto mt-6 max-w-[46ch] text-[18px] md:text-[21px] text-white/60 leading-[1.5]">
                        Pár otázek, ať na hovoru neztrácíme čas rozkoukáváním. Když ti nebudeme umět pomoct, řeknu ti to rovnou
                    </p>
                </div>

                <div className="pt-16 pb-24 md:pt-20 md:pb-28">
                    <ApplicationForm
                        token={t || ''}
                        defaultName={reg?.name || undefined}
                        defaultEmail={reg?.email || undefined}
                    />
                </div>
            </div>
        </main>
    );
}
