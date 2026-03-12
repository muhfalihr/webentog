import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'auth_session';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if persistence is disabled via env
  const isPersistent = process.env.PERSISTENT_CONNECTION !== 'false';

  // If not persistent, allow all traffic
  if (!isPersistent) {
    return NextResponse.next();
  }

  // Skip proxy for public routes, static files, etc.
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME);

  if (!sessionToken) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
