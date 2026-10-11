"use client";

// PostHog: záznamy návštěv, cesta po webu a identifikace kontaktu po odeslání
// formuláře. Nahrazuje Microsoft Clarity. Načítá se až po souhlasu s cookies
// (CookieConsent), do té doby jsou všechny funkce tady no-op.
//
// Události jdou přes /ingest (rewrite v next.config.ts), ať je blokátory
// reklam nezahodí jako cizí doménu.

import type { PostHog } from 'posthog-js';
import { getStoredUtm, UTM_KEYS } from './utm';

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

let instance: PostHog | null = null;
let nacitani: Promise<PostHog | null> | null = null;
// Volání před načtením (identify hned po odeslání formuláře) se nezahodí
const fronta: ((ph: PostHog) => void)[] = [];

export function loadPostHog(): Promise<PostHog | null> {
    if (typeof window === 'undefined' || !KEY) return Promise.resolve(null);
    if (nacitani) return nacitani;
    nacitani = import('posthog-js').then(({ default: posthog }) => {
        posthog.init(KEY, {
            api_host: '/ingest',
            ui_host: 'https://eu.posthog.com',
            defaults: '2025-05-24',
            person_profiles: 'identified_only',
            capture_pageleave: true,
            session_recording: {
                // Hesla maskuje PostHog vždy, e-maily a telefony z formulářů taky
                maskInputOptions: { password: true, email: true, tel: true },
            },
        });
        const utm = getStoredUtm();
        const vlastnosti: Record<string, string> = {};
        UTM_KEYS.forEach(k => { if (utm[k]) vlastnosti[k] = utm[k] as string; });
        if (Object.keys(vlastnosti).length) posthog.register(vlastnosti);
        instance = posthog;
        fronta.splice(0).forEach(fn => fn(posthog));
        return posthog;
    }).catch(() => null);
    return nacitani;
}

const s = (fn: (ph: PostHog) => void) => {
    if (instance) fn(instance);
    else if (KEY) fronta.push(fn);
};

/** Distinct id je e-mail malými písmeny, stejně ho skládá server do odkazu na osobu. */
export function phIdentify(email: string, vlastnosti: Record<string, unknown> = {}): void {
    const id = email.trim().toLowerCase();
    if (!id) return;
    s(ph => ph.identify(id, { email: id, ...vlastnosti }));
}

export function phCapture(udalost: string, vlastnosti: Record<string, unknown> = {}): void {
    s(ph => ph.capture(udalost, vlastnosti));
}

/** Vlastnosti, které se přilepí ke všem dalším událostem v prohlížeči. */
export function phRegister(vlastnosti: Record<string, unknown>): void {
    s(ph => ph.register(vlastnosti));
}
