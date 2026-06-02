import type { Metadata } from "next";
import { helvetica, instrumentSerif } from "./fonts";
import "./globals.css";
import { CookieConsent } from "@/components/CookieConsent";

export const metadata: Metadata = {
  title: "Pro kouče, podnikatele a tvůrce",
  description: "Proměň svůj Instagram na podnikání, které vydělává. Naučíme tě, jak na to pomocí našeho Creator Starter Packu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body className={`${helvetica.className} antialiased min-h-screen relative bg-[#111111] overflow-x-hidden`}>

        {/* CONTENT LAYER */}
        <main className="relative z-20">
          {children}
        </main>

        {/* Cookie lišta — Clarity se načte až po souhlasu */}
        <CookieConsent />

      </body>
    </html>
  );
}
