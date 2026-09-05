import type { Metadata } from 'next';
import { WEBINAR } from '@/components/webinar/webinarConfig';

export const metadata: Metadata = {
    title: '2030 začíná dnes | Webinář Beyond',
    description: WEBINAR.hero.subline,
    // Testovací verze stránky, zatím neindexovat.
    robots: { index: false, follow: false },
    openGraph: {
        title: '2030 začíná dnes',
        description: WEBINAR.hero.subline,
        type: 'website',
        locale: 'cs_CZ',
    },
};

export default function WebinarLayout({ children }: { children: React.ReactNode }) {
    return children;
}
