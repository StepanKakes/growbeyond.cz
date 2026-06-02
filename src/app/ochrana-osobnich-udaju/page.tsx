import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL } from "@/lib/legal";
import { LegalFooter } from "@/components/LegalFooter";

export const metadata: Metadata = {
    title: "Zásady ochrany osobních údajů | Beyond",
    description: "Informace o zpracování osobních údajů na webu growbeyond.cz.",
    robots: { index: false },
};

export default function PrivacyPolicyPage() {
    return (
        <main className="min-h-screen bg-brand-dark text-white font-sans">
            <div className="max-w-3xl mx-auto px-6 py-20 md:py-28">
                <Link href="/" className="text-gray-500 hover:text-white text-sm transition-colors">
                    ← Zpět na hlavní stránku
                </Link>

                <h1 className="text-3xl md:text-5xl font-bold tracking-tight-custom mt-8 mb-4">
                    Zásady ochrany osobních údajů
                </h1>
                <p className="text-gray-400 mb-12">Účinné od 2.&nbsp;6.&nbsp;2026</p>

                <div className="space-y-10 text-gray-300 leading-relaxed [&_h2]:text-white [&_h2]:text-xl [&_h2]:md:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight-custom [&_h2]:mb-4 [&_strong]:text-white [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-white [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2">

                    <section>
                        <h2>1. Správce osobních údajů</h2>
                        <p>
                            Správcem vašich osobních údajů je <strong>{LEGAL.name}</strong>, IČO:&nbsp;{LEGAL.ico},
                            se sídlem {LEGAL.address}. {LEGAL.registration}
                        </p>
                        <p className="mt-3">
                            Kontaktní e-mail: <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>
                        </p>
                    </section>

                    <section>
                        <h2>2. Jaké údaje zpracovávám a proč</h2>
                        <ul>
                            <li>
                                <strong>Dotazník / přihláška na konzultaci</strong> (e-mail, Instagram handle, odpovědi
                                na otázky o vašem podnikání) — abych mohl posoudit vaši přihlášku, připravit se na
                                hovor a kontaktovat vás. Právní základ: provedení opatření před uzavřením smlouvy
                                a oprávněný zájem.
                            </li>
                            <li>
                                <strong>Stažení materiálů zdarma</strong> (jméno, e-mail) — abych vám mohl zaslat
                                požadovaný materiál a navazující obsahové e-maily. Právní základ: souhlas, který
                                udělujete odesláním formuláře. Z odběru e-mailů se můžete kdykoliv odhlásit
                                kliknutím na odkaz v patičce každého e-mailu.
                            </li>
                            <li>
                                <strong>Nákup produktu</strong> (e-mail, fakturační a platební údaje) — pro vyřízení
                                objednávky, dodání produktu a splnění zákonných povinností (účetnictví). Právní
                                základ: plnění smlouvy a právní povinnost. Platby zpracovává společnost Stripe,
                                údaje o platební kartě se ke mně nikdy nedostanou.
                            </li>
                            <li>
                                <strong>Rezervace hovoru</strong> (jméno, e-mail, vybraný termín) — pro uskutečnění
                                domluvené konzultace. Právní základ: provedení opatření před uzavřením smlouvy.
                            </li>
                            <li>
                                <strong>Analytika a cookies</strong> (informace o chování na webu) — pro zlepšování
                                webu. Právní základ: souhlas udělený prostřednictvím cookie lišty. Podrobnosti
                                v sekci Cookies níže.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2>3. Komu údaje předávám (zpracovatelé)</h2>
                        <p>Pro fungování webu a služeb využívám tyto poskytovatele:</p>
                        <ul className="mt-3">
                            <li><strong>Stripe</strong> — zpracování plateb</li>
                            <li><strong>Plunk</strong> — rozesílka e-mailů</li>
                            <li><strong>Notion</strong> — evidence přihlášek a klientů</li>
                            <li><strong>Cal.com</strong> — rezervace termínů hovorů</li>
                            <li><strong>Microsoft Clarity</strong> — analytika chování na webu (pouze s vaším souhlasem)</li>
                        </ul>
                        <p className="mt-3">
                            Někteří z těchto poskytovatelů mohou údaje zpracovávat mimo EU. V takovém případě je
                            předání založeno na standardních smluvních doložkách nebo rozhodnutí o odpovídající
                            ochraně (EU-U.S. Data Privacy Framework).
                        </p>
                    </section>

                    <section>
                        <h2>4. Jak dlouho údaje uchovávám</h2>
                        <ul>
                            <li><strong>Přihlášky a dotazníky</strong> — po dobu jednání o spolupráci, nejdéle 2 roky od posledního kontaktu</li>
                            <li><strong>E-mailový odběr</strong> — do odvolání souhlasu (odhlášení z odběru)</li>
                            <li><strong>Údaje o nákupech</strong> — po dobu vyžadovanou zákonem (zpravidla 10 let pro účetní doklady)</li>
                            <li><strong>Analytická data</strong> — po dobu nastavenou poskytovatelem analytiky, zpravidla do 13 měsíců</li>
                        </ul>
                    </section>

                    <section>
                        <h2>5. Cookies</h2>
                        <p>
                            Web používá nezbytné technické cookies (pro správné fungování webu) a — pouze s vaším
                            souhlasem — analytické cookies služby Microsoft Clarity, které pomáhají pochopit, jak
                            návštěvníci web používají.
                        </p>
                        <p className="mt-3">
                            Souhlas s analytickými cookies můžete kdykoliv odvolat smazáním cookies ve svém
                            prohlížeči — při další návštěvě se vám lišta zobrazí znovu.
                        </p>
                    </section>

                    <section>
                        <h2>6. Vaše práva</h2>
                        <p>V souvislosti se zpracováním osobních údajů máte právo:</p>
                        <ul className="mt-3">
                            <li>na přístup ke svým osobním údajům,</li>
                            <li>na opravu nepřesných údajů,</li>
                            <li>na výmaz údajů („právo být zapomenut"),</li>
                            <li>na omezení zpracování,</li>
                            <li>na přenositelnost údajů,</li>
                            <li>vznést námitku proti zpracování,</li>
                            <li>kdykoliv odvolat udělený souhlas,</li>
                            <li>
                                podat stížnost u dozorového orgánu — Úřadu pro ochranu osobních údajů
                                (<a href="https://uoou.gov.cz" target="_blank" rel="noopener noreferrer">uoou.gov.cz</a>).
                            </li>
                        </ul>
                        <p className="mt-3">
                            Pro uplatnění svých práv mě kontaktujte na{" "}
                            <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>.
                        </p>
                    </section>

                    <section>
                        <h2>7. Závěrečná ustanovení</h2>
                        <p>
                            Tyto zásady mohu čas od času aktualizovat. Aktuální verze je vždy dostupná na této
                            stránce. Zpracování osobních údajů se řídí nařízením GDPR (EU) 2016/679 a zákonem
                            č. 110/2019 Sb., o zpracování osobních údajů.
                        </p>
                    </section>
                </div>
            </div>
            <LegalFooter />
        </main>
    );
}
