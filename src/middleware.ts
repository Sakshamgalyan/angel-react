import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/register'];
    const isPublicRoute = publicRoutes.includes(pathname);

    // Verify token
    const payload = token ? verifyToken(token) : null;
    const isAuthenticated = !!payload;

    // Redirect authenticated users away from auth pages
    if (isAuthenticated && isPublicRoute) {
        return NextResponse.redirect(new URL('/home', request.url));
    }

    // Redirect unauthenticated users to login
    if (!isAuthenticated && !isPublicRoute && pathname !== '/') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Allow the request to proceed
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api routes
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
    ],
};
