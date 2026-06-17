import { NextRequest, NextResponse } from 'next/server';
import { getInstagramProfile } from '@/lib/validate-contact';
import { plunkEnroll } from '@/lib/plunk';

export const runtime = 'nodejs';

const SITE_URL = 'https://growbeyond.cz';

type UtmPayload = {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
};

export async function POST(request: NextRequest) {
    const { firstName, email, igHandle, q3, q4, q5, q6, q7, clarityUserId, utm } = await request.json() as {
        firstName?: string; email?: string; igHandle?: string;
        q3?: string; q4?: string; q5?: string; q6?: string; q7?: string;
        clarityUserId?: string;
        utm?: UtmPayload;
    };

    // Z hashnutého Clarity user id postav přímý filtrovaný odkaz na nahrávky
    const CLARITY_PROJECT = 'vuqnag017s';
    const clarityUrl = clarityUserId
        ? `https://clarity.microsoft.com/projects/view/${CLARITY_PROJECT}/impressions?` +
          `date=${encodeURIComponent('Last 30 days')}&smartEvents=SubmitForm&UserId=${encodeURIComponent('is;' + clarityUserId)}`
        : '';

    // Extract just the short title (before colon) for Notion select fields
    const q3Short = q3 ? q3.split(':')[0].trim() : '';

    const zdroj = utm?.utm_source || '';
    const kampan = utm?.utm_campaign || '';
    const utmContent = utm?.utm_content || '';
    const video = utmContent
        ? (zdroj === 'youtube' && /^[a-zA-Z0-9_-]{11}$/.test(utmContent)
            ? `https://www.youtube.com/watch?v=${utmContent}`
            : utmContent)
        : '';

    const NOTION_TOKEN = process.env.NOTION_API_KEY;
    const DATABASE_ID = process.env.NOTION_MENTORSHIP_DB_ID;

    if (!NOTION_TOKEN || !DATABASE_ID) {
        console.error('Missing Notion environment variables for mentorship');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // IG enrichment — profil (cache hit z náhledu/validace)
    let igFollowers: number | null = null;
    let igVerified = false;
    let igProfilePic = '';
    let igName = '';
    try {
        const p = await getInstagramProfile(igHandle || '');
        if (p.profile) {
            igFollowers = p.profile.followers;
            igVerified = p.profile.isVerified;
            igProfilePic = p.profile.profilePicUrl || '';
            igName = p.profile.fullName || '';
        }
    } catch { /* enrichment je best-effort, nesmí shodit uložení leada */ }

    const baseProperties: Record<string, unknown> = {
        'Email': { title: [{ text: { content: email || '' } }] },
        'Jméno': { rich_text: [{ text: { content: (firstName || '').trim() } }] },
        'IG': { rich_text: [{ text: { content: igHandle || '' } }] },
        'Zdroj': { rich_text: [{ text: { content: zdroj } }] },
        'Kampaň': { rich_text: [{ text: { content: kampan } }] },
        'Video': { rich_text: [{ text: { content: video } }] },
        // Kvalifikace je nepovinná — strategie funnel ji doplní později (PATCH)
        ...(q3Short ? { 'Problém': { select: { name: q3Short } } } : {}),
        ...(q4 ? { 'Současný příjem': { select: { name: q4 } } } : {}),
        ...(q5 ? { 'Způsob monetizace': { select: { name: q5 } } } : {}),
        ...(q6 ? { 'Investice do růstu': { select: { name: q6 } } } : {}),
        ...(q7 ? { 'Detailní odpověď': { rich_text: [{ text: { content: q7 } }] } } : {}),
    };

    const enrichProperties: Record<string, unknown> = {
        'Verified': { checkbox: igVerified },
        ...(igFollowers != null ? { 'Sledující': { number: igFollowers } } : {}),
        ...(igProfilePic ? { 'Profilovka': { url: igProfilePic } } : {}),
        // Uživatelem zadané jméno má přednost; IG fullName jen když jméno chybí.
        ...(!firstName?.trim() && igName ? { 'Jméno': { rich_text: [{ text: { content: igName } }] } } : {}),
        ...(clarityUrl ? { 'Clarity': { url: clarityUrl } } : {}),
    };

    const createPage = (properties: Record<string, unknown>) =>
        fetch('https://api.notion.com/v1/pages', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_TOKEN}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28',
            },
            body: JSON.stringify({ parent: { database_id: DATABASE_ID }, properties }),
        });

    try {
        let response = await createPage({ ...baseProperties, ...enrichProperties });

        // Když enrichment property v DB ještě neexistuje, Notion vrátí 400.
        // Lead nesmí propadnout → ulož aspoň základní data.
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Notion API error (s enrichmentem):', errorData);
            response = await createPage(baseProperties);
            if (!response.ok) {
                const e2 = await response.json().catch(() => ({}));
                console.error('Notion API error (base):', e2);
                return NextResponse.json({ error: 'Failed to submit to Notion' }, { status: response.status });
            }
        }

        const created = await response.json();

        // Zařaď leada do Plunku → spustí větvenou VSL sekvenci (E1 + follow-up).
        // lead_url = jeho unikátní stránka (video + formulář) pro odkazy v emailech.
        // Best-effort: případný fail Plunku nesmí shodit uložení leada.
        if (email) {
            const leadUrl = `${SITE_URL}/strategie/${created.id}`;
            await plunkEnroll({
                email,
                firstName,
                event: 'optin_strategie',
                data: { lead_url: leadUrl, vsl_max: 0 },
            }).catch(() => { /* už logováno uvnitř */ });
        }

        // Vrať ID vytvořené Notion stránky — funnel z reklamy podle něj
        // přesměruje na unikátní stránku leadu (/strategie/<id>).
        return NextResponse.json({ success: true, id: created.id });
    } catch (error) {
        console.error('Submission error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
