"use client";

import React, { useEffect, useRef, useState } from 'react';
import { WebinarForm } from './WebinarForm';
import { WEBINAR, webinarDate } from './webinarConfig';
import { WEBINAR_FORM_EVENT } from './formEvents';

// Registrační popup. Otevírá se událostí z libovolného CTA, zavírá křížkem,
// klikem mimo nebo klávesou Escape. Při otevření zamkne scroll stránky.
export const WebinarFormModal = () => {
    const [open, setOpen] = useState(false);
    const closeRef = useRef<HTMLButtonElement>(null);
    const { display, weekday } = webinarDate();

    useEffect(() => {
        const handler = () => setOpen(true);
        window.addEventListener(WEBINAR_FORM_EVENT, handler);
        return () => window.removeEventListener(WEBINAR_FORM_EVENT, handler);
    }, []);

    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
        window.addEventListener('keydown', onKey);
        closeRef.current?.focus();
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener('keydown', onKey);
        };
    }, [open]);

    if (!open) return null;

    return (
        <div
            data-lenis-prevent
            className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6 overscroll-contain"
            role="dialog"
            aria-modal="true"
            aria-labelledby="webinar-form-title"
        >
            <button type="button" aria-label="Zavřít" className="absolute inset-0 bg-black/80" onClick={() => setOpen(false)} />
            <div className="relative z-10 w-full sm:max-w-[560px] max-h-[100dvh] sm:max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-[#111111] border border-white/10 px-5 py-6 sm:px-10 sm:py-10">
                <div className="flex items-start justify-between gap-6">
                    <div>
                        <p className="text-sm text-white/55">{weekday} {display} v {WEBINAR.time}, {WEBINAR.hero.live}</p>
                        <h2 id="webinar-form-title" className="mt-2 text-2xl sm:text-[30px] font-bold tracking-[-0.02em] leading-[1.15]">{WEBINAR.form.title}</h2>
                    </div>
                    <button
                        ref={closeRef}
                        type="button"
                        onClick={() => setOpen(false)}
                        aria-label="Zavřít"
                        className="shrink-0 -mr-2 -mt-1 flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <p className="mt-3 text-[17px] text-white/70 leading-[1.55]">{WEBINAR.form.description}</p>
                <div className="mt-7">
                    <WebinarForm />
                </div>
            </div>
        </div>
    );
};
