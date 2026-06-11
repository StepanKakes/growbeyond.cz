import type { Metadata } from 'next';
import { Navbar } from '@/components/Navbar';
import { TextureOverlay } from '@/components/TextureOverlay';
import { StrategieVideoBooking } from '@/components/strategie/StrategieVideoBooking';
import { LegalFooter } from '@/components/LegalFooter';
import { getLeadById } from '@/lib/mentorship-lead';

export const metadata: Metadata = {
    title: 'Tvé strategické video | Growbeyond',
    robots: { index: false, follow: false },
};

export default async function StrategieVideoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const lead = await getLeadById(id);

    return (
        <main className="min-h-screen relative bg-brand-dark text-white font-sans selection:bg-brand-red selection:text-white">
            <Navbar minimal />
            <TextureOverlay />

            {/* Plná prodejní stránka 1:1 jako homepage (hero → video → form → proof) */}
            <StrategieVideoBooking leadId={id} email={lead?.email} />

            <LegalFooter />
        </main>
    );
}
