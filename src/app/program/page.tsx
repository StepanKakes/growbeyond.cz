import type { Metadata } from 'next';
import { LegalFooter } from '@/components/LegalFooter';
import { ProgramVideo } from '@/components/program/ProgramVideo';
import { PROGRAM_VIDEOS } from '@/lib/free-program';
import { Card, CheckIcon, Mark, PillLink, Underlined } from '@/components/program/ui';

export const metadata: Metadata = {
    title: 'Pro kouče a mentory — Opravář tvého podnikání | Growbeyond',
    description: 'Najdeme, co tě nejvíc brzdí, vyřešíme to a otevřeme ti cestu k 500 000 Kč měsíčně. 3denní akcelerátor zdarma.',
};

// LP free programu — 1:1 převod redesignu (landing-redesign.html od Tima).
// CTA vede do IG DM (keyword "start" spouští Beo workflow Free Program: START).
const IG_DM_URL = 'https://ig.me/m/creationwithtim';

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

export default function ProgramLandingPage() {
    return (
        <main className="min-h-screen bg-brand-dark text-white font-sans selection:bg-brand-red selection:text-white overflow-x-hidden">

            {/* HERO */}
            <section className="pt-14 pb-18 px-6 text-center">
                <div className="relative z-[2] max-w-[900px] mx-auto flex flex-col items-center gap-[22px]">
                    <p className="m-0 font-bold leading-[1.5] tracking-[-0.01em] text-[clamp(18px,2.6vw,26px)]">
                        Hledám <Mark>kouče</Mark> a <Mark>mentory</Mark>
                    </p>

                    <h1 className="m-0 font-bold leading-[1.35] tracking-[-0.02em] text-[clamp(30px,5vw,54px)] max-w-[22ch]">
                        Najdeme, co tě nejvíc brzdí, vyřešíme to a otevřeme ti cestu k{' '}
                        <Mark><span className="whitespace-nowrap">500&nbsp;000&nbsp;Kč</span> měsíčně</Mark>
                    </h1>

                    <p className="m-0 font-medium leading-[1.6] text-[clamp(19px,2.4vw,26px)]">
                        <Underlined>Pomocí našeho 3denního akcelerátoru</Underlined>
                    </p>

                    <div className="w-[92vw] max-w-[560px] mt-2.5">
                        <ProgramVideo videoUrl={PROGRAM_VIDEOS.analyza.src} posterUrl={PROGRAM_VIDEOS.analyza.poster} />
                    </div>

                    <div className="mt-2">
                        <PillLink href={IG_DM_URL}>Napiš mi „START&ldquo; do DM</PillLink>
                    </div>
                    <p className="m-0 text-sm text-white/55">Pro okamžitý přístup k akcelerátoru</p>
                </div>
            </section>

            {/* JAK TO FUNGUJE */}
            <section className="py-20 px-6 border-t border-white/[0.06]">
                <div className="max-w-[820px] mx-auto flex flex-col gap-10">
                    <div className="text-center flex flex-col gap-4">
                        <h2 className="m-0 font-bold leading-[1.3] tracking-[-0.02em] text-[clamp(28px,4vw,44px)]">
                            Tento program funguje jako opravář&nbsp;tvého podnikání
                        </h2>
                        <p className="m-0 mx-auto leading-[1.6] text-white/75 max-w-[56ch] text-[clamp(17px,2vw,21px)]">
                            Stejně jako jsem odhalil svůj největší problém, chci najít ten tvůj a pomoct ti ho vyřešit
                        </p>
                    </div>

                    {/* Cesta: svislá přerušovaná linka, uzly s čísly, karty střídavě po stranách */}
                    <div className="relative flex flex-col gap-8 md:gap-12">
                        <div aria-hidden className="absolute left-7 md:left-1/2 top-6 bottom-6 border-l border-dashed border-white/20 md:-translate-x-px" />
                        {STEPS.map((step, i) => (
                            <div key={step.num} className="relative grid grid-cols-[56px_1fr] gap-4 items-center md:grid-cols-[1fr_112px_1fr] md:gap-0">
                                <div className="relative z-10 flex justify-center md:col-start-2 md:row-start-1">
                                    <span className="w-14 h-14 rounded-full bg-brand-dark border border-brand-red/60 flex items-center justify-center font-serif text-brand-red text-[24px] leading-none">
                                        {step.num}
                                    </span>
                                </div>
                                <Card
                                    className={`p-6 md:row-start-1 ${i % 2 === 0
                                        ? 'md:col-start-1 md:text-right'
                                        : 'md:col-start-3'}`}
                                >
                                    <p className="m-0 text-lg font-semibold leading-[1.5]">{step.text}</p>
                                </Card>
                            </div>
                        ))}
                        {/* cíl cesty */}
                        <div className="relative z-10 flex justify-start md:justify-center pl-[22px] md:pl-0">
                            <span aria-hidden className="w-3 h-3 rounded-full bg-brand-red" />
                        </div>
                    </div>
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
                        Pokud to myslíš vážně, napiš mi na Instagramu do DM slovo&nbsp;<Mark>„START&ldquo;</Mark> a
                        hned dostaneš přístup do akcelerátoru
                    </h2>
                    <PillLink href={IG_DM_URL}>Napsat „START&ldquo; na Instagramu</PillLink>
                </div>
            </section>

            <LegalFooter />
        </main>
    );
}
