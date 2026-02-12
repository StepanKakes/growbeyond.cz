"use client";

import React, { useState } from 'react';

export function ResourceForm() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: { [key: string]: string } = {};

        if (!firstName.trim()) newErrors.firstName = "Jméno je povinné.";
        if (!lastName.trim()) newErrors.lastName = "Příjmení je povinné.";
        if (!email.trim()) {
            newErrors.email = "Email je povinný.";
        } else if (!validateEmail(email)) {
            newErrors.email = "Zadejte platný email.";
        }
        if (!agreed) newErrors.agreed = "Musíte souhlasit s podmínkami.";

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            // Success! Mock download or API call
            alert("Formulář úspěšně odeslán!");
            // In a real scenario, trigger download logic here.
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                    <input
                        type="text"
                        placeholder="Jméno"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={`w-full bg-white rounded-xl px-5 py-3 text-black text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 shadow-lg ${errors.firstName ? 'ring-2 ring-red-500' : 'focus:ring-accent'}`}
                    />
                    {errors.firstName && <span className="text-red-500 text-xs pl-2">{errors.firstName}</span>}
                </div>
                <div className="flex flex-col gap-1">
                    <input
                        type="text"
                        placeholder="Příjmení"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={`w-full bg-white rounded-xl px-5 py-3 text-black text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 shadow-lg ${errors.lastName ? 'ring-2 ring-red-500' : 'focus:ring-accent'}`}
                    />
                    {errors.lastName && <span className="text-red-500 text-xs pl-2">{errors.lastName}</span>}
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full bg-white rounded-xl px-5 py-3 text-black text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 shadow-lg ${errors.email ? 'ring-2 ring-red-500' : 'focus:ring-accent'}`}
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
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent bg-transparent"
                    />
                    <label htmlFor="terms" className={`text-xs leading-tight ${errors.agreed ? 'text-red-500' : 'text-gray-400'}`}>
                        Odesláním formuláře udělujete souhlas se zpracováním osobních údajů za účelem zasílání obchodních sdělení a kontaktování ze strany Beyond.
                    </label>
                </div>
            </div>

            <button
                type="submit"
                className="bg-[#FF0E00] hover:bg-red-600 text-white text-sm font-bold uppercase tracking-wider px-10 py-3 rounded-xl transition-colors duration-200 shadow-xl shadow-red-900/20"
            >
                STÁHNOUT
            </button>
        </form>
    );
}
