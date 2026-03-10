import type { Metadata } from "next";
import { helvetica, instrumentSerif } from "./fonts";
import "./globals.css";


export const metadata: Metadata = {
  title: "GrowBeyond | Tvůj Instagram jako byznys",
  description: "Proměň svůj Instagram na podnikání, které vydělává. Naučíme tě, jak na to pomocí našeho Creator Starter Packu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${helvetica.className} antialiased min-h-screen relative bg-[#111111] overflow-x-hidden`}>

        {/* CONTENT LAYER */}
        <main className="relative z-20">
          {children}
        </main>

      </body>
    </html>
  );
}