// Sedm poměrů z Timova diagramu. Každý odpovídá na jednu otázku, takže když
// funnel nefunguje, je hned vidět kde.

import { countPageViews, getEdition, listApplications, listRegistrations } from './db';

export type FunnelMetric = {
    key: string;
    label: string;
    question: string;
    numerator: number;
    denominator: number;
    /** Poměr v procentech, null když se ještě není z čeho počítat. */
    rate: number | null;
};

export type FunnelReport = {
    edition: { title: string; startsAt: string; slug: string };
    totals: {
        views: number;
        registrations: number;
        qualified: number;
        calendarAdded: number;
        attended: number;
        noShow: number;
        attendanceSynced: boolean;
        applications: number;
        qualifiedApplications: number;
        booked: number;
        won: number;
        whatsappOptOuts: number;
    };
    metrics: FunnelMetric[];
};

const ratio = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 1000) / 10 : null);

export async function buildFunnelReport(): Promise<FunnelReport | null> {
    const edition = await getEdition();
    if (!edition) return null;

    const [registrations, applications, views] = await Promise.all([
        listRegistrations(edition.id),
        listApplications(edition.id),
        countPageViews(edition.id).catch(() => 0),
    ]);

    const qualified = registrations.filter(r => r.qualified_at).length;
    const calendarAdded = registrations.filter(r => r.calendar_added_at).length;
    const attended = registrations.filter(r => r.attended === true).length;
    const noShow = registrations.filter(r => r.attended === false).length;
    const attendanceSynced = registrations.some(r => r.attendance_synced_at);
    const optOuts = registrations.filter(r => r.wa_status === 'opted_out').length;

    const qualifiedApps = applications.filter(a => a.qualified).length;
    const booked = applications.filter(a => a.booked_at).length;
    const won = applications.filter(a => a.call_outcome === 'won').length;

    const metrics: FunnelMetric[] = [
        {
            key: 'traffic-registration',
            label: 'Návštěva na registraci',
            question: 'Jestli funguje hlavní myšlenka a landing page',
            numerator: registrations.length,
            denominator: views,
            rate: ratio(registrations.length, views),
        },
        {
            key: 'registration-qualification',
            label: 'Registrace na dotazník',
            question: 'Jestli dotazník není moc náročný',
            numerator: qualified,
            denominator: registrations.length,
            rate: ratio(qualified, registrations.length),
        },
        {
            key: 'registration-calendar',
            label: 'Registrace na kalendář',
            question: 'První signál commitmentu',
            numerator: calendarAdded,
            denominator: registrations.length,
            rate: ratio(calendarAdded, registrations.length),
        },
        {
            key: 'registration-attendance',
            label: 'Registrace na účast',
            question: 'Jestli funguje celý show up engine',
            numerator: attended,
            denominator: registrations.length,
            rate: ratio(attended, registrations.length),
        },
        {
            key: 'attendance-application',
            label: 'Účast na přihlášku',
            question: 'Nejdůležitější číslo, jestli webinář vytváří poptávku',
            numerator: applications.length,
            denominator: attended,
            rate: ratio(applications.length, attended),
        },
        {
            key: 'application-qualified',
            label: 'Přihláška na kvalifikovaný hovor',
            question: 'Jestli přitahujete správné lidi',
            numerator: qualifiedApps,
            denominator: applications.length,
            rate: ratio(qualifiedApps, applications.length),
        },
        {
            key: 'qualified-close',
            label: 'Kvalifikovaný hovor na uzavření',
            question: 'Jestli funguje nabídka a prodej',
            numerator: won,
            denominator: booked,
            rate: ratio(won, booked),
        },
    ];

    return {
        edition: { title: edition.title, startsAt: edition.starts_at, slug: edition.slug },
        totals: {
            views,
            registrations: registrations.length,
            qualified,
            calendarAdded,
            attended,
            noShow,
            attendanceSynced,
            applications: applications.length,
            qualifiedApplications: qualifiedApps,
            booked,
            won,
            whatsappOptOuts: optOuts,
        },
        metrics,
    };
}
