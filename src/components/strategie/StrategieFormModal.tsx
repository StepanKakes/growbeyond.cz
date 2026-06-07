"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { STRATEGIE_FORM_EVENT } from './strategieForm';

const ApplicationForm = dynamic(
    () => import('@/components/mentorship/ApplicationForm').then(m => m.ApplicationForm),
    { ssr: false }
);

export const StrategieFormModal = () => {
    const [open, setOpen] = useState(false);

    // Otevři na globální event z libovolného CTA
    useEffect(() => {
        const handler = () => setOpen(true);
        window.addEventListener(STRATEGIE_FORM_EVENT, handler);
        return () => window.removeEventListener(STRATEGIE_FORM_EVENT, handler);
    }, []);

    // Zamkni scroll pozadí + zavři na Escape
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener('keydown', onKey);
        };
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-center px-0 md:px-6 py-0 md:py-8 animate-[fadeIn_0.2s_ease-out]">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/85 backdrop-blur-sm"
                onClick={() => setOpen(false)}
            />

            {/* Dialog */}
            <div className="relative z-10 w-full md:max-w-3xl flex flex-col max-h-[100dvh] md:max-h-[92vh]">
                <div className="flex justify-end p-3 md:p-2 shrink-0">
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        aria-label="Zavřít"
                        className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-white/15 text-white flex items-center justify-center hover:bg-[#252525] transition-colors"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 px-2 pb-8">
                    <ApplicationForm redirectMode />
                </div>
            </div>
        </div>
    );
};
