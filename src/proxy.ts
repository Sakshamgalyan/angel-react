import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Get the auth token from cookies
    const token = request.cookies.get('auth-token')?.value || '';

    // If user is authenticated → allow
    if (token) {
        return NextResponse.next();
    }

    // If user is not authenticated → allow (client handles login UI)
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)'
    ],
};
