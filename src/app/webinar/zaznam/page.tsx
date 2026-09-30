import type { Metadata } from 'next';
import Link from 'next/link';
import { LedText } from '@/components/webinar/LedText';
import { TextureOverlay } from '@/components/TextureOverlay';
import { RecordingVideo } from '@/components/webinar/RecordingVideo';
import { WebinarCalEmbed } from '@/components/webinar/WebinarCalEmbed';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Záznam webináře 2030 | Beyond',
    robots: { index: false, follow: false },
};

// Záznam živého webináře z 29. 9. 2026. Visí jen týden, pak stránka ukáže,
// že už není k dispozici, a soubor na video.growbeyond.cz smaže cron na serveru.
const VIDEO = 'https://video.growbeyond.cz/webinar-2030-zaznam.mp4';
const POSTER = 'https://video.growbeyond.cz/webinar-2030-zaznam.jpg';
const DOSTUPNE_DO = new Date('2026-10-07T21:59:59Z'); // 7. 10. 23:59 Praha

export default function RecordingPage() {
    const dostupne = Date.now() < DOSTUPNE_DO.getTime();

    return (
        <main className="min-h-screen relative bg-[#0A0A0A] text-white selection:bg-brand-red selection:text-white overflow-x-hidden">
            <TextureOverlay />

            <div className="relative z-10 mx-auto w-full max-w-[1100px] px-5 md:px-8">
                <header className="pt-8 md:pt-10 text-center">
                    <Link href="/webinar" className="inline-block text-white text-[26px] md:text-[30px] font-serif italic leading-none">
                        Beyond
                    </Link>
                </header>

                {dostupne ? (
                    <section className="pt-12 md:pt-16 pb-20 md:pb-28">
                        <div className="text-center">
                            <LedText
                                as="h1"
                                text="2030 ZAČÍNÁ DNES"
                                className="block font-bold leading-[0.92] tracking-[-0.04em] text-[clamp(40px,8vw,104px)]"
                            />
                            <p className="mx-auto mt-6 max-w-[52ch] text-[18px] md:text-[21px] text-white/70 leading-[1.5]">
                                Celý záznam webináře, na stránce bude do 7. října
                            </p>
                        </div>

                        <div className="mt-10 md:mt-14 overflow-hidden rounded-2xl border border-white/10 bg-black">
                            <RecordingVideo src={VIDEO} poster={POSTER} />
                        </div>

                        <div className="mt-16 md:mt-24 text-center">
                            <h2 className="text-[28px] md:text-[40px] font-bold leading-[1.05] tracking-[-0.03em]">
                                Chceš to rozjet s námi?
                            </h2>
                            <p className="mx-auto mt-4 max-w-[52ch] text-[17px] md:text-[19px] text-white/70 leading-[1.5]">
                                Vyber si termín hovoru, projdeme, kde teď jsi a co by ti dávalo smysl
                            </p>
                        </div>
                        <div className="mt-8 md:mt-10">
                            <WebinarCalEmbed />
                        </div>
                    </section>
                ) : (
                    <section className="pt-20 md:pt-32 pb-20 md:pb-28 text-center">
                        <LedText
                            as="h1"
                            text="ZÁZNAM UŽ TU NENÍ"
                            className="block font-bold leading-[0.92] tracking-[-0.04em] text-[clamp(40px,8vw,104px)]"
                        />
                        <p className="mx-auto mt-6 max-w-[48ch] text-[18px] md:text-[21px] text-white/70 leading-[1.5]">
                            Záznam byl dostupný týden po webináři, pokud tě téma zajímá, vyber si termín hovoru
                        </p>
                        <div className="mt-10 text-left">
                            <WebinarCalEmbed />
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}
