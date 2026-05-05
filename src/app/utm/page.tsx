import type { Metadata } from 'next';
import { UtmGenerator } from './UtmGenerator';

export const metadata: Metadata = {
    title: 'UTM Generator',
    robots: { index: false, follow: false },
};

export default function UtmPage() {
    return <UtmGenerator />;
}
