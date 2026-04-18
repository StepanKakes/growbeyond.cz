import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

// Cache configuration
let driveCache: SOPItem[] | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes cache

export async function getGoogleDriveClient() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    throw new Error('Google Drive credentials missing in .env');
  }

  const formattedKey = privateKey.replace(/\\n/g, '\n');

  try {
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: formattedKey,
      scopes: SCOPES,
    });
    
    return google.drive({ version: 'v3', auth });
  } catch (error) {
    console.error('Failed to initialize Google Auth:', error);
    throw error;
  }
}

export interface SOPItem {
  id: string;
  name: string;
  mimeType: string;
  description?: string;
  webViewLink?: string;
  externalLink?: string;
  isFolder: boolean;
  itemCount?: number;
  parents?: string[];
}

const normalizeText = (text: string) => 
  text ? text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";

async function fetchFullLibrary(): Promise<SOPItem[]> {
  const drive = await getGoogleDriveClient();
  
  console.log('--- REFRESHING SOP LIBRARY FROM DRIVE ---');
  
  // Fetch ALL files visible to the service account
  const response = await drive.files.list({
    q: "trashed = false",
    fields: 'files(id, name, mimeType, description, webViewLink, parents)',
    pageSize: 1000,
  });

  const files = response.data.files || [];
  
  // Map files to SOPItems
  const items: SOPItem[] = files.map(file => {
    const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
    
    let externalLink = undefined;
    if (file.description) {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const match = file.description.match(urlRegex);
      if (match) externalLink = match[0];
    }

    return {
      id: file.id || '',
      name: file.name || 'Untitled',
      mimeType: file.mimeType || '',
      description: file.description || '',
      webViewLink: file.webViewLink || '',
      externalLink,
      isFolder,
      parents: file.parents || []
    };
  });

  // Calculate itemCount for folders
  items.forEach(item => {
    if (item.isFolder) {
      item.itemCount = items.filter(other => other.parents?.includes(item.id)).length;
    }
  });

  return items;
}

export async function getSOPItems(folderId: string, searchQuery?: string, fetchAll?: boolean): Promise<SOPItem[]> {
  const currentTime = Date.now();
  
  // Refresh cache if stale or empty
  if (!driveCache || (currentTime - lastFetchTime > CACHE_DURATION)) {
    try {
      driveCache = await fetchFullLibrary();
      lastFetchTime = currentTime;
    } catch (err) {
      console.error('Failed to fetch full library:', err);
      if (!driveCache) return []; // Only fail if we have no cache at all
    }
  }

  let results = driveCache || [];

  if (fetchAll) {
    return results;
  }

  if (searchQuery && searchQuery.trim().length > 0) {
    // Global diacritics-insensitive search across ALL files in cache
    const normalizedSearch = normalizeText(searchQuery);
    return results.filter(item => 
      normalizeText(item.name).includes(normalizedSearch) ||
      normalizeText(item.description || "").includes(normalizedSearch)
    );
  }

  // Browse mode: Filter by immediate parent (folderId)
  return results.filter(item => item.parents?.includes(folderId));
}
