"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FadeUp } from '../FadeUp';
import { CalendlySection } from './CalendlySection';
import { getStoredUtm } from '@/lib/utm';

type FormData = {
    email: string;
    igHandle: string;
    q3: string;
    q4: string;
    q5: string;
    q6: string;
};

const q3Options = [
    "Stagnace: Zasekl/a jsem se a nedaří se mi posunout dál.",
    "Nekonzistentní příjem: Jeden měsíc dobrý, druhý slabý.",
    "Plná kapacita: Časově to nestíhám odbavit, ale chci růst dál.",
    "Málo klientů: Nechodí dost poptávek.",
    "Začínám: Zatím (skoro) nevydělávám a chci to rozjet.",
];

const q4Options = [
    "Nic",
    "Do 50 tisíc Kč",
    "50 - 80 tisíc Kč",
    "80 - 120 tisíc Kč",
    "Více než 120 tisíc Kč"
];

const q5Options = [
    "1:1 koučink nebo konzultace",
    "Skupinový program nebo mastermind",
    "Online kurz nebo digitální produkt",
    "Zatím neprodávám / teprve začínám"
];

const q6Options = [
    "0 - 25 tisíc Kč",
    "25 - 50 tisíc Kč",
    "50 - 90 tisíc Kč",
    "90 - 150 tisíc Kč"
];

// Nejnižší stupeň investice → diskvalifikace na CSP a vyřazení z follow-up e-mailu.
const LOWEST_BUDGET = "0 - 25 tisíc Kč";

// Po kvalifikaci v reklamním funnelu přesměruj na unikátní stránku leadu
// s VSL videem a kalendářem (/strategie/<id>). Když API nevrátilo ID,
// spadni zpět na inline rezervaci, ať lead nepropadne.
const RedirectToVideo = ({ leadId, email, followupEligible }: { leadId: string | null; email: string; followupEligible: boolean }) => {
    const router = useRouter();

    useEffect(() => {
        if (leadId) router.push(`/strategie/${leadId}`);
    }, [leadId, router]);

    if (!leadId) {
        return (
            <div className="w-full animate-[fadeIn_1s_ease-out]">
                <CalendlySection prefillEmail={email} followupEligible={followupEligible} />
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col items-center justify-center py-24 gap-6 animate-[fadeIn_0.6s_ease-out]">
            <div className="w-12 h-12 border-2 border-white/20 border-t-brand-red rounded-full animate-spin" />
            <p className="text-white text-lg font-bold tracking-tight-custom">Připravujeme tvé strategické video…</p>
        </div>
    );
};

export const ApplicationForm = ({ redirectMode = false }: { redirectMode?: boolean }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [budgetConfirmed, setBudgetConfirmed] = useState<boolean | null>(null);
    const [leadId, setLeadId] = useState<string | null>(null);
    const [isValidating, setIsValidating] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; igHandle?: string }>({});
    const [igPreview, setIgPreview] = useState<{
        state: 'idle' | 'loading' | 'found' | 'not_found';
        profile?: { username: string; fullName: string; profilePicUrl: string; isVerified: boolean; followers: number | null };
    }>({ state: 'idle' });
    const [debug, setDebug] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [valLog, setValLog] = useState<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug')) {
            setDebug(true);
        }
    }, []);
    const [formData, setFormData] = useState<FormData>({
        email: '',
        igHandle: '',
        q3: '',
        q4: '',
        q5: '',
        q6: ''
    });

    const handleSelect = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Live náhled IG profilu po opuštění pole — ukáže, že jsme našli správný účet
    const lookupIgPreview = async () => {
        const h = formData.igHandle
            .trim()
            .replace(/^@+/, '')
            .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
            .replace(/\/+$/, '')
            .split(/[/?#]/)[0];
        if (!h || h.length < 2) {
            setIgPreview({ state: 'idle' });
            return;
        }
        setIgPreview({ state: 'loading' });
        try {
            const res = await fetch(`/api/ig-lookup?username=${encodeURIComponent(h)}`);
            const data = await res.json();
            if (data?.found && data.profile) setIgPreview({ state: 'found', profile: data.profile });
            else if (data?.uncertain) setIgPreview({ state: 'idle' }); // nejisté → nech být
            else setIgPreview({ state: 'not_found' });
        } catch {
            setIgPreview({ state: 'idle' });
        }
    };

    // 1. krok: instantní validace e-mailu a Instagramu před postupem dál.
    // Fail-open — když validační endpoint selže, leada nezablokujeme.
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
            // V debug módu nepostupuj automaticky, ať je vidět výsledek
            if (debug) return;
            setCurrentStep(2);
        } catch {
            // síťová chyba → pusť dál
            setCurrentStep(2);
        } finally {
            setIsValidating(false);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
    };

    const autoAdvance = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setTimeout(() => {
            if (currentStep < 5) setCurrentStep(prev => prev + 1);
        }, 150);
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 1: return formData.email.includes('@') && formData.igHandle.trim() !== '';
            case 2: return formData.q3 !== '';
            case 3: return formData.q4 !== '';
            case 4: return formData.q5 !== '';
            case 5: return formData.q6 !== '';
            default: return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (currentStep !== 5 || !isStepValid()) return;
        setIsSubmitting(true);

        // Clarity: označ session leadem → hashnuté user id použijeme pro
        // automatický odkaz na nahrávku v dashboardu.
        let clarityUserId = '';
        try {
            const ig = '@' + formData.igHandle.trim().replace(/^@+/, '');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const clarity = (window as any).clarity;
            if (typeof clarity === 'function') {
                const p = clarity('identify', formData.email, undefined, undefined, ig);
                clarity('set', 'lead_email', formData.email);
                clarity('set', 'lead_ig', ig);
                clarity('upgrade', 'lead-submit'); // garantuj uložení nahrávky
                if (p && typeof p.then === 'function') {
                    const r = await p;
                    clarityUserId = r?.id || '';
                }
            }
        } catch { /* clarity nemusí být načtený (bez souhlasu) */ }

        try {
            const res = await fetch('/api/mentorship-submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, clarityUserId, utm: getStoredUtm() })
            });
            const data = await res.json().catch(() => ({} as { id?: string }));
            if (data?.id) setLeadId(data.id);

            setIsSubmitted(true);
            if (!redirectMode) {
                setTimeout(() => {
                    const calElem = document.getElementById('calendly');
                    calElem?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 300);
            }
        } catch (error) {
            console.error("Error submitting form", error);
            setIsSubmitted(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        // Low budget → check if they want to invest more
        if (formData.q6 === LOWEST_BUDGET) {
            if (budgetConfirmed === null) {
                return (
                    <div className="w-full animate-[fadeIn_1s_ease-out]">
                        <div className="max-w-3xl mx-auto bg-[#131313] border border-white/10 rounded-xl p-8 md:p-12 text-center">
                            <div className="mb-8">
                                <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight-custom mb-4">
                                    Ještě jedna důležitá věc...
                                </h3>
                                <p className="text-white text-base md:text-lg leading-relaxed max-w-xl mx-auto mb-4">
                                    V dotazníku jsi uvedl/a, že tvůj rozpočet na růst je 0 - 25 tisíc Kč. Buďme k sobě na rovinu — naše intenzivní 1:1 spolupráce vyžaduje vyšší investici. Chci, abychom na hovoru oba neztráceli čas, pokud by to nakonec nedávalo smysl.
                                </p>
                                <p className="text-white text-base md:text-lg leading-relaxed max-w-xl mx-auto">
                                    Jsi případně otevřený/á najít způsob, jak do sebe investovat víc?
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button
                                    onClick={() => {
                                        setBudgetConfirmed(true);
                                        setTimeout(() => {
                                            const calElem = document.getElementById('calendly');
                                            calElem?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        }, 100);
                                    }}
                                    className="w-full sm:w-auto bg-brand-red hover:bg-[#cc0b00] text-white px-8 py-4 rounded-full text-base font-bold tracking-tight-custom transition-all"
                                >
                                    Ano, chci najít způsob
                                </button>
                                <button
                                    onClick={() => setBudgetConfirmed(false)}
                                    className="w-full sm:w-auto bg-[#1A1A1A] hover:bg-[#252525] border border-white/10 text-white px-8 py-4 rounded-full text-base font-bold transition-all"
                                >
                                    Ne, to je moje maximum
                                </button>
                            </div>
                        </div>
                    </div>
                );
            }

            if (budgetConfirmed === false) {
                return (
                    <div className="w-full animate-[fadeIn_1s_ease-out]">
                        <div className="max-w-3xl mx-auto bg-[#131313] border border-white/10 rounded-xl p-8 md:p-12 text-center">
                            <div className="mb-6">
                                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-brand-red/10 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-brand-red" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                        <path d="M2 17l10 5 10-5" />
                                        <path d="M2 12l10 5 10-5" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight-custom mb-4">
                                    Díky za tvé odpovědi!
                                </h3>
                                <p className="text-white text-base md:text-lg leading-relaxed max-w-xl mx-auto">
                                    Vzhledem k tvému rozpočtu si myslíme, že tahle 1:1 spolupráce pro tebe teď není ta správná volba. Díky za tvůj čas a přejeme ti hodně úspěchů na cestě dál.
                                </p>
                            </div>
                        </div>
                    </div>
                );
            }
        }

        if (redirectMode) {
            return (
                <RedirectToVideo
                    leadId={leadId}
                    email={formData.email}
                    followupEligible={formData.q6 !== LOWEST_BUDGET}
                />
            );
        }

        return (
            <div className="w-full animate-[fadeIn_1s_ease-out]">
                <CalendlySection
                    prefillEmail={formData.email}
                    followupEligible={formData.q6 !== LOWEST_BUDGET}
                />
            </div>
        );
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-6">Základní kontaktní údaje</h3>
                        <div>
                            <label className="block text-white font-medium mb-2 uppercase text-xs tracking-wider opacity-80">Tvůj email</label>
                            <input
                                required
                                type="email"
                                value={formData.email}
                                onChange={e => { handleSelect('email', e.target.value); if (errors.email) setErrors(prev => ({ ...prev, email: undefined })); }}
                                className={`w-full bg-[#1A1A1A] border rounded-xl px-5 py-4 text-white focus:outline-none focus:bg-[#252525] transition-colors placeholder:text-gray-600 ${errors.email ? 'border-brand-red' : 'border-white/10 focus:border-brand-red'}`}
                                placeholder="email@gmail.com"
                            />
                            {errors.email && <p className="text-brand-red text-sm mt-2">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-white font-medium mb-2 uppercase text-xs tracking-wider opacity-80">Tvůj Instagram Handle</label>
                            <input
                                required
                                type="text"
                                value={formData.igHandle}
                                onChange={e => { handleSelect('igHandle', e.target.value); if (errors.igHandle) setErrors(prev => ({ ...prev, igHandle: undefined })); if (igPreview.state !== 'idle') setIgPreview({ state: 'idle' }); }}
                                onBlur={lookupIgPreview}
                                className={`w-full bg-[#1A1A1A] border rounded-xl px-5 py-4 text-white focus:outline-none focus:bg-[#252525] transition-colors placeholder:text-gray-600 ${errors.igHandle ? 'border-brand-red' : 'border-white/10 focus:border-brand-red'}`}
                                placeholder="@creationwithtim"
                            />
                            {errors.igHandle && <p className="text-brand-red text-sm mt-2">{errors.igHandle}</p>}

                            {/* Live náhled profilu */}
                            {igPreview.state === 'loading' && (
                                <div className="flex items-center gap-2 mt-3 text-gray-400 text-sm">
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    Hledám profil…
                                </div>
                            )}
                            {igPreview.state === 'found' && igPreview.profile && (
                                <div className="flex items-center gap-3 mt-3 p-3 rounded-xl bg-[#1A1A1A] border border-green-500/40 animate-[fadeIn_0.3s_ease-out]">
                                    {igPreview.profile.profilePicUrl && (
                                        <img
                                            src={`/api/ig-avatar?username=${encodeURIComponent(igPreview.profile.username)}&url=${encodeURIComponent(igPreview.profile.profilePicUrl)}`}
                                            alt=""
                                            className="w-11 h-11 rounded-full object-cover border border-white/10 shrink-0 bg-[#262626]"
                                        />
                                    )}
                                    <span className="text-white font-bold truncate flex-1 min-w-0">@{igPreview.profile.username}</span>
                                    <svg className="w-5 h-5 text-green-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                                </div>
                            )}
                            {igPreview.state === 'not_found' && !errors.igHandle && (
                                <p className="text-brand-red text-sm mt-2">Tenhle účet jsme nenašli. Zkontroluj username.</p>
                            )}
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out] flex flex-col h-full">
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">1. Co tě teď nejvíc brzdí?</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                            {q3Options.map((opt, i) => {
                                const [title, ...rest] = opt.split(':');
                                const description = rest.join(':').trim();
                                return (
                                    <div
                                        key={i}
                                        onClick={() => autoAdvance('q3', opt)}
                                        className={`p-5 rounded-xl border h-full cursor-pointer transition-colors flex flex-col items-center justify-center text-center gap-1.5 ${formData.q3 === opt ? 'border-brand-red bg-brand-red text-white' : 'border-white/10 bg-[#1A1A1A] hover:bg-[#252525]'}`}
                                    >
                                        <span className={`text-base md:text-lg font-bold leading-tight ${formData.q3 === opt ? 'text-white' : 'text-white'}`}>{title}</span>
                                        {description && (
                                            <span className={`text-xs md:text-sm leading-relaxed ${formData.q3 === opt ? 'text-white/80' : 'text-white/70'}`}>{description}</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out] flex flex-col h-full">
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-6">2. Kolik ti teď měsíčně vydělává tvoje podnikání?</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                            {q4Options.map((opt, i) => (
                                <div
                                    key={i}
                                    onClick={() => autoAdvance('q4', opt)}
                                    className={`p-5 rounded-xl border h-full cursor-pointer transition-colors flex items-center justify-center text-center font-bold text-sm md:text-base ${formData.q4 === opt ? 'border-brand-red bg-brand-red text-white' : 'border-white/10 bg-[#1A1A1A] hover:bg-[#252525] text-white'}`}
                                >
                                    {opt}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out] flex flex-col h-full">
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-6">3. Jak aktuálně prodáváš?</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                            {q5Options.map((opt, i) => (
                                <div
                                    key={i}
                                    onClick={() => autoAdvance('q5', opt)}
                                    className={`p-5 rounded-xl border h-full cursor-pointer transition-colors flex items-center justify-center text-center font-bold text-sm md:text-base ${formData.q5 === opt ? 'border-brand-red bg-brand-red text-white' : 'border-white/10 bg-[#1A1A1A] hover:bg-[#252525] text-white'}`}
                                >
                                    {opt}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out] flex flex-col h-full">
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-6">4. Kolik jsi teď schopný/á jednorázově investovat do růstu? (ne měsíční platba)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                            {q6Options.map((opt, i) => (
                                <div
                                    key={i}
                                    onClick={() => autoAdvance('q6', opt)}
                                    className={`p-5 rounded-xl border h-full cursor-pointer transition-colors flex items-center justify-center text-center font-bold text-sm md:text-base ${formData.q6 === opt ? 'border-brand-red bg-brand-red text-white' : 'border-white/10 bg-[#1A1A1A] hover:bg-[#252525] text-white'}`}
                                >
                                    {opt}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <section className="pt-4 pb-12 px-4 relative z-20 w-full transition-opacity duration-500">
            <FadeUp>
                <div className="max-w-3xl mx-auto bg-[#131313] border border-white/10 rounded-xl p-6 md:p-10 min-h-[400px] md:min-h-[450px] flex flex-col relative overflow-hidden">

                    {/* Full width Progress Bar */}
                    <div className="absolute top-0 left-0 w-full h-1.5 md:h-2 bg-white/5">
                        <div
                            className="h-full bg-brand-red transition-all duration-500 ease-out"
                            style={{ width: `${(currentStep / 5) * 100}%` }}
                        />
                    </div>

                    <form onSubmit={handleSubmit} className="relative z-10 flex flex-col flex-1 mt-6">

                        <div className="flex-1">
                            {renderStepContent()}
                        </div>

                        {debug && valLog && (
                            <div className="mt-4 rounded-lg border border-white/15 bg-black/50 p-4 text-xs font-mono text-left space-y-3">
                                <div className="text-white/50 uppercase tracking-wider">Debug · validace (jen s ?debug=1)</div>

                                <div className="space-y-1">
                                    <div className={valLog.email.ok ? 'text-green-400 font-bold' : 'text-brand-red font-bold'}>
                                        E-MAIL: {valLog.email.ok ? 'OK' : 'BLOK'}
                                    </div>
                                    <div className="text-white/70 break-all">
                                        {valLog.email.email || '—'} · formát: {String(valLog.email.formatValid)} · test/placeholder: {String(valLog.email.placeholder)} · disposable: {String(valLog.email.disposable)} · doména přijímá poštu: {String(valLog.email.domainAcceptsMail)}
                                        {valLog.email.provider?.name && ` · service(${valLog.email.provider.name}): ${valLog.email.provider.used ? valLog.email.provider.status : 'nepoužito'}`}
                                    </div>
                                    {valLog.email.reason && <div className="text-brand-red">↳ {valLog.email.reason}</div>}
                                </div>

                                <div className="space-y-1">
                                    <div className={valLog.instagram.ok ? 'text-green-400 font-bold' : 'text-brand-red font-bold'}>
                                        INSTAGRAM: {valLog.instagram.status === 'exists' ? 'NALEZEN' : valLog.instagram.status === 'not_found' ? 'NENALEZEN' : 'NEOVĚŘENO (puštěno dál)'}
                                    </div>
                                    <div className="text-white/70 break-all">
                                        @{valLog.instagram.handle || '—'} · formát: {String(valLog.instagram.formatValid)} · test/placeholder: {String(valLog.instagram.placeholder)} · http: {valLog.instagram.httpStatus ?? '—'}
                                    </div>
                                    {valLog.instagram.reason && <div className="text-brand-red">↳ {valLog.instagram.reason}</div>}
                                </div>

                                <div className="text-white/40">V debug módu se po validaci nepostupuje na další krok.</div>
                            </div>
                        )}

                        <div className="flex items-center gap-4 pt-6 mt-8 border-t border-white/5">
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="px-6 py-3 rounded-full border border-white/20 text-white font-medium hover:bg-white/10 transition-colors"
                                >
                                    Zpět
                                </button>
                            )}

                            {currentStep === 1 && (
                                <button
                                    type="button"
                                    onClick={handleStep1Next}
                                    disabled={!isStepValid() || isValidating}
                                    className="px-10 ml-auto bg-brand-red hover:bg-[#cc0b00] disabled:bg-[#252525] disabled:text-gray-500 disabled:cursor-not-allowed text-white py-3 rounded-full font-bold transition-colors flex items-center justify-center gap-2 min-w-[150px]"
                                >
                                    {isValidating ? (
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        "Pokračovat"
                                    )}
                                </button>
                            )}

                            {currentStep === 5 && (
                                <button
                                    type="submit"
                                    disabled={!isStepValid() || isSubmitting}
                                    className="flex-1 md:flex-none md:px-12 ml-auto bg-brand-red hover:bg-[#cc0b00] disabled:bg-[#252525] disabled:text-gray-500 disabled:cursor-not-allowed text-white py-3 rounded-full font-bold transition-colors flex justify-center items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        redirectMode ? "Odemknout video" : "Rezervovat hovor"
                                    )}
                                </button>
                            )}
                        </div>

                        {(currentStep === 1 || currentStep === 5) && (
                            <p className="text-gray-500 text-xs leading-relaxed mt-4 text-center md:text-right">
                                {currentStep === 1 ? 'Pokračováním' : 'Odesláním formuláře'} souhlasíš se zpracováním osobních údajů dle{' '}
                                <a
                                    href="/ochrana-osobnich-udaju"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline underline-offset-2 hover:text-white transition-colors"
                                >
                                    zásad ochrany osobních údajů
                                </a>.
                            </p>
                        )}
                    </form>
                </div>
            </FadeUp>
        </section>
    );
};
