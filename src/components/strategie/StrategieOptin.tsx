"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FadeUp } from '../FadeUp';
import { getStoredUtm } from '@/lib/utm';

type IgPreview = {
    state: 'idle' | 'loading' | 'found' | 'not_found';
    profile?: { username: string; profilePicUrl: string };
};

const incomeOptions = ['Nic', 'Do 50 tisíc Kč', '50 - 80 tisíc Kč', '80 - 120 tisíc Kč', 'Více než 120 tisíc Kč'];

export const StrategieOptin = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [ig, setIg] = useState('');
    const [income, setIncome] = useState('');
    const [errors, setErrors] = useState<{ email?: string; ig?: string }>({});
    const [submitting, setSubmitting] = useState(false);
    const [igPreview, setIgPreview] = useState<IgPreview>({ state: 'idle' });

    const normIg = (raw: string) =>
        raw.trim().replace(/^@+/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/\/+$/, '').split(/[/?#]/)[0];

    const lookupIg = async () => {
        const h = normIg(ig);
        if (!h || h.length < 2) { setIgPreview({ state: 'idle' }); return; }
        setIgPreview({ state: 'loading' });
        try {
            const res = await fetch(`/api/ig-lookup?username=${encodeURIComponent(h)}`);
            const data = await res.json();
            if (data?.found && data.profile) setIgPreview({ state: 'found', profile: data.profile });
            else if (data?.uncertain) setIgPreview({ state: 'idle' });
            else setIgPreview({ state: 'not_found' });
        } catch { setIgPreview({ state: 'idle' }); }
    };

    const isValid = email.includes('@') && ig.trim() !== '' && income !== '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid || submitting) return;
        setSubmitting(true);
        setErrors({});

        // 1) Instantní validace e-mailu + IG
        try {
            const v = await fetch('/api/validate-lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, igHandle: ig }),
            });
            const vd = await v.json().catch(() => ({ ok: true }));
            if (vd?.ok === false && vd.errors && (vd.errors.email || vd.errors.igHandle)) {
                setErrors({ email: vd.errors.email, ig: vd.errors.igHandle });
                setSubmitting(false);
                return;
            }
        } catch { /* fail-open */ }

        // 2) Clarity identify (kontakt → nahrávka v dashboardu)
        let clarityUserId = '';
        try {
            const handle = '@' + normIg(ig);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const clarity = (window as any).clarity;
            if (typeof clarity === 'function') {
                const p = clarity('identify', email, undefined, undefined, handle);
                clarity('set', 'lead_email', email);
                clarity('set', 'lead_ig', handle);
                clarity('upgrade', 'lead-optin');
                if (p && typeof p.then === 'function') clarityUserId = (await p)?.id || '';
            }
        } catch { /* clarity nemusí být */ }

        // 3) Vytvoř lead → redirect na jeho unikátní stránku
        try {
            const res = await fetch('/api/mentorship-submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, igHandle: ig, q4: income, clarityUserId, utm: getStoredUtm() }),
            });
            const data = await res.json().catch(() => ({} as { id?: string }));
            if (data?.id) {
                router.push(`/strategie/${data.id}`);
                return;
            }
            // fallback: bez id nemůžeme na unikátní stránku
            setErrors({ email: 'Něco se pokazilo, zkus to prosím znovu.' });
            setSubmitting(false);
        } catch {
            setErrors({ email: 'Něco se pokazilo, zkus to prosím znovu.' });
            setSubmitting(false);
        }
    };

    return (
        <section id="optin" className="pt-4 pb-12 px-4 relative z-20 w-full">
            <FadeUp>
                <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-[#131313] border border-white/10 rounded-2xl p-6 md:p-8">
                    <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight-custom text-center mb-6">
                        Získej okamžitý přístup k&nbsp;našemu bezplatnému tréninku
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <input
                                required type="email" value={email}
                                onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: undefined })); }}
                                placeholder="email@gmail.com"
                                className={`w-full bg-[#1A1A1A] border rounded-xl px-5 py-4 text-white focus:outline-none focus:bg-[#252525] transition-colors placeholder:text-gray-600 ${errors.email ? 'border-brand-red' : 'border-white/10 focus:border-brand-red'}`}
                            />
                            {errors.email && <p className="text-brand-red text-sm mt-2">{errors.email}</p>}
                        </div>
                        <div>
                            <input
                                required type="text" value={ig}
                                onChange={e => { setIg(e.target.value); if (errors.ig) setErrors(p => ({ ...p, ig: undefined })); if (igPreview.state !== 'idle') setIgPreview({ state: 'idle' }); }}
                                onBlur={lookupIg}
                                placeholder="@tvuj_instagram"
                                className={`w-full bg-[#1A1A1A] border rounded-xl px-5 py-4 text-white focus:outline-none focus:bg-[#252525] transition-colors placeholder:text-gray-600 ${errors.ig ? 'border-brand-red' : 'border-white/10 focus:border-brand-red'}`}
                            />
                            {errors.ig && <p className="text-brand-red text-sm mt-2">{errors.ig}</p>}
                            {igPreview.state === 'loading' && (
                                <div className="flex items-center gap-2 mt-3 text-gray-400 text-sm">
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Hledám profil…
                                </div>
                            )}
                            {igPreview.state === 'found' && igPreview.profile && (
                                <div className="flex items-center gap-3 mt-3 p-3 rounded-xl bg-[#1A1A1A] border border-green-500/40 animate-[fadeIn_0.3s_ease-out]">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={`/api/ig-avatar?username=${encodeURIComponent(igPreview.profile.username)}&url=${encodeURIComponent(igPreview.profile.profilePicUrl)}`} alt="" className="w-10 h-10 rounded-full object-cover border border-white/10 bg-[#262626] shrink-0" />
                                    <span className="text-white font-bold truncate flex-1 min-w-0">@{igPreview.profile.username}</span>
                                    <svg className="w-5 h-5 text-green-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                                </div>
                            )}
                            {igPreview.state === 'not_found' && !errors.ig && (
                                <p className="text-brand-red text-sm mt-2">Tenhle účet jsme nenašli. Zkontroluj username.</p>
                            )}
                        </div>

                        {/* Příjem — seznam pod sebou (radio styl) */}
                        <div>
                            <label className="block text-white font-medium mb-2 uppercase text-xs tracking-wider opacity-80">Kolik ti teď měsíčně vydělává tvoje podnikání?</label>
                            <div className="flex flex-col gap-2">
                                {incomeOptions.map(opt => {
                                    const selected = income === opt;
                                    return (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => setIncome(opt)}
                                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-colors ${selected ? 'border-brand-red bg-brand-red/10' : 'border-white/10 bg-[#1A1A1A] hover:bg-[#252525]'}`}
                                        >
                                            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${selected ? 'border-brand-red' : 'border-white/30'}`}>
                                                {selected && <span className="w-2.5 h-2.5 rounded-full bg-brand-red" />}
                                            </span>
                                            <span className={`text-sm md:text-base font-bold ${selected ? 'text-white' : 'text-white/80'}`}>{opt}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit" disabled={!isValid || submitting}
                        className="w-full mt-6 bg-brand-red hover:bg-[#cc0b00] disabled:bg-[#252525] disabled:text-gray-500 disabled:cursor-not-allowed text-white py-4 rounded-full text-base font-bold uppercase tracking-tight-custom transition-colors flex items-center justify-center gap-2"
                    >
                        {submitting ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Zhlédnout bezplatný trénink'}
                    </button>
                    <p className="text-gray-500 text-xs leading-relaxed mt-4 text-center">
                        Pokračováním souhlasíš se zpracováním osobních údajů dle{' '}
                        <a href="/ochrana-osobnich-udaju" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white">zásad ochrany osobních údajů</a>.
                    </p>
                </form>
            </FadeUp>
        </section>
    );
};
