import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LegalFooter } from '@/components/LegalFooter';
import { ProgramDiagnostika } from '@/components/program/ProgramDiagnostika';
import { ProgramVideo } from '@/components/program/ProgramVideo';
import { ProgramLogo, ScanFrame } from '@/components/program/ui';
import { getProgramRow, PROGRAM_VIDEOS } from '@/lib/free-program';

export const metadata: Metadata = {
    title: '3denní rentgen | Growbeyond',
    robots: { index: false, follow: false },
};

// Vstupní stránka programu: analýza video + krokový dotazník (rentgen design).
// Po odeslání dotazníku jde člověk rovnou na Den 1 (video).
// Když už má diagnostiku za sebou, jde rovnou na aktuální den.
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
                        Vítej v programu!
                    </p>
                    <h1 className="m-0 font-bold leading-[1.35] tracking-[-0.02em] text-[clamp(28px,4.4vw,46px)] max-w-[24ch]">
                        Začneme krátkou analýzou a identifikujeme, co tě nejvíc brzdí
                    </h1>
                </div>
            </section>

            {/* ANALÝZA VIDEO */}
            <section className="pt-6 pb-10 px-6">
                <div className="max-w-[720px] mx-auto">
                    <ProgramVideo videoUrl={PROGRAM_VIDEOS.vstup.src} posterUrl={PROGRAM_VIDEOS.vstup.poster} />
                </div>
            </section>

            {/* DOTAZNÍK — krokový wizard v monitoru rentgenu; po odeslání Den 1 */}
            <section className="pt-2 pb-24 px-6">
                <div className="max-w-[720px] mx-auto">
                    <ScanFrame className="p-2 md:p-3">
                        <ProgramDiagnostika cid={id} />
                    </ScanFrame>
                </div>
            </section>

            <LegalFooter />
        </main>
    );
}
