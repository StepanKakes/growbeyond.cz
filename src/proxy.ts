import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedSop = pathname.startsWith('/sop') && !pathname.startsWith('/sop/login');
  const isProtectedInternal = pathname.startsWith('/links') || pathname.startsWith('/leads');

  // SOP knihovna – vlastní cookie/PIN
  if (isProtectedSop && request.cookies.get('sop_authorized')?.value !== 'true') {
    return redirectToLogin(request, pathname);
  }

  // Interní systémy (links, leads) – sdílená cookie/PIN, oddělené od SOP
  if (isProtectedInternal && request.cookies.get('internal_authorized')?.value !== 'true') {
    return redirectToLogin(request, pathname);
  }

  return NextResponse.next();
}

function redirectToLogin(request: NextRequest, from: string) {
  const url = request.nextUrl.clone();
  url.pathname = '/sop/login';
  url.searchParams.set('from', from);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    '/sop/:path*',
    '/links/:path*',
    '/leads/:path*',
  ],
};
