"use client";

import React, { useState } from 'react';
import { FadeUp } from '../FadeUp';
import { CalendlySection } from './CalendlySection';

type FormData = {
    email: string;
    igHandle: string;
    q3: string;
    q4: string;
    q5: string;
    q6: string;
    q7: string;
};

const q3Options = [
    "Slabý positioning: Můj profil neříká jasně, pro koho jsem a jaký výsledek doručuji, nebo přitahuji nerelevantní cílovku.",
    `Nefunkční funnel: Chybí mi systém, který by mi automaticky a předvídatelně přiváděl kvalifikované klienty. Nevím, jak diváka efektivně „zahřát" a dovést ho k nákupu ve správný moment.`,
    `Slabá nabídka: Moje nabídka nikoho „nezvedne ze židle", nebo se snažím oslovit každého a ve výsledku neoslovuji nikoho konkrétního.`,
    "Neefektivní procesy: Tvorba obsahu mi bere moc času a výsledky (prodeje) tomu vůbec neodpovídají. Moje osobní značka nefunguje jako jeden propojený celek."
];

const q4Options = [
    "0 - 10tisíc Kč",
    "10 - 30tisíc Kč",
    "35 - 100tisíc Kč",
    "100tisíc a víc"
];

const q5Options = [
    "Nemonetizuji",
    "Prodej produktu",
    "Služba (coachuji, pomáhám, konzultuji)",
    "Brand deals (placené spolupráce)"
];

const q6Options = [
    "0 - 10tisíc Kč",
    "15 - 30tisíc Kč",
    "35 - 60tisíc Kč",
    "65 - 90tisíc",
    "100tis. a víc"
];

export const ApplicationForm = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        email: '',
        igHandle: '',
        q3: '',
        q4: '',
        q5: '',
        q6: '',
        q7: ''
    });

    const getQ7Prompt = () => {
        if (formData.q3.startsWith("Slabý positioning")) return "Co by pro tebe znamenalo, kdyby tvůj profil oslovoval jen ty, se kterými skutečně chceš pracovat a kteří jsou ochotni zaplatit tvou cenu?";
        if (formData.q3.startsWith("Nefunkční funnel")) return "Co by pro tebe znamenalo, kdyby k tobě klienti přicházeli sami už v podstatě rozhodnutí, že chtějí nakoupit od tebe?";
        if (formData.q3.startsWith("Slabá nabídka")) return "Co by pro tebe znamenalo, kdybys měl nabídku, která je tak konkrétní a lákavá, že by ses už nikdy nemusel cítit, že někoho nutíš nakoupit, ale spíše mu pomáháš udělat skvělé rozhodnutí?";
        if (formData.q3.startsWith("Neefektivní procesy")) return "Co by pro tvůj osobní život znamenalo, kdybys tvorbu obsahu zkrátil na polovinu času, a přitom věděl, že každý post má své jasné místo v prodejní strategii a skutečně ti vydělává?";
        return "";
    };

    const handleSelect = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = () => {
        if (currentStep < 6) setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
    };

    const autoAdvance = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setTimeout(() => {
            if (currentStep < 6) setCurrentStep(prev => prev + 1);
        }, 150);
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 1: return formData.email.includes('@') && formData.igHandle.trim() !== '';
            case 2: return formData.q3 !== '';
            case 3: return formData.q4 !== '';
            case 4: return formData.q5 !== '';
            case 5: return formData.q6 !== '';
            case 6: return formData.q7.trim() !== '';
            default: return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isStepValid()) return;
        setIsSubmitting(true);

        try {
            await fetch('/api/mentorship-submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            setIsSubmitted(true);
            setTimeout(() => {
                const calElem = document.getElementById('calendly');
                calElem?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
        } catch (error) {
            console.error("Error submitting form", error);
            setIsSubmitted(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="w-full animate-[fadeIn_1s_ease-out]">
                <CalendlySection prefillEmail={formData.email} />
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
                                onChange={e => handleSelect('email', e.target.value)}
                                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-brand-red focus:bg-[#252525] transition-colors placeholder:text-gray-600"
                                placeholder="email@gmail.com"
                            />
                        </div>
                        <div>
                            <label className="block text-white font-medium mb-2 uppercase text-xs tracking-wider opacity-80">Tvůj Instagram Handle</label>
                            <input
                                required
                                type="text"
                                value={formData.igHandle}
                                onChange={e => handleSelect('igHandle', e.target.value)}
                                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-brand-red focus:bg-[#252525] transition-colors placeholder:text-gray-600"
                                placeholder="@creationwithtim"
                            />
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out] flex flex-col h-full">
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">1. V čem vidíš ten největší problém? Co tě nejvíc drží zpátky?</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                            {q3Options.map((opt, i) => (
                                <div
                                    key={i}
                                    onClick={() => autoAdvance('q3', opt)}
                                    className={`p-5 rounded-xl border h-full cursor-pointer transition-colors flex items-center justify-center text-center ${formData.q3 === opt ? 'border-brand-red bg-brand-red text-white' : 'border-white/10 bg-[#1A1A1A] hover:bg-[#252525]'}`}
                                >
                                    <p className={`text-sm leading-relaxed font-bold ${formData.q3 === opt ? 'text-white' : 'text-gray-400'}`}>{opt}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out] flex flex-col h-full">
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-6">2. Kolik ti vydělá Instagram za měsíc?</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                            {q4Options.map((opt, i) => (
                                <div
                                    key={i}
                                    onClick={() => autoAdvance('q4', opt)}
                                    className={`p-5 rounded-xl border h-full cursor-pointer transition-colors flex items-center justify-center text-center font-bold text-sm md:text-base ${formData.q4 === opt ? 'border-brand-red bg-brand-red text-white' : 'border-white/10 bg-[#1A1A1A] hover:bg-[#252525] text-gray-400'}`}
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
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-6">3. Jakým způsobem monetizuješ?</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                            {q5Options.map((opt, i) => (
                                <div
                                    key={i}
                                    onClick={() => autoAdvance('q5', opt)}
                                    className={`p-5 rounded-xl border h-full cursor-pointer transition-colors flex items-center justify-center text-center font-bold text-sm md:text-base ${formData.q5 === opt ? 'border-brand-red bg-brand-red text-white' : 'border-white/10 bg-[#1A1A1A] hover:bg-[#252525] text-gray-400'}`}
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
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-6">4. Kolik jsi teď schopný/á investovat do růstu tvé os. značky?</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                            {q6Options.map((opt, i) => (
                                <div
                                    key={i}
                                    onClick={() => autoAdvance('q6', opt)}
                                    className={`p-5 rounded-xl border h-full cursor-pointer transition-colors flex items-center justify-center text-center font-bold text-sm md:text-base ${formData.q6 === opt ? 'border-brand-red bg-brand-red text-white' : 'border-white/10 bg-[#1A1A1A] hover:bg-[#252525] text-gray-400'}`}
                                >
                                    {opt}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 6:
                return (
                    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out] flex flex-col h-full">
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">5. {getQ7Prompt()}</h3>
                        <div className="flex-1 min-h-[200px]">
                            <textarea
                                required
                                value={formData.q7}
                                onChange={e => handleSelect('q7', e.target.value)}
                                className="w-full h-[250px] bg-[#1A1A1A] border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-brand-red focus:bg-[#252525] transition-colors resize-none placeholder:text-gray-600"
                                placeholder="Napiš svou upřímnou odpověď plnými větami. Je to velmi důležité pro náš start..."
                            />
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
                            style={{ width: `${(currentStep / 6) * 100}%` }}
                        />
                    </div>

                    <form onSubmit={handleSubmit} className="relative z-10 flex flex-col flex-1 mt-6">

                        <div className="flex-1">
                            {renderStepContent()}
                        </div>

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
                                    onClick={handleNext}
                                    disabled={!isStepValid()}
                                    className="px-10 ml-auto bg-brand-red hover:bg-[#cc0b00] disabled:bg-[#252525] disabled:text-gray-500 disabled:cursor-not-allowed text-white py-3 rounded-full font-bold transition-colors"
                                >
                                    Pokračovat
                                </button>
                            )}

                            {currentStep === 6 && (
                                <button
                                    type="submit"
                                    disabled={!isStepValid() || isSubmitting}
                                    className="flex-1 md:flex-none md:px-12 ml-auto bg-brand-red hover:bg-[#cc0b00] disabled:bg-[#252525] disabled:text-gray-500 disabled:cursor-not-allowed text-white py-3 rounded-full font-bold transition-colors flex justify-center items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        "Rezervovat hovor"
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </FadeUp>
        </section>
    );
};
