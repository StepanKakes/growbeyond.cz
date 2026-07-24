import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ProgramVideo } from '@/components/program/ProgramVideo';
import { dayVideo, getProgramRow, markDayOpened, type ProgramDay } from '@/lib/free-program';
import { ProgramLogo } from '@/components/program/ui';

export const metadata: Metadata = {
    title: '3denní rentgen | Growbeyond',
    robots: { index: false, follow: false },
};

// Denní stránka — "Program den simple" design, responzivně: full-width brand-dark,
// na mobilu kompaktní sloupec, na desktopu se obsah (video, 3 věci) rozloží do šířky.
// Video + takeaways per bucket z diagnostiky.
const DAYS: ProgramDay[] = [1, 2, 3];

export default async function ProgramDayPage({ params }: { params: Promise<{ id: string; den: string }> }) {
    const { id, den } = await params;
    const day = Number(den) as ProgramDay;
    if (![1, 2, 3].includes(day)) redirect('/program');

    const row = await getProgramRow(id);
    if (!row) redirect('/program');
    if (!row.bucket) redirect(`/program/${id}`); // diagnostika je vstupní brána

    await markDayOpened(row, day); // analytika: kdy den poprvé otevřel

    const video = dayVideo(row.bucket, day);

    const label = (d: ProgramDay) =>
        d < day ? 'Hotovo' : d === day ? 'Dnes' : d === day + 1 ? 'Zítra' : 'Pozítří';

    return (
        <main className="min-h-screen bg-brand-dark text-white font-sans selection:bg-brand-red selection:text-white flex flex-col overflow-x-hidden">
            <div className="flex-1 w-full max-w-[440px] md:max-w-[900px] mx-auto px-[22px] md:px-8 pt-[26px] md:pt-10 pb-12 flex flex-col gap-[30px] md:gap-10">

                <ProgramLogo className="self-center w-[140px]" />

                {/* progress: tenké pruhy per den */}
                <div className="flex gap-2 items-center w-full max-w-[440px] mx-auto">
                    {DAYS.map(d => (
                        <div key={d} className="flex-1 flex flex-col gap-[7px]">
                            <span className={`h-[3px] rounded-full ${d <= day ? 'bg-brand-red' : 'bg-white/[0.14]'}`} />
                            <span className={`text-xs text-center ${d === day ? 'font-bold text-white' : d < day ? 'font-semibold text-white/35' : 'font-semibold text-white/[0.28]'}`}>
                                {label(d)}
                            </span>
                        </div>
                    ))}
                </div>

                {/* titulek */}
                <div className="flex flex-col gap-4">
                    <span className="self-center bg-brand-red px-2 text-[22px] font-bold tracking-[-0.02em]">
                        Den {day}
                    </span>
                    <h1 className="m-0 text-[33px] md:text-[44px] font-bold leading-[1.12] tracking-[-0.032em] text-center [text-wrap:balance] max-w-[24ch] mx-auto">
                        {video.title}
                    </h1>
                </div>

                {/* video */}
                <div className="w-full max-w-[820px] mx-auto rounded-xl overflow-hidden shadow-[0_18px_50px_-16px_rgba(0,0,0,0.7)]">
                    <ProgramVideo
                        videoUrl={video.src}
                        posterUrl={video.poster}
                        trackCid={id}
                        trackDay={day}
                        nativeProgress
                    />
                </div>

                {/* 3 klíčové věci — mobil pod sebou, desktop vedle sebe */}
                {video.takeaways.length > 0 && (
                    <div className="flex flex-col gap-6 md:gap-8">
                        <p className="m-0 text-[13px] font-bold uppercase tracking-[0.08em] text-white/40 text-center">
                            3 věci, které si z dneška vezmi
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                            {video.takeaways.map((t, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <span className="font-sans font-bold text-brand-red text-[40px] leading-none shrink-0">{i + 1}</span>
                                    <p className="m-0 text-[15px] md:text-base leading-[1.55] text-white/85">{t}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* mini footer */}
            <div className="text-center px-[22px] pt-[18px] pb-7 text-[11px] leading-[1.7] text-white/30">
                Vlastimil Trnka · IČO: 24080349<br />3denní rentgen
            </div>
        </main>
    );
}
