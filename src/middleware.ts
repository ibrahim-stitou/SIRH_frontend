import { auth } from './lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  const publicRoutes = ['/', '/api/auth', '/unauthorized', '/forgot-password'];
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isPublicRoute) {
   if (pathname === '/' && session && !session.error) {
      const userRole = session.user?.role?.code;

      if (userRole === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/overview', request.url));
      }
    }

    return NextResponse.next();
  }

  if (!session || session.error === 'TokenExpired' || session.error === 'RefreshAccessTokenError' || session.error === 'SessionExpired') {

    const errorParam = session?.error ? `?error=${session.error.toLowerCase()}` : '';
    return NextResponse.redirect(new URL(`/${errorParam}`, request.url));
  }

  const userRole = session.user?.role?.code;
  if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  const commonRoutes = ['/dashboard', '/profile', '/settings'];
  const isCommonRoute = commonRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|icons|fonts).*)',
  ],
};