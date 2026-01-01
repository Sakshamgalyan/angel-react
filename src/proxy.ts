
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;
    
    // Auth Token
    const token = request.cookies.get('auth-token')?.value;

    // Paths
    const isAuthPage = path === '/auth';
    const isWarningPage = path === '/warning';
    
    // Whitelisted valid UI prefixes/Routes
    // These are the routes that an authenticated, active user is allowed to visit.
    const validPrefixes = ['/home', '/privacy-policy'];

    // 1. Unauthenticated Handling
    if (!token) {
        // Allow access to auth page
        if (isAuthPage) {
            return NextResponse.next();
        }
        // Redirect all generic paths to /auth
        return NextResponse.redirect(new URL('/auth', request.url));
    }

    // 2. Authenticated Handling
    if (token) {
        try {
            const statusUrl = new URL('/api/auth/status', request.url);
            const res = await fetch(statusUrl, {
                headers: {
                    cookie: request.headers.get('cookie') || ''
                }
            });
            
            // If fetch fails (server error), we might want to fail open or closed.
            if (!res.ok) {
                 // Proceeding to next() is reasonable fallback or we could block.
            }
            
            const data = res.ok ? await res.json() : { authenticated: true, locked: false }; 

            // If token invalid (e.g. user deleted/logout on server) and API says unauth
            if (!data.authenticated) {
                const response = NextResponse.redirect(new URL('/auth', request.url));
                response.cookies.delete('auth-token');
                return response;
            }

            // Locked Logic
            if (data.locked) {
                if (!isWarningPage) {
                    return NextResponse.redirect(new URL('/warning', request.url));
                }
                return NextResponse.next();
            }

            // Active (Not Locked) Logic
            
            // If on Warning or Auth -> go Home
            if (isWarningPage || isAuthPage) {
                return NextResponse.redirect(new URL('/home', request.url));
            }
            
            // Role Based Access Control
            const userRole = data.role || 'merchant';
            const adminRoutes = ['/home/admin-settings'];
            
            // Check manual specific admin-only prefixes
            const isAdminRoute = adminRoutes.some(route => path.startsWith(route));
            
            if (isAdminRoute && userRole !== 'admin') {
                return NextResponse.redirect(new URL('/home', request.url));
            }
            
            // Validate Pages for Active Users
            // If path logic: "if any page is not available ... redirect to /home" (e.g. /response)
            // We check against valid prefixes.
            const isValid = validPrefixes.some(p => path.startsWith(p));
            
            if (isValid) {
                return NextResponse.next();
            }

            // Unknown/Invalid page -> redirect Home
            if (path !== '/home') {
                 return NextResponse.redirect(new URL('/home', request.url));
            }
            
            return NextResponse.next();

        } catch (error) {
            console.error('Middleware Auth/Status Check Error:', error);
            return NextResponse.next();
        }
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public images (svg, png, jpg, jpeg, etc)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
