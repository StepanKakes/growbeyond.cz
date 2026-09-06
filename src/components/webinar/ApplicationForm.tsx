"use client";

import React, { useState } from 'react';

// Přihláška na hovor po webináři. Tvrdší kvalifikace než dotazník na
// děkovačce: kdo projde, jde rovnou do kalendáře, kdo neprojde, dostane
// slušné vysvětlení a zůstává v sekvenci.

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

const BUDGET: Choice[] = [
    { value: 'nic', label: 'Zatím nechci investovat nic' },
    { value: 'do-20', label: 'Do 20 tisíc' },
    { value: '20-50', label: '20 až 50 tisíc' },
    { value: 'nad-50', label: 'Nad 50 tisíc' },
];

const WHEN: Choice[] = [
    { value: 'hned', label: 'Chci začít hned' },
    { value: 'mesic', label: 'Během měsíce' },
    { value: 'ctvrtleti', label: 'Někdy do čtvrt roku' },
    { value: 'rozhlizim', label: 'Zatím se jen rozhlížím' },
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
                        <input type="radio" name={name} value={o.value} checked={active} onChange={() => onChange(o.value)} className="sr-only" />
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

export const ApplicationForm = ({ token, defaultName, defaultEmail }: { token: string; defaultName?: string; defaultEmail?: string }) => {
    const [name, setName] = useState(defaultName || '');
    const [email, setEmail] = useState(defaultEmail || '');
    const [revenue, setRevenue] = useState('');
    const [team, setTeam] = useState('');
    const [budget, setBudget] = useState('');
    const [when, setWhen] = useState('');
    const [blocker, setBlocker] = useState('');
    const [status, setStatus] = useState<'idle' | 'submitting' | 'rejected' | 'error'>('idle');

    const ready = name.trim().length > 1 && /\S+@\S+\.\S+/.test(email) && revenue && team && budget && when;

    const submit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        if (status === 'submitting' || !ready) return;
        setStatus('submitting');
        try {
            const res = await fetch('/api/webinar/prihlaska', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, name, email, revenue, team, budget, when, blocker }),
            });
            const data = (await res.json().catch(() => ({}))) as { ok?: boolean; qualified?: boolean; redirect?: string };
            if (!res.ok || !data.ok) {
                setStatus('error');
                return;
            }
            if (data.qualified && data.redirect) {
                window.location.assign(data.redirect);
                return;
            }
            setStatus('rejected');
        } catch {
            setStatus('error');
        }
    };

    if (status === 'rejected') {
        return (
            <div role="status">
                <h2 className="text-[28px] md:text-[40px] font-bold tracking-[-0.03em] leading-[1.1]">Díky za upřímnost</h2>
                <p className="mt-5 text-[18px] md:text-[21px] text-white/70 leading-[1.5] max-w-[46ch]">
                    Podle toho, co jsi vyplnil, by ti společná práce teď nedávala smysl a nechci ti brát čas ani peníze
                </p>
                <p className="mt-4 text-[18px] md:text-[21px] text-white/70 leading-[1.5] max-w-[46ch]">
                    Nechávám tě v mailech, posílám tam věci, které ti pomůžou i bez nás. Až se to změní, ozvi se
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={submit} className="flex flex-col gap-10">
            <div className="grid gap-5 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                    <label htmlFor="app-name" className="text-sm text-white/50">Jméno</label>
                    <input
                        id="app-name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        autoComplete="name"
                        className="h-12 w-full rounded-lg border border-white/20 bg-transparent px-4 text-[17px] text-white transition-colors hover:border-white/35 focus:outline-none focus-visible:border-white"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="app-email" className="text-sm text-white/50">Email</label>
                    <input
                        id="app-email"
                        type="email"
                        inputMode="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        autoComplete="email"
                        className="h-12 w-full rounded-lg border border-white/20 bg-transparent px-4 text-[17px] text-white transition-colors hover:border-white/35 focus:outline-none focus-visible:border-white"
                    />
                </div>
            </div>

            <Group legend="Kolik teď děláš" name="revenue" options={REVENUE} value={revenue} onChange={setRevenue} />
            <Group legend="Jak jste na tom s týmem" name="team" options={TEAM} value={team} onChange={setTeam} />
            <Group legend="Kolik jsi připraven do růstu investovat" name="budget" options={BUDGET} value={budget} onChange={setBudget} />
            <Group legend="Kdy s tím chceš začít" name="when" options={WHEN} value={when} onChange={setWhen} />

            <div className="flex flex-col gap-2">
                <label htmlFor="app-blocker" className="text-sm text-white/50">Co tě teď nejvíc brzdí</label>
                <textarea
                    id="app-blocker"
                    value={blocker}
                    onChange={e => setBlocker(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-white/20 bg-transparent p-4 text-[17px] text-white transition-colors hover:border-white/35 focus:outline-none focus-visible:border-white"
                />
            </div>

            <div className="flex flex-wrap items-center gap-4">
                <button
                    type="submit"
                    disabled={!ready || status === 'submitting'}
                    className="h-13 rounded-full bg-brand-red px-8 text-base font-bold text-white transition-colors hover:bg-[#d40c00] disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {status === 'submitting' ? 'Odesílám' : 'Odeslat přihlášku'}
                </button>
                {status === 'error' && (
                    <p className="text-sm text-brand-red" role="alert">
                        Nepovedlo se to odeslat, zkus to prosím znovu
                    </p>
                )}
            </div>
        </form>
    );
};
