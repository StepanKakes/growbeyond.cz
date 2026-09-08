import type { Metadata } from 'next';
import { ApplicationForm } from '@/components/webinar/ApplicationForm';
import { LedText } from '@/components/webinar/LedText';
import { TextureOverlay } from '@/components/TextureOverlay';
import { dbConfigured, getRegistrationByToken } from '@/lib/webinar/db';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Přihláška na hovor | Beyond',
    robots: { index: false, follow: false },
};

export default async function ApplicationPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
    const { t } = await searchParams;
    const reg = dbConfigured() && t ? await getRegistrationByToken(t).catch(() => null) : null;
    const firstName = reg?.name?.trim().split(/\s+/)[0];

    return (
        <main className="min-h-screen relative bg-[#0A0A0A] text-white selection:bg-brand-red selection:text-white overflow-x-hidden">
            <TextureOverlay />

            {/* Hlavička je záměrně nízká, aby se první otázka vešla na obrazovku
                bez scrollování. Jinak formát jedné otázky ztrácí smysl. */}
            <section className="relative z-10">
                <div className="mx-auto w-full max-w-[860px] px-5 md:px-8 pt-14 md:pt-20">
                    <h1 className="text-[24px] md:text-[34px] font-bold tracking-[-0.03em] leading-[1.12] max-w-[26ch]">
                        {firstName ? `${firstName}, odpověz` : 'Odpověz'} na pár otázek, ať víme, kde{' '}
                        <LedText soft color="red" text="právě teď" className="whitespace-nowrap" /> jsi
                    </h1>
                    <p className="mt-3 max-w-[56ch] text-[16px] md:text-[18px] text-white/55 leading-[1.5]">
                        Když ti nebudeme umět pomoct, řeknu ti to rovnou a nebudeme si krátit čas
                    </p>
                </div>
            </section>

            <section className="relative z-10">
                <div className="mx-auto w-full max-w-[860px] px-5 md:px-8 pt-10 pb-16 md:pt-12 md:pb-20">
                    <ApplicationForm
                        token={t || ''}
                        defaultName={reg?.name || undefined}
                        defaultEmail={reg?.email || undefined}
                    />
                </div>
            </section>
        </main>
    );
}
