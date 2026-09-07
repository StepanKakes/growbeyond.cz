import type { Metadata } from 'next';
import Link from 'next/link';
import { LedText } from '@/components/webinar/LedText';
import { TextureOverlay } from '@/components/TextureOverlay';

export const metadata: Metadata = {
    title: 'Termín potvrzený | Beyond',
    robots: { index: false, follow: false },
};

// Přistane sem člověk, který si po přihlášce zarezervoval hovor v Cal.comu.
export default function BookingDonePage() {
    return (
        <main className="min-h-screen relative bg-[#0A0A0A] text-white selection:bg-brand-red selection:text-white overflow-x-hidden">
            <TextureOverlay />

            <section className="relative z-10">
                <div className="mx-auto w-full max-w-[1200px] px-5 md:px-12 pt-28 pb-20 md:pt-40 md:pb-28">
                    <LedText
                        as="h1"
                        text="MÁME TERMÍN"
                        className="block font-bold leading-[0.92] tracking-[-0.04em] text-[clamp(48px,10vw,132px)]"
                    />
                    <p className="mt-7 max-w-[48ch] text-[18px] md:text-[22px] text-white/70 leading-[1.5]">
                        Potvrzení máš v mailu i s odkazem na hovor. Přijď s konkrétní otázkou, ať z těch minut vytěžíme co nejvíc
                    </p>
                    <p className="mt-4 max-w-[48ch] text-[18px] md:text-[22px] text-white/70 leading-[1.5]">
                        Kdyby ti termín přestal vycházet, přesuň ho odkazem v potvrzovacím mailu, ať místo nezůstane prázdné
                    </p>

                    <Link
                        href="/webinar"
                        className="mt-10 inline-flex h-13 items-center rounded-full border border-white/25 px-8 text-base font-bold text-white transition-colors hover:border-white"
                    >
                        Zpět na stránku webináře
                    </Link>
                </div>
            </section>
        </main>
    );
}
