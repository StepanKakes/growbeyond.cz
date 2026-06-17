"use client";

import { useEffect } from 'react';
import { loadMetaPixel } from '@/lib/metaPixel';

const CONSENT_KEY = "gb_cookie_consent"; // sdíleno s CookieConsent

/**
 * Načte Meta Pixel jen na /strategie funnelu a jen po souhlasu s cookies.
 * - Při mountu: pokud už je souhlas udělen → načti hned.
 * - Jinak čekej na event z cookie lišty (gb-cookie-consent-accepted).
 */
export const MetaPixel = () => {
    useEffect(() => {
        if (localStorage.getItem(CONSENT_KEY) === "accepted") {
            loadMetaPixel();
            return;
        }
        const onAccept = () => loadMetaPixel();
        window.addEventListener("gb-cookie-consent-accepted", onAccept);
        return () => window.removeEventListener("gb-cookie-consent-accepted", onAccept);
    }, []);

    return null;
};
