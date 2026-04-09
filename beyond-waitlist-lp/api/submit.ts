import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, igHandle, q3, q4, q5, q6, q7 } = req.body;

  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  const DATABASE_ID = process.env.NOTION_MENTORSHIP_DB_ID;

  if (!NOTION_TOKEN || !DATABASE_ID) {
    console.error('Missing Notion environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
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
              name: q3 || '',
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
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Notion API error:', errorData);
      return res.status(response.status).json({ error: 'Failed to submit to Notion' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Submission error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
