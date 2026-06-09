import type { Metadata } from 'next';
import { listMentorshipLeads } from '@/lib/mentorship-leads';
import { LeadsDashboard } from './LeadsDashboard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Leady | Growbeyond',
    robots: { index: false, follow: false },
};

export default async function LeadsPage() {
    const leads = await listMentorshipLeads();
    return <LeadsDashboard leads={leads} clarityProjectId="vuqnag017s" />;
}
