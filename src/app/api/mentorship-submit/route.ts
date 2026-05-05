import { NextRequest, NextResponse } from 'next/server';

type UtmPayload = {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
};

export async function POST(request: NextRequest) {
    const { email, igHandle, q3, q4, q5, q6, q7, utm } = await request.json() as {
        email?: string; igHandle?: string;
        q3?: string; q4?: string; q5?: string; q6?: string; q7?: string;
        utm?: UtmPayload;
    };

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

    try {
        const response = await fetch('https://api.notion.com/v1/pages', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_TOKEN}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28',
            },
            body: JSON.stringify({
                parent: { database_id: DATABASE_ID },
                properties: {
                    'Email': {
                        title: [
                            {
                                text: {
                                    content: email || '',
                                },
                            },
                        ],
                    },
                    'IG': {
                        rich_text: [
                            {
                                text: {
                                    content: igHandle || '',
                                },
                            },
                        ],
                    },
                    'Problém': {
                        select: {
                            name: q3Short || '',
                        },
                    },
                    'Současný příjem': {
                        select: {
                            name: q4 || '',
                        },
                    },
                    'Způsob monetizace': {
                        select: {
                            name: q5 || '',
                        },
                    },
                    'Investice do růstu': {
                        select: {
                            name: q6 || '',
                        },
                    },
                    'Detailní odpověď': {
                        rich_text: [
                            {
                                text: {
                                    content: q7 || '',
                                },
                            },
                        ],
                    },
                    'Zdroj': {
                        rich_text: [{ text: { content: zdroj } }],
                    },
                    'Kampaň': {
                        rich_text: [{ text: { content: kampan } }],
                    },
                    'Video': {
                        rich_text: [{ text: { content: video } }],
                    },
                },
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Notion API error:', errorData);
            return NextResponse.json({ error: 'Failed to submit to Notion' }, { status: response.status });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Submission error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
