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

// Vstupní stránka programu, layout jako YouTube na mobilu: video úplně nahoře
// na celou šířku, pod ním logo, nadpis a krokový dotazník (rentgen design).
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

            {/* logo + uvítání úplně nahoře */}
            <section className="pt-8 pb-6 px-6 text-center">
                <div className="max-w-[820px] mx-auto flex flex-col items-center gap-4">
                    <ProgramLogo className="w-[min(180px,44vw)]" />
                    <p className="m-0 font-bold leading-[1.5] text-[clamp(17px,2.4vw,22px)]">
                        Vítej v programu!
                    </p>
                </div>
            </section>

            {/* video, na mobilu edge-to-edge, bez zaoblení, normální seekbar */}
            <section className="md:px-6">
                <div className="w-full max-w-[880px] mx-auto">
                    <ProgramVideo videoUrl={PROGRAM_VIDEOS.vstup.src} posterUrl={PROGRAM_VIDEOS.vstup.poster} nativeProgress />
                </div>
            </section>

            {/* nadpis pod videem */}
            <section className="pt-8 pb-4 px-6 text-center">
                <div className="max-w-[820px] mx-auto flex flex-col items-center">
                    <h1 className="m-0 font-bold leading-[1.35] tracking-[-0.02em] text-[clamp(24px,3.6vw,38px)] max-w-[26ch]">
                        Začneme krátkou analýzou a identifikujeme, co tě nejvíc brzdí
                    </h1>
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
