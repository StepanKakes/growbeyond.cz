import type { Metadata } from "next";
import { helvetica, instrumentSerif } from "./fonts";
import "./globals.css";

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
      <body className={`${helvetica.className} antialiased min-h-screen relative bg-[#111111] overflow-x-hidden`}>

        {/* CONTENT LAYER */}
        <div className="relative z-20">
          {children}
        </div>

      </body>
    </html>
  );
}