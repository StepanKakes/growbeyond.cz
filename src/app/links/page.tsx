import type { Metadata } from 'next';
import { listLinks, listClicks } from '@/lib/notion-links';
import { LinksDashboard } from './LinksDashboard';

export const metadata: Metadata = {
    title: 'Links Dashboard',
    robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LinksPage() {
    const [links, clicks] = await Promise.all([
        listLinks(),
        listClicks({ sinceDays: 30, limit: 1000 }),
    ]);

    return <LinksDashboard links={links} clicks={clicks} />;
}
