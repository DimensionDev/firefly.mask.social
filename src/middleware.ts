import { NextRequest, NextResponse, userAgent } from 'next/server.js';

export async function middleware(request: NextRequest) {
    if (request.nextUrl.pathname.startsWith('/post') || request.nextUrl.pathname.startsWith('/profile')) {
        const { isBot } = userAgent(request);

        request.headers.set('X-IS-BOT', isBot ? 'true' : 'false');

        return NextResponse.next({
            request,
        });
    }

    return NextResponse.next({
        request,
    });
}

export const config = {
    matcher: ['/post/:path*', '/profile/:path*'],
};
