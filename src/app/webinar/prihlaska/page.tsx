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

            <section className="relative z-10">
                <div className="mx-auto w-full max-w-[860px] px-5 md:px-8 pt-20 pb-14 md:pt-28 md:pb-16">
                    <h1 className="text-[30px] md:text-[46px] font-bold tracking-[-0.03em] leading-[1.08] max-w-[22ch]">
                        {firstName ? `${firstName}, odpověz` : 'Odpověz'} na pár otázek, ať víme, kde{' '}
                        <LedText soft color="red" text="právě teď" className="whitespace-nowrap" /> jsi
                    </h1>
                    <p className="mt-5 max-w-[54ch] text-[17px] md:text-[20px] text-white/60 leading-[1.5]">
                        Podle odpovědí poznám, jestli ti umíme pomoct. Když ne, řeknu ti to rovnou a nebudeme si krátit čas
                    </p>
                </div>
            </section>

            <section className="relative z-10 border-t border-white/10">
                <div className="mx-auto w-full max-w-[860px] px-5 md:px-8 py-12 md:py-16">
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
