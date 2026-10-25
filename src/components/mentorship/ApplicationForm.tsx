"use client";

import React, { useState, useEffect } from 'react';
import { FadeUp } from '../FadeUp';
import { CalendlySection } from './CalendlySection';
import { getStoredUtm } from '@/lib/utm';
import { phCapture, phIdentify } from '@/lib/posthog';

export type Vetev = 'kouci' | 'podnikatele';

type FormData = {
    email: string;
    igHandle: string;
    q3: string;
    q4: string;
    q5: string;
    q6: string;
    firma: string;
    cil: string;
};

type Moznost = { value: string; title: string; desc?: string };

// Hodnoty (value) jdou beze změny do Notionu jako select, proto zůstávají ve starém tvaru.
// Na webu se ukazuje title a desc.
const rozsah = (v: string) => v.replace(' - ', ' až ');

const KOUCI = {
    q3: [
        { value: "Stagnace: Zasekl/a jsem se a nedaří se mi posunout dál.", title: "Stagnace", desc: "Zasekl jsem se a nedaří se mi posunout dál" },
        { value: "Nekonzistentní příjem: Jeden měsíc dobrý, druhý slabý.", title: "Nekonzistentní příjem", desc: "Jeden měsíc dobrý, druhý slabý" },
        { value: "Plná kapacita: Časově to nestíhám odbavit, ale chci růst dál.", title: "Plná kapacita", desc: "Nestíhám to odbavit, ale chci růst dál" },
        { value: "Málo klientů: Nechodí dost poptávek.", title: "Málo klientů", desc: "Nechodí dost poptávek" },
        { value: "Začínám: Zatím (skoro) nevydělávám a chci to rozjet.", title: "Začínám", desc: "Zatím skoro nevydělávám a chci to rozjet" },
    ] as Moznost[],
    q4: ["Nic", "Do 50 tisíc Kč", "50 - 80 tisíc Kč", "80 - 120 tisíc Kč", "Více než 120 tisíc Kč"]
        .map(v => ({ value: v, title: rozsah(v) })) as Moznost[],
    q5: [
        { value: "1:1 koučink nebo konzultace", title: "1:1 koučink nebo konzultace" },
        { value: "Skupinový program nebo mastermind", title: "Skupinový program nebo mastermind" },
        { value: "Online kurz nebo digitální produkt", title: "Online kurz nebo digitální produkt" },
        { value: "Zatím neprodávám / teprve začínám", title: "Zatím neprodávám, teprve začínám" },
    ] as Moznost[],
    q6: ["0 - 25 tisíc Kč", "25 - 50 tisíc Kč", "50 - 90 tisíc Kč", "90 - 150 tisíc Kč"]
        .map(v => ({ value: v, title: rozsah(v) })) as Moznost[],
};

const PODNIKATELE = {
    q4: ["Zatím bez pravidelných tržeb", "Do 100 tisíc Kč", "100 až 250 tisíc Kč", "250 až 500 tisíc Kč", "500 tisíc až 1 milion Kč", "Více než 1 milion Kč"]
        .map(v => ({ value: v, title: v })) as Moznost[],
    q5: ["Doporučení", "Reklamy", "Obchodník nebo obchodní tým", "Sociální sítě", "Zatím nijak systematicky"]
        .map(v => ({ value: v, title: v })) as Moznost[],
    q3: [
        { value: "Málo poptávek: Zákazníci o nás nevědí", title: "Málo poptávek", desc: "Zákazníci o nás nevědí" },
        { value: "Nízká důvěra: Lidé nás neznají a váhají", title: "Nízká důvěra", desc: "Lidé nás neznají a váhají" },
        { value: "Jeden zdroj zákazníků: Když vypadne, poptávky stojí", title: "Jeden zdroj zákazníků", desc: "Když vypadne, poptávky stojí" },
        { value: "Zakladatel není vidět: Firma nemá tvář", title: "Zakladatel není vidět", desc: "Firma navenek nemá tvář" },
    ] as Moznost[],
};

// Nejnižší stupeň investice → diskvalifikace (jen kouči).
const LOWEST_BUDGET = "0 - 25 tisíc Kč";
const KROKU = 5;

const NADPISY: Record<Vetev, string[]> = {
    kouci: [
        "Kontaktní údaje",
        "Co tě teď nejvíc brzdí?",
        "Kolik ti teď podnikání vydělá za měsíc?",
        "Jak teď prodáváš?",
        "Kolik můžeš teď do růstu investovat?",
    ],
    podnikatele: [
        "Kontaktní údaje",
        "Řekni nám o firmě",
        "Jaké má firma měsíční tržby?",
        "Jak dnes získáváte zákazníky?",
        "Co nejvíc brzdí růst firmy?",
    ],
};

const inputCls = (chyba?: string) =>
    `w-full h-[52px] bg-[#0f0f0f] border rounded-xl px-4 text-base text-white placeholder:text-gray-600 focus:outline-none transition-colors ${chyba ? 'border-brand-red' : 'border-white/10 focus:border-brand-red'}`;

const Spinner = () => <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />;

// Náhled kalendáře, který se odemkne po vyplnění přihlášky
const ZamcenyKalendar = () => {
    const dny = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
    const cisla = Array.from({ length: 35 }, (_, i) => i - 2);
    return (
        <div className="relative h-full min-h-[360px]">
            <div className="opacity-30 select-none pointer-events-none" aria-hidden="true">
                <div className="flex items-center justify-between mb-5">
                    <span className="w-8 h-8 rounded-lg border border-white/15" />
                    <span className="text-sm font-bold text-white">Termíny hovorů</span>
                    <span className="w-8 h-8 rounded-lg border border-white/15" />
                </div>
                <div className="grid grid-cols-7 gap-y-3 text-center">
                    {dny.map(d => <span key={d} className="text-[11px] font-bold text-gray-500">{d}</span>)}
                    {cisla.map(c => <span key={c} className="text-sm text-gray-500">{c > 0 && c <= 31 ? c : ''}</span>)}
                </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="max-w-[280px] bg-[#0f0f0f] border border-white/10 rounded-2xl px-6 py-5 text-center">
                    <svg className="w-5 h-5 mx-auto mb-3 text-brand-red" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    </svg>
                    <p className="text-sm font-bold text-white mb-1">Kalendář je zamčený</p>
                    <p className="text-sm text-gray-400 leading-relaxed">Vyplň přihlášku a pak si vybereš termín hovoru</p>
                </div>
            </div>
        </div>
    );
};

export const ApplicationForm = ({ vetev = 'kouci' }: { vetev?: Vetev }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; igHandle?: string }>({});
    const [igPreview, setIgPreview] = useState<{
        state: 'idle' | 'loading' | 'found' | 'not_found';
        profile?: { username: string; fullName: string; profilePicUrl: string; isVerified: boolean; followers: number | null };
    }>({ state: 'idle' });
    const [debug, setDebug] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [valLog, setValLog] = useState<any>(null);
    const [formData, setFormData] = useState<FormData>({
        email: '', igHandle: '', q3: '', q4: '', q5: '', q6: '', firma: '', cil: '',
    });

    useEffect(() => {
        if (new URLSearchParams(window.location.search).has('debug')) setDebug(true);
    }, []);

    const set = (field: keyof FormData, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

    // Které pole a možnosti patří ke kroku 2 až 5
    const vyberKroku: Record<number, { field: keyof FormData; options: Moznost[] } | null> = vetev === 'kouci'
        ? { 2: { field: 'q3', options: KOUCI.q3 }, 3: { field: 'q4', options: KOUCI.q4 }, 4: { field: 'q5', options: KOUCI.q5 }, 5: { field: 'q6', options: KOUCI.q6 } }
        : { 2: null, 3: { field: 'q4', options: PODNIKATELE.q4 }, 4: { field: 'q5', options: PODNIKATELE.q5 }, 5: { field: 'q3', options: PODNIKATELE.q3 } };

    // Live náhled IG profilu po opuštění pole, ukáže, že jsme našli správný účet
    const lookupIgPreview = async () => {
        const h = formData.igHandle.trim().replace(/^@+/, '')
            .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/\/+$/, '').split(/[/?#]/)[0];
        if (!h || h.length < 2) { setIgPreview({ state: 'idle' }); return; }
        setIgPreview({ state: 'loading' });
        try {
            const res = await fetch(`/api/ig-lookup?username=${encodeURIComponent(h)}`);
            const data = await res.json();
            if (data?.found && data.profile) setIgPreview({ state: 'found', profile: data.profile });
            else if (data?.uncertain) setIgPreview({ state: 'idle' });
            else setIgPreview({ state: 'not_found' });
        } catch {
            setIgPreview({ state: 'idle' });
        }
    };

    const isStepValid = () => {
        if (currentStep === 1) return formData.email.includes('@') && formData.igHandle.trim() !== '';
        const vyber = vyberKroku[currentStep];
        if (vyber) return formData[vyber.field] !== '';
        return formData.firma.trim().length > 2 && formData.cil.trim().length > 2;
    };

    // 1. krok: validace e-mailu a Instagramu. Fail-open, když endpoint selže, leada nezablokujeme.
    const handleStep1Next = async () => {
        if (!isStepValid() || isValidating) return;
        setIsValidating(true);
        setErrors({});
        try {
            const res = await fetch('/api/validate-lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, igHandle: formData.igHandle }),
            });
            const data = await res.json().catch(() => ({ ok: true }));
            if (data?.details) setValLog(data.details);
            if (data && data.ok === false && data.errors && (data.errors.email || data.errors.igHandle)) {
                setErrors(data.errors);
                return;
            }
            if (debug) return;
            setCurrentStep(2);
        } catch {
            setCurrentStep(2);
        } finally {
            setIsValidating(false);
        }
    };

    const handleNext = () => {
        if (currentStep === 1) return handleStep1Next();
        if (isStepValid() && currentStep < KROKU) setCurrentStep(s => s + 1);
    };

    const autoAdvance = (field: keyof FormData, value: string) => {
        set(field, value);
        if (currentStep < KROKU) setTimeout(() => setCurrentStep(s => Math.min(s + 1, KROKU)), 180);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (currentStep !== KROKU || !isStepValid() || isSubmitting) return;
        setIsSubmitting(true);
        setSubmitError('');

        phIdentify(formData.email, { ig: '@' + formData.igHandle.trim().replace(/^@+/, '') });
        phCapture(vetev === 'kouci' ? 'prihlaska_mentoring' : 'prihlaska_podnikatele');

        const payload = vetev === 'kouci'
            ? { email: formData.email, igHandle: formData.igHandle, q3: formData.q3, q4: formData.q4, q5: formData.q5, q6: formData.q6 }
            : {
                email: formData.email, igHandle: formData.igHandle, q3: formData.q3, q4: formData.q4, q5: formData.q5,
                q7: `Co firma dělá: ${formData.firma.trim()}\nCíl na 90 dní: ${formData.cil.trim()}`,
            };

        try {
            const res = await fetch('/api/mentorship-submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...payload, vetev, utm: getStoredUtm() }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setIsSubmitted(true);
        } catch (error) {
            console.error('Error submitting form', error);
            setSubmitError('Přihlášku se nepodařilo odeslat. Zkus to prosím znovu za chvíli.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const nizkyRozpocet = vetev === 'kouci' && formData.q6 === LOWEST_BUDGET;

    const Moznosti = ({ field, options }: { field: keyof FormData; options: Moznost[] }) => (
        <div className="grid gap-2.5" role="radiogroup">
            {options.map(opt => {
                const vybrano = formData[field] === opt.value;
                return (
                    <button
                        key={opt.value}
                        type="button"
                        role="radio"
                        aria-checked={vybrano}
                        onClick={() => autoAdvance(field, opt.value)}
                        className={`w-full flex items-center gap-4 text-left px-4 py-3.5 min-h-[56px] rounded-xl border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red ${vybrano ? 'border-brand-red bg-brand-red/10' : 'border-white/10 bg-[#0f0f0f] hover:border-white/25'}`}
                    >
                        <span className={`w-[18px] h-[18px] shrink-0 rounded-full border-2 flex items-center justify-center ${vybrano ? 'border-brand-red' : 'border-white/25'}`}>
                            {vybrano && <span className="w-2 h-2 rounded-full bg-brand-red" />}
                        </span>
                        <span className="min-w-0">
                            <span className="block text-[15px] md:text-base font-bold text-white leading-snug">{opt.title}</span>
                            {opt.desc && <span className="block text-sm text-gray-400 leading-snug mt-0.5">{opt.desc}</span>}
                        </span>
                    </button>
                );
            })}
        </div>
    );

    const renderStepContent = () => {
        if (currentStep === 1) {
            return (
                <div className="grid gap-4">
                    <div>
                        <label htmlFor="prihlaska-email" className="block text-sm text-gray-300 mb-2">E-mail</label>
                        <input
                            id="prihlaska-email"
                            required
                            type="email"
                            autoComplete="email"
                            value={formData.email}
                            onChange={e => { set('email', e.target.value); if (errors.email) setErrors(p => ({ ...p, email: undefined })); }}
                            className={inputCls(errors.email)}
                            placeholder="jmeno@email.cz"
                        />
                        {errors.email && <p className="text-brand-red text-sm mt-2">{errors.email}</p>}
                    </div>
                    <div>
                        <label htmlFor="prihlaska-ig" className="block text-sm text-gray-300 mb-2">Instagram</label>
                        <input
                            id="prihlaska-ig"
                            required
                            type="text"
                            autoCapitalize="off"
                            autoCorrect="off"
                            value={formData.igHandle}
                            onChange={e => { set('igHandle', e.target.value); if (errors.igHandle) setErrors(p => ({ ...p, igHandle: undefined })); if (igPreview.state !== 'idle') setIgPreview({ state: 'idle' }); }}
                            onBlur={lookupIgPreview}
                            className={inputCls(errors.igHandle)}
                            placeholder="@tvujucet"
                        />
                        {errors.igHandle && <p className="text-brand-red text-sm mt-2">{errors.igHandle}</p>}
                        {igPreview.state === 'loading' && (
                            <div className="flex items-center gap-2 mt-3 text-gray-400 text-sm"><Spinner />Hledám profil</div>
                        )}
                        {igPreview.state === 'found' && igPreview.profile && (
                            <div className="flex items-center gap-3 mt-3 p-3 rounded-xl bg-[#0f0f0f] border border-white/10">
                                {igPreview.profile.profilePicUrl && (
                                    <img
                                        src={`/api/ig-avatar?username=${encodeURIComponent(igPreview.profile.username)}&url=${encodeURIComponent(igPreview.profile.profilePicUrl)}`}
                                        alt=""
                                        className="w-9 h-9 rounded-full object-cover shrink-0 bg-[#262626]"
                                    />
                                )}
                                <span className="text-white font-bold truncate flex-1 min-w-0">@{igPreview.profile.username}</span>
                                <svg className="w-5 h-5 text-green-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-label="Nalezeno"><path d="M20 6L9 17l-5-5" /></svg>
                            </div>
                        )}
                        {igPreview.state === 'not_found' && !errors.igHandle && (
                            <p className="text-brand-red text-sm mt-2">Tenhle účet jsme nenašli. Zkontroluj, jestli je jméno správně</p>
                        )}
                    </div>
                </div>
            );
        }

        const vyber = vyberKroku[currentStep];
        if (vyber) return Moznosti({ field: vyber.field, options: vyber.options });

        // Podnikatelé, krok 2: dvě krátké odpovědi vlastními slovy
        return (
            <div className="grid gap-4">
                <div>
                    <label htmlFor="prihlaska-firma" className="block text-sm text-gray-300 mb-2">Co firma dělá a komu prodává?</label>
                    <textarea
                        id="prihlaska-firma"
                        rows={3}
                        value={formData.firma}
                        onChange={e => set('firma', e.target.value)}
                        className="w-full bg-[#0f0f0f] border border-white/10 focus:border-brand-red rounded-xl px-4 py-3 text-base text-white placeholder:text-gray-600 focus:outline-none transition-colors resize-none"
                        placeholder="Například: dodáváme účetní software malým e-shopům"
                    />
                </div>
                <div>
                    <label htmlFor="prihlaska-cil" className="block text-sm text-gray-300 mb-2">Jaký je tvůj hlavní obchodní cíl na příštích 90 dní?</label>
                    <textarea
                        id="prihlaska-cil"
                        rows={2}
                        value={formData.cil}
                        onChange={e => set('cil', e.target.value)}
                        className="w-full bg-[#0f0f0f] border border-white/10 focus:border-brand-red rounded-xl px-4 py-3 text-base text-white placeholder:text-gray-600 focus:outline-none transition-colors resize-none"
                        placeholder="Například: 10 nových zákazníků z B2B"
                    />
                </div>
            </div>
        );
    };

    const potrebujeTlacitko = currentStep === 1 || (vetev === 'podnikatele' && currentStep === 2);
    const hotovo = isSubmitted && !nizkyRozpocet;

    return (
        <section className="pt-4 pb-12 px-4 relative z-20 w-full">
            <FadeUp>
                <div className="max-w-[1040px] mx-auto bg-[#131313] border border-white/10 rounded-[20px] overflow-hidden">

                    {isSubmitted && nizkyRozpocet ? (
                        <div className="px-6 md:px-12 py-14 text-center max-w-2xl mx-auto">
                            <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight-custom mb-4">Díky za tvé odpovědi</h3>
                            <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-4">
                                Uvedl jsi, že teď můžeš do růstu investovat do 25 tisíc Kč. Budeme k tobě upřímní, naše 1:1 spolupráce potřebuje vyšší vstupní investici.
                            </p>
                            <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                                Teď pro tebe proto nejspíš není ta pravá. Díky za tvůj čas a hodně štěstí na cestě dál.
                            </p>
                        </div>
                    ) : hotovo ? (
                        <div id="calendly" className="pt-6">
                            <p className="px-6 md:px-8 text-gray-300 text-base">Hotovo, přihláška je odeslaná. Teď si vyber termín hovoru</p>
                            {/* Follow-up po kalendáři je e-mail pro kouče, podnikatelům ho neposíláme */}
                            <CalendlySection prefillEmail={formData.email} followupEligible={vetev === 'kouci' && !nizkyRozpocet} />
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-[1.05fr_1fr]">
                            <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col">
                                <p className="text-sm text-gray-400 leading-relaxed mb-5">
                                    Odpověz na pár otázek, <span className="text-white font-bold">zabere to asi minutu</span>. Pak se ti <span className="text-white font-bold">odemkne kalendář</span>
                                </p>

                                <div className="h-0.5 bg-white/10 rounded-full overflow-hidden mb-5">
                                    <div className="h-full bg-brand-red transition-all duration-500 ease-out" style={{ width: `${(currentStep / KROKU) * 100}%` }} />
                                </div>

                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs font-bold text-brand-red border border-brand-red/40 bg-brand-red/10 rounded-full px-2.5 py-0.5">Krok {currentStep}</span>
                                    <span className="text-xs text-gray-500">z {KROKU}</span>
                                </div>

                                <h3 className="text-2xl md:text-[28px] font-bold text-white tracking-tight-custom leading-tight mb-5">
                                    {NADPISY[vetev][currentStep - 1]}
                                </h3>
                                {vetev === 'kouci' && currentStep === 5 && (
                                    <p className="text-sm text-gray-400 -mt-3 mb-5">Jednorázově, ne měsíčně</p>
                                )}

                                <div key={currentStep} className="animate-[fadeIn_0.3s_ease-out]">
                                    {renderStepContent()}
                                </div>

                                {debug && valLog && (
                                    <pre className="mt-4 rounded-lg border border-white/15 bg-black/50 p-3 text-[11px] text-white/70 whitespace-pre-wrap break-all">
                                        {JSON.stringify(valLog, null, 2)}
                                    </pre>
                                )}

                                {submitError && <p className="text-brand-red text-sm mt-4">{submitError}</p>}

                                <div className="mt-6 grid gap-3">
                                    {potrebujeTlacitko && (
                                        <button
                                            type="button"
                                            onClick={handleNext}
                                            disabled={!isStepValid() || isValidating}
                                            className="w-full h-[52px] rounded-full bg-brand-red hover:bg-[#cc0b00] disabled:bg-[#252525] disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold transition-colors flex items-center justify-center"
                                        >
                                            {isValidating ? <Spinner /> : 'Pokračovat'}
                                        </button>
                                    )}
                                    {currentStep === KROKU && (
                                        <button
                                            type="submit"
                                            disabled={!isStepValid() || isSubmitting}
                                            className="w-full h-[52px] rounded-full bg-brand-red hover:bg-[#cc0b00] disabled:bg-[#252525] disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold transition-colors flex items-center justify-center"
                                        >
                                            {isSubmitting ? <Spinner /> : 'Odeslat a vybrat termín'}
                                        </button>
                                    )}
                                    {currentStep > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(s => s - 1)}
                                            className="justify-self-start text-sm text-gray-400 hover:text-white transition-colors underline-offset-4 hover:underline"
                                        >
                                            Zpět
                                        </button>
                                    )}
                                </div>

                                {(currentStep === 1 || currentStep === KROKU) && (
                                    <p className="text-gray-500 text-xs leading-relaxed mt-4">
                                        {currentStep === 1 ? 'Pokračováním' : 'Odesláním'} souhlasíš se zpracováním osobních údajů podle{' '}
                                        <a href="/ochrana-osobnich-udaju" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white transition-colors">
                                            zásad ochrany osobních údajů
                                        </a>
                                    </p>
                                )}
                            </form>

                            <div className="hidden md:block p-8 border-l border-white/10">
                                <ZamcenyKalendar />
                            </div>
                        </div>
                    )}
                </div>
            </FadeUp>
        </section>
    );
};
