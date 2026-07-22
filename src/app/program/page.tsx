import type { Metadata } from 'next';
import { LegalFooter } from '@/components/LegalFooter';
import { ProgramVideo } from '@/components/program/ProgramVideo';
import { PROGRAM_VIDEOS } from '@/lib/free-program';
import { Card, CheckIcon, Mark, PillLink, ProgramLogo, Underlined } from '@/components/program/ui';

export const metadata: Metadata = {
    title: 'Pro kouče a mentory — Opravář tvého podnikání | Growbeyond',
    description: 'Najdeme, co tě nejvíc brzdí, vyřešíme to a otevřeme ti cestu k 500 000 Kč měsíčně. 3denní rentgen zdarma.',
};

// LP free programu — 1:1 převod redesignu (landing-redesign.html od Tima).
// CTA vede do IG DM (keyword "start" spouští Beo workflow Free Program: START).
const IG_DM_URL = 'https://ig.me/m/creationwithtim';

// Silnice cesty kroků: S-křivka přes uzly na 25/75 % šířky, středy řádků 1-4
// z pěti stejně vysokých řádků (y = 10/30/50/70), konec u špendlíku (50, 90).
const ROAD_PATH =
    'M 25 2 C 25 5 25 7 25 10 C 25 22 75 18 75 30 C 75 42 25 38 25 50 C 25 62 75 58 75 70 C 75 80 50 79 50 88';

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
                    <ProgramLogo className="text-[clamp(15px,2vw,19px)] mb-1" />
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

                    <div className="mt-2">
                        <PillLink href={IG_DM_URL}>Napiš mi „START&ldquo; do DM</PillLink>
                    </div>
                    <p className="m-0 text-sm text-white/55">Pro okamžitý přístup k rentgenu</p>
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

                    {/* Cesta: nakreslená klikatá road — silnice (široký tah + přerušovaná
                        středová čára, sketch filtr pro ručně kreslený vzhled) se čtyřmi
                        zatáčkami; uzly s čísly sedí na zatáčkách (25 % / 75 % šířky,
                        středy pěti stejně vysokých řádků), cíl = červený špendlík. */}
                    <div className="relative grid auto-rows-fr">
                        <svg
                            aria-hidden
                            className="absolute inset-0 w-full h-full"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            fill="none"
                        >
                            <defs>
                                <filter id="road-sketch" x="-10%" y="-10%" width="120%" height="120%">
                                    <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="7" result="noise" />
                                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.4" />
                                </filter>
                            </defs>
                            <g filter="url(#road-sketch)">
                                <path
                                    d={ROAD_PATH}
                                    stroke="white"
                                    strokeOpacity="0.07"
                                    strokeWidth="30"
                                    strokeLinecap="round"
                                    vectorEffect="non-scaling-stroke"
                                />
                                <path
                                    d={ROAD_PATH}
                                    stroke="white"
                                    strokeOpacity="0.4"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeDasharray="9 13"
                                    vectorEffect="non-scaling-stroke"
                                />
                            </g>
                        </svg>

                        {STEPS.map((step, i) => {
                            const nodeLeft = i % 2 === 0;
                            return (
                                <div key={step.num} className="relative grid grid-cols-2 items-center gap-3 md:gap-6 py-4 md:py-6">
                                    <div className={`flex justify-center ${nodeLeft ? '' : 'order-2'}`}>
                                        <span className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-brand-dark border-2 border-brand-red flex items-center justify-center font-bold text-brand-red text-[17px] md:text-[19px] tracking-[0.02em]">
                                            {step.num}
                                        </span>
                                    </div>
                                    <Card
                                        className={`p-4 md:p-6 ${nodeLeft ? 'rotate-[-0.6deg]' : 'order-1 rotate-[0.6deg]'}`}
                                    >
                                        <p className="m-0 text-[15px] md:text-lg font-semibold leading-[1.5]">{step.text}</p>
                                    </Card>
                                </div>
                            );
                        })}

                        {/* cíl cesty — červený špendlík na konci silnice */}
                        <div className="relative flex items-center justify-center">
                            <svg aria-hidden width="36" height="45" viewBox="0 0 24 30">
                                <path
                                    d="M12 1C6.2 1 1.5 5.6 1.5 11.3c0 7.8 9 17.3 10.5 17.3s10.5-9.5 10.5-17.3C22.5 5.6 17.8 1 12 1z"
                                    fill="#FF0E00"
                                />
                                <circle cx="12" cy="11.3" r="4" fill="#111111" />
                            </svg>
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
                        hned dostaneš přístup k rentgenu
                    </h2>
                    <PillLink href={IG_DM_URL}>Napsat „START&ldquo; na Instagramu</PillLink>
                </div>
            </section>

            <LegalFooter />
        </main>
    );
}
