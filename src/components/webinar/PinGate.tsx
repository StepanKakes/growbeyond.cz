"use client";

import React, { useState } from 'react';

// Přihlášení k internímu přehledu. Používá stejný PIN a cookie jako ostatní
// interní stránky (scope internal), takže se Tim hlásí jen jednou týdně.

export const PinGate = () => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const submit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        if (busy || !pin) return;
        setBusy(true);
        setError('');
        try {
            const res = await fetch('/api/sop/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin, scope: 'internal' }),
            });
            if (res.ok) {
                window.location.reload();
                return;
            }
            setError('Tenhle PIN nesedí');
        } catch {
            setError('Přihlášení se nepovedlo, zkus to znovu');
        }
        setBusy(false);
    };

    return (
        <main className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center px-5">
            <form onSubmit={submit} className="w-full max-w-[360px] flex flex-col gap-5">
                <h1 className="text-[28px] font-bold tracking-[-0.02em]">Interní přehled</h1>
                <div className="flex flex-col gap-2">
                    <label htmlFor="pin" className="text-sm text-white/50">PIN</label>
                    <input
                        id="pin"
                        type="password"
                        inputMode="numeric"
                        autoComplete="current-password"
                        value={pin}
                        onChange={e => setPin(e.target.value)}
                        className="h-12 w-full rounded-lg border border-white/20 bg-transparent px-4 text-[17px] text-white transition-colors hover:border-white/35 focus:outline-none focus-visible:border-white"
                    />
                </div>
                <button
                    type="submit"
                    disabled={busy || !pin}
                    className="h-12 rounded-full bg-brand-red px-8 text-base font-bold text-white transition-colors hover:bg-[#d40c00] disabled:opacity-40"
                >
                    {busy ? 'Ověřuju' : 'Vstoupit'}
                </button>
                {error && <p className="text-sm text-brand-red" role="alert">{error}</p>}
            </form>
        </main>
    );
};
