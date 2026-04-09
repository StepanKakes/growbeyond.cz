import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Beyond | 1:1 Mentorship — Tvůj Instagram jako byznys",
    description: "Pomůžeme ti implementovat náš statisícový funnel. Získej kvalitnější klienty a dosahuj stabilně šestimístných příjmů. Přihlaš se na strategický hovor.",
};

export default function MentorshipLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <>{children}</>;
}
