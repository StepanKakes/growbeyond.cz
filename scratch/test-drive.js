import { getGoogleDriveClient } from './src/lib/google-drive.js'; // Assuming we run with node/ts-node

async function test() {
    try {
        console.log('Testing Google Drive connection...');
        const drive = await getGoogleDriveClient();
        const folderId = process.env.SOP_DRIVE_FOLDER_ID || '1xhfkfJSm842DywcI38mojv5LGneh8zm9';
        console.log(`Fetching items from folder: ${folderId}`);
        
        const res = await drive.files.list({
            q: `'${folderId}' in parents and trashed = false`,
            fields: 'files(id, name)',
        });
        
        console.log('Success! Found files:', res.data.files?.length);
    } catch (err) {
        console.error('Test failed!');
        console.error('Error name:', err.name);
        console.error('Error message:', err.message);
        if (err.response) {
            console.error('Response data:', JSON.stringify(err.response.data, null, 2));
        }
    }
}

test();
