import type { Metadata } from 'next';
import { LegalFooter } from '@/components/LegalFooter';
import { ProgramVideo } from '@/components/program/ProgramVideo';
import { PROGRAM_VIDEOS, sanitizeUsername } from '@/lib/free-program';
import { CheckIcon, Mark, ProgramLogo, ScanFrame, Underlined } from '@/components/program/ui';
import { ProgramJoin } from '@/components/program/ProgramJoin';

export const metadata: Metadata = {
    title: 'Rentgen tvého podnikání pro kouče a mentory | Growbeyond',
    description: 'Najdeme, co tě nejvíc brzdí, vyřešíme to a otevřeme ti cestu k 500 000 Kč měsíčně. 3denní rentgen zdarma.',
};

// LP free programu — 1:1 převod redesignu (landing-redesign.html od Tima).
// Vstup přes formulář (IG + email → /api/program/join); keyword "start" v DM
// zůstává jako záložní cesta pro lidi ze starších postů.

// Rentgenové snímky kroků (Higgsfield, přebarvené do tmavého radiogramu
// skriptem — invert z bílého pozadí, červená zachována). Zdroje ~/Downloads.
const STEP_IMAGES = [
    '/images/program/xray-tv.png',
    '/images/program/xray-form.png',
    '/images/program/xray-lens.png',
    '/images/program/xray-tools.png',
];

const STEPS = [
    { num: '01', text: 'Podíváš se na úvodní video' },
    { num: '02', text: 'Vyplníš krátký dotazník' },
    { num: '03', text: 'My za tebe identifikujeme tvůj největší problém' },
    { num: '04', text: 'Za 3 dny se ho pomocí našich materiálů naučíš vyřešit' },
];

const FOR_YOU = [
    'nemáš dostatek klientů',
    'máš klienty ale nedokážeš jim nic prodat',
    'narazil jsi na strop a potřebuješ změnu aby ses posunul dál',
];

const NOT_FOR_YOU = [
    'Kdo hledá virální hack přes noc',
    'Kdo si chce jen nahnat sledující',
    'Kdo není kouč nebo mentor',
    'Kdo je úplně na začátku',
];

// ?u=<ig_username> (posílá Beo keyword "rentgen" jako URL button) předvyplní
// Instagram ve formuláři — člověk z DM už jen doplní email.
export default async function ProgramLandingPage({ searchParams }: { searchParams: Promise<{ u?: string }> }) {
    const { u } = await searchParams;
    const initialUsername = sanitizeUsername(u);
    return (
        <main className="min-h-screen bg-brand-dark text-white font-sans selection:bg-brand-red selection:text-white overflow-x-hidden">

            {/* HERO */}
            <section className="pt-14 pb-18 px-6 text-center">
                <div className="relative z-[2] max-w-[900px] mx-auto flex flex-col items-center gap-[22px]">
                    <ProgramLogo className="w-[min(250px,56vw)] mb-1" />
                    <p className="m-0 font-bold leading-[1.5] tracking-[-0.01em] text-[clamp(18px,2.6vw,26px)]">
                        Hledáme <Mark>kouče</Mark> a <Mark>mentory</Mark>
                    </p>

                    <h1 className="m-0 font-bold leading-[1.35] tracking-[-0.02em] text-[clamp(30px,5vw,54px)] max-w-[22ch]">
                        Najdeme, co tě nejvíc brzdí, vyřešíme to a otevřeme ti cestu k{' '}
                        <Mark><span className="whitespace-nowrap">500&nbsp;000&nbsp;Kč</span> měsíčně</Mark>
                    </h1>

                    <p className="m-0 font-medium leading-[1.6] text-[clamp(19px,2.4vw,26px)]">
                        <Underlined>Pomocí našeho 3denního rentgenu</Underlined>
                    </p>

                    <div className="w-[92vw] max-w-[560px] mt-2.5">
                        <ProgramVideo videoUrl={PROGRAM_VIDEOS.analyza.src} posterUrl={PROGRAM_VIDEOS.analyza.poster} />
                    </div>

                    <div className="mt-3 w-full flex justify-center">
                        <ProgramJoin initialUsername={initialUsername} />
                    </div>
                </div>
            </section>

            {/* JAK TO FUNGUJE */}
            <section className="py-20 px-6 border-t border-white/[0.06]">
                <div className="max-w-[820px] mx-auto flex flex-col gap-10">
                    <div className="text-center flex flex-col gap-4">
                        <h2 className="m-0 font-bold leading-[1.3] tracking-[-0.02em] text-[clamp(28px,4vw,44px)]">
                            Tento program funguje jako rentgen&nbsp;tvého podnikání
                        </h2>
                        <p className="m-0 mx-auto leading-[1.6] text-white/75 max-w-[56ch] text-[clamp(17px,2vw,21px)]">
                            Stejně jako jsem odhalil svůj největší problém, chci najít ten tvůj a pomoct ti ho vyřešit
                        </p>
                    </div>

                    {/* Rentgen: monitor letištního skeneru — rám s rohovými závorkami,
                        uvnitř mřížka, kroky jako reálné rentgenové snímky (mix-blend
                        screen, černé pozadí splyne s displejem), ghost čísla vpravo
                        a přes celý monitor pomalu přejíždí červená skenovací linka. */}
                    <ScanFrame className="max-w-[720px] mx-auto w-full p-2 md:p-3">
                        <div className="relative rounded-xl border border-white/[0.08] bg-[#0C0C0C] overflow-hidden">
                            <div
                                aria-hidden
                                className="absolute inset-0"
                                style={{
                                    backgroundImage:
                                        'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
                                    backgroundSize: '28px 28px',
                                }}
                            />
                            <div
                                aria-hidden
                                className="absolute inset-0"
                                style={{ background: 'radial-gradient(130% 100% at 50% 0%, transparent 55%, rgba(0,0,0,0.6))' }}
                            />
                            <span aria-hidden className="program-scanline" />

                            {/* kroky = prosvícené objekty */}
                            <div className="relative flex flex-col">
                                {STEPS.map((step, i) => (
                                    <div
                                        key={step.num}
                                        className={`relative grid grid-cols-[104px_1fr] md:grid-cols-[150px_1fr] items-center gap-4 md:gap-7 px-4 md:px-8 py-4 md:py-5 pr-14 md:pr-24 ${i > 0 ? 'border-t border-dashed border-white/[0.07]' : ''}`}
                                    >
                                        <span
                                            aria-hidden
                                            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 font-bold leading-none text-[52px] md:text-[76px] tracking-[-0.03em] select-none"
                                            style={{ WebkitTextStroke: '1.5px rgba(255,255,255,0.09)', color: 'transparent' }}
                                        >
                                            {step.num}
                                        </span>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={STEP_IMAGES[i]}
                                            alt=""
                                            width={560}
                                            height={560}
                                            loading="lazy"
                                            className="w-[104px] md:w-[150px] mix-blend-screen select-none pointer-events-none"
                                        />
                                        <p className="m-0 text-[15px] md:text-[19px] font-semibold leading-[1.45]">{step.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </ScanFrame>
                </div>
            </section>

            {/* PRO KOHO TO JE / NENÍ */}
            <section className="py-20 px-6 border-t border-white/[0.06]">
                <div className="max-w-[980px] mx-auto flex flex-col gap-10">
                    <div className="text-center">
                        <h2 className="m-0 mx-auto font-bold leading-[1.4] tracking-[-0.02em] text-[clamp(26px,3.6vw,40px)] max-w-[30ch]">
                            Pro kouče, experty a mentory, kteří už nechtějí dál <Mark>stagnovat</Mark> a jsou
                            připraveni <Mark>odstranit překážky</Mark>, které je brzdí v dalším růstu
                        </h2>
                    </div>

                    <div className="grid gap-5 grid-cols-1 md:grid-cols-2 items-stretch">
                        <div className="bg-[#1A1A1A] border border-brand-red/35 rounded-2xl p-8 px-7 flex flex-col gap-5">
                            <h3 className="m-0 text-[22px] font-bold">Jsi tu správně, pokud:</h3>
                            <div className="flex flex-col gap-3.5">
                                {FOR_YOU.map(item => (
                                    <div key={item} className="flex gap-3 items-baseline">
                                        <CheckIcon />
                                        <p className="m-0 text-[17px] leading-[1.55] text-white/90">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border border-white/[0.12] rounded-2xl p-8 px-7 flex flex-col gap-5">
                            <h3 className="m-0 text-[22px] font-bold text-white/70">Pro koho to není:</h3>
                            <div className="flex flex-col gap-3.5">
                                {NOT_FOR_YOU.map(item => (
                                    <div key={item} className="flex gap-3 items-baseline">
                                        <span className="text-white/35 font-bold shrink-0">✕</span>
                                        <p className="m-0 text-[17px] leading-[1.55] text-white/60">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="pt-24 pb-28 px-6 text-center border-t border-white/[0.06]">
                <div className="relative z-[2] max-w-[720px] mx-auto flex flex-col items-center gap-6">
                    <h2 className="m-0 font-bold leading-[1.4] tracking-[-0.02em] text-[clamp(28px,4vw,44px)]">
                        Pokud to myslíš vážně, <Mark>vstup do programu</Mark> a hned dostaneš přístup k rentgenu
                    </h2>
                    <div className="w-full flex justify-center">
                        <ProgramJoin initialUsername={initialUsername} />
                    </div>
                </div>
            </section>

            <LegalFooter />
        </main>
    );
}
