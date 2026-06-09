import { NextRequest, NextResponse } from 'next/server';
import { getInstagramProfile } from '@/lib/validate-contact';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const username = request.nextUrl.searchParams.get('username') || '';
    if (!username.trim()) {
        return NextResponse.json({ found: false, uncertain: false, profile: null });
    }

    const result = await getInstagramProfile(username);
    return NextResponse.json(result);
}
