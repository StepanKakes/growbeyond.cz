"use client";

import React, { useState } from 'react';

// Vstupní formulář free programu na LP: IG username + email → /api/program/join
// → rovnou redirect na /program/[id] (analýza + diagnostika). Nahrazuje dřívější
// CTA "napiš START do DM".

export const ProgramJoin = ({ initialUsername = '' }: { initialUsername?: string }) => {
    const [username, setUsername] = useState(initialUsername);
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        setError('');
        try {
            const res = await fetch('/api/program/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email }),
            });
            const data = await res.json().catch(() => null);
            if (data?.ok && data.next) {
                window.location.href = data.next;
                return;
            }
            setError(res.status === 400
                ? 'Zkontroluj prosím Instagram jméno a email.'
                : 'Něco se pokazilo, zkus to prosím znovu.');
        } catch {
            setError('Něco se pokazilo, zkus to prosím znovu.');
        }
        setSubmitting(false);
    };

    return (
        <form onSubmit={submit} className="w-full max-w-[420px] flex flex-col gap-3">
            <div className="flex items-center rounded-xl border border-white/[0.14] bg-white/[0.04] focus-within:border-brand-red transition-colors">
                <span className="pl-4 text-white/40 text-[16px] select-none">@</span>
                <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="tvůj Instagram"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    required
                    className="w-full bg-transparent px-2 py-3.5 text-white text-[16px] placeholder-white/40 outline-none"
                />
            </div>
            <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tvůj email"
                required
                className="w-full rounded-xl border border-white/[0.14] bg-white/[0.04] px-4 py-3.5 text-white text-[16px] placeholder-white/40 focus:border-brand-red outline-none transition-colors"
            />
            <button
                type="submit"
                disabled={submitting}
                className="mt-1 bg-brand-red hover:bg-[#cc0b00] disabled:opacity-60 text-white px-8 py-4 rounded-full text-[15px] font-bold tracking-[0.02em] uppercase transition-colors cursor-pointer border-0"
            >
                {submitting ? 'Otevírám program…' : 'Vstoupit do programu'}
            </button>
            {error && <p className="m-0 text-brand-red text-sm">{error}</p>}
            <p className="m-0 text-white/50 text-[13px] leading-[1.6]">
                Přístup dostaneš okamžitě. Videa ti budeme posílat na Instagram a na email.
            </p>
        </form>
    );
};
