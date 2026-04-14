import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /sop routes except the login page itself
  // API routes are also excluded (they can have their own check if needed)
  if (pathname.startsWith('/sop') && !pathname.startsWith('/sop/login')) {
    const isAuthorized = request.cookies.get('sop_authorized')?.value === 'true';

    if (!isAuthorized) {
      const url = request.nextUrl.clone();
      url.pathname = '/sop/login';
      // Store the original URL for redirect after login
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    '/sop/:path*',
  ],
};
