"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CONSENT_KEY = "gb_cookie_consent"; // "accepted" | "rejected"

declare global {
    interface Window {
        clarity?: (...args: unknown[]) => void;
    }
}

const loadClarity = () => {
    if (document.getElementById("clarity-script")) return;
    const script = document.createElement("script");
    script.id = "clarity-script";
    script.async = true;
    script.innerHTML = `
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "vuqnag017s");
    `;
    document.head.appendChild(script);
};

export const CookieConsent = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem(CONSENT_KEY);
        if (consent === "accepted") {
            loadClarity();
        } else if (consent !== "rejected") {
            setVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem(CONSENT_KEY, "accepted");
        setVisible(false);
        loadClarity();
    };

    const handleReject = () => {
        localStorage.setItem(CONSENT_KEY, "rejected");
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-sm z-[200] bg-[#1A1A1A] border border-white/10 rounded-2xl p-5 shadow-2xl shadow-black/50">
            <p className="text-white text-sm font-bold mb-2">Cookies 🍪</p>
            <p className="text-gray-400 text-xs leading-relaxed mb-4">
                Používáme analytické cookies (Microsoft Clarity), abychom pochopili, jak web používáš,
                a mohli ho zlepšovat. Více v{" "}
                <Link
                    href="/ochrana-osobnich-udaju"
                    className="underline underline-offset-2 hover:text-white transition-colors"
                >
                    zásadách ochrany osobních údajů
                </Link>
                .
            </p>
            <div className="flex items-center gap-3">
                <button
                    onClick={handleAccept}
                    className="flex-1 bg-brand-red hover:bg-[#cc0b00] text-white text-sm font-bold px-5 py-2.5 rounded-full transition-colors"
                >
                    Přijmout
                </button>
                <button
                    onClick={handleReject}
                    className="flex-1 bg-transparent border border-white/15 hover:bg-white/5 text-gray-300 text-sm font-medium px-5 py-2.5 rounded-full transition-colors"
                >
                    Odmítnout
                </button>
            </div>
        </div>
    );
};
