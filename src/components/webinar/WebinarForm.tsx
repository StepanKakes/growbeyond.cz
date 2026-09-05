"use client";

import React, { useId, useState } from 'react';
import { getStoredUtm } from '@/lib/utm';
import { WEBINAR } from './webinarConfig';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phoneOk = (raw: string) => /^\+?\d{9,15}$/.test(raw.replace(/[\s\-().]/g, ''));

type Errors = { name?: string; email?: string; phone?: string; form?: string };

const FIELDS: { key: keyof Omit<Errors, 'form'>; label: string; placeholder: string; type: string; autoComplete: string; inputMode?: 'email' | 'tel' }[] = [
    { key: 'name', label: 'Jméno', placeholder: 'Jan Novák', type: 'text', autoComplete: 'name' },
    { key: 'email', label: 'Email', placeholder: 'jan@firma.cz', type: 'email', autoComplete: 'email', inputMode: 'email' },
    { key: 'phone', label: 'Telefon', placeholder: '+420 777 123 456', type: 'tel', autoComplete: 'tel', inputMode: 'tel' },
];

export const WebinarForm = () => {
    const uid = useId();
    const [values, setValues] = useState({ name: '', email: '', phone: '' });
    const [errors, setErrors] = useState<Errors>({});
    const [status, setStatus] = useState<'idle' | 'submitting' | 'done'>('idle');

    const validate = (): Errors => {
        const e: Errors = {};
        if (values.name.trim().length < 2) e.name = 'Doplň prosím jméno.';
        if (!EMAIL_RE.test(values.email.trim())) e.email = 'Email nevypadá správně. Zkontroluj ho prosím.';
        if (!phoneOk(values.phone)) e.phone = 'Telefon zadej včetně předvolby, například +420 777 123 456.';
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
                body: JSON.stringify({ name: values.name.trim(), email: values.email.trim(), phone: values.phone.trim(), utm: getStoredUtm() }),
            });
            const data = await res.json().catch(() => ({} as { ok?: boolean; error?: string; field?: string }));
            if (res.ok && data?.ok) {
                setStatus('done');
                return;
            }
            const field = data?.field && ['name', 'email', 'phone'].includes(data.field) ? (data.field as keyof Errors) : 'form';
            setErrors({ [field]: data?.error || 'Odeslání se nepovedlo. Zkus to prosím za chvíli znovu.' });
            setStatus('idle');
        } catch {
            setErrors({ form: 'Odeslání se nepovedlo. Zkontroluj připojení a zkus to znovu.' });
            setStatus('idle');
        }
    };

    if (status === 'done') {
        return (
            <div className="w-full max-w-[480px]" role="status" aria-live="polite">
                <h3 className="text-2xl md:text-[28px] font-bold tracking-[-0.02em] leading-[1.15]">{WEBINAR.form.successTitle}</h3>
                <p className="mt-3 text-white/70 text-[17px] md:text-lg leading-[1.55]">
                    {WEBINAR.form.successText} <span className="text-white">{values.email.trim()}</span>.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} noValidate className="w-full max-w-[480px] flex flex-col gap-5">
            {FIELDS.map(f => {
                const id = `${uid}-${f.key}`;
                const err = errors[f.key];
                return (
                    <div key={f.key} className="flex flex-col gap-2">
                        <label htmlFor={id} className="text-sm text-white/70">{f.label}</label>
                        <input
                            id={id}
                            name={f.key}
                            type={f.type}
                            inputMode={f.inputMode}
                            autoComplete={f.autoComplete}
                            placeholder={f.placeholder}
                            value={values[f.key]}
                            aria-invalid={err ? true : undefined}
                            aria-describedby={err ? `${id}-error` : undefined}
                            onChange={e => {
                                const v = e.target.value;
                                setValues(p => ({ ...p, [f.key]: v }));
                                if (err) setErrors(p => ({ ...p, [f.key]: undefined }));
                            }}
                            className={`h-12 w-full rounded-lg border bg-transparent px-4 text-[17px] text-white placeholder:text-white/45 transition-colors focus:outline-none focus-visible:border-white ${err ? 'border-brand-red' : 'border-white/20 hover:border-white/35'}`}
                        />
                        {err && <p id={`${id}-error`} className="text-sm text-brand-red">{err}</p>}
                    </div>
                );
            })}

            <button
                type="submit"
                disabled={status === 'submitting'}
                className="mt-1 h-13 w-full rounded-full bg-brand-red px-8 text-base font-bold text-white transition-colors hover:bg-[#d40c00] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-wait disabled:opacity-70"
            >
                {status === 'submitting' ? 'Odesílám' : WEBINAR.form.submit}
            </button>
            {errors.form && <p className="text-sm text-brand-red" role="alert">{errors.form}</p>}
            <p className="text-sm text-white/50 leading-[1.5]">
                {WEBINAR.form.consent}{' '}
                <a href="/ochrana-osobnich-udaju" target="_blank" rel="noopener noreferrer" className="underline underline-offset-[3px] hover:text-white">
                    Zásady ochrany osobních údajů
                </a>
            </p>
        </form>
    );
};
