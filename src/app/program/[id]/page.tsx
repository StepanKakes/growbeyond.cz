import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LegalFooter } from '@/components/LegalFooter';
import { ProgramVideo } from '@/components/program/ProgramVideo';
import { ProgramDiagnostika } from '@/components/program/ProgramDiagnostika';
import { ProgramLogo } from '@/components/program/ui';
import { getProgramRow, PROGRAM_VIDEOS } from '@/lib/free-program';

export const metadata: Metadata = {
    title: '3denní rentgen | Growbeyond',
    robots: { index: false, follow: false },
};

// Vstupní stránka programu: hlavní krok je diagnostika (intro video člověk viděl
// na LP, kde je CTA "napiš START"); intro je dole jen jako záchrana pro ty, kdo
// přišli rovnou z DM. Když už má diagnostiku za sebou, jde rovnou na aktuální den.
export default async function ProgramEntryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const row = await getProgramRow(id);
    if (!row) redirect('/program');

    const stavDay: Record<string, number> = { 'Den 1': 1, 'Den 2': 2, 'Den 3': 3, 'Dokončeno': 3 };
    if (row.bucket && stavDay[row.stav]) redirect(`/program/${id}/${stavDay[row.stav]}`);

    return (
        <main className="min-h-screen bg-brand-dark text-white font-sans selection:bg-brand-red selection:text-white overflow-x-hidden">

            {/* HERO */}
            <section className="pt-14 pb-6 px-6 text-center">
                <div className="max-w-[820px] mx-auto flex flex-col items-center gap-5">
                    <ProgramLogo className="w-[min(210px,50vw)] mb-1" />
                    <p className="m-0 font-bold leading-[1.5] text-[clamp(18px,2.6vw,24px)]">
                        Vítej v rentgenu
                    </p>
                    <h1 className="m-0 font-bold leading-[1.35] tracking-[-0.02em] text-[clamp(28px,4.4vw,46px)] max-w-[24ch]">
                        Najdeme, co tě nejvíc brzdí — začneme krátkou analýzou
                    </h1>
                </div>
            </section>

            {/* DOTAZNÍK — hlavní a jediný krok */}
            <section className="pt-8 pb-16 px-6">
                <div className="max-w-[820px] mx-auto flex flex-col gap-4">
                    <h2 className="m-0 text-[clamp(22px,3vw,30px)] font-bold tracking-[-0.02em]">Vyplň krátký dotazník</h2>
                    <p className="m-0 text-white/75 leading-[1.6] text-[17px] mb-6">
                        My za tebe identifikujeme tvůj největší problém a hned ti otevřeme první den.
                    </p>
                    <ProgramDiagnostika cid={id} />
                </div>
            </section>

            {/* Intro video — jen pro ty, kdo přišli rovnou z DM a neviděli LP */}
            <section className="pt-12 pb-24 px-6 border-t border-white/[0.06]">
                <div className="max-w-[680px] mx-auto flex flex-col gap-5">
                    <p className="m-0 text-[13px] font-bold uppercase tracking-[0.08em] text-white/40 text-center">
                        Ještě jsi neviděl úvodní video? Pusť si ho tady (3 min)
                    </p>
                    <ProgramVideo videoUrl={PROGRAM_VIDEOS.analyza.src} posterUrl={PROGRAM_VIDEOS.analyza.poster} />
                </div>
            </section>

            <LegalFooter />
        </main>
    );
}
