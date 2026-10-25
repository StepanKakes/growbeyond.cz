import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Beyond pro zakladatele a podnikatele",
  description: "Osobní značka, která ti přinese kontakty, status, peníze a příležitosti.",
};

export default function PodnikateleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
