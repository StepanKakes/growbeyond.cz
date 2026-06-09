// Načtení a skórování leadů z Notion (vsl-lp-form) pro interní dashboard /leads.

export type LeadTier = 'A' | 'B' | 'C';

export type Lead = {
    id: string;
    email: string;
    ig: string;
    name: string;
    profilePic: string;
    verified: boolean;
    followers: number | null;
    problem: string;
    income: string;
    monetization: string;
    budget: string;
    detail: string;
    source: string;
    campaign: string;
    video: string;
    createdTime: string;
    notionUrl: string;
    score: number;
    tier: LeadTier;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const title = (p: any): string => p?.title?.map((t: any) => t.plain_text).join('') || '';
const text = (p: any): string => p?.rich_text?.map((t: any) => t.plain_text).join('') || '';
const sel = (p: any): string => p?.select?.name || '';
const num = (p: any): number | null => (typeof p?.number === 'number' ? p.number : null);
const check = (p: any): boolean => !!p?.checkbox;
const urlp = (p: any): string => p?.url || '';
/* eslint-enable @typescript-eslint/no-explicit-any */

// Z textu typu "65 - 90tisíc" / "100tis. a víc" / "Nic" vytáhne nejvyšší
// číslo (v tisících). "Nic"/prázdno = 0.
function maxThousands(s: string): number {
    const nums = (s.match(/\d+/g) || []).map(Number);
    return nums.length ? Math.max(...nums) : 0;
}

function scoreLead(budget: string, followers: number | null, income: string, verified: boolean) {
    const budgetScore = Math.min(maxThousands(budget) / 100, 1); // 100tis+ = max
    const incomeScore = Math.min(maxThousands(income) / 150, 1); // 150tis+ = max
    const followersScore = followers && followers > 0
        ? Math.min(Math.log10(followers + 1) / 5, 1) // 100k = max
        : 0;
    const verifiedScore = verified ? 1 : 0;

    const score = Math.round(
        100 * (0.4 * budgetScore + 0.3 * followersScore + 0.2 * incomeScore + 0.1 * verifiedScore)
    );
    const tier: LeadTier = score >= 66 ? 'A' : score >= 40 ? 'B' : 'C';
    return { score, tier };
}

const normIg = (raw: string): string => raw.trim().replace(/^@+/, '').replace(/\/+$/, '');

export async function listMentorshipLeads(): Promise<Lead[]> {
    const token = process.env.NOTION_API_KEY;
    const db = process.env.NOTION_MENTORSHIP_DB_ID;
    if (!token || !db) {
        console.error('Missing Notion env for leads dashboard');
        return [];
    }

    const leads: Lead[] = [];
    let cursor: string | undefined;

    try {
        do {
            const res = await fetch(`https://api.notion.com/v1/databases/${db}/query`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Notion-Version': '2022-06-28',
                },
                cache: 'no-store',
                body: JSON.stringify({
                    page_size: 100,
                    sorts: [{ property: 'Created Time', direction: 'descending' }],
                    ...(cursor ? { start_cursor: cursor } : {}),
                }),
            });
            if (!res.ok) {
                console.error('Notion query error', await res.text());
                break;
            }
            const data = await res.json();

            for (const page of data.results || []) {
                const p = page.properties || {};
                const budget = sel(p['Investice do růstu']);
                const income = sel(p['Současný příjem']);
                const followers = num(p['Sledující']);
                const verified = check(p['Verified']);
                const { score, tier } = scoreLead(budget, followers, income, verified);

                leads.push({
                    id: page.id,
                    email: title(p['Email']),
                    ig: normIg(text(p['IG'])),
                    name: text(p['Jméno']),
                    profilePic: urlp(p['Profilovka']),
                    verified,
                    followers,
                    problem: sel(p['Problém']),
                    income,
                    monetization: sel(p['Způsob monetizace']),
                    budget,
                    detail: text(p['Detailní odpověď']),
                    source: text(p['Zdroj']),
                    campaign: text(p['Kampaň']),
                    video: text(p['Video']),
                    createdTime: page.created_time || '',
                    notionUrl: page.url || '',
                    score,
                    tier,
                });
            }

            cursor = data.has_more ? data.next_cursor : undefined;
        } while (cursor);
    } catch (e) {
        console.error('listMentorshipLeads error', e);
    }

    return leads;
}
