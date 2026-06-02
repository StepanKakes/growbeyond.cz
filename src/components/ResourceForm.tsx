"use client";

import React, { useState, useEffect } from 'react';
import { instrumentSerif, helvetica } from "@/app/fonts";

interface ResourceFormProps {
    plunkEvent?: string;
    formId?: string;
    tagId?: string;
    redirectUrl?: string;
    buttonText?: string;
    sequenceId?: string;
}

export function ResourceForm({ plunkEvent, formId, tagId, redirectUrl, buttonText, sequenceId }: ResourceFormProps) {
    const [firstName, setFirstName] = useState('');
    const [email, setEmail] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (status === 'success' && redirectUrl) {
            const timer = setTimeout(() => {
                window.location.href = redirectUrl;
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [status, redirectUrl]);

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: { [key: string]: string } = {};

        if (!firstName.trim()) newErrors.firstName = "Jméno je povinné.";
        if (!email.trim()) {
            newErrors.email = "Email je povinný.";
        } else if (!validateEmail(email)) {
            newErrors.email = "Zadejte platný email.";
        }
        if (!agreed) newErrors.agreed = "Musíte souhlasit s podmínkami.";

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            setStatus('loading');
            setMessage('');

            try {
                const response = await fetch('/api/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email,
                        firstName,
                        plunkEvent,
                        formId,
                        tagId,
                        sequenceId,
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    setStatus('success');
                    // Success state now handled by conditional rendering
                } else {
                    setStatus('error');
                    setMessage(data.error || 'Něco se nepovedlo. Zkuste to prosím znovu.');
                }
            } catch (error) {
                setStatus('error');
                setMessage('Nepodařilo se připojit k serveru. Zkontrolujte prosím své připojení.');
            }
        }
    };

    if (status === 'success') {
        return (
            <div className="space-y-6 max-w-lg py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <p className={`${helvetica.className} text-xl lg:text-2xl font-bold text-white leading-tight uppercase tracking-tight`}>
                    Super, máš to tam! Odkaz na tvůj resource už letí k tobě do schránky.
                    <span className="block mt-4 text-gray-400 text-base lg:text-lg font-normal normal-case tracking-normal">
                        Vydrž vteřinu, hned tě přesměrujeme.
                    </span>
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <div className="flex flex-col gap-1">
                <input
                    type="text"
                    placeholder="Jméno"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={status === 'loading'}
                    className={`w-full bg-white rounded-xl px-5 py-3 text-black text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 shadow-lg ${errors.firstName ? 'ring-2 ring-red-500' : 'focus:ring-accent'} disabled:opacity-50`}
                />
                {errors.firstName && <span className="text-red-500 text-xs pl-2">{errors.firstName}</span>}
            </div>

            <div className="flex flex-col gap-1">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === 'loading'}
                    className={`w-full bg-white rounded-xl px-5 py-3 text-black text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 shadow-lg ${errors.email ? 'ring-2 ring-red-500' : 'focus:ring-accent'} disabled:opacity-50`}
                />
                {errors.email && <span className="text-red-500 text-xs pl-2">{errors.email}</span>}
            </div>

            <div className="flex flex-col gap-1">
                <div className="flex items-start gap-3 py-1">
                    <input
                        type="checkbox"
                        id="terms"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        disabled={status === 'loading'}
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent bg-transparent disabled:opacity-50"
                    />
                    <label htmlFor="terms" className={`text-xs leading-tight ${errors.agreed ? 'text-red-500' : 'text-gray-400'}`}>
                        Souhlasím se zpracováním osobních údajů dle{' '}
                        <a
                            href="/ochrana-osobnich-udaju"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline underline-offset-2 hover:text-white transition-colors"
                        >
                            zásad ochrany osobních údajů
                        </a>
                        {' '}a se zasíláním obsahových e-mailů, ze kterých se můžu kdykoliv odhlásit.
                    </label>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="bg-[#FF0E00] hover:bg-red-600 text-white text-sm font-bold uppercase tracking-wider px-10 py-3 rounded-xl transition-colors duration-200 shadow-xl shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {status === 'loading' ? 'ODESÍLÁM...' : (buttonText || 'STÁHNOUT')}
                </button>

                {message && status === 'error' && (
                    <div className="text-sm py-2 px-4 rounded-lg bg-red-500/10 text-red-500">
                        {message}
                    </div>
                )}
            </div>
        </form>
    );
}
