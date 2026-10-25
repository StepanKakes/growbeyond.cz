import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Beyond pro kouče a mentory",
  description: "Nastavíme ti osobní značku, získávání klientů a prodej tak, aby platící klienti chodili každý měsíc.",
};

export default function KouciLayout({ children }: { children: React.ReactNode }) {
  return children;
}
