import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL } from "@/lib/legal";
import { LegalFooter } from "@/components/LegalFooter";

export const metadata: Metadata = {
    title: "Obchodní podmínky | Beyond",
    description: "Obchodní podmínky pro nákup produktů a služeb na webu growbeyond.cz.",
    robots: { index: false },
};

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-brand-dark text-white font-sans">
            <div className="max-w-3xl mx-auto px-6 py-20 md:py-28">
                <Link href="/" className="text-gray-500 hover:text-white text-sm transition-colors">
                    ← Zpět na hlavní stránku
                </Link>

                <h1 className="text-3xl md:text-5xl font-bold tracking-tight-custom mt-8 mb-4">
                    Obchodní podmínky
                </h1>
                <p className="text-gray-400 mb-12">Účinné od 2.&nbsp;6.&nbsp;2026</p>

                <div className="space-y-10 text-gray-300 leading-relaxed [&_h2]:text-white [&_h2]:text-xl [&_h2]:md:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight-custom [&_h2]:mb-4 [&_strong]:text-white [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-white [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2">

                    <section>
                        <h2>1. Prodávající</h2>
                        <p>
                            <strong>{LEGAL.name}</strong><br />
                            IČO: {LEGAL.ico}<br />
                            Sídlo: {LEGAL.address}<br />
                            E-mail: <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>
                        </p>
                        <p className="mt-3">
                            {LEGAL.registration} {LEGAL.vatNote}
                        </p>
                        <p className="mt-3">
                            (dále jen „prodávající"). Tyto obchodní podmínky upravují vzájemná práva a povinnosti
                            mezi prodávajícím a zákazníkem při prodeji produktů a služeb prostřednictvím webu{" "}
                            {LEGAL.web}.
                        </p>
                    </section>

                    <section>
                        <h2>2. Nabízené produkty a služby</h2>
                        <ul>
                            <li>
                                <strong>Creator Starter Pack</strong> — balíček digitálního obsahu a služeb
                                (brandová analýza, strategický hovor, šablony a materiály). Cena je vždy uvedena
                                u produktu na webu a je konečná.
                            </li>
                            <li>
                                <strong>1:1 mentoring / konzultace</strong> — individuální spolupráce, jejíž rozsah
                                a cena se sjednává individuálně na základě úvodního hovoru.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2>3. Objednávka a uzavření smlouvy</h2>
                        <ol>
                            <li>
                                Objednávku provedete kliknutím na nákupní tlačítko na webu a dokončením platby
                                prostřednictvím platební brány Stripe.
                            </li>
                            <li>
                                Smlouva je uzavřena okamžikem připsání platby. O přijetí platby obdržíte potvrzení
                                na e-mail zadaný při platbě.
                            </li>
                            <li>
                                Odesláním objednávky potvrzujete, že jste se seznámili s těmito obchodními
                                podmínkami a souhlasíte s nimi.
                            </li>
                        </ol>
                    </section>

                    <section>
                        <h2>4. Cena a platba</h2>
                        <ol>
                            <li>Ceny jsou uvedeny v českých korunách (Kč) a jsou konečné. {LEGAL.vatNote}</li>
                            <li>
                                Platba probíhá online platební kartou prostřednictvím zabezpečené platební brány
                                Stripe. Prodávající nemá přístup k údajům o vaší platební kartě.
                            </li>
                        </ol>
                    </section>

                    <section>
                        <h2>5. Dodání</h2>
                        <ol>
                            <li>
                                Digitální obsah a přístupy jsou dodány elektronicky na e-mail zadaný při objednávce,
                                a to zpravidla do 24 hodin od přijetí platby.
                            </li>
                            <li>
                                Termíny hovorů a konzultací se rezervují prostřednictvím rezervačního systému, na
                                který obdržíte odkaz po dokončení objednávky.
                            </li>
                        </ol>
                    </section>

                    <section>
                        <h2>6. Odstoupení od smlouvy</h2>
                        <ol>
                            <li>
                                Jako spotřebitel máte právo odstoupit od smlouvy uzavřené na dálku ve lhůtě
                                14&nbsp;dnů od jejího uzavření, a to bez udání důvodu.
                            </li>
                            <li>
                                <strong>Výjimka u digitálního obsahu:</strong> Berete na vědomí, že pokud vám byl
                                digitální obsah dodán s vaším výslovným souhlasem před uplynutím 14denní lhůty,
                                ztrácíte tím v souladu s § 1837 písm. l) občanského zákoníku právo na odstoupení
                                od smlouvy v rozsahu tohoto obsahu.
                            </li>
                            <li>
                                <strong>Výjimka u služeb:</strong> Pokud byla služba (např. konzultace) s vaším
                                výslovným souhlasem zcela splněna před uplynutím lhůty pro odstoupení, právo na
                                odstoupení zaniká.
                            </li>
                            <li>
                                Pro odstoupení od smlouvy stačí zaslat e-mail na{" "}
                                <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>. Peníze vám vrátím do 14 dnů od
                                odstoupení, a to stejným způsobem, jakým jste platbu provedli.
                            </li>
                        </ol>
                    </section>

                    <section>
                        <h2>7. Práva z vadného plnění (reklamace)</h2>
                        <ol>
                            <li>
                                Pokud má dodaný produkt nebo služba vadu (např. nefunkční přístup k materiálům),
                                máte právo na bezplatnou nápravu — opravu, nové dodání, přiměřenou slevu, případně
                                odstoupení od smlouvy.
                            </li>
                            <li>
                                Reklamaci uplatníte e-mailem na{" "}
                                <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>. Reklamaci vyřídím bez
                                zbytečného odkladu, nejpozději do 30 dnů od jejího uplatnění.
                            </li>
                        </ol>
                    </section>

                    <section>
                        <h2>8. Mimosoudní řešení sporů</h2>
                        <p>
                            Pokud mezi námi vznikne spor, který se nepodaří vyřešit dohodou, máte jako spotřebitel
                            právo obrátit se s návrhem na mimosoudní řešení sporu na Českou obchodní inspekci
                            (ČOI), Štěpánská 796/44, 110 00 Praha 1,{" "}
                            <a href="https://www.coi.cz" target="_blank" rel="noopener noreferrer">www.coi.cz</a>.
                            Lze využít také platformu pro řešení sporů online provozovanou Evropskou komisí na
                            adrese{" "}
                            <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
                                ec.europa.eu/consumers/odr
                            </a>.
                        </p>
                    </section>

                    <section>
                        <h2>9. Ochrana osobních údajů</h2>
                        <p>
                            Informace o tom, jak nakládám s vašimi osobními údaji, najdete v{" "}
                            <Link href="/ochrana-osobnich-udaju">Zásadách ochrany osobních údajů</Link>.
                        </p>
                    </section>

                    <section>
                        <h2>10. Závěrečná ustanovení</h2>
                        <ol>
                            <li>Právní vztahy neupravené těmito podmínkami se řídí právním řádem České republiky, zejména občanským zákoníkem.</li>
                            <li>Tyto obchodní podmínky mohu měnit či doplňovat. Pro konkrétní objednávku platí vždy znění účinné v okamžiku jejího odeslání.</li>
                        </ol>
                    </section>
                </div>
            </div>
            <LegalFooter />
        </main>
    );
}
