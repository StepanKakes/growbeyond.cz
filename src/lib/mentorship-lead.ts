// Načtení leadu z Notion podle ID stránky (vrácené z /api/mentorship-submit).
// Slouží unikátní stránce leadu /strategie/<id> k předvyplnění e-mailu do
// kalendáře a rozhodnutí o follow-up e-mailu (Plunk).

export type MentorshipLead = {
    email: string;
    igHandle: string;
    budget: string;
    followupEligible: boolean;
};

// Nejnižší stupeň investice → bez follow-up e-mailu (shodné s ApplicationForm).
const LOWEST_BUDGET = '0 - 25 tisíc Kč';

type NotionProp = {
    type?: string;
    title?: { plain_text?: string }[];
    rich_text?: { plain_text?: string }[];
    select?: { name?: string } | null;
};

const plain = (prop?: NotionProp): string => {
    if (!prop) return '';
    if (prop.type === 'title') return prop.title?.[0]?.plain_text ?? '';
    if (prop.type === 'rich_text') return prop.rich_text?.[0]?.plain_text ?? '';
    if (prop.type === 'select') return prop.select?.name ?? '';
    return '';
};

export async function getLeadById(id: string): Promise<MentorshipLead | null> {
    const token = process.env.NOTION_API_KEY;
    if (!token) return null;

    // Notion page ID je UUID (32 hex znaků, případně s pomlčkami).
    if (!/^[0-9a-fA-F-]{32,36}$/.test(id)) return null;

    try {
        const res = await fetch(`https://api.notion.com/v1/pages/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Notion-Version': '2022-06-28',
            },
            cache: 'no-store',
        });
        if (!res.ok) return null;

        const page = await res.json();
        const props = (page.properties ?? {}) as Record<string, NotionProp>;
        const budget = plain(props['Investice do růstu']);

        return {
            email: plain(props['Email']),
            igHandle: plain(props['IG']),
            budget,
            followupEligible: budget !== LOWEST_BUDGET,
        };
    } catch {
        return null;
    }
}
