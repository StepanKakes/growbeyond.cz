import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Beyond pro zakladatele a podnikatele",
  description: "Osobní značka zakladatele, se kterou se odbornost firmy dostane k lidem, kteří nakupují.",
};

export default function PodnikateleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
