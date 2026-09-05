"use client";

import React, { useState } from 'react';
import { getStoredUtm } from '@/lib/utm';
import { WEBINAR } from './webinarConfig';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phoneOk = (raw: string) => /^\+?\d{9,15}$/.test(raw.replace(/[\s\-().]/g, ''));

type Errors = { name?: string; email?: string; phone?: string; form?: string };

export const WebinarForm = ({ showDescription = true }: { showDescription?: boolean }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [errors, setErrors] = useState<Errors>({});
    const [status, setStatus] = useState<'idle' | 'submitting' | 'done'>('idle');

    const validate = (): Errors => {
        const e: Errors = {};
        if (name.trim().length < 2) e.name = 'Vyplň prosím své jméno.';
        if (!EMAIL_RE.test(email.trim())) e.email = 'Zkontroluj prosím email.';
        if (!phoneOk(phone)) e.phone = 'Zkontroluj prosím telefonní číslo.';
        return e;
    };

    const handleSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        if (status === 'submitting') return;
        const e = validate();
        setErrors(e);
        if (Object.keys(e).length) return;

        setStatus('submitting');
        try {
            const res = await fetch('/api/webinar-register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim(), utm: getStoredUtm() }),
            });
            const data = await res.json().catch(() => ({} as { ok?: boolean; error?: string; field?: keyof Errors }));
            if (res.ok && data?.ok) {
                setStatus('done');
                return;
            }
            const field = data?.field && ['name', 'email', 'phone'].includes(data.field) ? data.field : 'form';
            setErrors({ [field]: data?.error || 'Něco se pokazilo, zkus to prosím znovu.' });
            setStatus('idle');
        } catch {
            setErrors({ form: 'Něco se pokazilo, zkus to prosím znovu.' });
            setStatus('idle');
        }
    };

    const inputClass = (bad?: string) =>
        `w-full rounded-full bg-white/[0.04] border px-6 py-4 text-white text-base font-bold placeholder:text-white/40 focus:outline-none focus:bg-white/[0.07] transition-colors ${bad ? 'border-brand-red' : 'border-white/[0.16] focus:border-white/40'}`;

    if (status === 'done') {
        return (
            <div className="w-full max-w-[640px] rounded-3xl bg-white/[0.04] border border-white/10 p-6 md:p-9 text-center">
                <span className="mx-auto mb-5 w-14 h-14 rounded-full bg-brand-red flex items-center justify-center shadow-[0_0_24px_rgba(255,14,0,0.5)]">
                    <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M20 6L9 17l-5-5" />
                    </svg>
                </span>
                <h3 className="text-[22px] md:text-[28px] font-bold tracking-tight-custom leading-[1.15]">{WEBINAR.form.successTitle}</h3>
                <p className="mt-3 text-white/60 font-bold text-[15px] md:text-base leading-[1.4]">
                    {WEBINAR.form.successText} <span className="text-white">{email.trim()}</span>
                </p>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            noValidate
            className="w-full max-w-[640px] rounded-3xl bg-white/[0.04] border border-white/10 p-6 md:p-9 flex flex-col gap-3"
        >
            <h3 className="text-[22px] md:text-[28px] font-bold tracking-tight-custom leading-[1.15]">{WEBINAR.form.title}</h3>
            {showDescription && (
                <p className="text-white/55 font-bold text-[15px] md:text-base leading-[1.4]">{WEBINAR.form.description}</p>
            )}
            <div className="h-2" />

            <div>
                <label htmlFor="webinar-name" className="sr-only">Jméno</label>
                <input
                    id="webinar-name" name="name" type="text" autoComplete="name" placeholder="Jméno"
                    value={name}
                    onChange={e => { setName(e.target.value); if (errors.name) setErrors(p => ({ ...p, name: undefined })); }}
                    className={inputClass(errors.name)}
                />
                {errors.name && <p className="text-brand-red text-sm font-bold mt-2 px-2">{errors.name}</p>}
            </div>
            <div>
                <label htmlFor="webinar-email" className="sr-only">Email</label>
                <input
                    id="webinar-email" name="email" type="email" autoComplete="email" inputMode="email" placeholder="Email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: undefined })); }}
                    className={inputClass(errors.email)}
                />
                {errors.email && <p className="text-brand-red text-sm font-bold mt-2 px-2">{errors.email}</p>}
            </div>
            <div>
                <label htmlFor="webinar-phone" className="sr-only">Telefon</label>
                <input
                    id="webinar-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="Telefon"
                    value={phone}
                    onChange={e => { setPhone(e.target.value); if (errors.phone) setErrors(p => ({ ...p, phone: undefined })); }}
                    className={inputClass(errors.phone)}
                />
                {errors.phone && <p className="text-brand-red text-sm font-bold mt-2 px-2">{errors.phone}</p>}
            </div>

            <div className="h-1" />
            <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full bg-brand-red hover:bg-[#cc0b00] disabled:opacity-70 disabled:cursor-wait text-white py-[18px] rounded-full text-base font-bold tracking-tight-custom transition-colors flex items-center justify-center gap-2"
            >
                {status === 'submitting'
                    ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-label="Odesílám" />
                    : WEBINAR.form.submit}
            </button>
            {errors.form && <p className="text-brand-red text-sm font-bold text-center">{errors.form}</p>}
            <p className="text-white/40 text-xs font-bold leading-[1.4] text-center">
                {WEBINAR.form.consent}{' '}
                <a href="/ochrana-osobnich-udaju" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white">
                    Zásady ochrany osobních údajů
                </a>
            </p>
        </form>
    );
};
