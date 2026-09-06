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

    return (
        <main className="min-h-screen relative bg-[#0A0A0A] text-white selection:bg-brand-red selection:text-white overflow-x-hidden">
            <TextureOverlay />

            <section className="relative z-10">
                <div className="mx-auto w-full max-w-[1200px] px-5 md:px-12 pt-24 pb-14 md:pt-36 md:pb-20">
                    <LedText
                        as="h1"
                        text="PŘIHLÁŠKA"
                        className="block font-bold leading-[0.92] tracking-[-0.04em] text-[clamp(48px,10vw,132px)]"
                    />
                    <p className="mt-7 max-w-[52ch] text-[18px] md:text-[22px] text-white/70 leading-[1.5]">
                        Než se sejdeme, potřebuju vědět, kde jsi. Podle odpovědí poznám, jestli ti umíme pomoct, a když ne,
                        řeknu ti to rovnou a nebudeme si krátit čas
                    </p>
                </div>
            </section>

            <section className="relative z-10 border-t border-white/10">
                <div className="mx-auto w-full max-w-[1200px] px-5 md:px-12 py-14 md:py-20">
                    <div className="max-w-[680px]">
                        <ApplicationForm
                            token={t || ''}
                            defaultName={reg?.name || undefined}
                            defaultEmail={reg?.email || undefined}
                        />
                    </div>
                </div>
            </section>
        </main>
    );
}
