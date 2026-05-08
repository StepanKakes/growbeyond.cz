import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedSop = pathname.startsWith('/sop') && !pathname.startsWith('/sop/login');
  const isProtectedLinks = pathname.startsWith('/links');

  if (isProtectedSop || isProtectedLinks) {
    const isAuthorized = request.cookies.get('sop_authorized')?.value === 'true';

    if (!isAuthorized) {
      const url = request.nextUrl.clone();
      url.pathname = '/sop/login';
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/sop/:path*',
    '/links/:path*',
  ],
};
