import { NextResponse } from 'next/server';
import { getSOPItems } from '@/lib/google-drive';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    // Use the provided folderId or fallback to the root folder
    const folderId = searchParams.get('folderId') || process.env.SOP_DRIVE_FOLDER_ID || '1xhfkfJSm842DywcI38mojv5LGneh8zm9';
    const q = searchParams.get('q') || undefined;
    const fetchAll = searchParams.get('all') === 'true';

    if (!folderId && !fetchAll) {
      return NextResponse.json({ error: 'Chybí ID složky' }, { status: 400 });
    }

    const items = await getSOPItems(folderId, q, fetchAll);
    return NextResponse.json(items);
  } catch (error: any) {
    console.error('SOP Items API error:', error);
    const message = error.message || 'Nepodařilo se načíst položky z Google Disku';
    return NextResponse.json(
      { error: message }, 
      { status: 500 }
    );
  }
}
