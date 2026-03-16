import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
    const isLoginRoute = request.nextUrl.pathname === '/admin/login';

    // Only protect /admin routes
    if (isAdminRoute) {
        const hasSession = request.cookies.has('admin_session');

        // If trying to access protected route without session, redirect to login
        if (!hasSession && !isLoginRoute) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }

        // If trying to access login page WITH a session, redirect to admin dashboard
        if (hasSession && isLoginRoute) {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: ['/admin/:path*'],
};
