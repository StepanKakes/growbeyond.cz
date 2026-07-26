"use client";

import React, { useState } from 'react';

// Vstup do free programu na LP. Instagram se NIKDY nezadává ručně:
// - s ?u= (odkaz z Beo DM po keywordu "rentgen") nese username neviditelně;
//   tlačítko otevře popup jen s emailem → POST /api/program/join → /program/[id]
// - bez ?u= vede CTA do IG DM (keyword "rentgen" pošle zpátky odkaz s ?u=),
//   čímž se zároveň otevře konverzace a Beo může dál psát

const IG_DM_URL = 'https://ig.me/m/creationwithtim';

const BTN = 'inline-block bg-brand-red hover:bg-[#cc0b00] text-white px-9 py-4 rounded-full text-[15px] font-bold tracking-[0.02em] uppercase transition-colors no-underline cursor-pointer border-0';

export const ProgramJoin = ({ username = '' }: { username?: string }) => {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!username) {
        return (
            <div className="flex flex-col items-center gap-3">
                <a href={IG_DM_URL} className={BTN}>Napiš mi RENTGEN do DM</a>
                <p className="m-0 text-white/50 text-[13px] leading-[1.6] max-w-[40ch] text-center">
                    Napiš mi na Instagram slovo RENTGEN a obratem ti pošlu vstup do programu.
                </p>
            </div>
        );
    }

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
                ? 'Zkontroluj prosím email.'
                : 'Něco se pokazilo, zkus to prosím znovu.');
        } catch {
            setError('Něco se pokazilo, zkus to prosím znovu.');
        }
        setSubmitting(false);
    };

    return (
        <>
            <button type="button" onClick={() => setOpen(true)} className={BTN}>
                Vstoupit do programu
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/75 backdrop-blur-sm"
                    onClick={e => { if (e.target === e.currentTarget && !submitting) setOpen(false); }}
                >
                    <div className="relative w-full max-w-[400px] rounded-2xl border border-white/[0.12] bg-[#0C0C0C] p-7 pt-8">
                        {/* mřížka monitoru jako na dotazníku */}
                        <div
                            aria-hidden
                            className="absolute inset-0 rounded-2xl pointer-events-none"
                            style={{
                                backgroundImage:
                                    'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
                                backgroundSize: '28px 28px',
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => !submitting && setOpen(false)}
                            aria-label="Zavřít"
                            className="absolute right-4 top-3.5 bg-transparent border-0 p-1 text-white/40 hover:text-white text-[20px] leading-none cursor-pointer"
                        >
                            ×
                        </button>
                        <form onSubmit={submit} className="relative flex flex-col gap-4">
                            <p className="m-0 text-white text-[19px] font-bold leading-[1.35]">
                                Kam ti mám poslat přístup?
                            </p>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="tvůj email"
                                required
                                autoFocus
                                className="w-full rounded-xl border border-white/[0.14] bg-white/[0.04] px-4 py-3.5 text-white text-[16px] placeholder-white/40 focus:border-brand-red outline-none transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-brand-red hover:bg-[#cc0b00] disabled:opacity-60 text-white px-8 py-4 rounded-full text-[15px] font-bold tracking-[0.02em] uppercase transition-colors cursor-pointer border-0"
                            >
                                {submitting ? 'Otevírám program…' : 'Vstoupit do programu'}
                            </button>
                            {error && <p className="m-0 text-brand-red text-sm">{error}</p>}
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};
