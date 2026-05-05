import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const target = `${request.nextUrl.origin}/?utm_source=instagram&utm_campaign=bio#apply`;
    return NextResponse.redirect(target, 302);
}
