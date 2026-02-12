import type { Metadata } from "next";
import localFont from "next/font/local";
import { Instrument_Serif } from "next/font/google";
import "./globals.css";

const helvetica = localFont({
  src: [
    {
      path: "./fonts/Helvetica.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Helvetica-Bold.woff",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/Helvetica-Oblique.woff",
      weight: "400",
      style: "italic",
    },
    {
      path: "./fonts/Helvetica-BoldOblique.woff",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-helvetica",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Notion Resources",
  description: "Curated resources from Notion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${helvetica.variable} ${instrumentSerif.variable} antialiased min-h-screen relative bg-[#111111] overflow-x-hidden`}>

        {/* CONTENT LAYER */}
        <div className="relative z-20">
          {children}
        </div>

      </body>
    </html>
  );
}