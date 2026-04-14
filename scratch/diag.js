const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Minimal .env loader
function loadEnv() {
  const envPath = path.join(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        let value = parts.slice(1).join('=').trim();
        // Remove quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    });
  }
}

async function test() {
  loadEnv();
  
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;
  
  console.log('--- DIAGNOSTIKA ---');
  console.log('Client Email:', clientEmail);
  console.log('Has Private Key:', !!privateKey);
  
  if (privateKey) {
      // The crucial part: fixing newline escape sequences in the key
      privateKey = privateKey.replace(/\\n/g, '\n');
  }

  const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];
  const folderId = process.env.SOP_DRIVE_FOLDER_ID || '1xhfkfJSm842DywcI38mojv5LGneh8zm9';

  try {
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: SCOPES,
    });

    const drive = google.drive({ version: 'v3', auth });
    
    console.log(`Zkouším výpis složky: ${folderId}`);
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name)',
    });

    console.log('VÝSLEDEK: ÚSPĚCH!');
    console.log(`Nalezeno souborů: ${res.data.files.length}`);
    res.data.files.forEach(f => console.log(`- ${f.name} (${f.id})`));
  } catch (err) {
    console.error('VÝSLEDEK: CHYBA!');
    console.error('Zpráva:', err.message);
    if (err.response) {
      console.error('Data od Google API:', JSON.stringify(err.response.data, null, 2));
    }
  }
}

test();
