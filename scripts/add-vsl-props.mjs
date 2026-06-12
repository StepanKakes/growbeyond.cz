// Jednorázově přidá do mentorship Notion DB number properties pro VSL retention.
// Spuštění: node --env-file=.env.local scripts/add-vsl-props.mjs
const token = process.env.NOTION_API_KEY;
const db = process.env.NOTION_MENTORSHIP_DB_ID;
if (!token || !db) { console.error('Chybí NOTION_API_KEY / NOTION_MENTORSHIP_DB_ID'); process.exit(1); }

const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
};

// Zjisti, co už existuje (ať nepřepíšeme)
const cur = await fetch(`https://api.notion.com/v1/databases/${db}`, { headers });
if (!cur.ok) { console.error('Načtení DB selhalo:', await cur.text()); process.exit(1); }
const existing = (await cur.json()).properties || {};

const want = ['Video max (s)', 'Video délka (s)'];
const props = {};
for (const name of want) {
    if (existing[name]) { console.log(`= už existuje: ${name}`); continue; }
    props[name] = { number: { format: 'number' } };
}

if (Object.keys(props).length === 0) { console.log('Nic k přidání, hotovo.'); process.exit(0); }

const res = await fetch(`https://api.notion.com/v1/databases/${db}`, {
    method: 'PATCH', headers, body: JSON.stringify({ properties: props }),
});
if (!res.ok) { console.error('PATCH selhal:', await res.text()); process.exit(1); }
console.log('+ přidáno:', Object.keys(props).join(', '));
