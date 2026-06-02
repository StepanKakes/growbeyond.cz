import Link from "next/link";
import { LEGAL } from "@/lib/legal";

export const LegalFooter = () => {
    return (
        <div className="relative z-20 bg-[#0c0c0c] border-t border-white/5 py-8 px-6">
            <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                <div className="text-gray-500 text-xs leading-relaxed">
                    <p>
                        {LEGAL.name} · IČO: {LEGAL.ico} · {LEGAL.address}
                    </p>
                    <p className="mt-1">
                        {LEGAL.registration}{" "}
                        <a
                            href={`mailto:${LEGAL.email}`}
                            className="hover:text-white transition-colors underline underline-offset-2"
                        >
                            {LEGAL.email}
                        </a>
                    </p>
                </div>
                <div className="flex items-center gap-5 text-xs text-gray-500 shrink-0">
                    <Link
                        href="/obchodni-podminky"
                        className="hover:text-white transition-colors"
                    >
                        Obchodní podmínky
                    </Link>
                    <Link
                        href="/ochrana-osobnich-udaju"
                        className="hover:text-white transition-colors"
                    >
                        Ochrana osobních údajů
                    </Link>
                </div>
            </div>
        </div>
    );
};
