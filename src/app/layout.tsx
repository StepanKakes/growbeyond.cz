import type { Metadata } from "next";
import { helvetica, instrumentSerif } from "./fonts";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Beyond | Tvůj Instagram jako byznys",
  description: "Proměň svůj Instagram na podnikání, které vydělává. Naučíme tě, jak na to pomocí našeho Creator Starter Packu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script id="clarity-script" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "vuqnag017s");
          `}
        </Script>
      </head>
      <body className={`${helvetica.className} antialiased min-h-screen relative bg-[#111111] overflow-x-hidden`}>

        {/* CONTENT LAYER */}
        <main className="relative z-20">
          {children}
        </main>

      </body>
    </html>
  );
}