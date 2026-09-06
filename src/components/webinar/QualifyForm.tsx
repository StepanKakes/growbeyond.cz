"use client";

import React, { useState } from 'react';

// Dotazník na děkovačce. Nepovinný, ale odpovědi dají týmu vědět, komu se
// vyplatí napsat osobně, a po webináři slouží jako první vrstva kvalifikace.

type Choice = { value: string; label: string };

const REVENUE: Choice[] = [
    { value: 'do-50', label: 'Do 50 tisíc měsíčně' },
    { value: '50-150', label: '50 až 150 tisíc měsíčně' },
    { value: '150-500', label: '150 až 500 tisíc měsíčně' },
    { value: 'nad-500', label: 'Nad 500 tisíc měsíčně' },
];

const TEAM: Choice[] = [
    { value: 'sam', label: 'Dělám na tom sám' },
    { value: '1-3', label: 'Jsme 1 až 3 lidi' },
    { value: 'vic', label: 'Máme víc než 3 lidi' },
];

const Group = ({
    legend,
    name,
    options,
    value,
    onChange,
}: {
    legend: string;
    name: string;
    options: Choice[];
    value: string;
    onChange: (v: string) => void;
}) => (
    <fieldset className="border-0 p-0 m-0">
        <legend className="text-sm text-white/50 mb-3">{legend}</legend>
        <div className="border-t border-white/10">
            {options.map(o => {
                const active = value === o.value;
                return (
                    <label
                        key={o.value}
                        className={`flex cursor-pointer items-center gap-4 border-b border-white/10 py-4 text-[17px] md:text-[19px] transition-colors ${
                            active ? 'text-white' : 'text-white/65 hover:text-white'
                        }`}
                    >
                        <input
                            type="radio"
                            name={name}
                            value={o.value}
                            checked={active}
                            onChange={() => onChange(o.value)}
                            className="sr-only"
                        />
                        <span
                            aria-hidden="true"
                            className={`h-[18px] w-[18px] shrink-0 rounded-full border transition-colors ${
                                active ? 'border-brand-red bg-brand-red' : 'border-white/30'
                            }`}
                        />
                        {o.label}
                    </label>
                );
            })}
        </div>
    </fieldset>
);

export const QualifyForm = ({ token }: { token: string }) => {
    const [revenue, setRevenue] = useState('');
    const [team, setTeam] = useState('');
    const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');

    const submit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        if (status === 'submitting' || !revenue || !team) return;
        setStatus('submitting');
        try {
            const res = await fetch('/api/webinar/kvalifikace', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, revenue, team }),
            });
            setStatus(res.ok ? 'done' : 'error');
        } catch {
            setStatus('error');
        }
    };

    if (status === 'done') {
        return (
            <p className="text-[18px] md:text-[21px] text-white/70 leading-[1.5]" role="status">
                Díky, mám to. Uvidíme se na webináři
            </p>
        );
    }

    return (
        <form onSubmit={submit} className="flex flex-col gap-10">
            <Group legend="Kolik teď děláš" name="revenue" options={REVENUE} value={revenue} onChange={setRevenue} />
            <Group legend="Jak jste na tom s týmem" name="team" options={TEAM} value={team} onChange={setTeam} />

            <div className="flex flex-wrap items-center gap-4">
                <button
                    type="submit"
                    disabled={status === 'submitting' || !revenue || !team}
                    className="h-13 rounded-full bg-brand-red px-8 text-base font-bold text-white transition-colors hover:bg-[#d40c00] disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {status === 'submitting' ? 'Ukládám' : 'Odeslat'}
                </button>
                {status === 'error' && (
                    <p className="text-sm text-brand-red" role="alert">
                        Nepovedlo se to uložit, zkus to prosím znovu
                    </p>
                )}
            </div>
        </form>
    );
};
