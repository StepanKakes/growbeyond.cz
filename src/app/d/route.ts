import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const target = `${request.nextUrl.origin}/?utm_source=dms&utm_campaign=default#apply`;
    return NextResponse.redirect(target, 302);
}
